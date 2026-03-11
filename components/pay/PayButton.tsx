"use client";

import { useState } from "react";

export default function PayButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function startPayment() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create checkout session");

      window.location.href = json.url; // redirect to Stripe Checkout
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {err ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {err}
        </div>
      ) : null}

      <button
        disabled={loading}
        onClick={startPayment}
        className={[
          "w-full rounded-2xl px-5 py-3 text-sm font-medium transition",
          loading ? "bg-white/20 text-white/70" : "bg-white text-[#020C21] hover:bg-white/90",
        ].join(" ")}
      >
        {loading ? "Redirecting…" : "Pay now →"}
      </button>

      <div className="text-center text-xs text-white/60">
        You’ll receive the report by email in ~2 weeks.
      </div>
    </div>
  );
}
