"use client";

import { useState } from "react";

export default function PayButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    try {
      setLoading(true);

      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to start checkout");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Missing checkout URL");
    } catch (err: any) {
      alert(err?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className={[
        "w-full rounded-xl px-5 py-3 text-sm font-semibold transition",
        loading
          ? "cursor-not-allowed bg-[#BFD4EA] text-white"
          : "bg-[#004483] text-white shadow-[0_10px_24px_rgba(0,68,131,0.22)] hover:bg-[#005AAE]",
      ].join(" ")}
    >
      {loading ? "Redirecting..." : "Pay now →"}
    </button>
  );
}