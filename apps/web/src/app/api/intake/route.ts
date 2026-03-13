import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { intakeSubmissionSchema } from "@/lib/validations/intake";

const DEFAULT_CHECKLIST_ITEMS = [
  {
    label: "Government-Issued ID",
    description: "Upload a valid government-issued photo ID for identity verification.",
    category: "Identification",
    required: true,
  },
  {
    label: "Business Tax Returns (2 years)",
    description: "Provide your most recent two years of filed business returns.",
    category: "Tax",
    required: true,
  },
  {
    label: "Bank Statements (3 months)",
    description: "Upload the latest three months of primary operating account statements.",
    category: "Financial",
    required: true,
  },
  {
    label: "W-2 / 1099 Documents",
    description: "Upload all available W-2 and 1099 forms for this filing cycle.",
    category: "Income",
    required: true,
  },
  {
    label: "Prior Year Notices (if any)",
    description: "Share IRS or state notices so the team can resolve open filing issues.",
    category: "Compliance",
    required: false,
  },
] as const;

function readTextAnswer(
  answers: Record<string, unknown>,
  field: string,
  fallback: string
): string {
  const value = answers[field];
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function readOptionalEmail(answers: Record<string, unknown>, field: string): string | null {
  const value = answers[field];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

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
    const answerMap = answers as Record<string, unknown>;

    let ownerEmailForHandoff = readOptionalEmail(answerMap, "ownerEmail");
    let businessNameForHandoff = readTextAnswer(answerMap, "businessName", "New Applicant");
    let requiresRegistration = false;

    // If clientId is "pending", create a guest lead client record
    let resolvedClientId = clientId;
    if (clientId === "pending") {
      const businessName = readTextAnswer(answerMap, "businessName", "New Applicant");
      const ownerName = readTextAnswer(answerMap, "ownerName", businessName);
      const ownerEmail = ownerEmailForHandoff ?? `guest-${Date.now()}@pending.bba`;

      ownerEmailForHandoff = ownerEmail;
      businessNameForHandoff = businessName;

      // Find or create a user for this email
      let user = await prisma.user.findUnique({
        where: { email: ownerEmail },
        include: { client: { select: { id: true } } },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { email: ownerEmail, name: ownerName, role: "CLIENT" },
          include: { client: { select: { id: true } } },
        });
      }

      requiresRegistration = !user.hashedPassword;

      // Find or create the client record
      if (user.client) {
        resolvedClientId = user.client.id;
      } else {
        const newClient = await prisma.client.create({
          data: { userId: user.id, businessName, stage: "LEAD" },
        });
        resolvedClientId = newClient.id;
      }
    } else {
      const clientContext = await prisma.client.findUnique({
        where: { id: resolvedClientId },
        select: {
          businessName: true,
          user: {
            select: {
              email: true,
              hashedPassword: true,
            },
          },
        },
      });

      if (clientContext?.user?.email) {
        ownerEmailForHandoff = clientContext.user.email;
        requiresRegistration = !clientContext.user.hashedPassword;
      }

      if (clientContext?.businessName) {
        businessNameForHandoff = clientContext.businessName;
      }
    }

    const submission = await prisma.intakeSubmission.create({
      data: {
        clientId: resolvedClientId,
        answers: JSON.stringify(answers),
        step,
        completed,
        submittedAt: completed ? new Date() : null,
      },
    });

    // If completed, advance client to INTAKE stage
    if (completed) {
      const updatedClient = await prisma.client.update({
        where: { id: resolvedClientId },
        data: { stage: "INTAKE" },
        select: { userId: true, businessName: true },
      });

      businessNameForHandoff = updatedClient.businessName;

      const existingChecklist = await prisma.checklistItem.findMany({
        where: { clientId: resolvedClientId },
        select: { label: true },
      });

      const existingLabels = new Set(existingChecklist.map((item) => item.label.toLowerCase()));
      const checklistToCreate = DEFAULT_CHECKLIST_ITEMS
        .filter((item) => !existingLabels.has(item.label.toLowerCase()))
        .map((item) => ({
          clientId: resolvedClientId,
          label: item.label,
          description: item.description,
          category: item.category,
          required: item.required,
          status: "PENDING",
        }));

      if (checklistToCreate.length > 0) {
        await prisma.checklistItem.createMany({
          data: checklistToCreate,
        });
      }

      await prisma.notification.create({
        data: {
          userId: updatedClient.userId,
          type: requiresRegistration ? "WARNING" : "SUCCESS",
          title: "Intake submitted",
          message: requiresRegistration
            ? "Your intake is complete. Create your portal sign-in to continue with document uploads and checklist tracking."
            : "Your intake is complete. Upload documents to activate AI classification and checklist updates.",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        submission,
        clientId: resolvedClientId,
        requiresRegistration,
        ownerEmail: ownerEmailForHandoff,
        businessName: businessNameForHandoff,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[INTAKE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
