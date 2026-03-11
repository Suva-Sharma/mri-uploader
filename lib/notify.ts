// lib/notify.ts
import { prisma } from "@/lib/prisma";
import { sendAndLogEmail } from "@/lib/email";

export async function notifyCaseReceived(caseId: string) {
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, patientName: true, submitterEmail: true, createdAt: true },
  });
  if (!c) return;

  // idempotency: don’t spam if finalize is called twice
  const already = await prisma.emailLog.findFirst({
    where: { caseId, type: "USER_RECEIVED", status: "SENT" },
    select: { id: true },
  });
  if (already) return;

  // user email
  await sendAndLogEmail({
    caseId,
    to: c.submitterEmail,
    type: "USER_RECEIVED",
    subject: "We received your MRI upload",
    text:
      `Hi ${c.patientName},\n\n` +
      `We received your scan upload successfully.\n` +
      `Our team will review it and you should receive the report in about 2 weeks.\n\n` +
      `Reference ID: ${caseId}\n\n` +
      `Thank you.`,
  });

  // admin recipients
 // lib/notify.ts

// admin recipients
const admins = await prisma.notificationRecipient.findMany({
  where: { isActive: true },   // ✅ FIX: was enabled: true
  select: { email: true },
});


  for (const a of admins) {
    await sendAndLogEmail({
      caseId,
      to: a.email,
      type: "ADMIN_NEW_UPLOAD",
      subject: `New MRI upload received (Case ${caseId})`,
      text:
        `New case received:\n\n` +
        `Case ID: ${caseId}\n` +
        `Patient: ${c.patientName}\n` +
        `Submitter: ${c.submitterEmail}\n` +
        `Created: ${c.createdAt.toISOString()}\n`,
    });
  }
}
