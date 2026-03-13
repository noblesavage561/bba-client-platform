import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";
import { runAnthropicTextRequest } from "@/lib/ai/anthropic";

interface AdvisorBreakdown {
  identityVerification: number;
  incomeDocumentation: number;
  cashFlowAnalysis: number;
  deductionsCredits: number;
  priorYearFiling: number;
}

interface AdvisorClientContext {
  userId: string;
  stage: string;
  businessName: string;
  confidenceScore: ({ score: number } & AdvisorBreakdown) | null;
  documents: Array<{
    documentType: string;
    classificationConfidence: number | null;
  }>;
  checklistItems: Array<{ status: string }>;
  incomeSources: Array<{ id: string }>;
  deductions: Array<{ id: string }>;
}

interface AdvisorMessageResult {
  advisorMessage: string;
  confidenceExplanation: string;
  nextActions: Array<{ label: string; type: string; target: string }>;
  stageUnlockCondition: string;
  flags: string[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseId = request.nextUrl.searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "Missing caseId" },
        { status: 400 }
      );
    }

    // Fetch case data
    const client = (await db.client.findUnique({
      where: { id: caseId },
      include: {
        confidenceScore: true,
        documents: {
          where: { status: "PROCESSED" },
          select: {
            id: true,
            documentType: true,
            classificationConfidence: true,
            extractedData: true,
          },
        },
        checklistItems: {
          select: {
            id: true,
            label: true,
            status: true,
          },
        },
        incomeSources: true,
        deductions: true,
        advisorMessages: {
          take: 1,
          orderBy: { generatedAt: "desc" },
        },
      },
    })) as AdvisorClientContext | null;

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
    if (!isAdmin && client.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate advisor message using Claude
    const advisorMessage = await generateAdvisorMessage(client);

    // Save the message to database
    await db.aIAdvisorMessage.create({
      data: {
        clientId: caseId,
        advisorMessage: advisorMessage.advisorMessage,
        confidenceExplanation: advisorMessage.confidenceExplanation,
        nextActions: JSON.stringify(advisorMessage.nextActions),
        stageUnlockCondition: advisorMessage.stageUnlockCondition,
        flags: JSON.stringify(advisorMessage.flags),
      },
    });

    return NextResponse.json({
      score: client.confidenceScore?.score || 0,
      breakdown: {
        identityVerification: client.confidenceScore?.identityVerification || 0,
        incomeDocumentation: client.confidenceScore?.incomeDocumentation || 0,
        cashFlowAnalysis: client.confidenceScore?.cashFlowAnalysis || 0,
        deductionsCredits: client.confidenceScore?.deductionsCredits || 0,
        priorYearFiling: client.confidenceScore?.priorYearFiling || 0,
      },
      advisorMessage: advisorMessage.advisorMessage,
      confidenceExplanation: advisorMessage.confidenceExplanation,
      nextActions: advisorMessage.nextActions,
      stageUnlockCondition: advisorMessage.stageUnlockCondition,
      flags: advisorMessage.flags,
    });
  } catch (error) {
    console.error("Advisor API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate advisor message",
      },
      { status: 500 }
    );
  }
}

async function generateAdvisorMessage(
  client: AdvisorClientContext
): Promise<AdvisorMessageResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const docSummary = client.documents
    .map(
      (d) =>
        `${d.documentType} (confidence: ${((d.classificationConfidence ?? 0) * 100).toFixed(0)}%)`
    )
    .join(", ");

  const checklistPct = client.checklistItems.length > 0
    ? Math.round(
        (client.checklistItems.filter((i) => i.status === "COMPLETE").length /
          client.checklistItems.length) *
          100
      )
    : 0;

  const prompt = `You are the BBA Services AI Advisor. Your role is to guide this client through their business consulting and tax filing journey in plain, encouraging language. Be specific, never vague. Never use jargon without explanation.

Current case status:
- Stage: ${client.stage || "LEAD"}
- AI Confidence Score: ${client.confidenceScore?.score || 0}%
- Documents uploaded: ${docSummary || "None yet"}
- Checklist completion: ${checklistPct}%
- Income sources: ${client.incomeSources.length}
- Deductions recorded: ${client.deductions.length}
- Client business: ${client.businessName}

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "advisor_message": "2-3 sentences of specific, encouraging guidance for what to do RIGHT NOW",
  "confidence_explanation": "1 sentence explaining what's driving the current confidence score",
  "next_actions": [
    {"label": "short action label", "type": "upload|form|schedule|review", "target": "/route/path"},
    ...max 3
  ],
  "stage_unlock_condition": "what specifically needs to happen to advance to the next stage",
  "flags": ["list of any risks or issues the advisor wants to surface", "max 3 items"]
}`;

  if (!apiKey) {
    return {
      advisorMessage:
        "Your intake is in progress. Upload additional documents to increase your confidence score and unlock faster preparer review.",
      confidenceExplanation:
        "Your score reflects the verified documents and checklist items currently on file.",
      nextActions: [
        { label: "Upload Documents", type: "upload", target: "/portal/documents" },
        { label: "Complete Checklist", type: "form", target: "/portal/checklist" },
      ],
      stageUnlockCondition:
        "Provide at least two processed documents and complete pending checklist items.",
      flags: [],
    };
  }

  let content = "{}";
  try {
    content = await runAnthropicTextRequest({
      apiKey,
      prompt,
      maxTokens: 1000,
      timeoutMs: 30000,
    });
  } catch (error) {
    console.error("Claude API error:", error);
  }

  try {
    const parsed = JSON.parse(content) as Partial<{
      advisor_message: string;
      confidence_explanation: string;
      next_actions: Array<{ label: string; type: string; target: string }>;
      stage_unlock_condition: string;
      flags: string[];
    }>;

    return {
      advisorMessage:
        parsed.advisor_message ||
        "Good progress on your intake! Continue uploading documents to improve your confidence score.",
      confidenceExplanation:
        parsed.confidence_explanation ||
        "Your score reflects the documents and information you've provided so far.",
      nextActions: parsed.next_actions || [],
      stageUnlockCondition:
        parsed.stage_unlock_condition ||
        "Upload at least 2 financial documents to advance to the next stage.",
      flags: parsed.flags || [],
    };
  } catch {
    // Fallback response
    return {
      advisorMessage:
        "Good progress on your intake! Continue uploading documents to improve your confidence score.",
      confidenceExplanation:
        "Your score reflects the documents and information you've provided so far.",
      nextActions: [
        {
          label: "Upload Documents",
          type: "upload",
          target: "/portal/documents",
        },
        {
          label: "Complete Checklist",
          type: "form",
          target: "/portal/checklist",
        },
      ],
      stageUnlockCondition:
        "Upload at least 2 financial documents to advance to the next stage.",
      flags: [],
    };
  }
}
