import { z } from "zod";
import { classify, DocumentType } from "@/lib/ingestion/classifier";

const DOCUMENT_TYPES: DocumentType[] = [
  "BANK_STATEMENT",
  "TAX_RETURN",
  "W2",
  "FORM_1099",
  "K1",
  "FORMATION_DOC",
  "INVOICE",
  "CONTRACT",
  "ID_DOCUMENT",
  "OTHER",
];

const entitySchema = z.object({
  "Effective Date": z.string().nullable().optional(),
  "Total Value": z.string().nullable().optional(),
  "Tax Year": z.string().nullable().optional(),
  Party: z.string().nullable().optional(),
  "Matter Ref": z.string().nullable().optional(),
});

const modelSchema = z.object({
  detected_type: z.string(),
  confidence: z.number(),
  type_mismatch: z.boolean(),
  corrected_type: z.string().nullable().optional(),
  entities: entitySchema,
  requires_validation: z.boolean(),
  missing_fields: z.array(z.string()),
});

export interface DocumentEntities {
  "Effective Date": string | null;
  "Total Value": string | null;
  "Tax Year": string | null;
  Party: string | null;
  "Matter Ref": string | null;
}

export interface DocumentClassificationInput {
  filename: string;
  selectedType: string;
  matterRef?: string;
  completedFields?: Record<string, string>;
}

export interface DocumentClassificationOutput {
  detected_type: DocumentType;
  confidence: number;
  type_mismatch: boolean;
  corrected_type: DocumentType;
  entities: DocumentEntities;
  requires_validation: boolean;
  missing_fields: string[];
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeDocumentType(value: string, fallback: DocumentType = "OTHER"): DocumentType {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_");
  if (DOCUMENT_TYPES.includes(normalized as DocumentType)) {
    return normalized as DocumentType;
  }

  const map: Record<string, DocumentType> = {
    "BANK_STATEMENTS": "BANK_STATEMENT",
    "BANK": "BANK_STATEMENT",
    "TAX_RETURNS": "TAX_RETURN",
    "1099": "FORM_1099",
    "FORM1099": "FORM_1099",
    "FORMATION": "FORMATION_DOC",
    "FORMATION_DOCUMENT": "FORMATION_DOC",
    "ID": "ID_DOCUMENT",
    "GOVERNMENT_ID": "ID_DOCUMENT",
  };

  return map[normalized] ?? fallback;
}

function extractJsonObject(rawText: string): unknown {
  const fenced = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? rawText;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain valid JSON object boundaries.");
  }

  const jsonText = candidate.slice(start, end + 1);
  return JSON.parse(jsonText);
}

function mergeEntities(
  entities: Partial<DocumentEntities>,
  matterRef?: string,
  completedFields?: Record<string, string>
): DocumentEntities {
  const merged: DocumentEntities = {
    "Effective Date": entities["Effective Date"] ?? null,
    "Total Value": entities["Total Value"] ?? null,
    "Tax Year": entities["Tax Year"] ?? null,
    Party: entities.Party ?? null,
    "Matter Ref": entities["Matter Ref"] ?? matterRef ?? null,
  };

  for (const [field, value] of Object.entries(completedFields ?? {})) {
    const trimmed = value?.trim();
    if (!trimmed) continue;

    if (field in merged) {
      merged[field as keyof DocumentEntities] = trimmed;
    }
  }

  return merged;
}

function inferMissingFields(entities: DocumentEntities): string[] {
  const missing = Object.entries(entities)
    .filter(([, value]) => !value || value.trim().length === 0)
    .map(([key]) => key);

  return missing;
}

function buildFallbackClassification(input: DocumentClassificationInput): DocumentClassificationOutput {
  const selectedType = normalizeDocumentType(input.selectedType);
  const fallback = classify(input.filename);
  const detectedType = fallback.documentType;
  const confidence = clampConfidence(fallback.confidence * 100);
  const typeMismatch = detectedType !== selectedType;
  const correctedType = typeMismatch ? detectedType : selectedType;

  const entities = mergeEntities({}, input.matterRef, input.completedFields);
  const missingFields = inferMissingFields(entities);
  const requiresValidation = confidence < 70 || missingFields.length > 0;

  return {
    detected_type: detectedType,
    confidence,
    type_mismatch: typeMismatch,
    corrected_type: correctedType,
    entities,
    requires_validation: requiresValidation,
    missing_fields: missingFields,
  };
}

export async function classifyDocumentWithAI(
  input: DocumentClassificationInput
): Promise<DocumentClassificationOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return buildFallbackClassification(input);
  }

  const selectedType = normalizeDocumentType(input.selectedType);
  const prompt = [
    "Classify this document and return ONLY JSON.",
    "",
    `filename: ${input.filename}`,
    `selected_type: ${selectedType}`,
    `matter_ref: ${input.matterRef ?? ""}`,
    `completed_fields: ${JSON.stringify(input.completedFields ?? {})}`,
    "",
    "Return this exact JSON shape:",
    "{",
    "  \"detected_type\": \"BANK_STATEMENT|TAX_RETURN|W2|FORM_1099|K1|FORMATION_DOC|INVOICE|CONTRACT|ID_DOCUMENT|OTHER\",",
    "  \"confidence\": 0-100 integer,",
    "  \"type_mismatch\": boolean,",
    "  \"corrected_type\": \"...\",",
    "  \"entities\": {",
    "    \"Effective Date\": string|null,",
    "    \"Total Value\": string|null,",
    "    \"Tax Year\": string|null,",
    "    \"Party\": string|null,",
    "    \"Matter Ref\": string|null",
    "  },",
    "  \"requires_validation\": boolean,",
    "  \"missing_fields\": [string]",
    "}",
  ].join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      return buildFallbackClassification(input);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text = payload.content?.find((item) => item.type === "text")?.text;
    if (!text) {
      return buildFallbackClassification(input);
    }

    const parsed = modelSchema.parse(extractJsonObject(text));
    const detectedType = normalizeDocumentType(parsed.detected_type, selectedType);
    const correctedType = normalizeDocumentType(
      parsed.corrected_type ?? detectedType,
      detectedType
    );

    const typeMismatch = parsed.type_mismatch || detectedType !== selectedType;
    const confidence = clampConfidence(parsed.confidence);

    const entities = mergeEntities(
      {
        "Effective Date": parsed.entities["Effective Date"] ?? null,
        "Total Value": parsed.entities["Total Value"] ?? null,
        "Tax Year": parsed.entities["Tax Year"] ?? null,
        Party: parsed.entities.Party ?? null,
        "Matter Ref": parsed.entities["Matter Ref"] ?? null,
      },
      input.matterRef,
      input.completedFields
    );

    const missingFields = Array.from(
      new Set([
        ...parsed.missing_fields,
        ...inferMissingFields(entities),
      ])
    );

    const requiresValidation =
      parsed.requires_validation || confidence < 70 || missingFields.length > 0;

    return {
      detected_type: detectedType,
      confidence,
      type_mismatch: typeMismatch,
      corrected_type: typeMismatch ? correctedType : detectedType,
      entities,
      requires_validation: requiresValidation,
      missing_fields: missingFields,
    };
  } catch {
    return buildFallbackClassification(input);
  }
}

export function normalizeSelectedType(selectedType: string): DocumentType {
  return normalizeDocumentType(selectedType);
}
