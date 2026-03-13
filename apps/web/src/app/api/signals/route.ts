import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";

function parseMetadata(value: string): Record<string, unknown> | undefined {
  try {
    return value ? (JSON.parse(value) as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseId = request.nextUrl.searchParams.get("caseId");
    const role = request.nextUrl.searchParams.get("role") || "client";
    const limit = Math.min(
      Math.max(parseInt(request.nextUrl.searchParams.get("limit") || "10", 10), 1),
      50
    );

    if (!caseId) {
      return NextResponse.json(
        { error: "Missing caseId" },
        { status: 400 }
      );
    }

    const client = await db.client.findUnique({
      where: { id: caseId },
      select: { userId: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
    if (!isAdmin && client.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For clients, only fetch client-visible signals
    // For staff, fetch all signals
    const isClientRole = role === "client";

    const signals = await db.caseSignal.findMany({
      where: {
        clientId: caseId,
        ...(isClientRole && { isClientVisible: true }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Count unresolved signals
    const unreadCount = await db.caseSignal.count({
      where: {
        clientId: caseId,
        isResolved: false,
        ...(isClientRole && { isClientVisible: true }),
      },
    });

    // Parse metadata where it's JSON
    const parsedSignals = signals.map((signal) => ({
      ...signal,
      metadata: parseMetadata(signal.metadata),
    }));

    return NextResponse.json({
      signals: parsedSignals,
      unreadCount,
      total: parsedSignals.length,
    });
  } catch (error) {
    console.error("Signals API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch signals",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId, signalType, severity, title, body, metadata } =
      await request.json();

    if (!caseId || !signalType || !title || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await db.client.findUnique({
      where: { id: caseId },
      select: { userId: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
    if (!isAdmin && client.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Debounce duplicate events emitted in rapid succession.
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existing = await db.caseSignal.findFirst({
      where: {
        clientId: caseId,
        signalType,
        title,
        body,
        createdAt: { gte: fiveSecondsAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const signal = await db.caseSignal.create({
      data: {
        clientId: caseId,
        signalType,
        severity: severity || "info",
        title,
        body,
        source: "api",
        isClientVisible: true,
        metadata:
          metadata && typeof metadata === "object"
            ? JSON.stringify(metadata)
            : "{}",
      },
    });

    return NextResponse.json(signal, { status: 201 });
  } catch (error) {
    console.error("Create signal error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create signal",
      },
      { status: 500 }
    );
  }
}
