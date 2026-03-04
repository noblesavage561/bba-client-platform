"use client";

import { ChecklistPanel } from "@/components/portal/ChecklistPanel";

export default function ChecklistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-blue text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Your Checklist</h1>
          <p className="text-blue-200 mt-1">
            Track the items needed to complete your funding application.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ChecklistPanel />
      </div>
    </div>
  );
}
