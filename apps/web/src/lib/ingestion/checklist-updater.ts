import { DocumentType } from "./classifier";
import { prisma } from "@/lib/db";

// Maps document type to the checklist item labels it satisfies
const DOCUMENT_TO_CHECKLIST: Partial<Record<DocumentType, string[]>> = {
  BANK_STATEMENT: ["Bank Statements (3 months)", "Bank Statements"],
  TAX_RETURN: ["Business Tax Returns", "Business Tax Returns (2 years)", "Personal Tax Returns"],
  FORMATION_DOC: ["Business Formation Documents", "Formation Documents", "Articles of Incorporation", "Operating Agreement", "EIN Letter"],
  W2: ["W-2 Forms", "W2 Documents"],
  FORM_1099: ["1099 Forms", "1099 Documents"],
  K1: ["K-1 Schedules", "Schedule K-1"],
  ID_DOCUMENT: ["Owner ID / Driver's License", "Government-Issued ID", "Identification Documents"],
  CONTRACT: ["Business Contracts", "Client Contracts"],
  INVOICE: ["Business Invoices"],
};

export async function updateChecklistFromDocument(
  clientId: string,
  documentType: DocumentType
): Promise<void> {
  const checklistLabels = DOCUMENT_TO_CHECKLIST[documentType];
  if (!checklistLabels || checklistLabels.length === 0) return;

  // Find matching checklist items for this client
  const items = await prisma.checklistItem.findMany({
    where: {
      clientId,
      status: { not: "COMPLETE" },
    },
  });

  const toUpdate = items.filter((item: { id: string; label: string }) =>
    checklistLabels.some(
      (label) =>
        item.label.toLowerCase().includes(label.toLowerCase()) ||
        label.toLowerCase().includes(item.label.toLowerCase())
    )
  );

  for (const item of toUpdate) {
    await prisma.checklistItem.update({
      where: { id: item.id },
      data: {
        status: "IN_PROGRESS",
        autoDetected: true,
      },
    });
  }

  // If we have 3+ bank statements processed, mark as complete
  if (documentType === "BANK_STATEMENT") {
    const bankStatementCount = await prisma.document.count({
      where: {
        clientId,
        documentType: "BANK_STATEMENT",
        status: "PROCESSED",
      },
    });

    if (bankStatementCount >= 3) {
      const bankItems = items.filter((item: { id: string; label: string }) =>
        item.label.toLowerCase().includes("bank statement")
      );
      for (const item of bankItems) {
        await prisma.checklistItem.update({
          where: { id: item.id },
          data: {
            status: "COMPLETE",
            completedAt: new Date(),
            autoDetected: true,
          },
        });
      }
    }
  }

  // Mark formation docs as complete on first upload
  if (documentType === "FORMATION_DOC") {
    for (const item of toUpdate) {
      await prisma.checklistItem.update({
        where: { id: item.id },
        data: {
          status: "COMPLETE",
          completedAt: new Date(),
          autoDetected: true,
        },
      });
    }
  }

  // Update client readiness score
  await recalculateReadinessScore(clientId);
}

async function recalculateReadinessScore(clientId: string): Promise<void> {
  const allItems = await prisma.checklistItem.findMany({
    where: { clientId },
  });

  if (allItems.length === 0) return;

  const required = allItems.filter((i: { required: boolean; status: string }) => i.required);
  const completed = required.filter((i: { required: boolean; status: string }) => i.status === "COMPLETE");

  const score = required.length > 0
    ? Math.round((completed.length / required.length) * 100)
    : 0;

  await prisma.client.update({
    where: { id: clientId },
    data: { readinessScore: score },
  });
}
