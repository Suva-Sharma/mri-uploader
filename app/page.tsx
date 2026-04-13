// app/page.tsx
import Link from "next/link";
import LaptopScreenCarousel from "@/components/landing/LaptopScreenCarousel";
import { getHeroSlides } from "@/lib/hero-slides";
import Image from "next/image";

type Plan = {
  key: "basic" | "advanced";
  name: string;
  price: string;
  description: string;
  outputs: string[];
  meta: string;
  cta: string;
  next: string;
  featured: boolean;
};

const plans: Plan[] = [
  {
    key: "basic",
    name: "Basic",
    price: "$200",
    description: "Standard Brain Health Report",
    outputs: [
      "Structural Analysis of Grey Matter in Your Brain",
      "Brain Degeneration Mapping",
      "White-Matter HyperIntensities Mapping",
    ],
    meta: "De-identified storage • Report via email (~1 week)",
    cta: "Select Basic →",
    next: "Next: upload your scan, then complete payment.",
    featured: false,
  },
  {
    key: "advanced",
    name: "Advanced",
    price: "$300",
    description: "More detailed report with additional outputs.",
    outputs: [
      "Structural Analysis of Grey Matter in Your Brain",
      "Brain Degeneration Mapping",
      "White-Matter HyperIntensities Mapping",
      "Advanced White Matter Microstructure Analysis",
    ],
    meta: "De-identified storage • Report via email (~1 week)",
    cta: "Select Advanced →",
    next: "Next: upload your scan, then complete payment.",
    featured: true,
  },
];

const steps = [
  { n: "1", title: "Choose Plan", icon: "🧾" },
  { n: "2", title: "Upload Scan", icon: "🧠" },
  { n: "3", title: "Make Payment", icon: "💳" },
  { n: "4", title: "Receive Report", icon: "📥" },
] as const;

const securityCards = [
  {
    title: "De-Identified Storage",
    desc: "Files are stored securely with privacy-first handling for patient-sensitive data.",
    icon: "📁",
  },
  {
    title: "Secure Payments",
    desc: "Encrypted checkout flow with reliable payment processing and webhook confirmation.",
    icon: "🛡️",
  },
  {
    title: "Data Protection",
    desc: "Controlled access, audit-friendly flow, and safer file lifecycle from upload to report.",
    icon: "🔐",
  },
] as const;

export const runtime = "nodejs";

