const mockQuestions = [
  { id: "q1", step: 1, order: 1, label: "Business Name", type: "TEXT", required: true, active: true },
  { id: "q2", step: 1, order: 2, label: "Business Type", type: "SELECT", required: true, active: true, options: ["LLC", "Corporation", "Sole Proprietorship", "Partnership"] },
  { id: "q3", step: 1, order: 3, label: "Industry", type: "SELECT", required: true, active: true, options: ["Technology", "Construction", "Retail", "Healthcare", "Food & Beverage", "Professional Services", "Other"] },
  { id: "q4", step: 1, order: 4, label: "Years in Business", type: "NUMBER", required: true, active: true },
  { id: "q5", step: 2, order: 1, label: "Owner Full Name", type: "TEXT", required: true, active: true },
  { id: "q6", step: 2, order: 2, label: "Owner Email", type: "TEXT", required: true, active: true },
  { id: "q7", step: 3, order: 1, label: "Annual Revenue", type: "SELECT", required: true, active: true, options: ["Under $100K", "$100K-$250K", "$250K-$500K", "$500K-$1M", "Over $1M"] },
];

const stepLabels: Record<number, string> = {
  1: "Business Basics",
  2: "Owner Info",
  3: "Financial Snapshot",
  4: "Funding Goals",
  5: "Document Readiness",
};

export default function IntakeConfigPage() {
  const grouped = mockQuestions.reduce<Record<number, typeof mockQuestions>>((acc, q) => {
    if (!acc[q.step]) acc[q.step] = [];
    acc[q.step].push(q);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Intake Questions</h1>
          <p className="text-gray-500 mt-1">Manage the intake wizard questions and steps.</p>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{q.label}</td>
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
      </div>
    </div>
  );
}
