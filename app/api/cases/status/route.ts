// app/api/cases/status/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toJsonSafeCase(c: any) {
  return {
    id: c.id,
    patientName: c.patientName,
    submitterEmail: c.submitterEmail,
    dob: c.dob,
    gender: c.gender,
    status: c.status,
    validatedAt: c.validatedAt,
    completedAt: c.completedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    files: c.files.map((f: any) => ({
      id: f.id,
      originalName: f.originalName,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes?.toString?.() ?? null,
      checksumSha256: f.checksumSha256,
      uploadedAt: f.uploadedAt,
      validatedAt: f.validatedAt,
      // storedPath intentionally omitted
    })),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = String(searchParams.get("caseId") ?? "").trim();
    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    const found = await prisma.case.findUnique({
      where: { id: caseId },
      include: { files: true },
    });

    if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });
    return NextResponse.json({ ok: true, case: toJsonSafeCase(found) });
  } catch (err) {
    console.error("STATUS_ROUTE_ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
