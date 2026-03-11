// app/upload/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import MriSubmitForm from "@/components/form/MriSubmitForm";

type SearchParams = {
  plan?: string | string[];
};

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const planParam = Array.isArray(sp?.plan) ? sp.plan[0] : sp?.plan;
  const plan = String(planParam ?? "").toLowerCase() === "advanced" ? "advanced" : "basic";
  const planLabel = plan === "advanced" ? "Advanced" : "Basic";

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-[#FDFDFD]/95 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
          <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#004483] text-white text-lg">🖥️</div>

            <div className="leading-tight">
            <div className="text-[22px] md:text-[26px] font-semibold tracking-tight text-[#004483]">MRI Report</div>

            <div className="text-xs text-slate-500">Upload • Verify • Pay • Email delivery</div>

            </div>
          </div>
          <div className="hidden md:inline-flex items-center rounded-full border border-[#E0E0E0] bg-[#FDFDFD] px-3 py-1 text-xs text-slate-700">
  Selected plan:&nbsp;<span className="font-semibold text-[#004483]">{planLabel}</span>
</div>


          <Link
            href="/#pricing"
            className="rounded-xl bg-[#007AEB] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,122,235,0.35)] transition hover:brightness-110"
          >
            Back to plans
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative">
        {/* Optional subtle waves to match landing hero feel */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[-120px] h-[240px] rounded-[100%] bg-[#77BEF2]/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[-155px] h-[240px] rounded-[100%] bg-white/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          {/* Minimal supporting text (no extra step blocks, no extra card wrappers) */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Upload your MRI</h1>
            <p className="mt-2 text-sm md:text-base text-white">
              Fill details, upload your file, and continue to payment after verification.
            </p>
          </div>

          {/* Form (UI is controlled inside MriSubmitForm) */}
          <MriSubmitForm plan={plan as any} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-[#004483]/55 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="flex flex-col gap-3 text-sm text-white md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} MRI Report. All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/#pricing" className="hover:text-white">
                Pricing
              </Link>
              <Link href="/#how" className="hover:text-white">
                How it works
              </Link>
              <Link href="/#security" className="hover:text-white">
                Privacy & Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
