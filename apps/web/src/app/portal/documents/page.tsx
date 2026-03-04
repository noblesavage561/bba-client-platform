"use client";

import { DocumentUpload } from "@/components/portal/DocumentUpload";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-blue text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Document Center</h1>
          <p className="text-blue-200 mt-1">
            Upload and manage your business documents securely.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DocumentUpload />
      </div>
    </div>
  );
}
