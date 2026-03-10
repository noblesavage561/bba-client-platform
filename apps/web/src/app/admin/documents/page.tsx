import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  PROCESSED: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PENDING: "bg-gray-100 text-gray-700",
  FAILED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  BANK_STATEMENT: "Bank Statement",
  TAX_RETURN: "Tax Return",
  W2: "W-2",
  FORM_1099: "1099",
  K1: "K-1",
  FORMATION_DOC: "Formation Doc",
  INVOICE: "Invoice",
  CONTRACT: "Contract",
  ID_DOCUMENT: "ID Document",
  OTHER: "Other",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const { type, status, q } = await searchParams;

  const documents = await prisma.document.findMany({
    where: {
      ...(type ? { documentType: type } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { originalName: { contains: q } },
              { filename: { contains: q } },
              { client: { businessName: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, businessName: true } },
    },
    orderBy: { uploadedAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-blue">Document Review</h1>
        <p className="text-gray-500 mt-1">Review and manage all client documents.</p>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <select name="type" defaultValue={type ?? ""} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
          <option value="FAILED">Failed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          name="q"
          type="text"
          placeholder="Search by client or filename..."
          defaultValue={q ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue-light transition-colors">
          Filter
        </button>
        <Link href="/admin/documents" className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Clear
        </Link>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uploaded</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={doc.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <span className="text-sm text-gray-800 font-medium truncate max-w-48">{doc.originalName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{doc.client.businessName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{typeLabels[doc.documentType] || doc.documentType}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[doc.status]}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{doc.uploadedAt.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(doc.fileSize)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/clients/${doc.client.id}`} className="text-xs text-brand-blue hover:underline">View Client</Link>
                    {doc.status === "PENDING" && (
                      <span className="text-xs text-green-600">Awaiting review</span>
                    )}
                    {doc.status === "FAILED" && (
                      <span className="text-xs text-orange-500">Reprocess needed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No documents match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
