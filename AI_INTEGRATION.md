# AI Integration Reference

This document details the AI-powered features in the BBA Client Platform.

---

## Architecture Overview

```
┌─────────────────┐
│  Client Upload  │
│   (Document)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  /api/documents/[id]    │
│      /process           │
└────────┬────────────────┘
         │
         ├─── Check: OPENROUTER_API_KEY exists?
         │
         ├─── Yes ──▶ AI Processing
         │            │
         │            ├─ classifyDocument() → Minimax M2.5
         │            │  Returns: { type, confidence }
         │            │
         │            └─ extractDocumentData() → Minimax M2.5
         │               Returns: { documentType, taxYear, totalIncome, ... }
         │
         └─── No ───▶ Rule-Based Processing (existing pipeline)
                      Uses regex patterns and business logic
```

---

## API Endpoints

### 1. Document Processing (Enhanced)

**Endpoint**: `POST /api/documents/[id]/process`

**AI Features**:
- Document type classification (W2, 1099, K1, etc.)
- Structured data extraction
- Mathematical precision for tax calculations

**Response** (AI-enabled):
```json
{
  "success": true,
  "documentId": "clx123...",
  "documentType": "W2",
  "method": "ai",
  "extractedData": {
    "documentType": "W2",
    "taxYear": 2023,
    "totalIncome": 85000.00,
    "taxesWithheld": 14250.00,
    "employer": "Acme Corp",
    "period": "2023-01-01/2023-12-31"
  }
}
```

### 2. Chat Assistant (New)

**Endpoint**: `POST /api/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "What documents do I need for my S-Corp formation?" }
  ]
}
```

**Response**: Server-Sent Events (SSE) stream

**Features**:
- Real-time streaming responses
- Authentication required
- Context-aware tax/business advisory

---

## AI Service Functions

Location: `apps/web/src/lib/ai.ts`

### getChatCompletion()

```typescript
getChatCompletion(prompt: string, context: string): Promise<string | null>
```

**Purpose**: General-purpose chat completion for advisory questions

**Model**: Minimax M2.5

**Use Cases**:
- Client Q&A
- Tax strategy guidance
- Business planning assistance

### extractDocumentData()

```typescript
extractDocumentData(text: string): Promise<object>
```

**Purpose**: Extract structured financial data from document text

**Model**: Minimax M2.5 (optimized for structured output)

**Output Format**:
```typescript
{
  documentType: string;
  taxYear?: number;
  totalIncome?: number;
  taxesWithheld?: number;
  employer?: string;
  period?: string;
  // ... other fields based on document type
}
```

**Mathematical Precision**: All monetary values returned with exact decimal representation.

### classifyDocument()

```typescript
classifyDocument(text: string): Promise<{ type: string; confidence: number }>
```

**Purpose**: Identify document type before extraction

**Model**: Minimax M2.5 (highly cost-effective for classification)

**Output**:
```typescript
{
  type: "W2" | "FORM_1099" | "BANK_STATEMENT" | "TAX_RETURN" | ...,
  confidence: 0.95 // 0-1 scale
}
```

---

## Environment Variables

### Required for AI Features

| Variable | Purpose | Example |
|----------|---------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API authentication | `sk-or-v1-...` |
| `NEXT_PUBLIC_AI_ENABLED` | Enable/disable AI features | `"true"` |

### Behavior Without AI

If `OPENROUTER_API_KEY` is not set or `NEXT_PUBLIC_AI_ENABLED` is `"false"`:
- Document processing falls back to rule-based pipeline
- Chat endpoint returns 503 error
- No AI-related costs incurred

---

## Cost Management

### Token Usage Estimates

**Document Processing (per document)**:
- Classification: ~500 tokens = $0.0003
- Extraction (W2): ~2000 tokens = $0.002
- **Total: ~$0.002 per document**

