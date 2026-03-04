import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Clients", value: "124", change: "+8 this month", icon: "👥", color: "bg-blue-50 border-blue-200" },
    { label: "Active Clients", value: "47", change: "in ACTIVE/FUNDED stage", icon: "✅", color: "bg-green-50 border-green-200" },
    { label: "Pending Documents", value: "23", change: "awaiting review", icon: "📄", color: "bg-amber-50 border-amber-200" },
    { label: "Tasks Due Today", value: "11", change: "3 overdue", icon: "⚡", color: "bg-red-50 border-red-200" },
  ];

  const pipelineSummary = [
    { stage: "LEAD", count: 18, color: "bg-gray-400" },
    { stage: "INTAKE", count: 24, color: "bg-blue-400" },
    { stage: "STRATEGY", count: 19, color: "bg-purple-400" },
    { stage: "FOUNDATION", count: 22, color: "bg-yellow-400" },
    { stage: "ACTIVE", count: 28, color: "bg-orange-400" },
    { stage: "FUNDED", count: 9, color: "bg-green-500" },
    { stage: "CLOSED", count: 4, color: "bg-red-400" },
  ];

  const recentActivity = [
    { id: "1", text: "New intake submission from Apex Tech Solutions", time: "5 min ago", type: "intake" },
    { id: "2", text: "Bank statement processed for Rivera Construction", time: "23 min ago", type: "document" },
    { id: "3", text: "Task completed: Review formation docs – Johnson LLC", time: "1 hour ago", type: "task" },
    { id: "4", text: "New client registered: Bright Future Logistics", time: "2 hours ago", type: "client" },
    { id: "5", text: "Document rejected: Tax return insufficient for Chen Consulting", time: "3 hours ago", type: "document" },
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
        <h1 className="text-2xl font-bold text-brand-blue">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all client activity and platform metrics.</p>
      </div>

      {/* Stats */}
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
        {/* Pipeline Summary */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-blue">Pipeline Summary</h2>
            <Link href="/admin/clients" className="text-sm text-brand-blue hover:underline">
              View all →
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">Recent Activity</h2>
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

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/clients" className="bg-brand-blue text-white rounded-xl p-4 text-center hover:bg-brand-blue-light transition-colors">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-sm font-medium">View Clients</div>
        </Link>
        <Link href="/admin/documents" className="bg-white border-2 border-brand-blue text-brand-blue rounded-xl p-4 text-center hover:bg-blue-50 transition-colors">
          <div className="text-2xl mb-1">📄</div>
          <div className="text-sm font-medium">Review Docs</div>
        </Link>
        <Link href="/admin/config" className="bg-white border-2 border-brand-gold text-brand-blue rounded-xl p-4 text-center hover:bg-amber-50 transition-colors">
          <div className="text-2xl mb-1">⚙️</div>
          <div className="text-sm font-medium">Configuration</div>
        </Link>
        <a href="mailto:bruce@bbaservices.org" className="bg-brand-gold text-brand-blue rounded-xl p-4 text-center hover:bg-yellow-400 transition-colors">
          <div className="text-2xl mb-1">📧</div>
          <div className="text-sm font-medium">Send Email</div>
        </a>
      </div>
    </div>
  );
}
