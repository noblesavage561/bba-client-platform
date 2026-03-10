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

export default async function EmailTemplatesPage() {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
  });

  const hydratedTemplates = templates.map((template) => ({
    ...template,
    variables: parseJsonArray(template.variables),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Email Templates</h1>
          <p className="text-gray-500 mt-1">Manage automated emails sent to clients at key milestones.</p>
        </div>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
          + New Template
        </button>
      </div>

      <div className="grid gap-4">
        {hydratedTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-brand-blue">{template.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${template.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {template.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Trigger:</span>{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{template.trigger}</code>
                </div>
                <div className="text-sm text-gray-600 italic">&quot;{template.subject}&quot;</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.variables.map((v) => (
                    <span key={v} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                      {"{" + v + "}"}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-sm text-brand-blue border border-brand-blue px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  Edit
                </button>
                <button className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}

        {hydratedTemplates.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No email templates found yet.
          </div>
        )}
      </div>
    </div>
  );
}
