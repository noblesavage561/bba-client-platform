import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, content, isInternal } = body;

    if (!clientId || !content) {
      return NextResponse.json(
        { error: "clientId and content are required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        authorId: session.user.id,
        clientId,
        content,
        isInternal: isInternal ?? false,
      },
      include: { author: { select: { name: true } } },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "NOTE_CREATED",
        entityType: "Note",
        entityId: note.id,
        metadata: JSON.stringify({ clientId, isInternal }),
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
