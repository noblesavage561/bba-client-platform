# BBA Services AI Upgrade v2.0 - Integration Guide

## Overview
This document describes how to integrate the new AI-powered components into the existing BBA Services portal.

## Quick Start

### 1. Wrap Your App with Error Boundary
In your root layout or main app component:

```tsx
import { BBAErrorBoundaryWrapper } from "@/components/ui/BBAErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <BBAErrorBoundaryWrapper>
      <div>{children}</div>
    </BBAErrorBoundaryWrapper>
  );
}
```

### 2. Add Dashboard Metrics
In your portal dashboard page:

```tsx
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";

export default function DashboardPage() {
  const caseId = "..."; // Get from session or routing
  
  return (
    <div>
      <DashboardMetrics caseId={caseId} className="mb-8" />
      {/* Rest of dashboard */}
    </div>
  );
}
```

### 3. Add AI Advisor Panel
In your portal sidebar or dashboard:

```tsx
import { AIAdvisorPanel } from "@/components/portal/AIAdvisorPanel";

export default function PortalLayout() {
  const caseId = "...";
  
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="md:col-span-3">{/* Main content */}</div>
      <aside className="md:col-span-1">
        <AIAdvisorPanel caseId={caseId} userRole="client" />
      </aside>
    </div>
  );
}
```

### 4. Add Signal Feed
In your notification center or dashboard:

```tsx
import { SignalFeed } from "@/components/portal/SignalFeed";

export default function NotificationsPage() {
  const caseId = "...";
  
  return (
    <div>
      <h1>Recent Activity</h1>
      <SignalFeed 
        caseId={caseId}
        role="client"
        maxItems={20}
        autoRefresh={true}
      />
    </div>
  );
}
```

### 5. Add Document Upload with Dual Pathway
Replace your existing intake with the dual-pathway version:

```tsx
import { DualPathwayIntake } from "@/components/intake/DualPathwayIntake";

export default function IntakePage() {
  const caseId = "..."; // Get from routing
  
  return (
    <DualPathwayIntake caseId={caseId} />
  );
}
```

Alternatively, just use the SmartUploadZone for document uploads:

```tsx
import { SmartUploadZone } from "@/components/intake/SmartUploadZone";

export default function DocumentUploadPage() {
  const caseId = "...";
  
  const handleDocumentProcessed = (doc) => {
    console.log("Document processed:", doc);
    // Refresh your UI, update state, etc.
  };
  
  return (
    <SmartUploadZone 
      caseId={caseId}
      onDocumentProcessed={handleDocumentProcessed}
    />
  );
}
```

## Component Reference

### SmartUploadZone
```tsx
interface SmartUploadZoneProps {
  caseId: string;                    // Client/case ID
  onDocumentProcessed: (doc: DocumentRecord) => void;
  allowedTypes?: string[];           // Default: ['pdf', 'jpg', 'png', 'heic', 'tiff']
  maxFiles?: number;                 // Default: 10
}
```

**States**: `idle | dragging | uploading | analyzing | confirming | saved | error`

**Features**:
- Drag & drop upload
- File validation (size, type)
- Claude AI classification
- Extracted fields preview
- Confidence score display
- Error handling with specific actionable messages

### AIAdvisorPanel
```tsx
interface AIAdvisorPanelProps {
  caseId: string;
  userRole?: "client" | "staff";
  className?: string;
}
```

**Features**:
- Animated confidence ring (0-100%)
- Confidence breakdown by category
- AI advisor message
- Next steps/actions
- Critical flags
- Ask a question input

**Auto-refresh**: Every 30 seconds

### SignalFeed
```tsx
interface SignalFeedProps {
  caseId: string;
  role?: "client" | "staff";
  className?: string;
  maxItems?: number;                 // Default: 10
  autoRefresh?: boolean;             // Default: true
  refreshInterval?: number;          // Default: 10000 (ms)
}
```

**Features**:
- Real-time signal display
- Grouped by date
- Severity badges (info/warning/critical)
- Dismiss/resolve actions
- Unread count tracking
- Icon per signal type

### DualPathwayIntake
```tsx
interface DualPathwayIntakeProps extends IntakeWizardProps {
  caseId: string;
}
```

**Pathways**:
1. **Document-First**: Upload documents → AI extracts → Review & confirm
2. **Manual**: Step-by-step form filling → Upload docs supplement

**Features**:
- Completion percentage tracking
- Progress indicators
- AI guidance tooltips
- Hybrid approach support

### DashboardMetrics
```tsx
interface DashboardMetricsProps {
  caseId: string;
  className?: string;
}
```

**Metrics Displayed**:
1. Documents Processed (count)
2. Checklist Progress (%)
3. AI Confidence (%)
4. Pending Tasks (count)
5. Alerts (count)

## API Endpoints

### Document Classification
**POST** `/api/documents/classify?caseId={caseId}`
```json
{
  "filename": "W2_2024.pdf",
  "mimeType": "application/pdf",
  "fileSize": 102400,
  "extractedText": "..."
}
```

**Response**:
```json
{
  "documentType": "W2",
  "confidence": 0.95,
  "taxYear": "2024",
  "keyFields": {...},
  "issues": [],
  "requiresHumanReview": false
}
```

### Upload Document
**POST** `/api/documents/upload`
```form
file: File
caseId: string
documentType: string
confidence: number
extractedData: JSON string
requiresHumanReview: boolean
```

