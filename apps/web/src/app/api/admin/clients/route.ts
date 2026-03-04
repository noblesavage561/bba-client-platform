import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/authHelpers";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

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
