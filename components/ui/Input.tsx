"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
        "placeholder:text-slate-400 outline-none",
        "focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300",
        className
      )}
      {...props}
    />
  );
}
