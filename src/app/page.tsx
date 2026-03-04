import Link from "next/link";

const stats = [
  { label: "Active Clients", value: "0", href: "/intake" },
  { label: "Open Invoices", value: "$0", href: "/financials" },
  { label: "Pending Workflows", value: "0", href: "/workflows" },
];

const quickLinks = [
  {
    href: "/intake",
    title: "Client Intake",
    description:
      "Onboard new clients, collect information, and manage the intake pipeline.",
    icon: "👤",
  },
  {
    href: "/financials",
    title: "Financials",
    description:
      "Track invoices, payments, and financial reporting for all clients.",
    icon: "💰",
  },
  {
    href: "/workflows",
    title: "Automation Workflows",
    description:
      "Configure and monitor automated workflows to streamline operations.",
    icon: "⚡",
  },
  {
    href: "/admin",
    title: "Admin Dashboard",
    description: "Manage users, settings, permissions, and platform configuration.",
    icon: "⚙️",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to the BBA Services Client Platform
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Sections</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map(({ href, title, description, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

