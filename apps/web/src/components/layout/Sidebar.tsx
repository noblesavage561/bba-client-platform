"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/clients", label: "Clients", icon: "👥" },
  { href: "/admin/documents", label: "Documents", icon: "📄" },
  { href: "/admin/config", label: "Configuration", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-blue text-white flex flex-col min-h-screen shrink-0">
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center text-brand-blue font-bold text-xs">
            BBA
          </div>
          <div>
            <div className="font-bold text-sm">Admin Panel</div>
            <div className="text-blue-300 text-xs">Business Banking Alliance</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-brand-gold text-brand-blue"
                  : "text-blue-200 hover:bg-blue-700 hover:text-white"}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-300 hover:text-white text-sm transition-colors"
        >
          <span>←</span>
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
