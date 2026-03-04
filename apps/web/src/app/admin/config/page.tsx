import Link from "next/link";

const configSections = [
  {
    title: "Intake Questions",
    description: "Manage the questions in the client intake wizard.",
    icon: "📋",
    href: "/admin/config/intake",
    count: "23 questions",
  },
  {
    title: "Program Tracks",
    description: "Define funding programs and their checklist templates.",
    icon: "🗂️",
    href: "/admin/config/intake",
    count: "4 tracks",
  },
  {
    title: "Checklist Templates",
    description: "Configure document requirements for each program track.",
    icon: "✅",
    href: "/admin/config/intake",
    count: "3 templates",
  },
  {
    title: "Email Templates",
    description: "Customize automated emails sent to clients.",
    icon: "📧",
    href: "/admin/config/email-templates",
    count: "8 templates",
  },
];

export default function ConfigPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-blue">Configuration</h1>
        <p className="text-gray-500 mt-1">
          Manage platform settings, intake forms, and automation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {configSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{section.icon}</div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-brand-blue group-hover:underline">
                  {section.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{section.description}</p>
                <div className="mt-3 text-xs font-medium text-brand-gold bg-amber-50 inline-block px-2 py-1 rounded-full">
                  {section.count}
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-brand-blue transition-colors text-xl">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
