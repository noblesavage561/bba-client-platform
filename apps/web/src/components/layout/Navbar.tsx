"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-brand-blue shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center text-brand-blue font-bold text-sm">
              BBA
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              Business Banking Alliance
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/portal"
              className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
            >
              Client Portal
            </Link>
            <Link
              href="/admin"
              className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/apply"
              className="bg-brand-gold hover:bg-yellow-400 text-brand-blue px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
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

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-blue-700 mt-2 pt-3 space-y-1">
            <Link href="/" className="block text-blue-200 hover:text-white px-2 py-2 text-sm font-medium">
              Home
            </Link>
            <Link href="/portal" className="block text-blue-200 hover:text-white px-2 py-2 text-sm font-medium">
              Client Portal
            </Link>
            <Link href="/admin" className="block text-blue-200 hover:text-white px-2 py-2 text-sm font-medium">
              Admin
            </Link>
            <Link
              href="/apply"
              className="block bg-brand-gold text-brand-blue px-4 py-2 rounded-lg text-sm font-bold mt-2 text-center"
            >
              Apply Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
