"use client";

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

const mockChecklist: ChecklistItemData[] = [
  { id: "c1", label: "Bank Statements (3 months)", description: "Most recent 3 months of business bank statements", category: "Financial Documents", status: "COMPLETE", required: true, autoDetected: true },
  { id: "c2", label: "Business Tax Returns (2 years)", description: "Complete Federal business tax returns", category: "Tax Documents", status: "IN_PROGRESS", required: true, autoDetected: false },
  { id: "c3", label: "Personal Tax Returns (2 years)", description: "Personal 1040 tax returns for all owners with 20%+ ownership", category: "Tax Documents", status: "PENDING", required: true, autoDetected: false },
  { id: "c4", label: "Articles of Incorporation / Operating Agreement", description: "Business formation documents", category: "Legal Documents", status: "COMPLETE", required: true, autoDetected: true },
  { id: "c5", label: "EIN Letter", description: "IRS Employer Identification Number letter", category: "Legal Documents", status: "PENDING", required: true, autoDetected: false },
  { id: "c6", label: "Government-Issued ID", description: "Driver's license or passport for all owners", category: "Identification", status: "PENDING", required: true, autoDetected: false },
  { id: "c7", label: "Business License / Permits", description: "Applicable business licenses and permits", category: "Legal Documents", status: "NOT_APPLICABLE", required: false, autoDetected: false },
  { id: "c8", label: "Business Debt Schedule", description: "List of all current business loans and balances", category: "Financial Documents", status: "PENDING", required: true, autoDetected: false, dueDate: "Jan 25, 2024" },
  { id: "c9", label: "Voided Business Check", description: "For ACH payment setup", category: "Financial Documents", status: "IN_PROGRESS", required: true, autoDetected: false },
];

export function ChecklistPanel() {
  const required = mockChecklist.filter((i) => i.required);
  const completed = required.filter((i) => i.status === "COMPLETE");
  const completionPct = Math.round((completed.length / required.length) * 100);

  // Group by category
  const grouped = mockChecklist.reduce<Record<string, ChecklistItemData[]>>((acc, item) => {
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
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
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
