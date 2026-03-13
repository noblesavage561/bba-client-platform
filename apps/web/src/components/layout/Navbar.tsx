"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ROUTES } from "@/lib/routes";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUnread = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as Array<{ read?: boolean }>;
        const unread = payload.filter((item) => item.read === false).length;
        if (mounted) {
          setUnreadCount(unread);
        }
      } catch {
        // Silently ignore when user is not authenticated.
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo compact className="scale-[0.92] origin-left" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href={ROUTES.HOME}
              className="text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
            >
              Platform
            </Link>
            <Link
              href={ROUTES.PORTAL}
              className="text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
            >
              Client Portal
            </Link>
            <Link
              href={ROUTES.PREPARER}
              className="text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
            >
              Preparer Workspace
            </Link>
            {session ? (
              <>
                <span className="text-sm text-slate-500">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-slate-600 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
                <Link
                  href={ROUTES.PORTAL_NOTIFICATIONS}
                  className="relative text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
                  aria-label="Open notification center"
                >
                  <span className="text-lg">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] px-1 h-[18px] rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={ROUTES.APPLY}
                  className="bg-brand-gold hover:bg-brand-gold-light text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Start Intake
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="bg-brand-gold hover:bg-brand-gold-light text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-brand-blue p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 mt-2 pt-3 space-y-1">
            <Link href={ROUTES.HOME} className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
              Platform
            </Link>
            <Link href={ROUTES.PORTAL} className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
              Client Portal
            </Link>
            <Link href={ROUTES.PREPARER} className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
              Preparer Workspace
            </Link>
            {session ? (
              <>
                <div className="px-2 py-2 text-sm text-slate-500">
                  {session.user.email}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left text-red-600 hover:text-red-700 px-2 py-2 text-sm font-medium"
                >
                  Sign Out
                </button>
                <Link href={ROUTES.PORTAL_NOTIFICATIONS} className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
                  Notification Center{unreadCount > 0 ? ` (${unreadCount})` : ""}
                </Link>
                <Link
                  href={ROUTES.APPLY}
                  className="block bg-brand-gold text-white px-4 py-2 rounded-lg text-sm font-bold mt-2 text-center"
                >
                  Start Intake
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
                  Sign In
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="block bg-brand-gold text-white px-4 py-2 rounded-lg text-sm font-bold mt-2 text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
