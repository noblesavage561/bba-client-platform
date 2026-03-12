import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/db";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { updateChecklistFromDocument } from "@/lib/ingestion/checklist-updater";
import { extractDocumentData, classifyDocument } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        client: { select: { userId: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
    const isOwner = document.client.userId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as processing
    await prisma.document.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Load file buffer
    const buffer = await readFile(document.storageKey);
    const textContent = buffer.toString('utf-8');

    // Determine processing method: AI-powered if enabled, fallback to rule-based
    const useAI = process.env.OPENROUTER_API_KEY && process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
    
    let extractedData;
    let documentType = document.documentType;
    let confidence = 0;

    if (useAI) {
      // AI-powered extraction
      const aiResult = await extractDocumentData(textContent);
      const classification = await classifyDocument(textContent);
      
      extractedData = aiResult;
      documentType = classification.type || aiResult.documentType || document.documentType;
      confidence = classification.confidence || 0.95;
    } else {
      // Fallback to rule-based ingestion pipeline
      const result = await runIngestionPipeline({
        documentId: document.id,
        clientId: document.clientId,
        filename: document.originalName,
        mimeType: document.mimeType,
        buffer,
        documentType: document.documentType,
      });
      
      extractedData = result.extractedData;
      documentType = result.documentType;
      confidence = result.confidence || 0;
    }

    // Update document with extracted data
    await prisma.document.update({
      where: { id },
      data: {
        status: "PROCESSED",
        extractedData: JSON.stringify(extractedData),
        documentType: documentType,
        classificationConfidence: confidence,
        period: extractedData.period ?? null,
        processedAt: new Date(),
      },
    });

    // Update checklist based on document type
    await updateChecklistFromDocument(document.clientId, documentType);

    return NextResponse.json({
      success: true,
      documentId: id,
      documentType: documentType,
      extractedData: extractedData,
      method: useAI ? 'ai' : 'rule-based',
    });
  } catch (error) {
    console.error("[DOCUMENT_PROCESS]", error);

    await prisma.document.update({
      where: { id },
      data: { status: "FAILED" },
    }).catch(() => {});

    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
