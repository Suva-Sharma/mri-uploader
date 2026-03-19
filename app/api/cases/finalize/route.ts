// app/api/cases/finalize/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fsp from "node:fs/promises";
import path from "node:path";
import { sha256FileStreaming } from "@/lib/fileHash";
import { notifyCaseReceived } from "@/lib/notify";

const DATA_ROOT = process.env.DATA_ROOT ?? path.join(process.cwd(), "data");

function resolveStoredPath(storedPath: string) {
  return path.isAbsolute(storedPath)
    ? storedPath
    : path.join(DATA_ROOT, storedPath);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const caseId = String(body.caseId ?? "").trim();
    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    const found = await prisma.case.findUnique({
      where: { id: caseId },
      include: { files: true },
    });

    if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });
    if (!found.files?.length) {
      return NextResponse.json({ error: "No files found for this case" }, { status: 400 });
    }

    await prisma.case.update({
      where: { id: caseId },
      data: { status: "VALIDATING" },
    });

    for (const f of found.files) {
      const abs = resolveStoredPath(f.storedPath);

      let stat;
      try {
        stat = await fsp.stat(abs);
      } catch {
        await prisma.case.update({
          where: { id: caseId },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ error: "File missing on server" }, { status: 400 });
      }

      if (!stat.isFile() || stat.size <= 0) {
        await prisma.case.update({
          where: { id: caseId },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
      }

      const checksumNow = await sha256FileStreaming(abs);

      if (f.checksumSha256 && f.checksumSha256 !== checksumNow) {
        await prisma.case.update({
          where: { id: caseId },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ error: "Checksum mismatch (file corrupted)" }, { status: 400 });
      }

      await prisma.caseFile.update({
        where: { id: f.id },
        data: {
          checksumSha256: checksumNow,
          validatedAt: new Date(),
          sizeBytes: BigInt(stat.size),
        },
      });
    }

    await prisma.case.update({
      where: { id: caseId },
      data: { status: "QUEUED", validatedAt: new Date() },
    });

    try {
      await notifyCaseReceived(caseId);
    } catch (e) {
      console.warn("NOTIFY_FAILED:", e);
    }

    return NextResponse.json({ ok: true, caseId, status: "QUEUED" });
  } catch (err) {
    console.error("FINALIZE_ROUTE_ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}