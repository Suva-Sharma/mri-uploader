export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  caseId?: string | string[];
};

export default async function PayLaterSuccessPage({
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
              <Image
                src="/logo/applogo.png"
                alt="Brain Health Report logo"
                width={45}
                height={45}
                className="object-contain"
              />
              <div className="leading-tight">
                <div className="text-[30px] font-semibold tracking-tight text-[#004483]">
                  Brain Health Report
                </div>
                <div className="text-xs text-slate-500">Secure upload • Email delivery</div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <h1 className="text-3xl font-semibold text-[#004483]">Payment status</h1>
              <p className="mt-3 text-sm text-[#4E6E95]">Missing case ID.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      patientName: true,
      paymentStatus: true,
      status: true,
    },
  });

  if (!c) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
        <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/applogo.png"
                alt="Brain Health Report logo"
                width={45}
                height={45}
                className="object-contain"
              />
              <div className="leading-tight">
                <div className="text-[30px] font-semibold tracking-tight text-[#004483]">
                  Brain Health Report
                </div>
                <div className="text-xs text-slate-500">Secure upload • Email delivery</div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <h1 className="text-3xl font-semibold text-[#004483]">Payment status</h1>
              <p className="mt-3 text-sm text-[#4E6E95]">Case not found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const customerName = c.patientName?.trim() || "Customer";

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/applogo.png"
              alt="Brain Health Report logo"
              width={45}
              height={45}
              className="object-contain"
            />
            <div className="leading-tight">
              <div className="text-[30px] font-semibold tracking-tight text-[#004483]">
                Brain Health Report
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
            <div className="mb-6">
              <div className="inline-flex items-center rounded-full bg-[#EAF4FF] px-3 py-1 text-xs font-semibold text-[#004483]">
                Payment pending
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-[#004483]">
                Thank you
              </h1>
            </div>

            <div className="space-y-4 text-sm leading-7 text-[#2F5E93]">
              <p>
                Dear <span className="font-semibold text-[#004483]">{customerName}</span>,
              </p>

              <p>
                Thank you for uploading your data to BrainCast.
              </p>

              <p>
                To proceed with generating your report, payment is required. An invoice will be
                sent to you shortly with the details needed to complete the payment.
              </p>

              <p>
                Once payment has been received, we will begin processing your report and keep you
                updated on the timeline.
              </p>

              <p>
                If you have any questions, please feel free to get in touch.
              </p>

              <div className="pt-2">
                <p>Kind regards,</p>
                <p className="font-semibold text-[#004483]">The BrainCast Team</p>
                <p>Melbourne, Australia</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#E0E0E0] bg-[#F5FAFF] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-[#6E8FB4]">
                Reference ID
              </div>
              <div className="mt-1 break-all font-mono text-sm font-semibold text-[#004483]">
                {caseId}
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex rounded-xl bg-[#004483] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#005AAE]"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}