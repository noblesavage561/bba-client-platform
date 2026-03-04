import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { intakeSubmissionSchema } from "@/lib/validations/intake";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = intakeSubmissionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { clientId, answers, step, completed } = validated.data;

    const submission = await prisma.intakeSubmission.create({
      data: {
        clientId,
        answers: JSON.stringify(answers),
        step,
        completed,
        submittedAt: completed ? new Date() : null,
      },
    });

    // If completed, advance client to INTAKE stage
    if (completed) {
      await prisma.client.update({
        where: { id: clientId },
        data: { stage: "INTAKE" },
      });
    }

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("[INTAKE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
