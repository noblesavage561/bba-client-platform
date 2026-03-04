import { DocumentType } from "./classifier";

export interface ExtractedData {
  documentType: DocumentType;
  period?: string;
  // Bank statement fields
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
  beginningBalance?: number;
  endingBalance?: number;
  transactions?: Transaction[];
  // Tax return fields
  taxYear?: string;
  totalIncome?: number;
  grossRevenue?: number;
  netProfit?: number;
  taxableIncome?: number;
  // W2 / 1099 fields
  employerName?: string;
  wages?: number;
  federalTaxWithheld?: number;
  nonemployeeCompensation?: number;
  // Formation doc fields
  entityName?: string;
  entityType?: string;
  stateOfFormation?: string;
  formationDate?: string;
  ein?: string;
  // Generic
  raw?: Record<string, unknown>;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
  type: "credit" | "debit";
}

export function extract(
  documentType: DocumentType,
  filename: string,
  textContent: string
): ExtractedData {
  const base: ExtractedData = { documentType };

  switch (documentType) {
    case "BANK_STATEMENT":
      return extractBankStatement(filename, textContent, base);
    case "TAX_RETURN":
      return extractTaxReturn(textContent, base);
    case "W2":
      return extractW2(textContent, base);
    case "FORM_1099":
      return extract1099(textContent, base);
    case "FORMATION_DOC":
      return extractFormationDoc(textContent, base);
    default:
      return { ...base, raw: { filename, contentLength: textContent.length } };
  }
}

function extractBankStatement(
  filename: string,
  text: string,
  base: ExtractedData
): ExtractedData {
  // Extract period from filename or content
  const periodFromFilename = extractPeriodFromFilename(filename);
  const periodFromContent = extractPeriodFromText(text);
  const period = periodFromFilename ?? periodFromContent;

  // Extract bank name from common patterns
  const bankPatterns = [
    /chase bank/i,
    /bank of america/i,
    /wells fargo/i,
    /citibank/i,
    /us bank/i,
    /pnc bank/i,
    /td bank/i,
    /capital one/i,
  ];
  let bankName: string | undefined;
  for (const pat of bankPatterns) {
    const m = text.match(pat);
    if (m) {
      bankName = m[0];
      break;
    }
  }

  // Parse transactions from common CSV/text formats
  const transactions = parseTransactions(text);

  // Extract balances
  const beginBalMatch = text.match(/beginning balance[:\s]+\$?([\d,]+\.?\d*)/i);
  const endBalMatch = text.match(/ending balance[:\s]+\$?([\d,]+\.?\d*)/i);

  return {
    ...base,
    period,
    bankName,
    beginningBalance: beginBalMatch ? parseAmount(beginBalMatch[1]) : undefined,
    endingBalance: endBalMatch ? parseAmount(endBalMatch[1]) : undefined,
    transactions,
  };
}

function extractTaxReturn(text: string, base: ExtractedData): ExtractedData {
  const yearMatch = text.match(/tax year[:\s]+(\d{4})/i) ?? text.match(/\b(20\d{2})\b/);
  const incomeMatch = text.match(/total income[:\s]+\$?([\d,]+)/i);
  const netProfitMatch = text.match(/net profit[:\s]+\$?([\d,]+)/i) ??
    text.match(/net income[:\s]+\$?([\d,]+)/i);

  return {
    ...base,
    taxYear: yearMatch ? yearMatch[1] : undefined,
    totalIncome: incomeMatch ? parseAmount(incomeMatch[1]) : undefined,
    netProfit: netProfitMatch ? parseAmount(netProfitMatch[1]) : undefined,
  };
}

function extractW2(text: string, base: ExtractedData): ExtractedData {
  const wagesMatch = text.match(/wages[,\s]+tips[,\s]+other compensation\s+([\d,]+)/i);
  const fedTaxMatch = text.match(/federal income tax withheld[:\s]+([\d,]+)/i);
  const employerMatch = text.match(/employer'?s?\s+name[:\s]+([^\n]+)/i);

  return {
    ...base,
    wages: wagesMatch ? parseAmount(wagesMatch[1]) : undefined,
    federalTaxWithheld: fedTaxMatch ? parseAmount(fedTaxMatch[1]) : undefined,
    employerName: employerMatch ? employerMatch[1].trim() : undefined,
  };
}

function extract1099(text: string, base: ExtractedData): ExtractedData {
  const compMatch = text.match(/nonemployee compensation[:\s]+\$?([\d,]+)/i);

  return {
    ...base,
    nonemployeeCompensation: compMatch ? parseAmount(compMatch[1]) : undefined,
  };
}

function extractFormationDoc(text: string, base: ExtractedData): ExtractedData {
  const entityMatch = text.match(/(?:name of (?:company|llc|corporation)|entity name)[:\s]+([^\n]+)/i);
  const stateMatch = text.match(/state of (?:organization|incorporation|formation)[:\s]+([^\n]+)/i);
  const einMatch = text.match(/(?:ein|employer identification number)[:\s]+(\d{2}-\d{7})/i);
  const dateMatch = text.match(/(?:date of (?:organization|formation|incorporation))[:\s]+([^\n]+)/i);

  return {
    ...base,
    entityName: entityMatch ? entityMatch[1].trim() : undefined,
    stateOfFormation: stateMatch ? stateMatch[1].trim() : undefined,
    ein: einMatch ? einMatch[1] : undefined,
    formationDate: dateMatch ? dateMatch[1].trim() : undefined,
  };
}

export function extractPeriodFromFilename(filename: string): string | undefined {
  // Match patterns like: Dec2023, Dec_2023, December 2024, 01-2024, 2024-01
  // Note: no \b anchors because underscores are word characters so they break boundaries
  const patterns = [
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)_?(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)[_\s-]?(\d{4})/i,
    /(\d{1,2})[_-](\d{4})/,
    /(\d{4})[_-](\d{1,2})/,
  ];

  for (const pat of patterns) {
    const match = filename.match(pat);
    if (match && match[1] && match[2]) {
      return `${match[1]} ${match[2]}`;
    }
  }
  return undefined;
}

export function extractPeriodFromText(text: string): string | undefined {
  const match =
    text.match(/statement period[:\s]+([^\n]{5,30})/i) ??
    text.match(/for the month of[:\s]+([^\n]{3,20})/i);
  if (match) return match[1].trim();
  return undefined;
}

function parseTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = text.split("\n");

  // Simple CSV-like detection: date, description, amount
  const txPattern = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.+?)\s+([+-]?\$?[\d,]+\.?\d{0,2})/;

  for (const line of lines) {
    const match = line.match(txPattern);
    if (match) {
      const amount = parseAmount(match[3].replace(/\$/, ""));
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: Math.abs(amount),
        type: amount >= 0 ? "credit" : "debit",
      });
    }
  }

  return transactions.slice(0, 500); // cap at 500
}

function parseAmount(str: string): number {
  return parseFloat(str.replace(/,/g, "")) || 0;
}
