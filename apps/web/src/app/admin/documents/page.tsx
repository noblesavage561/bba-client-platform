const mockDocuments = [
  { id: "d1", client: "Apex Tech Solutions", name: "Chase_Bank_Statement_Dec23.pdf", type: "BANK_STATEMENT", status: "PROCESSED", uploadedAt: "2024-01-10", size: "1.2 MB" },
  { id: "d2", client: "Rivera Construction", name: "Business_Tax_Return_2022.pdf", type: "TAX_RETURN", status: "PROCESSED", uploadedAt: "2024-01-10", size: "3.4 MB" },
  { id: "d3", client: "Bright Future Logistics", name: "Articles_of_Incorporation.pdf", type: "FORMATION_DOC", status: "PENDING", uploadedAt: "2024-01-12", size: "456 KB" },
  { id: "d4", client: "Apex Tech Solutions", name: "W2_2023.pdf", type: "W2", status: "PROCESSING", uploadedAt: "2024-01-14", size: "890 KB" },
  { id: "d5", client: "Chen Consulting", name: "Bank_Statement_Nov23.pdf", type: "BANK_STATEMENT", status: "FAILED", uploadedAt: "2024-01-11", size: "2.1 MB" },
  { id: "d6", client: "Johnson Bakery", name: "1099_2023.pdf", type: "FORM_1099", status: "PROCESSED", uploadedAt: "2024-01-09", size: "340 KB" },
];

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

export default function AdminDocumentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-blue">Document Review</h1>
        <p className="text-gray-500 mt-1">Review and manage all client documents.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
          <option value="FAILED">Failed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by client or filename..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>

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
            {mockDocuments.map((doc, i) => (
              <tr key={doc.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <span className="text-sm text-gray-800 font-medium truncate max-w-48">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{doc.client}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{typeLabels[doc.type] || doc.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[doc.status]}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{doc.uploadedAt}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{doc.size}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-brand-blue hover:underline">View</button>
                    {doc.status === "PENDING" && (
                      <>
                        <button className="text-xs text-green-600 hover:underline">Approve</button>
                        <button className="text-xs text-red-500 hover:underline">Reject</button>
                      </>
                    )}
                    {doc.status === "FAILED" && (
                      <button className="text-xs text-orange-500 hover:underline">Retry</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
