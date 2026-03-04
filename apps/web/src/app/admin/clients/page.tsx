import Link from "next/link";
import { ClientCard } from "@/components/admin/ClientCard";

const STAGES = ["ALL", "LEAD", "INTAKE", "STRATEGY", "FOUNDATION", "ACTIVE", "FUNDED", "CLOSED"];

const mockClients = [
  { id: "1", businessName: "Apex Tech Solutions", stage: "STRATEGY", programTrack: "Business Credit Builder", readinessScore: 68, ownerName: "Marcus Johnson", updatedAt: "2024-01-15" },
  { id: "2", businessName: "Rivera Construction LLC", stage: "ACTIVE", programTrack: "SBA Express", readinessScore: 85, ownerName: "Carlos Rivera", updatedAt: "2024-01-14" },
  { id: "3", businessName: "Bright Future Logistics", stage: "INTAKE", programTrack: null, readinessScore: 30, ownerName: "Tamara Williams", updatedAt: "2024-01-15" },
  { id: "4", businessName: "Chen Consulting Group", stage: "FOUNDATION", programTrack: "Business Credit Builder", readinessScore: 55, ownerName: "David Chen", updatedAt: "2024-01-13" },
  { id: "5", businessName: "Johnson Family Bakery", stage: "FUNDED", programTrack: "Micro-Lending Track", readinessScore: 92, ownerName: "Patricia Johnson", updatedAt: "2024-01-10" },
  { id: "6", businessName: "Sunrise Medical Spa", stage: "STRATEGY", programTrack: "SBA Express", readinessScore: 72, ownerName: "Dr. Aisha Patel", updatedAt: "2024-01-12" },
];

export default function ClientsPage({
  searchParams,
}: {
  searchParams: { stage?: string };
}) {
  const activeStage = searchParams.stage ?? "ALL";
  const filtered = activeStage === "ALL"
    ? mockClients
    : mockClients.filter((c) => c.stage === activeStage);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Client Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage and track all clients through the funding process.</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {/* Stage Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STAGES.map((stage) => (
          <Link
            key={stage}
            href={`/admin/clients${stage !== "ALL" ? `?stage=${stage}` : ""}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${activeStage === stage
                ? "bg-brand-blue text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {stage === "ALL" ? `All (${mockClients.length})` : `${stage} (${mockClients.filter(c => c.stage === stage).length})`}
          </Link>
        ))}
      </div>

      {/* Client Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>No clients found for this stage.</p>
        </div>
      )}
    </div>
  );
}
