import { NextRequest, NextResponse } from "next/server";

interface ClaudeClassificationRaw {
  document_type?: string;
  confidence?: number;
  tax_year?: string | null;
  institution_or_employer?: string | null;
  account_number_last4?: string | null;
  key_fields?: Record<string, unknown>;
  issues?: string[];
  requires_human_review?: boolean;
  review_reason?: string | null;
}

interface DocumentClassification {
  documentType: string;
  confidence: number;
  taxYear: string | null | undefined;
  institution: string | null | undefined;
  accountLast4: string | null | undefined;
  keyFields: Record<string, unknown>;
  issues: string[];
  requiresHumanReview: boolean;
  reviewReason: string | null | undefined;
}

interface AnthropicJsonResponse {
  content?: Array<{
    text?: string;
  }>;
}

const CLASSIFICATION_PROMPT = `You are a financial document classifier for a US tax and business consulting firm.

Analyze the following document text and return ONLY a valid JSON object with this exact schema:
{
  "document_type": "W2 | 1099-NEC | 1099-MISC | 1099-INT | 1099-DIV | K1 | bank_statement | pay_stub | tax_return_1040 | business_tax_return | EIN_letter | articles_of_incorporation | utility_bill | lease_agreement | business_license | unknown",
  "confidence": 0.0-1.0,
  "tax_year": "YYYY or null",
  "institution_or_employer": "string or null",
  "account_number_last4": "XXXX or null",
  "key_fields": { ...extracted key-value pairs relevant to document type... },
  "issues": ["list any problems: low resolution, missing pages, password protected, partial document, etc."],
  "requires_human_review": true | false,
  "review_reason": "string or null"
}

For bank statements, extract: institution name, account type (checking/savings/business), statement period (start_date, end_date), beginning_balance, ending_balance, total_deposits, total_withdrawals, transaction_count.

For W-2s, extract: employer_name, employer_ein, employee_ssn_last4, box1_wages, box2_federal_withheld, box4_ss_withheld, box6_medicare_withheld, box12_codes, box16_state_wages, state.

For 1099s, extract: payer_name, payer_tin, recipient_tin_last4, box1_amount, form_variant, tax_year.

Document text:
{DOCUMENT_TEXT}`;

export async function POST(request: NextRequest) {
  try {
    const { extractedText } = (await request.json()) as {
      extractedText?: string;
    };
    const caseId = request.nextUrl.searchParams.get("caseId");

    if (!caseId || !extractedText) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Call Claude API for classification
    const classificationResult = await classifyDocumentWithClaude(
      extractedText
    );

    return NextResponse.json(classificationResult);
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Classification failed",
      },
      { status: 500 }
    );
  }
}

async function classifyDocumentWithClaude(
  documentText: string
): Promise<DocumentClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const prompt = CLASSIFICATION_PROMPT.replace(
    "{DOCUMENT_TEXT}",
    documentText
  );

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Claude API error:", errorData);
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = (await response.json()) as AnthropicJsonResponse;
  const content = data.content?.[0]?.text || "{}";

  // Attempt to parse JSON response
  try {
    const parsed = JSON.parse(content) as ClaudeClassificationRaw;
    return normalizeClassification(parsed);
  } catch (parseError) {
    console.error("JSON parse error:", parseError, "Content:", content);
    // Attempt JSON repair
    const repaired = attemptJsonRepair(content);
    if (repaired) {
      return repaired;
    }
    throw new Error("Failed to parse Claude response as JSON");
  }
}

function attemptJsonRepair(text: string): DocumentClassification | null {
  // Simple JSON repair - try to extract JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as ClaudeClassificationRaw;
      return normalizeClassification(parsed);
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeClassification(
  parsed: ClaudeClassificationRaw
): DocumentClassification {
  return {
    documentType: parsed.document_type || "unknown",
    confidence: parsed.confidence || 0,
    taxYear: parsed.tax_year,
    institution: parsed.institution_or_employer,
    accountLast4: parsed.account_number_last4,
    keyFields: parsed.key_fields || {},
    issues: parsed.issues || [],
    requiresHumanReview: parsed.requires_human_review || false,
    reviewReason: parsed.review_reason,
  };
}
