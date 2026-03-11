export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { priceForPlan } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const caseId = String(body.caseId ?? "").trim();
    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    const c = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        status: true,
        plan: true,
        paymentStatus: true,
        stripeCheckoutSessionId: true,
        submitterEmail: true,
      },
    });

    if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    if (c.status !== "QUEUED") {
      return NextResponse.json({ error: "Upload not verified yet. Payment blocked." }, { status: 400 });
    }

    if (c.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Already paid." }, { status: 400 });
    }

    const { amountCents, currency } = priceForPlan(c.plan as "BASIC" | "ADVANCED");

    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "APP_URL is not set" }, { status: 500 });
    }

    if (c.paymentStatus === "PENDING" && c.stripeCheckoutSessionId) {
      const existing = await stripe.checkout.sessions.retrieve(c.stripeCheckoutSessionId);
      if (existing?.url) return NextResponse.json({ url: existing.url });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: c.submitterEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: c.plan === "ADVANCED" ? "MRI Report - Advanced" : "MRI Report - Basic",
            },
          },
        },
      ],
      metadata: {
        caseId: c.id,
        plan: c.plan,
      },
      success_url: `${appUrl}/pay/success?caseId=${encodeURIComponent(c.id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pay?caseId=${encodeURIComponent(c.id)}`,
    });

    await prisma.case.update({
      where: { id: c.id },
      data: {
        paymentStatus: "PENDING",
        amountCents,
        currency,
        stripeCheckoutSessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CHECKOUT_CREATE_ERROR:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
