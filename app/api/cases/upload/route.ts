// app/api/cases/upload/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import Busboy from "busboy";
import { prisma } from "@/lib/prisma";

const ALLOWED = [".nii", ".nii.gz", ".zip", ".tgz", ".gz"];
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? `${5 * 1024 * 1024 * 1024}`); // 5GB default
const DATA_ROOT = process.env.DATA_ROOT ?? path.join(process.cwd(), "data");

function isAllowedFile(name: string) {
  const lower = name.toLowerCase();
  return ALLOWED.some((ext) => lower.endsWith(ext));
}

function safeName(name: string) {
  // remove directories, normalize weird paths, avoid traversal
  return path.basename(name).replaceAll("..", ".").replaceAll("/", "_").replaceAll("\\", "_");
}

function parseDob(dobStr: string): Date | null {
  // expects YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dobStr.trim());
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

type ParsedUpload = {
  fields: {
    patientName: string;
    email: string;
    dobStr: string;
    gender: string;
    plan:  string; 
  };
  file: {
    originalName: string;
    mimeType: string | null;
    tmpPartPathAbs: string;
    bytes: number;
    checksumSha256: string;
  };
};

async function parseMultipart(req: Request): Promise<ParsedUpload> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new Error("Expected multipart/form-data");
  }
  if (!req.body) throw new Error("Missing request body");

  const tmpDirAbs = path.join(DATA_ROOT, "tmp");
  await fsp.mkdir(tmpDirAbs, { recursive: true });

  const uploadId = crypto.randomUUID();
  const tmpPartPathAbs = path.join(tmpDirAbs, `${uploadId}.part`);

  const fields = {
    patientName: "",
    email: "",
    dobStr: "",
    gender: "",
    plan: "basic",
  };

  let fileSeen = false;
  let originalName = "";
  let mimeType: string | null = null;

  const hash = crypto.createHash("sha256");
  let bytes = 0;

  let writeStream: fs.WriteStream | null = null;
  let fileWriteDone: Promise<void> | null = null;

  const bb = Busboy({
    headers: { "content-type": contentType },
    limits: {
      files: 1,
      fields: 20,
      fileSize: MAX_BYTES,
    },
  });

  const done = new Promise<ParsedUpload>((resolve, reject) => {
    const cleanup = async () => {
      try {
        if (writeStream) writeStream.destroy();
      } catch {}
      try {
        await fsp.unlink(tmpPartPathAbs);
      } catch {}
    };

    bb.on("field", (name, val) => {
      const v = String(val ?? "").trim();
      if (name === "patientName") fields.patientName = v;
      if (name === "email") fields.email = v;
      if (name === "dob") fields.dobStr = v;
      if (name === "gender") fields.gender = v;
      if (name === "plan") fields.plan = v;
    });

    bb.on("file", (fieldname, file, info) => {
      if (fieldname !== "file") {
        file.resume();
        return;
      }
      if (fileSeen) {
        file.resume();
        reject(new Error("Only one file allowed"));
        return;
      }
      fileSeen = true;

      originalName = safeName(info.filename || "upload.bin");
      mimeType = info.mimeType || null;

      if (!isAllowedFile(originalName)) {
        file.resume();
        reject(new Error(`Invalid file type. Allowed: ${ALLOWED.join(", ")}`));
        return;
      }

      // Write atomically: write to tmpPartPathAbs; only exists when complete
      writeStream = fs.createWriteStream(tmpPartPathAbs, { flags: "wx", mode: 0o600 });

      file.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        hash.update(chunk);
      });

      file.on("limit", () => {
        reject(new Error(`File too large. Max bytes: ${MAX_BYTES}`));
      });

      file.on("error", (err) => reject(err));
      writeStream.on("error", (err) => reject(err));

      // Pipe file -> disk
      file.pipe(writeStream);

      fileWriteDone = new Promise<void>((res, rej) => {
        writeStream!.on("finish", () => res());
        writeStream!.on("close", () => res());
        writeStream!.on("error", (e) => rej(e));
      });
    });

    bb.on("error", async (err) => {
      await cleanup();
      reject(err);
    });

    bb.on("filesLimit", async () => {
      await cleanup();
      reject(new Error("Only one file allowed"));
    });

    bb.on("finish", async () => {
      try {
        if (!fileSeen || !fileWriteDone) throw new Error("Missing file");
        await fileWriteDone;

        // sanity: file must exist and be > 0
        const st = await fsp.stat(tmpPartPathAbs);
        if (!st.isFile() || st.size <= 0) throw new Error("Uploaded file is empty");

        resolve({
          fields,
          file: {
            originalName,
            mimeType,
            tmpPartPathAbs,
            bytes: st.size,
            checksumSha256: hash.digest("hex"),
          },
        });
      } catch (e: any) {
        await cleanup();
        reject(e);
      }
    });
  });

  // Start parsing
  Readable.fromWeb(req.body as any).pipe(bb);
  return done;
}

