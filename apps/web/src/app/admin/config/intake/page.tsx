import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

const stepLabels: Record<number, string> = {
  1: "Taxpayer Basics",
  2: "Primary Filer",
  3: "Income Snapshot",
  4: "Planning Goals",
  5: "Document Readiness",
};

export default async function IntakeConfigPage() {
  const questions = await prisma.intakeQuestion.findMany({
    orderBy: [{ step: "asc" }, { order: "asc" }],
  });

  const hydratedQuestions = questions.map((question) => ({
    ...question,
    options: parseJsonArray(question.options),
  }));

  const grouped = hydratedQuestions.reduce<Record<number, typeof hydratedQuestions>>((acc, q) => {
    if (!acc[q.step]) acc[q.step] = [];
    acc[q.step].push(q);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Intake Questions</h1>
          <p className="text-gray-500 mt-1">Manage wizard prompts used for tax preparation intake.</p>
        </div>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
          + Add Question
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([step, questions]) => (
          <div key={step} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-brand-blue px-6 py-3 flex items-center justify-between">
              <h2 className="text-white font-semibold">
                Step {step}: {stepLabels[Number(step)] || `Step ${step}`}
              </h2>
              <span className="text-blue-200 text-sm">{questions.length} questions</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Order</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Question</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Type</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Required</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Active</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{q.order}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {q.label}
                      {q.options.length > 0 && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          ({q.options.length} options)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{q.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.required ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                        {q.required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {q.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-brand-blue hover:underline">Edit</button>
                        <button className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {hydratedQuestions.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No intake questions configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
