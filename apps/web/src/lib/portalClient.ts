import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAuthRouteFailure } from "@/lib/runtimeLogger";

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

export async function getPortalClient() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    logAuthRouteFailure("portal_session_lookup_failed", {
      code: getErrorCode(error),
      message: error instanceof Error ? error.message : "Unknown auth failure",
    });

    return { session: null, client: null };
  }

  if (!session) {
    return { session: null, client: null };
  }

  const userId = typeof session.user?.id === "string" && session.user.id.length > 0
    ? session.user.id
    : null;
  const userEmail = typeof session.user?.email === "string" && session.user.email.length > 0
    ? session.user.email
    : null;

  if (!userId && !userEmail) {
    logAuthRouteFailure("portal_session_missing_identity", {
      message: "Session exists but has neither user id nor email",
    });

    return { session: null, client: null };
  }

  const client = userId
    ? await prisma.client.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          businessName: true,
          stage: true,
        },
      })
    : await prisma.client.findFirst({
        where: {
          user: {
            email: userEmail as string,
          },
        },
        select: {
          id: true,
          userId: true,
          businessName: true,
          stage: true,
        },
      });

  return { session, client };
}