import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "BBA Client Platform",
  description:
    "Business Banking Alliance – Unlock Your Business's Full Financial Potential",
  keywords: "business funding, credit optimization, compliance, BBA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-brand-blue text-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Business Banking Alliance. All
              rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              bruce@bbaservices.org
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
