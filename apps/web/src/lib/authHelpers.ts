import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "PROGRAM_MANAGER",
  "COMPLIANCE",
  "FINANCE",
  "CLIENT_SUCCESS",
  "CREDIT",
] as const;

export const SUPER_ADMIN_ROLES = ["SUPER_ADMIN", "PROGRAM_MANAGER"] as const;

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!(ADMIN_ROLES as readonly string[]).includes(session.user.role)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function requireSuperAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!(SUPER_ADMIN_ROLES as readonly string[]).includes(session.user.role)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}
