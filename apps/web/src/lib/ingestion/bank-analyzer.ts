import { Transaction, ExtractedData } from "./extractor";

export interface BankAnalysisResult {
  period: string;
  totalDeposits: number;
  totalWithdrawals: number;
  avgMonthlyDeposits: number;
  avgMonthlyWithdrawals: number;
  netCashflow: number;
  overdraftCount: number;
  nsfCount: number;
  recurringTransactions: RecurringTransaction[];
  lenderReadySummary: LenderReadySummary;
}

export interface RecurringTransaction {
  description: string;
  amount: number;
  frequency: string;
  occurrences: number;
  type: "credit" | "debit";
}

export interface LenderReadySummary {
  period: string;
  totalMonths: number;
  averageMonthlyRevenue: number;
  averageMonthlyExpenses: number;
  netMonthlyIncome: number;
  overdraftRisk: "LOW" | "MEDIUM" | "HIGH";
  cashflowTrend: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  keyStrengths: string[];
  keyRisks: string[];
}

export function analyzeBankStatement(
  extractedData: ExtractedData,
  filename: string
): BankAnalysisResult {
  const transactions = extractedData.transactions ?? [];
  const period = extractedData.period ?? extractPeriodFromFilename(filename) ?? "Unknown Period";

  const credits = transactions.filter((t) => t.type === "credit");
  const debits = transactions.filter((t) => t.type === "debit");

  const totalDeposits = credits.reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = debits.reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = totalDeposits - totalWithdrawals;

  // Count overdraft/NSF indicators
  const overdraftCount = countOverdrafts(transactions);
  const nsfCount = countNSF(transactions);

  // Estimate months from period string
  const totalMonths = estimateMonthCount(period, transactions);
  const avgMonthlyDeposits = totalMonths > 0 ? totalDeposits / totalMonths : totalDeposits;
  const avgMonthlyWithdrawals = totalMonths > 0 ? totalWithdrawals / totalMonths : totalWithdrawals;

  const recurringTransactions = detectRecurring(transactions);
  const lenderReadySummary = buildLenderSummary({
    period,
    totalMonths,
    avgMonthlyDeposits,
    avgMonthlyWithdrawals,
    overdraftCount,
    nsfCount,
    netCashflow,
  });

  return {
    period,
    totalDeposits,
    totalWithdrawals,
    avgMonthlyDeposits,
    avgMonthlyWithdrawals,
    netCashflow,
    overdraftCount,
    nsfCount,
    recurringTransactions,
    lenderReadySummary,
  };
}

function countOverdrafts(transactions: Transaction[]): number {
  return transactions.filter(
    (t) =>
      /overdraft|od fee|overdrawn/i.test(t.description) ||
      (t.balance !== undefined && t.balance < 0)
  ).length;
}

function countNSF(transactions: Transaction[]): number {
  return transactions.filter((t) => /nsf|insufficient funds|returned/i.test(t.description)).length;
}

function estimateMonthCount(period: string, transactions: Transaction[]): number {
  // Try to parse from period string
  const rangeMatch = period.match(/(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4})/);
  if (rangeMatch) {
    // Rough estimate: count months between two dates
    return 3; // Default to 3 for typical bank statement periods
  }

  // Single month
  if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(period)) {
    return 1;
  }

  // Use transaction date range
  if (transactions.length > 0) {
    const dates = transactions
      .map((t) => t.date)
      .filter(Boolean)
      .sort();
    if (dates.length >= 2) {
      const diffDays = 30; // simplified
      return Math.max(1, Math.round(diffDays / 30));
    }
  }

  return 1;
}

function detectRecurring(transactions: Transaction[]): RecurringTransaction[] {
  const grouped: Record<string, Transaction[]> = {};

  for (const tx of transactions) {
    const key = normalizeDescription(tx.description) + "_" + tx.amount.toFixed(2);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  }

  const recurring: RecurringTransaction[] = [];

  for (const [, txs] of Object.entries(grouped)) {
    if (txs.length >= 2) {
      recurring.push({
        description: txs[0].description,
        amount: txs[0].amount,
        frequency: txs.length >= 3 ? "monthly" : "occasional",
        occurrences: txs.length,
        type: txs[0].type,
      });
    }
  }

  return recurring.sort((a, b) => b.occurrences - a.occurrences).slice(0, 20);
}

function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\d{4,}/g, "") // remove long numbers (ref numbers, dates)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

function buildLenderSummary(params: {
  period: string;
  totalMonths: number;
  avgMonthlyDeposits: number;
  avgMonthlyWithdrawals: number;
  overdraftCount: number;
  nsfCount: number;
  netCashflow: number;
}): LenderReadySummary {
  const { period, totalMonths, avgMonthlyDeposits, avgMonthlyWithdrawals, overdraftCount, nsfCount, netCashflow } = params;

  const totalIssues = overdraftCount + nsfCount;
  const overdraftRisk: LenderReadySummary["overdraftRisk"] =
    totalIssues === 0 ? "LOW" :
    totalIssues <= 2 ? "MEDIUM" : "HIGH";

  const cashflowTrend: LenderReadySummary["cashflowTrend"] =
    netCashflow > 0 ? "POSITIVE" :
    netCashflow === 0 ? "NEUTRAL" : "NEGATIVE";

  const keyStrengths: string[] = [];
  const keyRisks: string[] = [];

  if (avgMonthlyDeposits > 10000) {
    keyStrengths.push(`Strong monthly revenue averaging $${avgMonthlyDeposits.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
  }
  if (overdraftCount === 0) {
    keyStrengths.push("No overdraft incidents – demonstrates financial discipline");
  }
  if (netCashflow > 0) {
    keyStrengths.push("Positive net cashflow demonstrates ability to service debt");
  }

  if (overdraftCount > 0) {
    keyRisks.push(`${overdraftCount} overdraft incident(s) detected`);
  }
  if (nsfCount > 0) {
    keyRisks.push(`${nsfCount} NSF/returned payment(s) detected`);
  }
  if (avgMonthlyDeposits < 5000) {
    keyRisks.push("Monthly deposit volume may limit funding eligibility");
  }

  return {
    period,
    totalMonths,
    averageMonthlyRevenue: avgMonthlyDeposits,
    averageMonthlyExpenses: avgMonthlyWithdrawals,
    netMonthlyIncome: avgMonthlyDeposits - avgMonthlyWithdrawals,
    overdraftRisk,
    cashflowTrend,
    keyStrengths,
    keyRisks,
  };
}

function extractPeriodFromFilename(filename: string): string | undefined {
  const match = filename.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)_?(\d{4})/i);
  if (match) return `${match[1]} ${match[2]}`;
  return undefined;
}
