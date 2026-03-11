// app/pay/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PayButton from "@/components/pay/PayButton";

type SearchParams = { caseId?: string | string[] };

export default async function PayPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const caseId = Array.isArray(sp.caseId) ? sp.caseId[0] : sp.caseId;

  if (!caseId) {
    return (
      <div className="p-8">
        <p>Missing caseId.</p>
        <Link href="/">Go home</Link>
      </div>
    );
  }

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, status: true, plan: true, paymentStatus: true },
  });

  if (!c) return <div className="p-8">Case not found.</div>;

  const canPay = c.status === "QUEUED" && c.paymentStatus !== "PAID";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="font-semibold">MRI Report</div>
          <Link href="/#pricing" className="text-sm text-slate-600 hover:text-slate-900">
            Back to plans
          </Link>
        </div>
      </header>

      <main className="text-white" style={{ backgroundColor: "#020C21" }}>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-2xl font-semibold">Payment</h1>
            <p className="mt-2 text-sm text-white/70">
              Your upload must be verified before payment is allowed.
            </p>

            <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
              <div>Case ID: <span className="font-mono">{c.id}</span></div>
              <div className="mt-1">Plan: <span className="font-semibold">{c.plan}</span></div>
              <div className="mt-1">Upload Status: <span className="font-semibold">{c.status}</span></div>
              <div className="mt-1">Payment Status: <span className="font-semibold">{c.paymentStatus}</span></div>
            </div>

            {canPay ? (
              <div className="mt-6">
                <PayButton caseId={caseId} />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                Payment is not available yet. Please ensure your file upload is fully verified.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
