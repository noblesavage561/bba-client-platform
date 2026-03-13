import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ADMIN_ROLES } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

function serializeEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const caseId = request.nextUrl.searchParams.get("caseId");
  const role = request.nextUrl.searchParams.get("role") || "client";

  if (!caseId) {
    return new Response("Missing caseId", { status: 400 });
  }

  const client = await db.client.findUnique({
    where: { id: caseId },
    select: { userId: true },
  });

  if (!client) {
    return new Response("Client not found", { status: 404 });
  }

  const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.user.role);
  if (!isAdmin && client.userId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let lastSeenAt = new Date(Date.now() - 60_000);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const push = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(serializeEvent(event, data)));
      };

      let stopped = false;
      push("connected", { caseId, role, at: new Date().toISOString() });

      const poll = async () => {
        if (stopped) return;

        try {
          const isClientRole = role === "client";
          const signals = await db.caseSignal.findMany({
            where: {
              clientId: caseId,
              ...(isClientRole && { isClientVisible: true }),
              createdAt: { gt: lastSeenAt },
            },
            orderBy: { createdAt: "asc" },
            take: 25,
          });

          if (signals.length > 0) {
            lastSeenAt = signals[signals.length - 1].createdAt;
          }

          const unreadCount = await db.caseSignal.count({
            where: {
              clientId: caseId,
              isResolved: false,
              ...(isClientRole && { isClientVisible: true }),
            },
          });

          push("signals", {
            signals: signals.map((signal) => ({
              ...signal,
              metadata: signal.metadata ? safeJson(signal.metadata) : undefined,
            })),
            unreadCount,
          });
        } catch (error) {
          push("error", {
            message: error instanceof Error ? error.message : "Stream update failed",
          });
        }
      };

      const pollInterval = setInterval(poll, 5000);
      const heartbeat = setInterval(() => {
        push("ping", { ts: Date.now() });
      }, 15000);

      poll();

      const abort = () => {
        if (stopped) return;
        stopped = true;
        clearInterval(pollInterval);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // no-op
        }
      };

      request.signal.addEventListener("abort", abort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function safeJson(value: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}
