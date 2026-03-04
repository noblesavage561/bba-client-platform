import Link from "next/link";
import { TaskPanel } from "@/components/admin/TaskPanel";

const mockClient = {
  id: "1",
  businessName: "Apex Tech Solutions",
  stage: "STRATEGY",
  programTrack: "Business Credit Builder",
  readinessScore: 68,
  ownerName: "Marcus Johnson",
  ownerEmail: "marcus@apextech.com",
  ownerPhone: "(555) 234-5678",
  ein: "87-1234567",
  industry: "Technology",
  annualRevenue: "$850,000",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-15",
};

const mockDocuments = [
  { id: "d1", name: "Chase_Bank_Statement_Dec23.pdf", type: "BANK_STATEMENT", status: "PROCESSED", uploadedAt: "2024-01-10" },
  { id: "d2", name: "Business_Tax_Return_2022.pdf", type: "TAX_RETURN", status: "PROCESSED", uploadedAt: "2024-01-10" },
  { id: "d3", name: "Articles_of_Incorporation.pdf", type: "FORMATION_DOC", status: "PENDING", uploadedAt: "2024-01-12" },
  { id: "d4", name: "W2_2023.pdf", type: "W2", status: "PROCESSING", uploadedAt: "2024-01-14" },
];

const mockChecklist = [
  { id: "c1", label: "Bank Statements (3 months)", status: "COMPLETE", category: "Financial" },
  { id: "c2", label: "Business Tax Returns (2 years)", status: "IN_PROGRESS", category: "Tax" },
  { id: "c3", label: "Formation Documents", status: "IN_PROGRESS", category: "Legal" },
  { id: "c4", label: "EIN Letter", status: "PENDING", category: "Legal" },
  { id: "c5", label: "Personal Tax Returns (2 years)", status: "PENDING", category: "Tax" },
  { id: "c6", label: "Business Credit Report", status: "NOT_APPLICABLE", category: "Credit" },
];

const mockNotes = [
  { id: "n1", author: "Bruce B.", content: "Client called to confirm tax return is being prepared by CPA. Expected by Jan 20.", isInternal: true, createdAt: "2024-01-13 14:30" },
  { id: "n2", author: "Bruce B.", content: "Initial strategy call completed. Client is interested in SBA 7(a) and line of credit.", isInternal: false, createdAt: "2024-01-05 10:00" },
];

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
  STRATEGY: "bg-purple-100 text-purple-800",
  FOUNDATION: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-orange-100 text-orange-800",
  FUNDED: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
};

export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = { ...mockClient, id: params.id };

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
            <div className="font-medium text-gray-800">{client.ownerName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium text-gray-800">{client.ownerEmail}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">EIN</div>
            <div className="font-medium text-gray-800">{client.ein}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Annual Revenue</div>
            <div className="font-medium text-gray-800">{client.annualRevenue}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Documents</h2>
          <div className="space-y-2">
            {mockDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">📄</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{doc.name}</div>
                    <div className="text-xs text-gray-400">{doc.type} • {doc.uploadedAt}</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${statusColors[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Checklist</h2>
          <div className="space-y-2">
            {mockChecklist.map((item) => (
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
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Tasks</h2>
          <TaskPanel clientId={params.id} />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Notes & Activity</h2>
          <div className="space-y-3">
            {mockNotes.map((note) => (
              <div key={note.id} className={`p-4 rounded-lg ${note.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}>
                {note.isInternal && (
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                    Internal
                  </span>
                )}
                <p className="text-sm text-gray-700">{note.content}</p>
                <p className="text-xs text-gray-400 mt-1">{note.author} · {note.createdAt}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-lg text-sm hover:border-brand-blue hover:text-brand-blue transition-colors">
            + Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