**Chat (per message)**:
- Average conversation: ~1500 tokens = $0.004
- **Total: ~$0.004 per exchange**

### Optimization Strategies

1. **Minimax M2.5 is already highly cost-effective** (~85% cheaper than GPT-4)
2. **Cache common responses** (not implemented yet)
3. **Limit document text to first 5000 chars** for classification
4. **Set rate limits** per user/client

### Budget Alerts

Set up billing alerts in OpenRouter dashboard:
1. Go to [openrouter.ai/account](https://openrouter.ai/account)
2. Set soft limit: $30/month
3. Set hard limit: $50/month

---

## Testing AI Features

### Local Testing

```bash
# Set environment variables
export OPENROUTER_API_KEY="sk-or-v1-..."
export NEXT_PUBLIC_AI_ENABLED="true"

# Start dev server
npm run dev

# Test extraction directly
curl -X POST http://localhost:3000/api/documents/[doc-id]/process \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

### Mock AI Responses (for testing without API key)

Create `apps/web/src/lib/__mocks__/ai.ts`:

```typescript
export async function extractDocumentData(text: string) {
  return {
    documentType: "W2",
    taxYear: 2023,
    totalIncome: 75000,
    taxesWithheld: 12000,
    employer: "Test Corp"
  };
}

export async function classifyDocument(text: string) {
  return { type: "W2", confidence: 0.95 };
}
```

---

## Error Handling

### OpenRouter API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check `OPENROUTER_API_KEY` |
| 429 Rate Limit | Too many requests | Implement queuing or add credits |
| 500 Server Error | OpenRouter downtime | Fallback to rule-based processing |
| Insufficient Credits | Billing issue | Add credits in OpenRouter dashboard |

### Graceful Degradation

The system automatically falls back to rule-based processing if:
- `OPENROUTER_API_KEY` is not set
- OpenRouter API returns errors
- Timeout (>30 seconds)

---

## Security Considerations

### API Key Protection

✅ **Do**:
- Store API key in environment variables only
- Use Railway's secret management
- Never commit `.env` to git

❌ **Don't**:
- Expose API key in client-side code
- Log API key in server logs
- Share API key across environments

### Rate Limiting

Implement per-user rate limits:
```typescript
// Pseudo-code
const userLimit = await getRateLimit(session.user.id);
if (userLimit.aiRequests > 50) {
  return { error: "Daily AI limit reached" };
}
```

### Content Filtering

OpenRouter provides AI content moderation. For sensitive tax data:
- Never send SSNs or full account numbers to AI
- Redact PII before extraction
- Log all AI interactions for audit

---

## Future Enhancements

### Planned Features

- [ ] **Multi-language support** (Spanish, Chinese)
- [ ] **Voice-to-text integration** for client calls
- [ ] **Automated tax form generation** from extracted data
- [ ] **Predictive analytics** for client tax liability
- [ ] **RAG (Retrieval-Augmented Generation)** for IRS code lookups

### Advanced Extraction

```typescript
// Future: Extract from images/scanned PDFs
export async function extractFromImage(imageUrl: string) {
  const response = await openai.chat.completions.create({
    model: "minimax/minimax-m2.5",  // Or use vision-capable model when available
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract W2 data from this image" },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
}
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **AI vs Rule-Based Split** (processing method distribution)
2. **Extraction Accuracy** (manual verification rate)
3. **Cost per Client** (AI spend / active clients)
4. **Chat Engagement** (messages per session)
5. **Error Rate** (failed AI calls / total calls)

### Logging Example

```typescript
await prisma.aiLog.create({
  data: {
    userId: session.user.id,
    endpoint: "extractDocumentData",
    model: "minimax/minimax-m2.5",
    tokensUsed: 2000,
    cost: 0.002,
    success: true,
  }
});
```

---

## References

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Prisma with PostgreSQL](https://pris.ly/d/postgresql)
- [Railway Deployment](https://docs.railway.app)
