export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceForPlan } from "@/lib/pricing";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBaseUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

async function sendPaymentReceivedEmail(args: {
  to: string;
  caseId: string;
}) {
  const { to, caseId } = args;

  const emailMode = process.env.EMAIL_MODE ?? "console";

  const subject = "Payment received - MRI Report";

  const text = [
    "Payment received ✅",
    "",
    "We received your scan upload successfully.",
    "Our team will review it and you should receive your report by email in about 2 weeks.",
    "",
    `Reference ID: ${caseId}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f3562;">
      <h2 style="margin: 0 0 12px; color: #004483;">Payment received ✅</h2>
      <p style="margin: 0 0 10px;">
        We received your scan upload successfully.
      </p>
      <p style="margin: 0 0 10px;">
        Our team will review it and you should receive your report by email in about 2 weeks.
      </p>
      <p style="margin: 16px 0 0; font-size: 14px; color: #4E6E95;">
        <strong>Reference ID:</strong> ${caseId}
      </p>
    </div>
  `;

  if (emailMode === "console") {
    console.log("EMAIL_MODE=console");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);
    console.log(text);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "MRI Upload <no-reply@yourdomain.com>",
    to,
    subject,
    text,
    html,
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const caseId = session.metadata?.caseId;
      if (!caseId) return NextResponse.json({ received: true });

      const c = await prisma.case.findUnique({
        where: { id: caseId },
        select: {
          id: true,
          plan: true,
          paymentStatus: true,
          submitterEmail: true,
        },
      });

      if (!c) return NextResponse.json({ received: true });

      // already paid -> do nothing
      if (c.paymentStatus === "PAID") {
        return NextResponse.json({ received: true });
      }

      const expected = priceForPlan(c.plan as any);
      const paidAmount = session.amount_total ?? 0;
      const paidCurrency = (session.currency ?? "").toLowerCase();

      if (
        paidAmount !== expected.amountCents ||
        paidCurrency !== expected.currency
      ) {
        await prisma.case.update({
          where: { id: c.id },
          data: { paymentStatus: "FAILED" },
        });

        return NextResponse.json({ received: true });
      }

      await prisma.case.update({
        where: { id: c.id },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: String(session.payment_intent ?? ""),
        },
      });

      // send confirmation email after payment is officially marked PAID
      if (c.submitterEmail) {
        try {
          await sendPaymentReceivedEmail({
            to: c.submitterEmail,
            caseId: c.id,
          });

          await prisma.emailLog.create({
            data: {
              caseId: c.id,
              to: c.submitterEmail,
              type: "USER_COMPLETED",
              status: "SENT",
            },
          });
        } catch (emailErr: any) {
          console.error("PAYMENT_EMAIL_SEND_FAILED:", emailErr);

          await prisma.emailLog.create({
            data: {
              caseId: c.id,
              to: c.submitterEmail,
              type: "USER_COMPLETED",
              status: "FAILED",
              error: String(emailErr?.message ?? emailErr),
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WEBHOOK_ERROR", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}