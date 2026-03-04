import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | BBA Client Platform",
};

const adminSections = [
  {
    title: "User Management",
    description: "Add, remove, and manage platform users and their roles.",
    icon: "👥",
    action: "Manage Users",
  },
  {
    title: "Permissions & Roles",
    description: "Configure role-based access control for each platform section.",
    icon: "🔐",
    action: "Edit Roles",
  },
  {
    title: "Platform Settings",
    description: "Update branding, notifications, and general platform configuration.",
    icon: "🛠️",
    action: "Open Settings",
  },
  {
    title: "Integrations",
    description: "Connect third-party services such as email, CRM, and payment processors.",
    icon: "🔗",
    action: "View Integrations",
  },
  {
    title: "Audit Log",
    description: "Review a history of all actions taken across the platform.",
    icon: "📋",
    action: "View Log",
  },
  {
    title: "Data Export",
    description: "Export client, financial, and workflow data to CSV or other formats.",
    icon: "📤",
    action: "Export Data",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage users, settings, permissions, and platform configuration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map(({ title, description, icon, action }) => (
          <div
            key={title}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              {icon}
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 flex-1 text-sm text-gray-500">{description}</p>
            <button className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
