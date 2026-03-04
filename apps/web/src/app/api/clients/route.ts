import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");

    const where = stage ? { stage } : {};

    const clients = await prisma.client.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, businessName, programTrack } = body;

    if (!userId || !businessName) {
      return NextResponse.json(
        { error: "userId and businessName are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        userId,
        businessName,
        programTrack,
        stage: "LEAD",
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("[CLIENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
