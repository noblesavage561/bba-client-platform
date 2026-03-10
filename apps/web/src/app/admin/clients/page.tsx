import Link from "next/link";
import { ClientCard } from "@/components/admin/ClientCard";
import { prisma } from "@/lib/db";
import { ROUTES } from "@/lib/routes";

const STAGES = ["ALL", "LEAD", "INTAKE", "STRATEGY", "FOUNDATION", "ACTIVE", "FUNDED", "CLOSED"];

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const activeStage = stage ?? "ALL";

  const clients = await prisma.client.findMany({
    where: activeStage === "ALL" ? undefined : { stage: activeStage },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const countsByStage = await prisma.client.groupBy({
    by: ["stage"],
    _count: { _all: true },
  });

  const totalCount = countsByStage.reduce((sum, row) => sum + row._count._all, 0);
  const stageCounts = Object.fromEntries(
    countsByStage.map((row) => [row.stage, row._count._all])
  ) as Record<string, number>;

  const formattedClients = clients.map((client) => ({
    id: client.id,
    businessName: client.businessName,
    stage: client.stage,
    programTrack: client.programTrack,
    readinessScore: client.readinessScore,
    ownerName: client.user?.name ?? "Unassigned",
    updatedAt: client.updatedAt.toISOString().slice(0, 10),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Client Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage and track all clients through intake, preparation, and filing readiness.</p>
        </div>
        <Link
          href={ROUTES.ADMIN_CLIENT_NEW}
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
            href={`${ROUTES.ADMIN_CLIENTS}${stage !== "ALL" ? `?stage=${stage}` : ""}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${activeStage === stage
                ? "bg-brand-blue text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {stage === "ALL"
              ? `All (${totalCount})`
              : `${stage} (${stageCounts[stage] ?? 0})`}
          </Link>
        ))}
      </div>

      {/* Client Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {formattedClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {formattedClients.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>No clients found for this stage.</p>
        </div>
      )}
    </div>
  );
}
