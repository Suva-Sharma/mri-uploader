"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Plan = "basic" | "advanced";

type UploadResp = { ok?: boolean; caseId?: string; error?: string };
type FinalizeResp = { ok?: boolean; caseId?: string; status?: string; error?: string };

function uploadWithProgress(
  url: string,
  fd: FormData,
  onProgress: (pct: number) => void
): Promise<UploadResp> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.round((evt.loaded / evt.total) * 100);
      onProgress(Math.max(0, Math.min(100, pct)));
    };

    xhr.onload = () => {
      const json = (xhr.response ?? {}) as UploadResp;
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else reject(new Error(json?.error ?? `Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

export default function MriSubmitForm({ plan }: { plan?: Plan }) {
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY">("MALE");
  const [file, setFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSubmit = useMemo(() => {
    if (busy) return false;
    return Boolean(patientName.trim() && email.trim() && dob.trim() && gender && file);
  }, [busy, patientName, email, dob, gender, file]);

  const router = useRouter();

  function validateClient() {
    const e: Record<string, string> = {};
    if (!patientName.trim()) e.patientName = "Name is required";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email is required";
    if (!dob.trim()) e.dob = "DOB is required";
    if (!gender) e.gender = "Gender is required";
    if (!file) e.file = "File is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setStep(null);
    setUploadPct(0);
    setErrors({});

    if (!validateClient() || !file) return;

    setBusy(true);

    try {
      setStep("Uploading…");

      const fd = new FormData();
      fd.append("patientName", patientName);
      fd.append("email", email);
      fd.append("dob", dob);
      fd.append("gender", gender);
      fd.append("file", file);
      fd.append("plan", plan ?? "basic");

      const uploadJson = await uploadWithProgress("/api/cases/upload", fd, setUploadPct);
      if (!uploadJson.ok) throw new Error(uploadJson?.error ?? "Upload failed");

      const caseId = uploadJson.caseId;
      if (!caseId) throw new Error("Upload did not return a caseId");

      setUploadPct(100);
      setStep("Validating…");

      const finRes = await fetch("/api/cases/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });

      const finJson = (await finRes.json()) as FinalizeResp;
      if (!finRes.ok) throw new Error(finJson?.error ?? "Finalize failed");

      setStep("Redirecting to payment…");
      router.push(`/pay?caseId=${caseId}`);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err?.message ?? "Something went wrong" }));
      setStep(null);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-[#004483]">
      {/* top info */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E0E0E0] bg-[#FDFDFD] px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Patient Submission Form</div>
          <div className="text-xs text-[#4E6E95]">Fill details, upload MRI, then continue to payment.</div>
        </div>
        <div className="inline-flex items-center rounded-full bg-[#EAF4FF] px-3 py-1 text-xs font-semibold text-[#004483]">
          Plan: {(plan ?? "basic").toUpperCase()}
        </div>
      </div>

      {/* fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" error={errors.patientName}>
          <Input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Patient name"
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </Field>

        <Field label="Date of birth" error={errors.dob}>
          <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </Field>

        <Field label="Gender" error={errors.gender}>
          <Select value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </Select>
        </Field>
      </div>

      {/* upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[#004483]">Upload file</div>
          <div className="text-xs text-[#4E6E95]">.nii / .nii.gz / .zip / .tgz / .gz</div>
        </div>

        <Dropzone file={file} onChange={setFile} error={errors.file} disabled={busy} />
      </div>

      {/* progress */}
      {busy && (
        <div className="space-y-2 rounded-xl border border-[#D5E9FF] bg-[#F7FBFF] p-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0E0E0]">
            <div className="h-full rounded-full bg-[#007AEB] transition-all" style={{ width: `${uploadPct}%` }} />
          </div>
          <div className="text-xs text-[#2F5E93]">
            {step ?? "Working…"} {uploadPct > 0 ? `• ${uploadPct}%` : ""}
          </div>
        </div>
      )}

      {/* error */}
      {errors.submit ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.submit}
        </div>
      ) : null}

      {/* submit */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className={[
          "w-full rounded-xl px-5 py-3 text-sm font-semibold transition",
          canSubmit
            ? "bg-[#004483] text-white hover:bg-[#005AAE] shadow-[0_10px_24px_rgba(0,68,131,0.25)]"
            : "cursor-not-allowed bg-[#E0E0E0] text-[#7C8CA1]",
        ].join(" ")}
      >
        {busy ? "Submitting…" : "Submit & continue →"}
      </button>

      <div className="space-y-2 text-center">
        <div className="text-s text-[#E0E0E0]">
          We verify the upload before moving to payment.
        </div>

        <div className="mx-auto max-w-2xl text-s leading-relaxed text-[#E0E0E0]">
          Disclaimer: This service is provided for informational purposes only and is not a
          substitute for professional medical advice, diagnosis, or treatment.{" "}
          <a
            href="/documents/disclaimer.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-4 hover:text-[#77BEF2]"
          >
            Click here
          </a>{" "}
          to read the full disclaimer.
        </div>
      </div>
    </div>
  );
}

/* ---- UI helpers ---- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[#FFFFFF]">{label}</div>
        {error ? <div className="text-xs text-red-600">{error}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-[#E0E0E0] bg-[#FDFDFD] px-4 py-3 text-sm text-[#0F3562] outline-none",
        "placeholder:text-[#89A1BD] focus:border-[#77BEF2] focus:ring-4 focus:ring-[#77BEF2]/30",
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl border border-[#E0E0E0] bg-[#FDFDFD] px-4 py-3 text-sm text-[#0F3562] outline-none",
        "focus:border-[#77BEF2] focus:ring-4 focus:ring-[#77BEF2]/30",
      ].join(" ")}
    />
  );
}

function Dropzone({
  file,
  onChange,
  error,
  disabled,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "block cursor-pointer rounded-2xl border-2 border-dashed p-6 transition",
        "border-[#77BEF2] bg-[#F3F9FF] hover:bg-[#ECF6FF]",
        disabled ? "pointer-events-none opacity-70" : "",
        error ? "border-red-400 bg-red-50" : "",
      ].join(" ")}
    >
      <input
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {!file ? (
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#EAF4FF] text-[#004483]">⬆️</div>
          <div className="text-sm font-semibold text-[#004483]">Drag & drop your MRI file here</div>
          <div className="mt-1 text-xs text-[#4E6E95]">or click to browse</div>
          {error ? <div className="mt-3 text-xs text-red-600">{error}</div> : null}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#004483]">{file.name}</div>
            <div className="mt-1 text-xs text-[#4E6E95]">{formatBytes(file.size)}</div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
            }}
            className="rounded-lg border border-[#BFD8F2] bg-white px-3 py-2 text-xs font-medium text-[#004483] hover:bg-[#F5FAFF]"
          >
            Change
          </button>
        </div>
      )}
    </label>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}