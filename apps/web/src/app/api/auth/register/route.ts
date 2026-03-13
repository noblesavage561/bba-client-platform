import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().min(1).max(120).optional(),
  businessName: z.string().trim().min(1).max(160).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { client: { select: { id: true } } },
    });

    if (existingUser?.hashedPassword) {
      return NextResponse.json(
        { error: "An account already exists for this email. Please sign in." },
        { status: 409 }
      );
    }

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: parsed.data.name || existingUser.name,
            role: "CLIENT",
            hashedPassword,
          },
        })
      : await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: parsed.data.name ?? parsed.data.businessName ?? normalizedEmail,
            role: "CLIENT",
            hashedPassword,
          },
        });

    const desiredBusinessName = parsed.data.businessName?.trim();

    if (existingUser?.client && desiredBusinessName) {
      await prisma.client.update({
        where: { id: existingUser.client.id },
        data: {
          businessName: desiredBusinessName,
          stage: "INTAKE",
        },
      });
    }

    if (!existingUser?.client && desiredBusinessName) {
      await prisma.client.create({
        data: {
          userId: user.id,
          businessName: desiredBusinessName,
          stage: "INTAKE",
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SUCCESS",
        title: "Portal access ready",
        message: "Your secure sign-in is active. You can now track your workflow in the portal.",
      },
    });

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("[REGISTER_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}