export default async function LandingPage() {
  const heroSlides = await getHeroSlides();
  const slides = heroSlides.length > 0 ? heroSlides : ["/hero-preview/fallback.png"];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <style>{`html { scroll-behavior: smooth; }`}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-[#FDFDFD]/90 backdrop-blur">
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

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#004483] md:flex">
            <a href="#pricing" className="hover:text-[#007AEB]">Pricing</a>
            <a href="#how" className="hover:text-[#007AEB]">How It Works</a>
            <a href="#security" className="hover:text-[#007AEB]">Privacy & Security</a>
          </nav>

          <a
            href="#pricing"
            className="rounded-xl bg-[#007AEB] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,122,235,0.35)] transition hover:brightness-110"
          >
            Get Started
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#004483] via-[#0069CC] to-[#007AEB] text-white">
        <div className="pointer-events-none absolute inset-x-0 bottom-[-120px] h-[240px] rounded-[100%] bg-[#77BEF2]/40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[-145px] h-[240px] rounded-[100%] bg-[#77BEF2]/28" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[-175px] h-[240px] rounded-[100%] bg-white/14" />

        <div className="relative mx-auto grid max-w-6xl gap-20 px-4 py-16 md:grid-cols-2 md:gap-20 lg:gap-28 md:py-20">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Upload your MRI scan,
              <span className="mt-2 block text-white">Receive a detailed report by email.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
              Secure upload • De-identified storage • Report via email
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="rounded-xl bg-[#007AEB] px-6 py-3 text-center text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,122,235,0.35)] transition hover:brightness-110"
              >
                Choose a Plan
              </a>
              <a
                href="#how"
                className="rounded-xl bg-[#FDFDFD] px-6 py-3 text-center text-base font-semibold text-[#004483] shadow-sm transition hover:bg-white"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end md:pl-16 lg:pl-24 xl:pl-28">
            <div className="w-full max-w-[680px] md:max-w-[760px] lg:max-w-[860px] xl:max-w-[920px]">
              <LaptopScreenCarousel
                images={slides}
                intervalMs={2000}
                frameSrc="/frames/laptop-frame.png"
                className="scale-[2.15] origin-center md:origin-right md:translate-x-16 md:scale-[2.5] lg:translate-x-68"
                screen={{
                  leftPct: 23.8,
                  topPct: 19.6,
                  widthPct: 53.0,
                  heightPct: 60.5,
                  radiusPx: 10,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#EAF0F6] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-[#004483] md:text-5xl">
              Choose your plan
            </h2>
            <p className="mt-2 text-base text-[#004483]/80 md:text-lg">
              Simple pricing, secure upload, and report delivery by email.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((p) => (
              <article
                key={p.key}
                className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#FDFDFD] p-6 shadow-[0_16px_40px_rgba(0,68,131,0.14)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(0,68,131,0.18)] md:p-7"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    p.featured ? "bg-[#007AEB]" : "bg-[#77BEF2]"
                  }`}
                />

                {p.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-[#007AEB] px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}

                <div className="pr-20">
                  <h3 className="text-2xl font-semibold text-[#004483]">{p.name}</h3>
                  <div className="mt-1 text-4xl font-bold leading-none text-[#004483]">{p.price}</div>
                  <p className="mt-3 text-sm leading-relaxed text-[#1F4D82] md:text-base">
                    {p.description}
                  </p>
                </div>

                <div className="my-5 h-px w-full bg-[#E0E0E0]" />

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2A649F]">
                    Included in this plan
                  </p>

                  <ul className="space-y-2.5">
                    {p.outputs.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-[#0F3F75] md:text-[15px]"
                      >
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#007AEB]" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 rounded-xl border border-[#D8E6F5] bg-[#F4F9FF] px-4 py-3 text-xs text-[#1F5A95] md:text-sm">
                  {p.meta}
                </div>

                <div className="mt-auto pt-6">
                  <Link
                    href={`/upload?plan=${p.key}`}
                    className="block rounded-xl bg-[#004483] px-5 py-3 text-center text-base font-semibold text-white shadow-[0_10px_24px_rgba(0,68,131,0.26)] transition hover:brightness-110"
                  >
                    {p.cta}
                  </Link>
                </div>

                <p className="mt-3 text-center text-xs text-[#3B6EA4]">{p.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[#FDFDFD] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-5xl font-semibold tracking-tight text-[#004483] md:text-6xl">
            How it works
          </h2>

          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-10 hidden border-t-2 border-dashed border-[#C7D7EE] md:block" />
            <div className="grid gap-6 md:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="relative flex flex-col items-center text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-[#EEF4FD] text-3xl shadow-inner ring-1 ring-[#DDE7F7]">
                    {s.icon}
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-[#004483]">
                    {s.n}. {s.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section id="security" className="border-y border-[#D8E1EE] bg-[#EAF0F6] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-5xl font-semibold tracking-tight text-[#004483] md:text-6xl">
            Privacy & Security
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-[#204F87] md:text-base">
            Disclaimer: This service is provided for informational purposes only and is not a
            substitute for professional medical advice, diagnosis, or treatment.{" "}
            <a
              href="/documents/disclaimer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#007AEB] underline underline-offset-4 hover:text-[#004483]"
            >
              Click here
            </a>{" "}
            to read the full disclaimer.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {securityCards.map((c) => (
              <article
                key={c.title}
                className="rounded-2xl border border-[#D7DEE9] bg-[#FDFDFD] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#EAF4FF] text-2xl">
                    {c.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-[#004483]">{c.title}</h3>
                </div>
                <p className="mt-4 text-base leading-relaxed text-[#204F87]">{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDFDFD]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 border-t border-[#E0E0E0]" />
          <div className="flex flex-col gap-4 text-sm text-[#2F5E93] md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Brain Health Report. All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#pricing" className="hover:text-[#007AEB]">Pricing</a>
              <a href="#how" className="hover:text-[#007AEB]">How It Works</a>
              <a href="#security" className="hover:text-[#007AEB]">Privacy & Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}