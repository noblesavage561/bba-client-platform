import Link from "next/link";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";

interface Client {
  id: string;
  businessName: string;
  stage: string;
  programTrack: string | null;
  readinessScore: number;
  ownerName: string;
  updatedAt: string;
}

export function ClientCard({ client }: { client: Client }) {
  const scoreColor =
    client.readinessScore >= 80 ? "text-green-600" :
    client.readinessScore >= 60 ? "text-yellow-600" : "text-orange-500";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{client.businessName}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{client.ownerName}</p>
          </div>
          <Badge variant={statusToBadgeVariant(client.stage)}>
            {client.stage}
          </Badge>
        </div>

        {client.programTrack && (
          <div className="text-xs text-brand-gold font-medium bg-amber-50 px-2 py-1 rounded-full inline-block mb-3">
            {client.programTrack}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Readiness</div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${client.readinessScore >= 80 ? "bg-green-500" : client.readinessScore >= 60 ? "bg-yellow-400" : "bg-orange-400"}`}
                  style={{ width: `${client.readinessScore}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${scoreColor}`}>
                {client.readinessScore}%
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Updated {client.updatedAt}
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <Link
          href={`/admin/clients/${client.id}`}
          className="text-xs font-medium text-brand-blue hover:underline"
        >
          View Details →
        </Link>
        <div className="flex gap-3">
          <Link href={`/admin/clients/${client.id}#tasks`} className="text-xs text-gray-500 hover:text-brand-blue transition-colors">
            Add Task
          </Link>
          <Link href={`/admin/clients/${client.id}#notes`} className="text-xs text-gray-500 hover:text-brand-blue transition-colors">
            Add Note
          </Link>
        </div>
      </div>
    </div>
  );
}
