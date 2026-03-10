import { classify, classifyFromContent, DocumentType } from "./classifier";
import { extract, ExtractedData } from "./extractor";
import { analyzeBankStatement } from "./bank-analyzer";
import { prisma } from "@/lib/db";

export interface PipelineInput {
  documentId: string;
  clientId: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
  documentType?: string;
}

export interface PipelineResult {
  documentType: DocumentType;
  confidence: number;
  extractedData: ExtractedData;
  period?: string;
}

export async function runIngestionPipeline(input: PipelineInput): Promise<PipelineResult> {
  const { documentId, filename, mimeType, buffer, documentType: providedType } = input;

  // Step 1: Classify
  let classification = classify(filename, mimeType);

  // Try to get text content for better classification (for text-based files)
  let textContent = "";
  if (mimeType === "text/csv" || mimeType === "text/plain") {
    textContent = buffer.toString("utf-8");
    const contentClassification = classifyFromContent(filename, textContent, mimeType);
    if (contentClassification.confidence > classification.confidence) {
      classification = contentClassification;
    }
  }

  const documentType = (providedType as DocumentType) ?? classification.documentType;
  const confidence = classification.confidence;

  // Step 2: Extract data
  const extractedData = extract(documentType, filename, textContent);

  // Step 3: If bank statement, run bank analysis and save
  if (documentType === "BANK_STATEMENT") {
    const analysis = analyzeBankStatement(extractedData, filename);

    await prisma.bankStatementAnalysis.upsert({
      where: { documentId },
      update: {
        period: analysis.period,
        totalDeposits: analysis.totalDeposits,
        totalWithdrawals: analysis.totalWithdrawals,
        avgMonthlyDeposits: analysis.avgMonthlyDeposits,
        avgMonthlyWithdrawals: analysis.avgMonthlyWithdrawals,
        netCashflow: analysis.netCashflow,
        overdraftCount: analysis.overdraftCount,
        nsfCount: analysis.nsfCount,
        recurringTransactions: JSON.stringify(analysis.recurringTransactions),
        lenderReadySummary: JSON.stringify(analysis.lenderReadySummary),
      },
      create: {
        documentId,
        period: analysis.period,
        totalDeposits: analysis.totalDeposits,
        totalWithdrawals: analysis.totalWithdrawals,
        avgMonthlyDeposits: analysis.avgMonthlyDeposits,
        avgMonthlyWithdrawals: analysis.avgMonthlyWithdrawals,
        netCashflow: analysis.netCashflow,
        overdraftCount: analysis.overdraftCount,
        nsfCount: analysis.nsfCount,
        recurringTransactions: JSON.stringify(analysis.recurringTransactions),
        lenderReadySummary: JSON.stringify(analysis.lenderReadySummary),
      },
    });

    extractedData.period = analysis.period;
  }

  return {
    documentType,
    confidence,
    extractedData,
    period: extractedData.period,
  };
}
