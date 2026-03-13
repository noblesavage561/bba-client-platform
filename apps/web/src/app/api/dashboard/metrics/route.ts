import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/authHelpers";
import { ROUTES } from "@/lib/routes";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseId = request.nextUrl.searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "Missing caseId" },
        { status: 400 }
      );
    }

    // Fetch case data
    const client = await db.client.findUnique({
      where: { id: caseId },
      include: {
        confidenceScore: true,
        documents: {
          where: { status: "PROCESSED" },
          select: { id: true },
        },
        checklistItems: {
          select: { status: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
    if (!isAdmin && client.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate checklist completion
    const checklistItems = client.checklistItems || [];
    const completedItems = checklistItems.filter(
      (i) => i.status === "COMPLETE"
    ).length;
    const checklistPct =
      checklistItems.length > 0
        ? Math.round((completedItems / checklistItems.length) * 100)
        : 0;

    // Get document count
    const documentCount = client.documents.length;

    // Get alerts count
    const alertsCount = await db.caseSignal.count({
      where: {
        clientId: caseId,
        isResolved: false,
      },
    });

    const pendingTasks = await db.task.count({
      where: {
        clientId: caseId,
        status: { not: "DONE" },
      },
    });

    // Get confidence score
    const confidenceScore = client.confidenceScore?.score || 0;

    const metrics = [
      {
        label: "Documents Processed",
        value: documentCount,
        icon: "📄",
        target: ROUTES.PORTAL_DOCUMENTS,
      },
      {
        label: "Checklist",
        value: `${checklistPct}%`,
        icon: "✓",
        target: ROUTES.PORTAL_CHECKLIST,
      },
      {
        label: "AI Confidence",
        value: `${confidenceScore}%`,
        icon: "🧠",
        color:
          confidenceScore >= 90
            ? "#059669"
            : confidenceScore >= 71
            ? "#1591cd"
            : confidenceScore >= 41
            ? "#d97706"
            : "#dc2626",
        target: ROUTES.PORTAL,
      },
      {
        label: "Pending Tasks",
        value: pendingTasks,
        icon: "📋",
        target: ROUTES.PORTAL_TASKS,
      },
      {
        label: "Alerts",
        value: alertsCount,
        icon: "🔔",
        target: ROUTES.PORTAL_NOTIFICATIONS,
      },
    ];

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load metrics",
      },
      { status: 500 }
    );
  }
}
