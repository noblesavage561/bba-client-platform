"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export type UploadZoneState =
  | "idle"
  | "dragging"
  | "uploading"
  | "analyzing"
  | "confirming"
  | "saved"
  | "error";

export interface ClassificationResult {
  documentType: string;
  confidence: number;
  taxYear?: string;
  institution?: string;
  accountLast4?: string;
  keyFields: Record<string, unknown>;
  issues: string[];
  requiresHumanReview: boolean;
  reviewReason?: string;
}

interface SmartUploadZoneProps {
  caseId: string;
  onDocumentProcessed: (doc: DocumentRecord) => void;
  allowedTypes?: string[];
  maxFiles?: number;
}

interface DocumentRecord {
  id: string;
  filename: string;
  documentType: string;
  confidence: number;
  extractedData: ClassificationResult;
  status: "confirming" | "saved";
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/tiff",
];

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  tif: "image/tiff",
  tiff: "image/tiff",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function SmartUploadZone({
  caseId,
  onDocumentProcessed,
  allowedTypes = [
    "pdf",
    "jpg",
    "png",
    "heic",
    "tiff",
  ],
  maxFiles = 10,
}: SmartUploadZoneProps) {
  const [state, setState] = useState<UploadZoneState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [confirmingDoc, setConfirmingDoc] = useState<DocumentRecord | null>(
    null
  );
  const [savedDocs, setSavedDocs] = useState<DocumentRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const normalizedAllowedTypes = allowedTypes.map((ext) =>
    ext.toLowerCase().replace(".", "")
  );
  const acceptedMimeTypes = normalizedAllowedTypes
    .map((ext) => EXT_TO_MIME[ext])
    .filter((mime): mime is string => Boolean(mime));

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `This file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please compress it or split into multiple files under 25MB.`,
      };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (!normalizedAllowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `BBA accepts ${normalizedAllowedTypes.join(", ").toUpperCase()} files. ${file.name} is a ${extension || "unknown"} file.`,
      };
    }

    if (file.type && !acceptedMimeTypes.includes(file.type)) {
      const ext = file.name.split(".").pop() || "unknown";
      return {
        valid: false,
        error: `BBA accepts PDF, JPG, PNG, and TIFF files. ${file.name} is a ${ext} file.`,
      };
    }

    return { valid: true };
  };

  const classifyDocument = async (
    file: File,
    fileContent: string
  ): Promise<ClassificationResult> => {
    const response = await fetch(
      `/api/documents/classify?caseId=${caseId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          extractedText: fileContent.substring(0, 50000), // Limit context
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Classification API error: ${response.statusText}`);
    }

    return response.json();
  };

  const uploadDocument = async (file: File): Promise<DocumentRecord> => {
    setState("uploading");
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Read file content for text extraction
      const fileContent = await readFileAsText(file);

      // Show analyzing state
      setState("analyzing");
      const startTime = Date.now();
      const classificationResult = await classifyDocument(file, fileContent);

      // Check timeout (longer than 30 seconds)
      const elapsed = Date.now() - startTime;
      if (elapsed > 30000) {
        // Queue in background instead of blocking
        console.warn("Classification took >30s, processing in background");
        // For now, still proceed with the result
      }

      // Check rejection rules
      if (classificationResult.confidence < 0.6) {
        throw new Error(
          "AI could not confidently identify this document. Please re-upload a clearer copy or select the document type manually."
        );
      }

      if (classificationResult.documentType === "unknown") {
        setError(
          "Unable to identify document type. Please select from the options below."
        );
        setState("error");
        return null as unknown as DocumentRecord;
      }

      if (
        classificationResult.issues.some((i) =>
          i.toLowerCase().includes("password")
        )
      ) {
        throw new Error(
          "This PDF is password-protected. Please remove the password and re-upload."
        );
      }

      if (
        classificationResult.issues.some((i) =>
          i.toLowerCase().includes("low resolution")
        )
      ) {
        throw new Error(
          "Image quality is too low for AI extraction. Please scan at 300 DPI or higher."
        );
      }

      // Upload to backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);
      formData.append("documentType", classificationResult.documentType);
      formData.append("confidence", classificationResult.confidence.toString());
      formData.append(
        "extractedData",
        JSON.stringify(classificationResult)
      );
      formData.append(
        "requiresHumanReview",
        classificationResult.requiresHumanReview.toString()
      );

      const uploadResponse = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Upload failed: ${uploadResponse.statusText}`
        );
      }

      const uploadedDoc = await uploadResponse.json();

      const documentRecord: DocumentRecord = {
        id: uploadedDoc.id,
        filename: file.name,
        documentType: classificationResult.documentType,
        confidence: classificationResult.confidence,
        extractedData: classificationResult,
        status: "confirming",
      };

      // Move to confirmation state
      setState("confirming");
      setConfirmingDoc(documentRecord);

      return documentRecord;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setState("error");
      throw err;
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });
  };

  const handleConfirmAndSave = useCallback(async () => {
    if (!confirmingDoc) return;

    try {
      const response = await fetch(
        `/api/documents/${confirmingDoc.id}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extractedData: confirmingDoc.extractedData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save confirmation");
      }

      // Update doc status and add to saved list
      const savedDoc = { ...confirmingDoc, status: "saved" as const };
      setSavedDocs((prev) => [...prev, savedDoc]);
      onDocumentProcessed(savedDoc);

      // Reset state
      setConfirmingDoc(null);
      setState("saved");

      // Reset after 2 seconds
      setTimeout(() => {
        setState("idle");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save";
      setError(errorMessage);
      setState("error");
    }
  }, [confirmingDoc, onDocumentProcessed]);

  const handleDragEnter = () => {
    dragOverRef.current = true;
    setState("dragging");
  };

  const handleDragLeave = () => {
    dragOverRef.current = false;
    setState("idle");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = false;
    setState("idle");

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (files.length > maxFiles) {
        setError(`You can upload up to ${maxFiles} files at a time.`);
        setState("error");
        return;
      }
      // Process first file for now (could be enhanced for batch)
      await uploadDocument(files[0]);
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      if (files.length > maxFiles) {
        setError(`You can upload up to ${maxFiles} files at a time.`);
        setState("error");
        return;
      }
      await uploadDocument(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return "#059669"; // green
    if (confidence >= 0.7) return "#1591cd"; // blue
    if (confidence >= 0.5) return "#d97706"; // amber
    return "#dc2626"; // red
  };

  const confidenceColor = confirmingDoc
    ? getConfidenceColor(confirmingDoc.confidence)
    : "#414042";

  return (
    <div className="w-full">
      {state === "idle" && !confirmingDoc && savedDocs.length === 0 && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#414042] rounded-lg p-12 text-center cursor-pointer hover:border-[#1591cd] hover:bg-blue-50 transition-all"
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-[#414042] mb-2">
            Drop documents here
          </h3>
          <p className="text-gray-600 mb-6">
            Or click to browse. Accepts PDF, JPG, PNG, HEIC, TIFF (max 25MB)
          </p>
          <Button
            onClick={handleBrowseClick}
            className="bg-[#1591cd] text-white hover:bg-[#0d6aaa]"
          >
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={acceptedMimeTypes.length > 0 ? acceptedMimeTypes.join(",") : ALLOWED_MIME_TYPES.join(",")}
            className="hidden"
            multiple={maxFiles > 1}
          />
        </div>
      )}

      {state === "uploading" && (
        <Card className="p-8 text-center">
          <div className="text-3xl mb-4">📤</div>
          <p className="text-[#414042] font-semibold mb-4">Uploading...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1591cd] h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
        </Card>
      )}

      {state === "analyzing" && (
        <Card className="p-8 text-center">
          <div className="text-3xl mb-4 animate-spin">🔄</div>
          <p className="text-[#414042] font-semibold">
            Analyzing document...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Our AI is reviewing and extracting key information
          </p>
        </Card>
      )}

      {state === "confirming" && confirmingDoc && (
        <Card className="p-8 border-l-4" style={{ borderLeftColor: confidenceColor }}>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#1591cd] text-white rounded-full text-sm font-semibold">
                  {confirmingDoc.documentType}
                </span>
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100"
                  style={{ borderLeft: `4px solid ${confidenceColor}` }}
                >
                  <span className="text-xs font-semibold text-[#414042]">
                    Confidence: {(confirmingDoc.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#414042] mb-3">
                AI extracted this. Please verify:
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-[#414042] mb-3">
                  Key Fields Extracted:
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(confirmingDoc.extractedData.keyFields)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-[#414042]">
                          {key}:
                        </span>
                        <span className="text-gray-600 ml-2">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {confirmingDoc.extractedData.issues.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Issues</h4>
                  <ul className="text-sm text-amber-800">
                    {confirmingDoc.extractedData.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => {
                setConfirmingDoc(null);
                setState("idle");
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAndSave}
              className="bg-[#1591cd] text-white hover:bg-[#0d6aaa]"
            >
              Confirm & Save
            </Button>
          </div>
        </Card>
      )}

      {state === "saved" && (
        <Card className="p-8 text-center border-l-4 border-green-500">
          <div className="text-3xl mb-4">✅</div>
          <p className="text-[#414042] font-semibold">Document saved successfully!</p>
          <p className="text-sm text-gray-600 mt-2">Ready to upload another document</p>
        </Card>
      )}

      {state === "error" && error && (
        <Card className="p-8 border-l-4 border-red-500">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#414042] mb-2">
                Upload Error
              </h3>
              <p className="text-gray-700">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setState("idle");
                }}
                className="mt-4 bg-[#1591cd] text-white hover:bg-[#0d6aaa]"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {savedDocs.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-[#414042] mb-4">
            Documents Processed ({savedDocs.length})
          </h3>
          <div className="space-y-3">
            {savedDocs.map((doc) => (
              <Card key={doc.id} className="p-4 flex items-center gap-4">
                <div className="text-2xl">✓</div>
                <div className="flex-1">
                  <p className="font-semibold text-[#414042]">{doc.filename}</p>
                  <p className="text-sm text-gray-600">
                    {doc.documentType} • Confidence: {(doc.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Button
            onClick={() => setSavedDocs([])}
            className="mt-4 bg-[#1591cd] text-white hover:bg-[#0d6aaa]"
          >
            Upload More Documents
          </Button>
        </div>
      )}
    </div>
  );
}
