"use client";

import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
        "outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300",
        className
      )}
      {...props}
    />
  );
}
