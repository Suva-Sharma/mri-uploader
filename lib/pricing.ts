// lib/pricing.ts
export function priceForPlan(plan: "BASIC" | "ADVANCED") {
    // amounts in cents (USD)
    if (plan === "ADVANCED") return { amountCents: 30000, currency: "usd" as const };
    return { amountCents: 20000, currency: "usd" as const };
  }

  