export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  analysisResult?: DocumentAnalysis;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'tax_return'
  | 'bank_statement'
  | 'investment_statement'
  | 'insurance_policy'
  | 'other';

export type DocumentStatus = 'pending' | 'processing' | 'analyzed' | 'error';

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  extractedData: Record<string, unknown>;
  confidence: number;
}
