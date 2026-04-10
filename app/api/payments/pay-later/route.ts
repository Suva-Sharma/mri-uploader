export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const caseId = String(body.caseId ?? "").trim();

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
    }

    const c = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!c) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (c.status !== "QUEUED") {
      return NextResponse.json(
        { error: "Upload is not verified yet" },
        { status: 400 }
      );
    }

    if (c.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "This case is already paid" },
        { status: 400 }
      );
    }

    await prisma.case.update({
      where: { id: caseId },
      data: {
        paymentStatus: "UNPAID",
      },
    });

    return NextResponse.json({ ok: true, caseId });
  } catch (err) {
    console.error("PAY_LATER_ROUTE_ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}