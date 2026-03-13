// apps/web/src/lib/ai.ts
import OpenAI from 'openai';

let openrouterClient: OpenAI | null | undefined;

function getOpenRouterClient(): OpenAI | null {
  if (openrouterClient !== undefined) {
    return openrouterClient;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    openrouterClient = null;
    return openrouterClient;
  }

  openrouterClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://bba-services.app',
      'X-Title': 'BBA Client Platform',
    },
  });

  return openrouterClient;
}

/**
 * Get a chat completion from the LLM for advisory/Q&A purposes
 */
export async function getChatCompletion(prompt: string, context: string) {
  const openrouter = getOpenRouterClient();
  if (!openrouter) {
    return "AI chat is unavailable right now.";
  }

  const response = await openrouter.chat.completions.create({
    model: "minimax/minimax-m2.5",
    messages: [
      { role: "system", content: "You are a professional BBA tax advisor assistant." },
      { role: "user", content: `Context: ${context}\n\nQuestion: ${prompt}` }
    ],
  });
  return response.choices[0].message.content;
}

/**
 * Extract structured tax document data using LLM intelligence
 * Returns JSON with documentType, totalIncome, taxYear, and other relevant fields
 */
export async function extractDocumentData(text: string) {
  const openrouter = getOpenRouterClient();
  if (!openrouter) {
    return {};
  }

  const response = await openrouter.chat.completions.create({
    model: "minimax/minimax-m2.5",
    response_format: { type: "json_object" },
    messages: [
      { 
        role: "system", 
        content: `Extract tax data into JSON. Identify documentType (W2, 1099, K1, BANK_STATEMENT, TAX_RETURN, etc.), totalIncome, taxYear, and any other relevant financial data. 
        
For tax calculations requiring mathematical precision, ensure all monetary values are returned with exact decimal representation to avoid floating-point errors in downstream tax calculations.

Example format:
{
  "documentType": "W2",
  "taxYear": 2023,
  "totalIncome": 75000.00,
  "taxesWithheld": 12500.00,
  "employer": "Company Name",
  "period": "2023-01-01/2023-12-31"
}` 
      },
      { role: "user", content: text }
    ],
  });
  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * Classify document type using AI (alternative to rule-based classifier)
 */
export async function classifyDocument(text: string): Promise<{ type: string; confidence: number }> {
  const openrouter = getOpenRouterClient();
  if (!openrouter) {
    return { type: "OTHER", confidence: 0 };
  }

  const response = await openrouter.chat.completions.create({
    model: "minimax/minimax-m2.5",
    response_format: { type: "json_object" },
    messages: [
      { 
        role: "system", 
        content: `Classify this document into one of these types: BANK_STATEMENT, TAX_RETURN, W2, FORM_1099, K1, FORMATION_DOC, INVOICE, CONTRACT, ID_DOCUMENT, OTHER.
        
Return JSON with "type" and "confidence" (0-1 scale).` 
      },
      { role: "user", content: text.substring(0, 2000) } // First 2000 chars for classification
    ],
  });
  const result = JSON.parse(response.choices[0].message.content || '{"type": "OTHER", "confidence": 0}');
  return result;
}
