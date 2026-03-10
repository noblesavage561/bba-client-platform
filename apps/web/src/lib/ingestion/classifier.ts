export type DocumentType =
  | "BANK_STATEMENT"
  | "TAX_RETURN"
  | "W2"
  | "FORM_1099"
  | "K1"
  | "FORMATION_DOC"
  | "INVOICE"
  | "CONTRACT"
  | "ID_DOCUMENT"
  | "OTHER";

export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
}

// Rules-based classifier using filename and mime type patterns
const rules: Array<{
  patterns: RegExp[];
  documentType: DocumentType;
  confidence: number;
}> = [
  {
    patterns: [/bank.?statement/i, /account.?statement/i, /checking/i, /savings.?account/i, /stmt/i],
    documentType: "BANK_STATEMENT",
    confidence: 0.92,
  },
  {
    patterns: [/1040/i, /tax.?return/i, /schedule.?c/i, /form.?1040/i, /federal.?return/i],
    documentType: "TAX_RETURN",
    confidence: 0.93,
  },
  {
    patterns: [/w[-_]?2\b/i, /wage.?and.?tax/i, /\bw2\b/i],
    documentType: "W2",
    confidence: 0.95,
  },
  {
    patterns: [/1099/i],
    documentType: "FORM_1099",
    confidence: 0.95,
  },
  {
    patterns: [/k[-_]?1/i, /schedule.?k/i, /partner.*share/i],
    documentType: "K1",
    confidence: 0.92,
  },
  {
    patterns: [
      /articles.?of.?incorporation/i,
      /operating.?agreement/i,
      /ein.?letter/i,
      /formation/i,
      /certificate.?of.?organization/i,
      /bylaws/i,
    ],
    documentType: "FORMATION_DOC",
    confidence: 0.88,
  },
  {
    patterns: [/invoice/i, /purchase.?order/i, /billing/i],
    documentType: "INVOICE",
    confidence: 0.85,
  },
  {
    patterns: [/contract/i, /agreement/i, /service.?agreement/i],
    documentType: "CONTRACT",
    confidence: 0.82,
  },
  {
    patterns: [/passport/i, /driver.?licen/i, /id.?card/i, /identification/i, /dl[-_ ]/i],
    documentType: "ID_DOCUMENT",
    confidence: 0.88,
  },
];

export function classify(filename: string, mimeType?: string): ClassificationResult {
  const normalized = filename.toLowerCase().replace(/[_]/g, " ");
  // Also test original (lowercased) for hyphenated patterns
  const original = filename.toLowerCase();

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized) || pattern.test(original)) {
        return { documentType: rule.documentType, confidence: rule.confidence };
      }
    }
  }

  // Fallback: try from mime type context
  if (mimeType?.includes("image")) {
    return { documentType: "ID_DOCUMENT", confidence: 0.4 };
  }

  return { documentType: "OTHER", confidence: 0.5 };
}

export function classifyFromContent(
  filename: string,
  textContent: string,
  mimeType?: string
): ClassificationResult {
  // First try filename
  const fromFilename = classify(filename, mimeType);
  if (fromFilename.confidence >= 0.85) return fromFilename;

  // Try content keywords
  const contentLower = textContent.toLowerCase();

  if (/bank statement|account statement|beginning balance|ending balance/i.test(contentLower)) {
    return { documentType: "BANK_STATEMENT", confidence: 0.9 };
  }
  if (/form 1040|u\.s\. individual income tax|adjusted gross income/i.test(contentLower)) {
    return { documentType: "TAX_RETURN", confidence: 0.9 };
  }
  if (/wages, tips, other compensation|employer's ein|employee's ssn/i.test(contentLower)) {
    return { documentType: "W2", confidence: 0.92 };
  }
  if (/nonemployee compensation|payer's tin|recipient's tin/i.test(contentLower)) {
    return { documentType: "FORM_1099", confidence: 0.92 };
  }
  if (/partner's share|schedule k-1|partnership/i.test(contentLower)) {
    return { documentType: "K1", confidence: 0.9 };
  }
  if (/articles of incorporation|operating agreement|registered agent/i.test(contentLower)) {
    return { documentType: "FORMATION_DOC", confidence: 0.88 };
  }

  return fromFilename;
}
