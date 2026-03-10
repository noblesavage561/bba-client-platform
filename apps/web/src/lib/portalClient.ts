import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getPortalClient() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, client: null };
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      businessName: true,
      stage: true,
    },
  });

  return { session, client };
}