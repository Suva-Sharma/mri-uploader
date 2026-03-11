import type { ReactNode } from "react";

export function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{label}</div>
      {children}
      {error ? (
        <div className="text-xs text-red-600">{error}</div>
      ) : helper ? (
        <div className="text-xs text-black/60">{helper}</div>
      ) : null}
    </div>
  );
}
