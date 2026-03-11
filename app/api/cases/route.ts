import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const patientName = String(body.patientName ?? "").trim();
    const submitterEmail = String(body.email ?? "").trim();
    const gender = body.gender; 
    const dobRaw = body.dob;

    if (!patientName || !submitterEmail || !gender || !dobRaw) {
      return NextResponse.json(
        { error: "Missing required fields: patientName, email, gender, dob" },
        { status: 400 }
      );
    }

    const dob = new Date(dobRaw);
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json({ error: "Invalid dob" }, { status: 400 });
    }

    // IMPORTANT:
    // This assumes your Prisma model is named `Case` (so client is prisma.case)
    // and fields match: patientName, submitterEmail, gender, dob, status.
    const created = await prisma.case.create({
      data: {
        patientName,
        submitterEmail,
        gender,
        dob,
        status: "CREATED",
      },
      select: { id: true },
    });

    return NextResponse.json({ caseId: created.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
