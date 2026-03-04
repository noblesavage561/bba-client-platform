import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "BBA Client Platform",
  description:
    "BBA Services client intake platform, financials, automation workflows, and admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <Nav />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
