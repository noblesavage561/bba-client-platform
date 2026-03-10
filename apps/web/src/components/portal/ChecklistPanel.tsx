"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/Progress";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";

interface ChecklistItemData {
  id: string;
  label: string;
  description?: string;
  category: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "NOT_APPLICABLE";
  required: boolean;
  autoDetected: boolean;
  dueDate?: string;
}

export function ChecklistPanel({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<ChecklistItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChecklist = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (!response.ok) return;
        const data = await response.json();

        const mapped: ChecklistItemData[] = (data.checklistItems ?? []).map((item: {
          id: string;
          label: string;
          description?: string | null;
          category: string;
          status: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "NOT_APPLICABLE";
          required: boolean;
          autoDetected: boolean;
          dueDate?: string | null;
        }) => ({
          id: item.id,
          label: item.label,
          description: item.description ?? undefined,
          category: item.category,
          status: item.status,
          required: item.required,
          autoDetected: item.autoDetected,
          dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : undefined,
        }));

        setItems(mapped);
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, [clientId]);

  const required = items.filter((i) => i.required);
  const completed = required.filter((i) => i.status === "COMPLETE");
  const completionPct = required.length > 0
    ? Math.round((completed.length / required.length) * 100)
    : 0;

  // Group by category
  const grouped = items.reduce<Record<string, ChecklistItemData[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const statusIcon = (status: string) => {
    switch (status) {
      case "COMPLETE": return "✅";
      case "IN_PROGRESS": return "🔄";
      case "NOT_APPLICABLE": return "➖";
      default: return "⏳";
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-sm text-gray-500">
          Loading checklist...
        </div>
      )}

      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-blue">Overall Progress</h2>
          <span className="text-2xl font-bold text-brand-blue">{completionPct}%</span>
        </div>
        <Progress value={completionPct} color={completionPct >= 80 ? "green" : completionPct >= 50 ? "gold" : "blue"} size="lg" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{completed.length} of {required.length} required items complete</span>
          <span>{required.length - completed.length} remaining</span>
        </div>
      </div>

      {!loading && items.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          Your checklist is being prepared.
        </div>
      )}

      {/* Checklist Groups */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">{category}</h3>
            <span className="text-xs text-gray-500">
              {items.filter((i) => i.status === "COMPLETE").length}/{items.length} complete
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-6 py-4">
                <span className="text-xl mt-0.5">{statusIcon(item.status)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${item.status === "NOT_APPLICABLE" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                      {item.label}
                    </span>
                    {item.required && item.status !== "NOT_APPLICABLE" && (
                      <span className="text-xs text-red-500 font-medium">Required</span>
                    )}
                    {item.autoDetected && (
                      <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
                        Auto-detected
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                  {item.dueDate && item.status !== "COMPLETE" && (
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">Due: {item.dueDate}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <Badge variant={statusToBadgeVariant(item.status)}>
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
