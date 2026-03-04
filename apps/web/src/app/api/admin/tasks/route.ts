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
    const clientId = searchParams.get("clientId");
    const assignedToId = searchParams.get("assignedToId");

    const tasks = await prisma.task.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(assignedToId && { assignedToId }),
      },
      include: {
        assignedTo: { select: { name: true, email: true } },
        client: { select: { businessName: true } },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
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
    const { title, description, clientId, assignedToId, priority, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        clientId,
        assignedToId,
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "OPEN",
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, priority, assignedToId, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