export async function POST(req: Request) {
  let tmpToCleanup: string | null = null;

  try {
    const parsed = await parseMultipart(req);
    tmpToCleanup = parsed.file.tmpPartPathAbs;

    const patientName = parsed.fields.patientName.trim();
    const email = parsed.fields.email.trim();
    const gender = parsed.fields.gender.trim(); // must match Prisma enum strings
    const dob = parseDob(parsed.fields.dobStr);
    const planRaw = parsed.fields.plan?.toLowerCase?.() ?? "basic";
    const plan = planRaw === "advanced" ? "ADVANCED" : "BASIC";


    if (!patientName || !email || !gender || !dob) {
      return NextResponse.json(
        { error: "Missing required fields: patientName, email, gender, dob(YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const allowedGenders = new Set(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
    if (!allowedGenders.has(gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
    }

    // Create caseId up-front (uuid) so filesystem + DB match
    const caseId = crypto.randomUUID();

    // Store *relative* path in DB (portable between machines)
    const rawRelDir = path.join("cases", caseId, "raw");  // relative to DATA_ROOT
    const rawAbsDir = path.join(DATA_ROOT, rawRelDir);
    await fsp.mkdir(rawAbsDir, { recursive: true });

    // Ensure final name is safe
    const finalFileName = safeName(parsed.file.originalName);
    const storedRelPath = path.join(rawRelDir, finalFileName);
    const storedAbsPath = path.join(DATA_ROOT, storedRelPath);

    // If somehow exists, avoid overwrite
    try {
      await fsp.access(storedAbsPath);
      const ext = path.extname(finalFileName);
      const base = finalFileName.slice(0, Math.max(0, finalFileName.length - ext.length));
      const altName = `${base}-${crypto.randomUUID()}${ext}`;
      const altRel = path.join(rawRelDir, altName);
      const altAbs = path.join(DATA_ROOT, altRel);
      await fsp.rename(parsed.file.tmpPartPathAbs, altAbs);
      tmpToCleanup = null;

      const st = await fsp.stat(altAbs);

      await prisma.$transaction([
        prisma.case.create({
          data: {
            id: caseId,
            patientName,
            submitterEmail: email,
            gender: gender as any,
            dob,
            plan: plan as any, 
            status: "UPLOADING",
          },
        }),
        prisma.caseFile.create({
          data: {
            caseId,
            originalName: parsed.file.originalName,
            storedPath: altRel,
            mimeType: parsed.file.mimeType,
            sizeBytes: BigInt(st.size),
            checksumSha256: parsed.file.checksumSha256,
          },
        }),
      ]);

      return NextResponse.json({ ok: true, caseId });
    } catch {
      // doesn't exist -> normal path
    }

    // Atomic move temp -> final
    await fsp.rename(parsed.file.tmpPartPathAbs, storedAbsPath);
    tmpToCleanup = null;

    const stat = await fsp.stat(storedAbsPath);

    // DB write (transaction). If DB fails, delete file so no orphan PHI sits on disk.
    try {
      await prisma.$transaction([
        prisma.case.create({
          data: {
            id: caseId,
            patientName,
            submitterEmail: email,
            gender: gender as any,
            dob,
            plan: plan as any,
            status: "UPLOADING",
          },
        }),
        prisma.caseFile.create({
          data: {
            caseId,
            originalName: parsed.file.originalName,
            storedPath: storedRelPath,
            mimeType: parsed.file.mimeType,
            sizeBytes: BigInt(stat.size),
            checksumSha256: parsed.file.checksumSha256,
          },
        }),
      ]);
    } catch (dbErr) {
      // cleanup moved file
      try {
        await fsp.unlink(storedAbsPath);
      } catch {}
      throw dbErr;
    }

    return NextResponse.json({ ok: true, caseId });
  } catch (err: any) {
    console.error("UPLOAD_ROUTE_ERROR:", err);

    // cleanup temp .part if still there
    if (tmpToCleanup) {
      try {
        await fsp.unlink(tmpToCleanup);
      } catch {}
    }

    const msg = String(err?.message ?? "Server error");
    const status =
      msg.includes("multipart") || msg.includes("Missing") || msg.includes("Invalid") || msg.includes("Max")
        ? 400
        : 500;

    return NextResponse.json({ error: msg }, { status });
  }
}
