import { getPortalClient } from "@/lib/portalClient";

export const dynamic = "force-dynamic";

export default async function PortalTasksPage() {
  const { client } = await getPortalClient();

  if (!client) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-blue">Tasks</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to view your current case tasks.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-blue">Pending Tasks</h1>
      <p className="mt-2 text-sm text-slate-500">
        Your preparer will add action items here as your case advances.
      </p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        You are all caught up right now. New tasks appear automatically when required.
      </div>
    </div>
  );
}
