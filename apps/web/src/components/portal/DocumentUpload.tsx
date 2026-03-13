"use client";

import { useState, useRef, DragEvent, useEffect, useMemo } from "react";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";

const DOC_TYPES = [
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "TAX_RETURN", label: "Tax Return" },
  { value: "W2", label: "W-2" },
  { value: "FORM_1099", label: "1099" },
  { value: "K1", label: "K-1" },
  { value: "FORMATION_DOC", label: "Formation Document" },
  { value: "INVOICE", label: "Invoice" },
  { value: "CONTRACT", label: "Contract" },
  { value: "ID_DOCUMENT", label: "Government ID" },
  { value: "OTHER", label: "Other" },
];

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED" | "VALIDATION_REQUIRED";
  processingState: "UPLOADED" | "ANALYZING" | "PROCESSED" | "VALIDATION_REQUIRED" | "CORRECTED";
  confidence: number;
  entities: Record<string, string | null>;
  missingFields: string[];
  autoCorrected: boolean;
  isExpanded: boolean;
  validationDraft: Record<string, string>;
  uploadedAt: string;
}

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: "info" | "success" | "warning";
}

const ENTITY_KEYS = ["Effective Date", "Total Value", "Tax Year", "Party", "Matter Ref"];

export function DocumentUpload({ clientId }: { clientId: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedType, setSelectedType] = useState("OTHER");
  const [matterRef, setMatterRef] = useState("");
  const [uploading, setUploading] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const appendActivity = (message: string, level: ActivityLogEntry["level"] = "info") => {
    const timestamp = new Date().toISOString();
    setActivityLog((prev) => [
      {
        id: `${timestamp}-${Math.random().toString(36).slice(2)}`,
        timestamp,
        message,
        level,
      },
      ...prev,
    ]);
  };

  const parseJsonObject = (value: unknown): Record<string, unknown> => {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return {};
      }
    }
    return {};
  };

  const toConfidenceScore = (
    confidenceScore: unknown,
    classificationConfidence: unknown
  ): number => {
    if (typeof confidenceScore === "number") {
      return Math.max(0, Math.min(100, Math.round(confidenceScore)));
    }
    if (typeof classificationConfidence === "number") {
      const normalized =
        classificationConfidence <= 1 ? classificationConfidence * 100 : classificationConfidence;
      return Math.max(0, Math.min(100, Math.round(normalized)));
    }
    return 0;
  };

  const mapEntities = (value: unknown): Record<string, string | null> => {
    const obj = parseJsonObject(value);
    const mapped: Record<string, string | null> = {};
    for (const key of ENTITY_KEYS) {
      const entity = obj[key];
      mapped[key] = typeof entity === "string" && entity.trim().length > 0 ? entity : null;
    }
    return mapped;
  };

  const mapDocument = (doc: Record<string, unknown>): UploadedFile => {
    const extractedData = parseJsonObject(doc.extractedData);
    const extractedEntities = mapEntities(doc.extractedEntities);
    const missingFieldsRaw = extractedData.missingFields;
    const missingFields = Array.isArray(missingFieldsRaw)
      ? missingFieldsRaw.filter((field): field is string => typeof field === "string")
      : [];
    const typeMismatch = Boolean(extractedData.typeMismatch);

    return {
      id: String(doc.id),
      name: String(doc.originalName),
      type: String(doc.documentType),
      size: formatSize(Number(doc.fileSize ?? 0)),
      status: (doc.status as UploadedFile["status"]) ?? "PENDING",
      processingState:
        (doc.processingState as UploadedFile["processingState"]) ?? "UPLOADED",
      confidence: toConfidenceScore(doc.confidenceScore, doc.classificationConfidence),
      entities: extractedEntities,
      missingFields,
      autoCorrected: (doc.processingState as string) === "CORRECTED" || typeMismatch,
      isExpanded: false,
      validationDraft: {},
      uploadedAt: new Date(String(doc.uploadedAt)).toISOString().slice(0, 10),
    };
  };

  const stats = useMemo(() => {
    const totalDocs = files.length;
    const processed = files.filter((f) => f.status === "PROCESSED").length;
    const autoCorrected = files.filter((f) => f.autoCorrected).length;
    const withConfidence = files.filter((f) => f.confidence > 0);
    const avgConfidence =
      withConfidence.length > 0
        ? Math.round(
            withConfidence.reduce((sum, file) => sum + file.confidence, 0) / withConfidence.length
          )
        : 0;

    return {
      totalDocs,
      processed,
      autoCorrected,
      avgConfidence,
    };
  }, [files]);

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (!response.ok) return;

        const data = (await response.json()) as { documents?: Record<string, unknown>[] };
        const mapped: UploadedFile[] = (data.documents ?? []).map((doc) => mapDocument(doc));

        setFiles(mapped);

        const seededLog: ActivityLogEntry[] = [];
        for (const doc of mapped) {
          seededLog.push({
            id: `${doc.id}-uploaded`,
            timestamp: `${doc.uploadedAt}T00:00:00.000Z`,
            message: `${doc.name} uploaded to queue`,
            level: "info",
          });

          if (doc.status === "PROCESSED") {
            seededLog.push({
              id: `${doc.id}-processed`,
              timestamp: `${doc.uploadedAt}T00:00:01.000Z`,
              message: `${doc.name} processed with AI entities`,
              level: "success",
            });
          }

          if (doc.status === "VALIDATION_REQUIRED") {
            seededLog.push({
              id: `${doc.id}-validation`,
              timestamp: `${doc.uploadedAt}T00:00:01.000Z`,
              message: `${doc.name} requires validation`,
              level: "warning",
            });
          }

          if (doc.autoCorrected) {
            seededLog.push({
              id: `${doc.id}-corrected`,
              timestamp: `${doc.uploadedAt}T00:00:02.000Z`,
              message: `${doc.name} type auto-corrected`,
              level: "warning",
            });
          }
        }

        setActivityLog(
          seededLog.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  // mapDocument is intentionally local; reload should only happen when clientId changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (newFiles: File[]) => {
    setUploading(true);
    setError(null);

    for (const file of newFiles) {
      const tempId = `tmp-${Date.now()}-${Math.random()}`;
      setFiles((prev) => [
        {
          id: tempId,
          name: file.name,
          type: selectedType,
          size: formatSize(file.size),
          status: "PENDING",
          processingState: "UPLOADED",
          confidence: 0,
          entities: {
            "Effective Date": null,
            "Total Value": null,
            "Tax Year": null,
            Party: null,
            "Matter Ref": matterRef || null,
          },
          missingFields: [],
          autoCorrected: false,
          isExpanded: false,
          validationDraft: {},
          uploadedAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);

      appendActivity(`${file.name} uploaded and queued for AI analysis`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", clientId);
      formData.append("documentType", selectedType);

      const uploadResponse = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json().catch(() => ({ error: "Upload failed" }));
        setError(payload.error ?? "Upload failed");
        setFiles((prev) => prev.filter((f) => f.id !== tempId));
        continue;
      }

      const uploadPayload = await uploadResponse.json();
      const document = uploadPayload.document as {
        id: string;
        originalName: string;
        documentType: string;
        fileSize: number;
        status: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
        uploadedAt: string;
      };

      const persistedFile: UploadedFile = {
        id: document.id,
        name: file.name,
        type: document.documentType,
        size: formatSize(document.fileSize),
        status: "PROCESSING",
        processingState: "ANALYZING",
        confidence: 0,
        entities: {
          "Effective Date": null,
          "Total Value": null,
          "Tax Year": null,
          Party: null,
          "Matter Ref": matterRef || null,
        },
        missingFields: [],
        autoCorrected: false,
        isExpanded: false,
        validationDraft: {},
        uploadedAt: new Date(document.uploadedAt).toISOString().slice(0, 10),
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? persistedFile : f))
      );

      appendActivity(`${file.name} analyzing with Anthropic classifier`);

      const classifyResponse = await fetch("/api/ai/classify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          filename: file.name,
          selected_type: selectedType,
          matter_ref: matterRef || null,
        }),
      });

      if (!classifyResponse.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === document.id
              ? {
                  ...f,
                  status: "FAILED",
                  processingState: "VALIDATION_REQUIRED",
                }
              : f
          )
        );
        setError("One or more documents failed AI analysis. Please retry later.");
        appendActivity(`${file.name} failed AI analysis`, "warning");
        continue;
      }

      const classifyPayload = (await classifyResponse.json()) as {
        classification?: {
          confidence: number;
          type_mismatch: boolean;
          corrected_type: string;
          entities: Record<string, string | null>;
          requires_validation: boolean;
          missing_fields: string[];
        };
        document?: Record<string, unknown>;
        activity?: Array<{ message: string }>;
      };

      const classification = classifyPayload.classification;
      const updatedDocument = classifyPayload.document;

      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== document.id) return f;

          if (updatedDocument) {
            return mapDocument(updatedDocument);
          }

          return {
            ...f,
            type: classification?.corrected_type ?? f.type,
            confidence: classification?.confidence ?? f.confidence,
            status: classification?.requires_validation ? "VALIDATION_REQUIRED" : "PROCESSED",
            processingState: classification?.requires_validation
              ? "VALIDATION_REQUIRED"
              : classification?.type_mismatch
                ? "CORRECTED"
                : "PROCESSED",
            entities: {
              ...f.entities,
              ...(classification?.entities ?? {}),
            },
            missingFields: classification?.missing_fields ?? [],
            autoCorrected: Boolean(classification?.type_mismatch),
          };
        })
      );

      if (classification?.type_mismatch) {
        appendActivity(`${file.name} was AUTO-CORRECTED to ${classification.corrected_type}`, "warning");
      }

      if (classification?.requires_validation || (classification?.missing_fields?.length ?? 0) > 0) {
        appendActivity(`${file.name} needs validation for ${classification?.missing_fields.join(", ") || "missing fields"}`, "warning");
      } else {
        appendActivity(`${file.name} processed and entities saved`, "success");
      }

      for (const event of classifyPayload.activity ?? []) {
        appendActivity(`${file.name}: ${event.message}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleExpanded = (id: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id
          ? { ...file, isExpanded: !file.isExpanded }
          : file
      )
    );
  };

  const updateValidationField = (id: string, field: string, value: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id
          ? {
              ...file,
              validationDraft: {
                ...file.validationDraft,
                [field]: value,
              },
            }
          : file
      )
    );
  };

  const submitValidation = async (file: UploadedFile) => {
    setValidatingId(file.id);
    setError(null);

    const completedFields: Record<string, string> = {};
    for (const field of file.missingFields) {
      const fromDraft = file.validationDraft[field];
      const fromEntities = file.entities[field];
      completedFields[field] = (fromDraft ?? fromEntities ?? "").trim();
    }

    const response = await fetch("/api/ai/classify-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: file.id,
        filename: file.name,
        selected_type: file.type,
        matter_ref: file.entities["Matter Ref"] ?? matterRef,
        completed_fields: completedFields,
      }),
    });

    if (!response.ok) {
      setError("Validation recheck failed. Please retry.");
      setValidatingId(null);
      appendActivity(`${file.name} validation submission failed`, "warning");
      return;
    }

    const payload = (await response.json()) as {
      classification?: {
        requires_validation: boolean;
        missing_fields: string[];
        type_mismatch: boolean;
      };
      document?: Record<string, unknown>;
    };

    setFiles((prev) =>
      prev.map((item) => {
        if (item.id !== file.id) return item;
        if (payload.document) {
          return mapDocument(payload.document);
        }

        return {
          ...item,
          status: payload.classification?.requires_validation ? "VALIDATION_REQUIRED" : "PROCESSED",
          processingState: payload.classification?.requires_validation
            ? "VALIDATION_REQUIRED"
            : payload.classification?.type_mismatch
              ? "CORRECTED"
              : "PROCESSED",
          missingFields: payload.classification?.missing_fields ?? item.missingFields,
        };
      })
    );

    if (payload.classification?.requires_validation) {
      appendActivity(`${file.name} still needs validation`, "warning");
    } else {
      appendActivity(`${file.name} validated and processed`, "success");
    }

    setValidatingId(null);
  };

  const confidenceColor = (score: number): string => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-brand-blue";
    return "bg-amber-500";
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-brand-blue mb-4">Upload Tax Documents</h2>

        {/* Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matter Ref (optional)
          </label>
          <input
            value={matterRef}
            onChange={(e) => setMatterRef(e.target.value)}
            placeholder="e.g., MAT-2026-014"
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
            ${dragging
              ? "border-brand-blue bg-blue-50 scale-[1.01]"
              : "border-gray-300 hover:border-brand-blue hover:bg-blue-50"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-4xl mb-3">📤</div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Drag & drop files here
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse your device
          </p>
          <p className="text-xs text-gray-400">
            Supported: PDF, JPEG, PNG, XLSX, CSV - Max 25MB per file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.tiff"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {uploading && (
          <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading and running AI classification confidence checks...
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="text-xs uppercase text-gray-500">Total Docs</div>
              <div className="text-xl font-bold text-brand-blue">{stats.totalDocs}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="text-xs uppercase text-gray-500">Processed</div>
              <div className="text-xl font-bold text-brand-blue">{stats.processed}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="text-xs uppercase text-gray-500">Auto-Corrected</div>
              <div className="text-xl font-bold text-brand-blue">{stats.autoCorrected}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="text-xs uppercase text-gray-500">Avg Confidence</div>
              <div className="text-xl font-bold text-brand-blue">{stats.avgConfidence}%</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-brand-blue">Document Intelligence Queue</h2>
            </div>

            {loading && (
              <div className="px-6 py-4 text-sm text-gray-500">Loading documents...</div>
            )}

            {!loading && files.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                      <th className="px-4 py-3 text-left">Icon</th>
                      <th className="px-4 py-3 text-left">Document</th>
                      <th className="px-4 py-3 text-left">AI Classification</th>
                      <th className="px-4 py-3 text-left">Confidence</th>
                      <th className="px-4 py-3 text-left">Entities</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <>
                        <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-xl">
                            {file.type === "BANK_STATEMENT" ? "🏦" :
                             file.type === "TAX_RETURN" ? "📑" :
                             file.type === "FORMATION_DOC" ? "🏢" :
                             file.type === "ID_DOCUMENT" ? "🪪" : "📄"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-[#414042] truncate max-w-xs">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {DOC_TYPES.find((t) => t.value === file.type)?.label ?? file.type} • {file.size} • {file.uploadedAt}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-[#414042] font-medium">{DOC_TYPES.find((t) => t.value === file.type)?.label ?? file.type}</div>
                            {file.autoCorrected && (
                              <Badge variant="corrected" className="mt-1">
                                AUTO-CORRECTED
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${confidenceColor(file.confidence)}`}
                                  style={{ width: `${file.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-[#414042]">{file.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#414042]">
                              {Object.values(file.entities).filter(Boolean).length}/5 fields
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusToBadgeVariant(file.status)}>
                              {file.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleExpanded(file.id)}
                                className="text-sm text-brand-blue hover:underline"
                              >
                                View →
                              </button>
                              {file.status === "VALIDATION_REQUIRED" && (
                                <button
                                  type="button"
                                  onClick={() => submitValidation(file)}
                                  disabled={validatingId === file.id}
                                  className="text-xs bg-brand-blue text-white px-2 py-1 rounded-md hover:bg-brand-blue-light disabled:opacity-50"
                                >
                                  {validatingId === file.id ? "Validating..." : "Submit Validation"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {file.status === "VALIDATION_REQUIRED" && (
                          <tr key={`${file.id}-validation`} className="bg-amber-50/40 border-b border-amber-100">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="text-sm font-medium text-amber-800 mb-2">
                                Validation Required: complete missing fields
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {file.missingFields.map((field) => (
                                  <label key={`${file.id}-${field}`} className="text-xs text-[#414042] space-y-1 block">
                                    <span>{field}</span>
                                    <input
                                      value={file.validationDraft[field] ?? file.entities[field] ?? ""}
                                      onChange={(e) => updateValidationField(file.id, field, e.target.value)}
                                      className="w-full border border-amber-300 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                  </label>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}

                        {file.isExpanded && (
                          <tr key={`${file.id}-entities`} className="bg-gray-50/60 border-b border-gray-100">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                                {ENTITY_KEYS.map((key) => (
                                  <div key={`${file.id}-${key}`} className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="text-xs uppercase text-gray-500">{key}</div>
                                    <div className="font-medium text-[#414042] mt-1 break-words">
                                      {file.entities[key] ?? "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && files.length === 0 && (
              <div className="px-6 py-8 text-sm text-gray-500 text-center">
                No documents uploaded yet.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-brand-blue">AI Activity Log</h3>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {activityLog.length === 0 && (
                <div className="px-6 py-4 text-sm text-gray-500">No AI activity yet.</div>
              )}

              {activityLog.map((event) => (
                <div key={event.id} className="px-6 py-3 flex items-start justify-between gap-3">
                  <div className="text-sm text-[#414042]">{event.message}</div>
                  <div
                    className={`text-xs whitespace-nowrap ${
                      event.level === "success"
                        ? "text-green-700"
                        : event.level === "warning"
                          ? "text-amber-700"
                          : "text-gray-500"
                    }`}
                  >
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
