import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { classify } from "@/lib/ingestion/classifier";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("clientId") as string | null;
    const documentType = formData.get("documentType") as string | null;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: "file and clientId are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload PDF, CSV, XLSX, or image files." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 25MB limit." },
        { status: 400 }
      );
    }

    // Validate clientId - must be a cuid-like alphanumeric string, no slashes or dots
    if (!clientId || !/^[a-z0-9]+$/i.test(clientId) || clientId.length > 30) {
      return NextResponse.json(
        { error: "Invalid clientId" },
        { status: 400 }
      );
    }

    // Classify document type if not provided
    const classification = classify(file.name, file.type);
    const resolvedType = documentType || classification.documentType;

    // Save file to /tmp/uploads (dev) or object storage (prod)
    const uploadDir = path.join(process.cwd(), "tmp", "uploads", clientId);
    await mkdir(uploadDir, { recursive: true });

    const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        clientId,
        filename: safeFilename,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storageKey: filePath,
        documentType: resolvedType,
        classificationConfidence: classification.confidence,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error("[DOCUMENT_UPLOAD]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
