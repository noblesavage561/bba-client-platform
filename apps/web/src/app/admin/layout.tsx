import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";
import { buildLoginHref } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";
import { logAuthRouteFailure } from "@/lib/runtimeLogger";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    logAuthRouteFailure("missing-session", { route: ROUTES.ADMIN });
    redirect(buildLoginHref(ROUTES.ADMIN));
  }

  if (!(ADMIN_ROLES as readonly string[]).includes(session.user.role)) {
    logAuthRouteFailure("insufficient-role", {
      route: ROUTES.ADMIN,
      role: session.user.role,
    });
    redirect(ROUTES.PORTAL);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
