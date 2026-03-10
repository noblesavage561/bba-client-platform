"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <Link
              href="/apply"
              className="bg-brand-gold hover:bg-brand-gold-light text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Start Intake
            </Link>
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
            <Link
              href="/apply"
              className="block bg-brand-gold text-white px-4 py-2 rounded-lg text-sm font-bold mt-2 text-center"
            >
              Start Intake
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
