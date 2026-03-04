import Link from "next/link";

const PIPELINE_STAGES = [
  { key: "LEAD", label: "Lead", color: "bg-gray-400" },
  { key: "INTAKE", label: "Intake", color: "bg-blue-400" },
  { key: "STRATEGY", label: "Strategy", color: "bg-purple-400" },
  { key: "FOUNDATION", label: "Foundation", color: "bg-yellow-400" },
  { key: "ACTIVE", label: "Active", color: "bg-orange-400" },
  { key: "FUNDED", label: "Funded", color: "bg-green-500" },
  { key: "CLOSED", label: "Closed", color: "bg-red-400" },
];

export default function PortalPage() {
  // In production this would come from getServerSession
  const clientName = "Your Business";
  const currentStage = "STRATEGY";
  const currentStageIndex = PIPELINE_STAGES.findIndex(
    (s) => s.key === currentStage
  );

  const stats = [
    { label: "Documents Uploaded", value: "4", icon: "📄" },
    { label: "Checklist Completion", value: "62%", icon: "✅" },
    { label: "Days in Program", value: "14", icon: "📅" },
    { label: "Tasks Pending", value: "3", icon: "📋" },
  ];

  const notifications = [
    {
      id: "1",
      message: "Your bank statements have been processed successfully.",
      type: "SUCCESS",
      time: "2 hours ago",
    },
    {
      id: "2",
      message: "Please upload your most recent tax return (2023).",
      type: "WARNING",
      time: "1 day ago",
    },
    {
      id: "3",
      message: "Welcome to the BBA Client Platform! Your application is under review.",
      type: "INFO",
      time: "2 days ago",
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
      {/* Header */}
      <div className="bg-brand-blue text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            Welcome back, {clientName} 👋
          </h1>
          <p className="text-blue-200 mt-1">
            Here's an overview of your application progress.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Pipeline Progress */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">
            Your Progress
          </h2>
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
              {PIPELINE_STAGES.find((s) => s.key === currentStage)?.label}
            </span>{" "}
            – Our team is reviewing your information and preparing your strategy.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-brand-blue">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/portal/documents"
            className="bg-brand-blue text-white rounded-xl p-5 hover:bg-brand-blue-light transition-colors flex items-center gap-3 group"
          >
            <span className="text-3xl">📤</span>
            <div>
              <div className="font-semibold">Upload Documents</div>
              <div className="text-blue-200 text-sm">
                Add bank statements, tax returns & more
              </div>
            </div>
          </Link>
          <Link
            href="/portal/checklist"
            className="bg-brand-gold text-brand-blue rounded-xl p-5 hover:bg-yellow-400 transition-colors flex items-center gap-3"
          >
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-semibold">View Checklist</div>
              <div className="text-amber-800 text-sm">
                Track your completion status
              </div>
            </div>
          </Link>
          <a
            href="mailto:bruce@bbaservices.org"
            className="bg-white border-2 border-brand-blue text-brand-blue rounded-xl p-5 hover:bg-blue-50 transition-colors flex items-center gap-3"
          >
            <span className="text-3xl">💬</span>
            <div>
              <div className="font-semibold">Contact Your Advisor</div>
              <div className="text-gray-500 text-sm">
                Get support from your BBA team
              </div>
            </div>
          </a>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-brand-blue mb-4">
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`border rounded-lg p-4 ${notificationColors[n.type]}`}
              >
                <p className="text-sm">{n.message}</p>
                <p className="text-xs opacity-60 mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