### Confirm Document
**POST** `/api/documents/{id}/confirm`
```json
{
  "extractedData": {...}
}
```

### Get Advisor Data
**GET** `/api/advisor?caseId={caseId}&role=client`

**Response**:
```json
{
  "score": 75,
  "breakdown": {
    "identityVerification": 20,
    "incomeDocumentation": 40,
    "cashFlowAnalysis": 15,
    "deductionsCredits": 0,
    "priorYearFiling": 0
  },
  "advisorMessage": "...",
  "nextActions": [...],
  "stageUnlockCondition": "...",
  "flags": [...]
}
```

### Ask Advisor Question
**POST** `/api/advisor/ask`
```json
{
  "caseId": "...",
  "question": "Can I claim home office deduction?"
}
```

**Response**:
```json
{
  "answer": "Yes, if you have a dedicated office space...",
  "question": "..."
}
```

### Get Signals
**GET** `/api/signals?caseId={caseId}&role=client&limit=10`

**Response**:
```json
{
  "signals": [...],
  "unreadCount": 2,
  "total": 10
}
```

### Create Signal
**POST** `/api/signals`
```json
{
  "caseId": "...",
  "signalType": "document_classified",
  "severity": "info",
  "title": "Document Processed",
  "body": "Your W-2 has been classified...",
  "metadata": {}
}
```

### Mark Signal as Resolved
**POST** `/api/signals/{signalId}/resolve`

### Get Dashboard Metrics
**GET** `/api/dashboard/metrics?caseId={caseId}`

**Response**:
```json
{
  "metrics": [
    {
      "label": "Documents Processed",
      "value": 3,
      "icon": "📄",
      "onClick": "..."
    },
    ...
  ]
}
```

## Database Relationships

```
Client
  ├─ confidenceScore: AIConfidenceScore (1:1)
  ├─ documents: Document[] (1:many)
  ├─ signals: CaseSignal[] (1:many)
  ├─ incomeSources: IncomeSource[] (1:many)
  ├─ deductions: Deduction[] (1:many)
  └─ advisorMessages: AIAdvisorMessage[] (1:many)

Document
  ├─ client: Client (many:1)
  └─ bankStatementAnalysis: BankStatementAnalysis (1:1 optional)
```

## Environment Variables Required

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Next Auth (if not already configured)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=file:./dev.db  # or postgres://...
```

## Styling & Customization

### BBA Color Scheme
```typescript
const colors = {
  charcoal: '#414042',      // Primary text, dark elements
  blue: '#1591cd',          // Primary action, links, accents
  white: '#FFFFFF',         // Background
  success: '#059669',       // Positive feedback, high confidence
  warning: '#d97706',       // Warnings, medium confidence
  danger: '#dc2626',        // Errors, low confidence
  bgDark: '#1a1a2e',        // Dark backgrounds, gradients
}
```

### Typography
- **Body**: Outfit font
- **Headings**: Playfair Display font (editorial)

## Testing

### Test SmartUploadZone
```tsx
// upload a test PDF and verify:
// 1. File is accepted
// 2. AI classification runs
// 3. Confidence score displays
// 4. Extracted fields appear
// 5. Confirm/save works
```

### Test Advisor Panel
```tsx
// Verify:
// 1. Confidence ring animates correctly
// 2. Breakdown categories update
// 3. Next actions are clickable
// 4. Ask question sends to API
```

### Test Signal Feed
```tsx
// Verify:
// 1. Signals load from API
// 2. Auto-refresh works
// 3. Dismiss/resolve buttons work
// 4. Unread count updates
```

## Common Issues & Troubleshooting

### Confidence Score Not Updating
- Check `/api/documents/{id}/confirm` is being called
- Verify Prisma database has `AIConfidenceScore` table
- Review Prisma migrations are applied

### Advisor Message Blank
- Check `ANTHROPIC_API_KEY` is set
- Verify Claude API is accessible
- Check API response in network tab
- Review error logs

### Documents Not Being Classified
- Ensure file content is being extracted properly
- Check Claude API rate limits
- Verify extracted text is being sent to classification API

### Signals Not Appearing
- Check `isClientVisible` flag is `true` for client role
- Verify signal refresh interval (default 10s)
- Check database has signals in `CaseSignal` table

## Security Considerations

1. **File Uploads**: Only allow specified MIME types on frontend + backend
2. **Access Control**: All endpoints check session and role
3. **Data Privacy**: SSN stored as last-4 only, never full values
4. **AI Limits**: Claude API calls are rate-limited and logged
5. **Database**: Use Prisma to prevent SQL injection

## Performance Tips

1. **Lazy Load Advisor Panel**: Only render when scrolled into view
2. **Cache Metrics**: Consider caching dashboard metrics for 30s
3. **Pagination**: Use `limit` on signal feeds for large cases
4. **Background Jobs**: Process long documents in background (future)
5. **CDN**: Serve static assets via CDN in production

## Next Steps

1. **Dashboard Redesign**: Add hero section with BBA branding
2. **Staff Workspace**: Build preparer case queue and document review screen
3. **Real-Time Updates**: Implement WebSocket/SSE for live signals
4. **Email Notifications**: Add email alerts for critical signals
5. **Payment Integration**: Connect funding flow and fee collection
6. **Analytics**: Track user flows and AI accuracy metrics

---

**Version**: 2.0 | **Last Updated**: March 13, 2026 | **Maintainer**: BBA Engineering
