"use client";

import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/Button";
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
  status: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
  uploadedAt: string;
}

const mockUploaded: UploadedFile[] = [
  { id: "f1", name: "Chase_Bank_Dec2023.pdf", type: "BANK_STATEMENT", size: "1.2 MB", status: "PROCESSED", uploadedAt: "Jan 10, 2024" },
  { id: "f2", name: "Tax_Return_2022.pdf", type: "TAX_RETURN", size: "3.4 MB", status: "PROCESSED", uploadedAt: "Jan 10, 2024" },
  { id: "f3", name: "EIN_Letter.pdf", type: "FORMATION_DOC", size: "234 KB", status: "PROCESSING", uploadedAt: "Jan 14, 2024" },
];

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>(mockUploaded);
  const [dragging, setDragging] = useState(false);
  const [selectedType, setSelectedType] = useState("OTHER");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    for (const file of newFiles) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempFile: UploadedFile = {
        id: tempId,
        name: file.name,
        type: selectedType,
        size: formatSize(file.size),
        status: "PROCESSING",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };

      setFiles((prev) => [tempFile, ...prev]);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? { ...f, status: "PROCESSED" as const }
            : f
        )
      );
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-brand-blue mb-4">Upload Documents</h2>

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
            Supported: PDF, JPEG, PNG, XLSX, CSV • Max 25MB per file
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
            Uploading and processing your documents...
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-brand-blue">Your Documents</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <span className="text-2xl">
                  {file.type === "BANK_STATEMENT" ? "🏦" :
                   file.type === "TAX_RETURN" ? "📑" :
                   file.type === "FORMATION_DOC" ? "🏢" :
                   file.type === "ID_DOCUMENT" ? "🪪" : "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{file.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {DOC_TYPES.find(t => t.value === file.type)?.label ?? file.type} • {file.size} • {file.uploadedAt}
                  </div>
                </div>
                <Badge variant={statusToBadgeVariant(file.status)}>
                  {file.status === "PROCESSING" ? "Processing..." : file.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFile(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
