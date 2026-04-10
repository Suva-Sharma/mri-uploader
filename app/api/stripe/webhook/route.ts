export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceForPlan } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("WEBHOOK_SIGNATURE_FAIL:", err?.message);
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
        select: { id: true, plan: true, paymentStatus: true },
      });
      if (!c) return NextResponse.json({ received: true });

      // Idempotent
      if (c.paymentStatus === "PAID") return NextResponse.json({ received: true });

      const expected = priceForPlan(c.plan as "BASIC" | "ADVANCED");
      const paidAmount = session.amount_total ?? 0;
      const paidCurrency = (session.currency ?? "").toLowerCase();

      if (paidAmount !== expected.amountCents || paidCurrency !== expected.currency) {
        await prisma.case.update({
          where: { id: c.id },
          data: { paymentStatus: "FAILED" },
        });
        console.error("WEBHOOK_AMOUNT_MISMATCH", {
          caseId: c.id,
          paidAmount,
          paidCurrency,
          expected,
        });
        return NextResponse.json({ received: true });
      }

      await prisma.case.update({
        where: { id: c.id },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : null,
        },
      });

      console.log("WEBHOOK_MARKED_PAID", { caseId: c.id, sessionId: session.id });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WEBHOOK_ERROR", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
