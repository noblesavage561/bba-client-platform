"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navItems = [
  { href: "/admin", label: "Command Dashboard", icon: "📊", exact: true },
  { href: "/admin/clients", label: "Taxpayers", icon: "👥" },
  { href: "/admin/documents", label: "Document Queue", icon: "📄" },
  { href: "/admin/config", label: "Platform Rules", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-blue text-white flex flex-col min-h-screen shrink-0">
      <div className="p-4 border-b border-slate-500/40">
        <BrandLogo compact className="invert brightness-[1.9] saturate-[0.2]" />
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-300">
          Preparer and Reviewer Workspace
        </p>
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
                  ? "bg-brand-gold text-white"
                  : "text-slate-200 hover:bg-brand-blue-light hover:text-white"}`}
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
          className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors"
        >
          <span>←</span>
          Platform Home
        </Link>
      </div>
    </aside>
  );
}
