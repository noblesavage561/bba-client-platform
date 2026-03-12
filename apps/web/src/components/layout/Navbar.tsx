"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo compact className="scale-[0.92] origin-left" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
            >
              Platform
            </Link>
            <Link
              href="/portal"
              className="text-slate-600 hover:text-brand-blue text-sm font-medium transition-colors"
            >
              Client Portal
            </Link>
            <Link
              href="/admin"
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
                  href="/auth/signup"
                  className="bg-brand-gold hover:bg-brand-gold-light text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Sign Up
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
            <Link href="/" className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
              Platform
            </Link>
            <Link href="/portal" className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
              Client Portal
            </Link>
            <Link href="/admin" className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
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
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-slate-600 hover:text-brand-blue px-2 py-2 text-sm font-medium">
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-brand-gold text-white px-4 py-2 rounded-lg text-sm font-bold mt-2 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
