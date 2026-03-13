import { SignalFeed } from "@/components/portal/SignalFeed";
import { getPortalClient } from "@/lib/portalClient";

export const dynamic = "force-dynamic";

export default async function PortalNotificationsPage() {
  const { client } = await getPortalClient();

  if (!client) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-blue">Notification Center</h1>
        <p className="mt-2 text-sm text-slate-500">
          Complete intake and sign in to view your case notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-blue">Notification Center</h1>
      <p className="mt-2 text-sm text-slate-500">
        Real-time case activity, AI processing updates, and advisor alerts.
      </p>
      <div className="mt-6">
        <SignalFeed caseId={client.id} role="client" maxItems={50} autoRefresh />
      </div>
    </div>
  );
}
