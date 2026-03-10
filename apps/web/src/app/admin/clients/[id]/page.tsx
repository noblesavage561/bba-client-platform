import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskPanel } from "@/components/admin/TaskPanel";
import { ClientNotesPanel } from "@/components/admin/ClientNotesPanel";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  PROCESSED: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PENDING: "bg-gray-100 text-gray-700",
  FAILED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
};

const checklistColors: Record<string, string> = {
  COMPLETE: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  PENDING: "bg-gray-100 text-gray-700",
  NOT_APPLICABLE: "bg-gray-50 text-gray-400",
};

const stageColors: Record<string, string> = {
  LEAD: "bg-gray-100 text-gray-700",
  INTAKE: "bg-blue-100 text-blue-800",
  STRATEGY: "bg-sky-100 text-sky-800",
  FOUNDATION: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-orange-100 text-orange-800",
  FUNDED: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
      checklistItems: { orderBy: [{ category: "asc" }, { label: "asc" }] },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const initialNotes = client.notes.map((note) => ({
    id: note.id,
    content: note.content,
    isInternal: note.isInternal,
    createdAt: note.createdAt.toISOString().slice(0, 10),
    authorName: note.author?.name ?? "Unknown",
  }));

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/clients" className="hover:text-brand-blue">
          Clients
        </Link>
        <span>/</span>
        <span className="text-brand-blue font-medium">{client.businessName}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-blue">{client.businessName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stageColors[client.stage]}`}>
                {client.stage}
              </span>
              {client.programTrack && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-blue">
                  {client.programTrack}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Readiness Score</div>
            <div className="text-3xl font-bold text-brand-blue">{client.readinessScore}%</div>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${client.readinessScore >= 80 ? "bg-green-500" : client.readinessScore >= 60 ? "bg-brand-gold" : "bg-orange-400"}`}
                style={{ width: `${client.readinessScore}%` }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">Owner</div>
            <div className="font-medium text-gray-800">{client.user?.name ?? "Unassigned"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium text-gray-800">{client.user?.email ?? "Not available"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Created</div>
            <div className="font-medium text-gray-800">{client.createdAt.toISOString().slice(0, 10)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Updated</div>
            <div className="font-medium text-gray-800">{client.updatedAt.toISOString().slice(0, 10)}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Documents</h2>
          <div className="space-y-2">
            {client.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">📄</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{doc.originalName}</div>
                    <div className="text-xs text-gray-400">{doc.documentType} • {doc.uploadedAt.toISOString().slice(0, 10)}</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${statusColors[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
            ))}
            {client.documents.length === 0 && (
              <div className="text-sm text-gray-400">No documents uploaded yet.</div>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Checklist</h2>
          <div className="space-y-2">
            {client.checklistItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.category}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${checklistColors[item.status]}`}>
                  {item.status}
                </span>
              </div>
            ))}
            {client.checklistItems.length === 0 && (
              <div className="text-sm text-gray-400">No checklist items created yet.</div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div id="tasks" className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Tasks</h2>
          <TaskPanel clientId={id} />
        </div>

        {/* Notes */}
        <div id="notes" className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Notes & Activity</h2>
          <ClientNotesPanel clientId={id} initialNotes={initialNotes} />
        </div>
      </div>
    </div>
  );
}
