import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/db";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { updateChecklistFromDocument } from "@/lib/ingestion/checklist-updater";
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
