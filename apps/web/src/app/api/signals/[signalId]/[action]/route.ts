import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ signalId: string; action: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signalId, action } = await context.params;

    if (!signalId || (action !== "read" && action !== "resolve")) {
      return NextResponse.json(
        { error: "Invalid signalId or action" },
        { status: 400 }
      );
    }

    const signal = await db.caseSignal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    const signalClient = await db.client.findUnique({
      where: { id: signal.clientId },
      select: { userId: true },
    });

    if (!signalClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
    if (!isAdmin && signalClient.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.caseSignal.update({
      where: { id: signalId },
      data: {
        ...(action === "resolve" && {
          isResolved: true,
          resolvedAt: new Date(),
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Signal action error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update signal",
      },
      { status: 500 }
    );
  }
}
