import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "e2e.user@bba.local";
  const password = "E2Epass!234";
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { hashedPassword: hash, role: "CLIENT", name: "E2E User" },
    create: { email, hashedPassword: hash, role: "CLIENT", name: "E2E User" },
  });

  const client = await prisma.client.upsert({
    where: { userId: user.id },
    update: {
      businessName: "E2E Test Holdings",
      stage: "STRATEGY",
      readinessScore: 66,
      programTrack: "Tax Readiness",
    },
    create: {
      userId: user.id,
      businessName: "E2E Test Holdings",
      stage: "STRATEGY",
      readinessScore: 66,
      programTrack: "Tax Readiness",
    },
  });

  await prisma.checklistItem.deleteMany({ where: { clientId: client.id } });
  await prisma.task.deleteMany({ where: { clientId: client.id } });
  await prisma.document.deleteMany({ where: { clientId: client.id } });
  await prisma.notification.deleteMany({ where: { userId: user.id } });

  await prisma.checklistItem.createMany({
    data: [
      { clientId: client.id, label: "Bank Statements (3 months)", category: "Financial", status: "COMPLETE", required: true, autoDetected: true },
      { clientId: client.id, label: "Federal Tax Returns (2 years)", category: "Tax", status: "IN_PROGRESS", required: true, autoDetected: false },
      { clientId: client.id, label: "Government-Issued ID", category: "Identification", status: "PENDING", required: true, autoDetected: false },
    ],
  });

  await prisma.task.createMany({
    data: [
      { clientId: client.id, title: "Upload missing 1099", priority: "HIGH", status: "OPEN" },
      { clientId: client.id, title: "Confirm filer information", priority: "MEDIUM", status: "IN_PROGRESS" },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: user.id, title: "Upload reminder", message: "Please upload your 1099 form.", type: "WARNING", read: false },
      { userId: user.id, title: "Checklist progress", message: "Checklist updated to 66%.", type: "INFO", read: true },
    ],
  });

  console.log(JSON.stringify({
    email,
    password,
    userId: user.id,
    clientId: client.id,
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
