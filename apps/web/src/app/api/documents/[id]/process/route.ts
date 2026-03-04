import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/db";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { updateChecklistFromDocument } from "@/lib/ingestion/checklist-updater";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Mark as processing
    await prisma.document.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Load file buffer
    const buffer = await readFile(document.storageKey);

    // Run ingestion pipeline
    const result = await runIngestionPipeline({
      documentId: document.id,
      clientId: document.clientId,
      filename: document.originalName,
      mimeType: document.mimeType,
      buffer,
      documentType: document.documentType,
    });

    // Update document with extracted data
    await prisma.document.update({
      where: { id },
      data: {
        status: "PROCESSED",
        extractedData: JSON.stringify(result.extractedData),
        documentType: result.documentType,
        classificationConfidence: result.confidence,
        period: result.period ?? null,
        processedAt: new Date(),
      },
    });

    // Update checklist based on document type
    await updateChecklistFromDocument(document.clientId, result.documentType);

    return NextResponse.json({
      success: true,
      documentId: id,
      documentType: result.documentType,
      extractedData: result.extractedData,
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
