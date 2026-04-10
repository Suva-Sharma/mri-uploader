"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  caseId: string;
};

export default function PayLaterButton({ caseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePayLater() {
    try {
      setLoading(true);

      const res = await fetch("/api/payments/pay-later", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to continue with pay later");
      }

      router.push(`/pay/later-success?caseId=${caseId}`);
    } catch (err: any) {
      alert(err?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePayLater}
      disabled={loading}
      className={[
        "w-full rounded-xl border border-[#BFD8F2] bg-white px-5 py-3 text-sm font-semibold text-[#004483] transition hover:bg-[#F5FAFF]",
        loading ? "cursor-not-allowed opacity-70" : "",
      ].join(" ")}
    >
      {loading ? "Please wait..." : "Pay Later"}
    </button>
  );
}