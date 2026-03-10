import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";

function canAccessClient(session: { user: { id: string; role: string } }, ownerUserId: string) {
  if ((ADMIN_ROLES as readonly string[]).includes(session.user.role)) {
    return true;
  }
  return session.user.id === ownerUserId;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!owner) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!canAccessClient(session, owner.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        checklistItems: { orderBy: { category: "asc" } },
        tasks: { orderBy: { dueDate: "asc" } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!owner) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!canAccessClient(session, owner.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { stage, programTrack, readinessScore, businessName } = body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(programTrack !== undefined && { programTrack }),
        ...(readinessScore !== undefined && { readinessScore }),
        ...(businessName && { businessName }),
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!owner) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!canAccessClient(session, owner.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLIENT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
