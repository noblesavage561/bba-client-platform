import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("[EMAIL_TEMPLATES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN", "PROGRAM_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, trigger, subject, body: emailBody, variables } = body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        trigger,
        subject,
        body: emailBody,
        variables: JSON.stringify(variables ?? []),
        active: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("[EMAIL_TEMPLATES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
