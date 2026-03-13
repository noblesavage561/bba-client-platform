import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";
import { runAnthropicTextRequest } from "@/lib/ai/anthropic";

interface AdvisorAskClientContext {
  userId: string;
  businessName: string;
  confidenceScore: {
    score: number;
  } | null;
  documents: Array<{
    documentType: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId, question } = await request.json();

    if (!caseId || !question) {
      return NextResponse.json(
        { error: "Missing caseId or question" },
        { status: 400 }
      );
    }

    // Get client context
    const client = (await db.client.findUnique({
      where: { id: caseId },
      include: {
        confidenceScore: true,
        documents: { select: { documentType: true } },
      },
    })) as AdvisorAskClientContext | null;

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

    // Call Claude API with context
    const answer = await askAdvisor(question, client);

    // Store the Q&A in a note (internal)
    await db.note.create({
      data: {
        authorId: session.user.id,
        clientId: caseId,
        content: `Q: ${question}\n\nA: ${answer}`,
        isInternal: false,
      },
    });

    return NextResponse.json({
      answer,
      question,
    });
  } catch (error) {
    console.error("Advisor ask error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get answer",
      },
      { status: 500 }
    );
  }
}

async function askAdvisor(
  question: string,
  client: AdvisorAskClientContext
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "AI analysis is currently unavailable. Upload your latest documents and checklist updates, then try your question again in a moment.";
  }

  const prompt = `You are the BBA Services AI Advisor. Answer this client's question about their tax situation or business finances in plain language, being specific and helpful.

Client context:
- Business: ${client.businessName}
- Confidence Score: ${client.confidenceScore?.score || 0}%
- Documents submitted: ${client.documents.map((d) => d.documentType).join(", ") || "None"}

Client question: ${question}

Provide a friendly, 2-3 sentence answer that addresses their specific situation.`;

  try {
    const text = await runAnthropicTextRequest({
      apiKey,
      prompt,
      maxTokens: 500,
      timeoutMs: 30000,
    });

    return text || "I couldn't generate an answer right now. Please try again.";
  } catch {
    return "AI analysis is taking longer than usual. Please try again shortly.";
  }
}
