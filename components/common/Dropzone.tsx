"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { isAllowedUploadFile, allowedHint } from "@/lib/validators";

export function Dropzone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const onDrop = useCallback(
    (files: File[]) => {
      const f = files?.[0];
      if (!f) return;

      if (!isAllowedUploadFile(f.name)) {
        onChange(null);
        return;
      }
      onChange(f);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-2xl border border-dashed p-4 cursor-pointer transition",
        isDragActive ? "bg-black/5" : "bg-white"
      )}
    >
      <input {...getInputProps()} />
      <div className="text-sm font-semibold">
        {file ? `Selected: ${file.name}` : "Click to upload or drag and drop"}
      </div>
      <div className="mt-1 text-xs text-black/60">{allowedHint()}</div>
      {file && <div className="mt-2 text-xs text-black/60">Size: {file.size.toLocaleString()} bytes</div>}
    </div>
  );
}
