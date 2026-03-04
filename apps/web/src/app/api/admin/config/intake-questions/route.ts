import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const questions = await prisma.intakeQuestion.findMany({
      orderBy: [{ step: "asc" }, { order: "asc" }],
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("[INTAKE_QUESTIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN", "PROGRAM_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { step, order, label, type, options, required, conditionalField, conditionalValue, description } = body;

    const question = await prisma.intakeQuestion.create({
      data: {
        step,
        order,
        label,
        description,
        type,
        options: JSON.stringify(options ?? []),
        required: required ?? true,
        conditionalField,
        conditionalValue,
        active: true,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("[INTAKE_QUESTIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
