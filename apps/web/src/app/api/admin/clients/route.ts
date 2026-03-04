import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN", "PROGRAM_MANAGER", "COMPLIANCE", "FINANCE", "CLIENT_SUCCESS", "CREDIT"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");

    const clients = await prisma.client.findMany({
      where: {
        ...(stage && { stage }),
        ...(search && {
          businessName: { contains: search },
        }),
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[ADMIN_CLIENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
