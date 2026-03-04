import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financials | BBA Client Platform",
};

const summaryCards = [
  { label: "Total Revenue", value: "$0.00", change: "+0%", positive: true },
  { label: "Outstanding Invoices", value: "$0.00", change: "0 invoices", positive: true },
  { label: "Collected This Month", value: "$0.00", change: "+0%", positive: true },
];

export default function FinancialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financials</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track invoices, payments, and financial reporting
          </p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          + New Invoice
        </button>
      </div>

      {/* Summary */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map(({ label, value, change, positive }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            <p
              className={`mt-1 text-xs font-medium ${
                positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* Invoices table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {["Invoice #", "Client", "Amount", "Due Date", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-600"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  No invoices yet. Create your first invoice to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
