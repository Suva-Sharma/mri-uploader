// lib/email.ts
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type EmailType = "USER_RECEIVED" | "ADMIN_NEW_UPLOAD" | "USER_COMPLETED" | "USER_FAILED";

function getTransport() {
  const mode = (process.env.EMAIL_MODE ?? "console").toLowerCase();

  if (mode === "console") return null;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("EMAIL_MODE=smtp but SMTP_HOST/SMTP_USER/SMTP_PASS not configured");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendAndLogEmail(opts: {
  caseId: string;
  to: string;
  type: EmailType;
  subject: string;
  text: string;
}) {
  const mode = (process.env.EMAIL_MODE ?? "console").toLowerCase();
  const from = process.env.SMTP_FROM ?? "no-reply@mri-uploader.local";

  let status: "SENT" | "FAILED" | "CONSOLE" = "CONSOLE";
  let error: string | null = null;

  try {
    const transport = getTransport();

    if (!transport) {
      // console mode (dev)
      console.log("\n[EMAIL:CONSOLE]", { to: opts.to, subject: opts.subject, text: opts.text }, "\n");
    } else {
      await transport.sendMail({
        from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
      });
    }
  } catch (e: any) {
    status = "FAILED";
    error = String(e?.message ?? e);
  }

  // Always log the attempt
  await prisma.emailLog.create({
    data: {
      caseId: opts.caseId,
      to: opts.to,
      type: opts.type as any,
      status: status as any,
      error,
    },
  });

  // If in smtp mode and sending failed, you can decide if you want to throw.
  // I recommend NOT blocking the medical pipeline due to email failure.
  if (mode === "smtp" && status === "FAILED") {
    console.warn("EMAIL_SEND_FAILED:", error);
  }
}
