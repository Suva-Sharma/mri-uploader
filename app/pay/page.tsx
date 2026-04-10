// app/pay/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PayButton from "@/components/pay/PayButton";

type SearchParams = { caseId?: string | string[] };

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const caseId = Array.isArray(sp.caseId) ? sp.caseId[0] : sp.caseId;

  if (!caseId) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
        <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#004483] text-lg text-white">
                🖥️
              </div>
              <div className="leading-tight">
                <div className="text-[30px] font-semibold tracking-tight text-[#004483]">
                  MRI Report
                </div>
                <div className="text-xs text-slate-500">Secure upload • Email delivery</div>
              </div>
            </div>

            <Link
              href="/#pricing"
              className="rounded-xl border border-[#D7E4F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#004483] transition hover:bg-[#F5FAFF]"
            >
              Back to plans
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <h1 className="text-3xl font-semibold text-[#004483]">Payment</h1>
              <p className="mt-3 text-sm text-[#4E6E95]">Missing case ID.</p>

              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex rounded-xl bg-[#004483] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#005AAE]"
                >
                  Go home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, status: true, plan: true, paymentStatus: true },
  });

  if (!c) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
        <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#004483] text-lg text-white">
                🖥️
              </div>
              <div className="leading-tight">
                <div className="text-[30px] font-semibold tracking-tight text-[#004483]">
                  MRI Report
                </div>
                <div className="text-xs text-slate-500">Secure upload • Email delivery</div>
              </div>
            </div>

            <Link
              href="/#pricing"
              className="rounded-xl border border-[#D7E4F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#004483] transition hover:bg-[#F5FAFF]"
            >
              Back to plans
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <h1 className="text-3xl font-semibold text-[#004483]">Payment</h1>
              <p className="mt-3 text-sm text-[#4E6E95]">Case not found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const canPay = c.status === "QUEUED" && c.paymentStatus !== "PAID";

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#004483] text-lg text-white">
              🖥️
            </div>
            <div className="leading-tight">
              <div className="text-[30px] font-semibold tracking-tight text-[#004483]">
                MRI Report
              </div>
              <div className="text-xs text-slate-500">Secure upload • Email delivery</div>
            </div>
          </div>

          <Link
            href="/#pricing"
            className="rounded-xl border border-[#D7E4F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#004483] transition hover:bg-[#F5FAFF]"
          >
            Back to plans
          </Link>
        </div>
      </header>

      <main className="min-h-[calc(100vh-88px)] bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-[#004483]">Complete payment</h1>
              <p className="mt-2 text-sm text-[#4E6E95]">
                Review the status below and continue with payment.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard label="Plan" value={c.plan} />
              <StatusCard label="Upload status" value={c.status} />
              <StatusCard label="Payment status" value={c.paymentStatus} />
            </div>

            {canPay ? (
              <div className="mt-8 rounded-2xl border border-[#CFE6FF] bg-[#F5FAFF] p-5">
                <div className="mb-4 text-sm font-medium text-[#2F5E93]">
                  Your upload is verified. You can proceed to payment now.
                </div>

                <div className="w-full">
                  <PayButton caseId={caseId} />
                </div>
                <div className="mt-3">
                <button
                  type="button"
                  className="w-full rounded-xl border border-[#BFD8F2] bg-white px-5 py-3 text-sm font-semibold text-[#004483] transition hover:bg-[#F5FAFF]"
                >
                  Pay Later
                </button>
                
              </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-[#8A6A00]">
                Payment is not available yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#D7E4F2] bg-[#F5FAFF] px-4 py-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6E8FB4]">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-[#004483]">{value}</div>
    </div>
  );
}