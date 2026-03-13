import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ADMIN_ROLES } from "@/lib/authHelpers";
import { classifyDocumentWithAI } from "@/lib/ai/document-classifier";
import { updateChecklistFromDocument } from "@/lib/ingestion/checklist-updater";

interface ClassifyRequestBody {
  documentId?: string;
  filename?: string;
  selected_type?: string;
  matter_ref?: string;
  completed_fields?: Record<string, string>;
}

interface DocumentRecord {
  id: string;
  clientId: string;
  originalName: string;
  client: {
    userId: string;
  };
}

function canAccessClient(session: { user: { id: string; role: string } }, ownerUserId: string) {
  return (
    (ADMIN_ROLES as readonly string[]).includes(session.user.role) ||
    session.user.id === ownerUserId
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as ClassifyRequestBody;
    if (!body.filename || !body.selected_type) {
      return NextResponse.json(
        { error: "filename and selected_type are required" },
        { status: 400 }
      );
    }

    let document: DocumentRecord | null = null;

    if (body.documentId) {
      document = await prisma.document.findUnique({
        where: { id: body.documentId },
        select: {
          id: true,
          clientId: true,
          originalName: true,
          client: { select: { userId: true } },
        },
      });

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      if (!canAccessClient(session, document.client.userId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "PROCESSING",
          processingState: "ANALYZING",
        },
      });
    }

    const result = await classifyDocumentWithAI({
      filename: body.filename,
      selectedType: body.selected_type,
      matterRef: body.matter_ref,
      completedFields: body.completed_fields,
    });

    const confidence = result.confidence;
    const finalType = result.corrected_type;
    const requiresValidation =
      confidence < 70 || result.requires_validation || result.missing_fields.length > 0;

    const nextStatus = requiresValidation ? "VALIDATION_REQUIRED" : "PROCESSED";
    const nextProcessingState = requiresValidation
      ? "VALIDATION_REQUIRED"
      : result.type_mismatch
        ? "CORRECTED"
        : "PROCESSED";

    const activityEvents: Array<{ timestamp: string; message: string }> = [];
    const nowIso = new Date().toISOString();

    if (result.type_mismatch) {
      activityEvents.push({
        timestamp: nowIso,
        message: `Type auto-corrected to ${finalType}`,
      });
    }

    if (requiresValidation) {
      activityEvents.push({
        timestamp: nowIso,
        message: "Validation required due to confidence or missing fields",
      });
    } else {
      activityEvents.push({
        timestamp: nowIso,
        message: "Document processed and entities saved",
      });
    }

    if (!document) {
      return NextResponse.json({
        success: true,
        classification: result,
        status: nextStatus,
        processing_state: nextProcessingState,
        activity: activityEvents,
      });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        documentType: finalType,
        status: nextStatus,
        processingState: nextProcessingState,
        confidenceScore: confidence,
        classificationConfidence: confidence / 100,
        extractedEntities: JSON.stringify(result.entities),
        extractedData: JSON.stringify({
          detectedType: result.detected_type,
          correctedType: result.corrected_type,
          typeMismatch: result.type_mismatch,
          requiresValidation,
          missingFields: result.missing_fields,
        }),
        processedAt: nextStatus === "PROCESSED" ? new Date() : null,
      },
    });

    if (nextStatus === "PROCESSED") {
      await updateChecklistFromDocument(document.clientId, finalType);
    }

    if (result.type_mismatch || requiresValidation) {
      await prisma.notification
        .create({
          data: {
            userId: document.client.userId,
            title: result.type_mismatch
              ? "Document type auto-corrected"
              : "Document validation required",
            message: result.type_mismatch
              ? `${document.originalName} was corrected to ${finalType}.`
              : `${document.originalName} needs validation for: ${result.missing_fields.join(", ") || "missing fields"}.`,
            type: result.type_mismatch ? "WARNING" : "INFO",
            read: false,
            link: "/portal/documents",
          },
        })
        .catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      classification: result,
      document: updatedDocument,
      activity: activityEvents,
    });
  } catch (error) {
    console.error("[AI_CLASSIFY_DOCUMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
