import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Active Taxpayers",
      value: "124",
      change: "+8 this week",
      icon: "👥",
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Ready To File",
      value: "47",
      change: "awaiting final sign-off",
      icon: "✅",
      color: "bg-green-50 border-green-200",
    },
    {
      label: "Low Confidence Fields",
      value: "23",
      change: "red queue",
      icon: "📄",
      color: "bg-amber-50 border-amber-200",
    },
    {
      label: "Risk Alerts",
      value: "11",
      change: "3 critical",
      icon: "⚡",
      color: "bg-red-50 border-red-200",
    },
  ];

  const pipelineSummary = [
    { stage: "INTAKE", count: 18, color: "bg-slate-400" },
    { stage: "DOCUMENT_COLLECTION", count: 24, color: "bg-blue-400" },
    { stage: "AI_PREPARATION", count: 19, color: "bg-indigo-400" },
    { stage: "PREPARER_REVIEW", count: 22, color: "bg-amber-400" },
    { stage: "FINAL_REVIEW", count: 28, color: "bg-orange-400" },
    { stage: "CLIENT_SIGNOFF", count: 9, color: "bg-green-500" },
    { stage: "E_FILED", count: 4, color: "bg-emerald-600" },
  ];

  const recentActivity = [
    {
      id: "1",
      text: "New intake submission from Atlas Medical Group",
      time: "5 min ago",
      type: "intake",
    },
    {
      id: "2",
      text: "K-1 packet processed for Rivera Holdings",
      time: "23 min ago",
      type: "document",
    },
    {
      id: "3",
      text: "Reviewer override captured for Section 179 field mapping",
      time: "1 hour ago",
      type: "task",
    },
    {
      id: "4",
      text: "Battle Plan generated: retirement optimization opportunity",
      time: "2 hours ago",
      type: "client",
    },
    {
      id: "5",
      text: "Audit risk warning triggered for withholding anomaly",
      time: "3 hours ago",
      type: "document",
    },
  ];

  const activityIcons: Record<string, string> = {
    intake: "📋",
    document: "📄",
    task: "✅",
    client: "👤",
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-blue">
          Reviewer Command Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Workflow health, confidence queues, and optimization opportunities
          across active returns.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 border-2 ${stat.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-brand-blue">{stat.value}</span>
            </div>
            <div className="font-semibold text-gray-700">{stat.label}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-blue">
              Workflow Stage Summary
            </h2>
            <Link href="/admin/clients" className="text-sm text-brand-blue hover:underline">
              View all -&gt;
            </Link>
          </div>
          <div className="space-y-3">
            {pipelineSummary.map((item) => (
              <div key={item.stage} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm font-medium text-gray-700 w-28">{item.stage}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.count / 124) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-600 w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">
            Recent Intelligence Events
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <span className="text-xl mt-0.5">{activityIcons[activity.type]}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/clients" className="bg-brand-blue text-white rounded-xl p-4 text-center hover:bg-brand-blue-light transition-colors">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-sm font-medium">View Taxpayers</div>
        </Link>
        <Link href="/admin/documents" className="bg-white border-2 border-brand-blue text-brand-blue rounded-xl p-4 text-center hover:bg-blue-50 transition-colors">
          <div className="text-2xl mb-1">📄</div>
          <div className="text-sm font-medium">Review Documents</div>
        </Link>
        <Link href="/admin/config" className="bg-white border-2 border-brand-gold text-brand-blue rounded-xl p-4 text-center hover:bg-sky-50 transition-colors">
          <div className="text-2xl mb-1">⚙️</div>
          <div className="text-sm font-medium">Rules and Settings</div>
        </Link>
        <a href="mailto:bruce@bbaservices.org" className="bg-brand-gold text-white rounded-xl p-4 text-center hover:bg-brand-gold-light transition-colors">
          <div className="text-2xl mb-1">📧</div>
          <div className="text-sm font-medium">Notify Team</div>
        </a>
      </div>
    </div>
  );
}
