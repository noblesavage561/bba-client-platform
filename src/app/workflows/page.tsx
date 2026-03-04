import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflows | BBA Client Platform",
};

const workflowTemplates = [
  {
    id: 1,
    name: "New Client Welcome",
    description: "Automatically send a welcome email and onboarding checklist to new clients.",
    trigger: "Client Approved",
    steps: 4,
    status: "Inactive",
  },
  {
    id: 2,
    name: "Invoice Reminder",
    description: "Send payment reminders 7 days and 1 day before invoice due dates.",
    trigger: "Invoice Due Soon",
    steps: 2,
    status: "Inactive",
  },
  {
    id: 3,
    name: "Intake Review Notification",
    description: "Notify the admin team when a new intake form is submitted.",
    trigger: "Intake Submitted",
    steps: 1,
    status: "Inactive",
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Paused: "bg-yellow-100 text-yellow-700",
};

export default function WorkflowsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Automation Workflows
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure and monitor automated workflows to streamline operations
          </p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          + New Workflow
        </button>
      </div>

      <div className="space-y-4">
        {workflowTemplates.map(
          ({ id, name, description, trigger, steps, status }) => (
            <div
              key={id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                  <div className="mt-3 flex gap-6 text-xs text-gray-400">
                    <span>
                      <span className="font-medium text-gray-600">Trigger:</span>{" "}
                      {trigger}
                    </span>
                    <span>
                      <span className="font-medium text-gray-600">Steps:</span>{" "}
                      {steps}
                    </span>
                  </div>
                </div>
                <button className="flex-shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Configure
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
