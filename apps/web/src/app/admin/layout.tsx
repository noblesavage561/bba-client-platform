import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
