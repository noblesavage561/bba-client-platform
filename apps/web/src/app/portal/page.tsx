import Link from "next/link";
import { prisma } from "@/lib/db";
import { getPortalClient } from "@/lib/portalClient";
import { buildLoginHref, buildRegisterHref } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { AIAdvisorPanel } from "@/components/portal/AIAdvisorPanel";
import { SignalFeed } from "@/components/portal/SignalFeed";

const PIPELINE_STAGES = [
  { key: "LEAD", label: "Lead", color: "bg-gray-400" },
  { key: "INTAKE", label: "Intake", color: "bg-blue-500" },
  { key: "STRATEGY", label: "Strategy", color: "bg-sky-500" },
  { key: "FOUNDATION", label: "Foundation", color: "bg-amber-500" },
  { key: "ACTIVE", label: "Active", color: "bg-orange-500" },
  { key: "FUNDED", label: "Funded", color: "bg-green-500" },
  { key: "CLOSED", label: "Closed", color: "bg-red-500" },
];

export const dynamic = "force-dynamic";

function formatRelativeTime(value: Date): string {
  const now = Date.now();
  const diffMs = now - value.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default async function PortalPage() {
  const { session, client } = await getPortalClient();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-blue">Sign in required</h1>
          <p className="text-gray-500 mt-2">Please sign in to view your client portal dashboard.</p>
          <Link href={buildLoginHref(ROUTES.PORTAL)} className="inline-block mt-6 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
            Go to Login
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            First time here?{" "}
            <Link href={buildRegisterHref(ROUTES.PORTAL)} className="text-brand-blue font-medium hover:underline">
              Create your sign-in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-blue">No client profile found</h1>
          <p className="text-gray-500 mt-2">Complete intake to create your profile and start tracking your progress.</p>
          <Link href={ROUTES.APPLY} className="inline-block mt-6 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
            Start Intake
          </Link>
        </div>
      </div>
    );
  }

  const portalUserId = typeof session.user?.id === "string" && session.user.id.length > 0
    ? session.user.id
    : client.userId;

  const [notifications, unreadNotificationsCount] = await Promise.all([
    portalUserId
      ? prisma.notification.findMany({
          where: { userId: portalUserId },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : Promise.resolve([] as Array<{ id: string; message: string; type: string; createdAt: Date }>),
    portalUserId
      ? prisma.notification.count({
          where: {
            userId: portalUserId,
            read: false,
          },
        })
      : Promise.resolve(0),
  ]);

  const currentStage = client.stage;
  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentStage);

  const hydratedNotifications = notifications.length > 0
    ? notifications.map((item) => ({
        id: item.id,
        message: item.message,
        type: item.type,
        time: formatRelativeTime(item.createdAt),
      }))
    : [
        {
          id: "empty",
          message: "No recent signals yet. Upload documents to start pipeline updates.",
          type: "INFO",
          time: "just now",
        },
      ];

  const notificationColors: Record<string, string> = {
    SUCCESS: "bg-green-50 border-green-300 text-green-800",
    WARNING: "bg-amber-50 border-amber-300 text-amber-800",
    ERROR: "bg-red-50 border-red-300 text-red-800",
    INFO: "bg-blue-50 border-blue-300 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-blue text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Welcome back, {client.businessName} 👋</h1>
          <p className="text-slate-200 mt-1">Your workflow status, AI confidence overview, and live case updates.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Filing Workflow</h2>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage, index) => (
              <div key={stage.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                      ${index <= currentStageIndex ? stage.color : "bg-gray-200"}`}
                  >
                    {index < currentStageIndex ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium whitespace-nowrap
                    ${index === currentStageIndex ? "text-brand-blue" : "text-gray-400"}`}
                  >
                    {stage.label}
                  </span>
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1
                    ${index < currentStageIndex ? "bg-brand-gold" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Current Stage:{" "}
            <span className="font-semibold text-brand-blue">
              {PIPELINE_STAGES.find((s) => s.key === currentStage)?.label ?? currentStage}
            </span>{" "}
            - this stage updates as your team processes documents, completes checklist items, and advances your case.
          </p>
        </div>

        <DashboardMetrics caseId={client.id} className="mb-8" />

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href={ROUTES.PORTAL_DOCUMENTS}
            className="bg-brand-blue text-white rounded-xl p-5 hover:bg-brand-blue-light transition-colors flex items-center gap-3 group"
          >
            <span className="text-3xl">📤</span>
            <div>
              <div className="font-semibold">Upload Documents</div>
              <div className="text-slate-200 text-sm">Add W-2, 1099, K-1, statements, and receipts</div>
            </div>
          </Link>
          <Link
            href={ROUTES.PORTAL_CHECKLIST}
            className="bg-brand-gold text-white rounded-xl p-5 hover:bg-brand-gold-light transition-colors flex items-center gap-3"
          >
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-semibold">Open Tax Checklist</div>
              <div className="text-slate-100 text-sm">Review missing items and filing blockers</div>
            </div>
          </Link>
          <Link
            href={ROUTES.PORTAL_NOTIFICATIONS}
            className="bg-white border-2 border-brand-blue text-brand-blue rounded-xl p-5 hover:bg-brand-blue/5 transition-colors flex items-center gap-3"
          >
            <span className="text-3xl">💬</span>
            <div>
              <div className="font-semibold">Contact Your Advisor</div>
              <div className="text-gray-500 text-sm">View portal notices and advisor updates</div>
            </div>
          </Link>
        </div>

        <div className="grid xl:grid-cols-2 gap-6 mb-8">
          <AIAdvisorPanel caseId={client.id} userRole="client" />
          <SignalFeed
            caseId={client.id}
            role="client"
            maxItems={8}
            autoRefresh
          />
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">
            Recent Notifications {unreadNotificationsCount > 0 ? `(${unreadNotificationsCount} unread)` : ""}
          </h2>
          <div className="space-y-3">
            {hydratedNotifications.map((item) => (
              <div key={item.id} className={`border rounded-lg p-4 ${notificationColors[item.type] ?? notificationColors.INFO}`}>
                <p className="text-sm">{item.message}</p>
                <p className="text-xs opacity-60 mt-1">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
