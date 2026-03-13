import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { extractedData } = await request.json();
    const { id } = await context.params;
    const documentId = id;

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing document ID" },
        { status: 400 }
      );
    }

    // Update document with confirmed extraction data
    const document = await db.document.update({
      where: { id: documentId },
      data: {
        status: "PROCESSED",
        extractedData: JSON.stringify(extractedData),
        processedAt: new Date(),
      },
    });

    // Get the client to trigger confidence score update
    const client = await db.client.findUnique({
      where: { id: document.clientId },
      include: { confidenceScore: true },
    });

    if (client) {
      // Trigger confidence update logic
      const updatedConfidence = await updateConfidenceScore(client.id);

      // Create a signal for confidence update if score changed
      if (updatedConfidence) {
        await db.caseSignal.create({
          data: {
            clientId: client.id,
            signalType: "confidence_increased",
            severity: "info",
            title: `Confidence Score Updated to ${updatedConfidence.score}%`,
            body: `Your case confidence improved after uploading your ${document.documentType}.`,
            source: "system",
            isClientVisible: true,
            metadata: JSON.stringify({
              previousScore: client.confidenceScore?.score,
              newScore: updatedConfidence.score,
              documentType: document.documentType,
            }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      status: document.status,
    });
  } catch (error) {
    console.error("Confirmation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Confirmation failed",
      },
      { status: 500 }
    );
  }
}

async function updateConfidenceScore(clientId: string) {
  const documents = await db.document.findMany({
    where: { clientId, status: "PROCESSED" },
  });

  let score = 0;
  const breakdown = {
    identityVerification: 0,
    incomeDocumentation: 0,
    cashFlowAnalysis: 0,
    deductionsCredits: 0,
    priorYearFiling: 0,
  };

  // Calculate confidence based on documents
  const docTypes = new Set(documents.map((d) => d.documentType));

  // Identity verification
  if (docTypes.has("EIN_letter") || docTypes.has("articles_of_incorporation")) {
    breakdown.identityVerification = 20;
  }

  // Income documentation
  let incomeDocCount = 0;
  if (docTypes.has("W2")) incomeDocCount++;
  if (docTypes.has("FORM_1099")) incomeDocCount++;
  if (docTypes.has("K1")) incomeDocCount++;
  incomeDocCount = Math.min(incomeDocCount * 25, 50);
  breakdown.incomeDocumentation = incomeDocCount;

  // Cash flow analysis
  const bankStatementCount = documents.filter(
    (d) => d.documentType === "BANK_STATEMENT"
  ).length;
  if (bankStatementCount >= 3) {
    breakdown.cashFlowAnalysis = 15;
  }

  // Prior year filing
  if (docTypes.has("TAX_RETURN")) {
    breakdown.priorYearFiling = 10;
  }

  score =
    breakdown.identityVerification +
    breakdown.incomeDocumentation +
    breakdown.cashFlowAnalysis +
    breakdown.priorYearFiling +
    breakdown.deductionsCredits;

  // Update confidence score in database
  const confidenceRecord = await db.aIConfidenceScore.upsert({
    where: { clientId },
    create: {
      clientId,
      score: Math.min(score, 100),
      identityVerification: breakdown.identityVerification,
      incomeDocumentation: breakdown.incomeDocumentation,
      cashFlowAnalysis: breakdown.cashFlowAnalysis,
      deductionsCredits: breakdown.deductionsCredits,
      priorYearFiling: breakdown.priorYearFiling,
    },
    update: {
      score: Math.min(score, 100),
      identityVerification: breakdown.identityVerification,
      incomeDocumentation: breakdown.incomeDocumentation,
      cashFlowAnalysis: breakdown.cashFlowAnalysis,
      deductionsCredits: breakdown.deductionsCredits,
      priorYearFiling: breakdown.priorYearFiling,
    },
  });

  return confidenceRecord;
}
