export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { priceForPlan } from "@/lib/pricing";

type SearchParams = {
  caseId?: string | string[];
  session_id?: string | string[];
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const caseId = Array.isArray(sp.caseId) ? sp.caseId[0] : sp.caseId;
  const sessionId = Array.isArray(sp.session_id) ? sp.session_id[0] : sp.session_id;

  if (!caseId) return <div className="p-8">Missing caseId.</div>;

  // 1) Read case
  let c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, plan: true, paymentStatus: true },
  });

  if (!c) return <div className="p-8">Case not found.</div>;

  // 2) Fallback: if not paid yet but we have session_id, verify directly with Stripe
  if (c.paymentStatus !== "PAID" && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const paid =
        session.payment_status === "paid" ||
        session.status === "complete";

      if (paid) {
        const expected = priceForPlan(c.plan as "BASIC" | "ADVANCED");
        const paidAmount = session.amount_total ?? 0;
        const paidCurrency = (session.currency ?? "").toLowerCase();

        if (paidAmount === expected.amountCents && paidCurrency === expected.currency) {
          await prisma.case.update({
            where: { id: c.id },
            data: {
              paymentStatus: "PAID",
              paidAt: new Date(),
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : null,
            },
          });

          c = await prisma.case.findUnique({
            where: { id: caseId },
            select: { id: true, plan: true, paymentStatus: true },
          });
        }
      }
    } catch (e) {
      console.error("SUCCESS_PAGE_FALLBACK_CONFIRM_FAIL", e);
    }
  }

  const isPaid = c?.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="font-semibold">MRI Report</div>
        </div>
      </header>

      <main className="text-white" style={{ backgroundColor: "#020C21" }}>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur">
            {isPaid ? (
              <>
                <h1 className="text-2xl font-semibold">Payment received ✅</h1>
                <p className="mt-2 text-white/70">
                  We received your scan upload successfully. Our team will review it and you should receive your report by email in about 2 weeks.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold">Payment pending</h1>
                <p className="mt-2 text-white/70">
                  We couldn’t confirm payment yet. If you completed checkout, wait a moment and refresh.
                </p>
                <div className="mt-6">
                  <Link
                    href={`/pay?caseId=${caseId}`}
                    className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-medium text-[#020C21] hover:bg-white/90"
                  >
                    Return to payment
                  </Link>
                </div>
              </>
            )}

            <div className="mt-6 text-xs text-white/60">
              Reference ID: <span className="font-mono">{caseId}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
