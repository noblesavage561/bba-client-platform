import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BrandLogo } from "@/components/layout/BrandLogo";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "BBA Services Tax Intelligence Platform",
  description:
    "Enterprise-grade, AI-powered tax preparation and advisory command center for clients, preparers, and reviewers.",
  keywords:
    "tax platform, ai tax preparation, document intelligence, preparer workbench, reviewer dashboard, bba services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${spaceGrotesk.variable} font-sans min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-auto border-t border-slate-200 bg-white/80 py-8 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
            <BrandLogo compact />
            <div>
              <p className="text-sm font-semibold text-brand-blue">
                &copy; {new Date().getFullYear()} BBA Services. All rights reserved.
              </p>
              <p className="text-xs text-slate-500">bruce@bbaservices.org</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
