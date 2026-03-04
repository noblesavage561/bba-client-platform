// Shared TypeScript types for the BBA Client Platform

export type Role =
  | "SUPER_ADMIN"
  | "PROGRAM_MANAGER"
  | "COMPLIANCE"
  | "FINANCE"
  | "CLIENT_SUCCESS"
  | "CREDIT"
  | "CLIENT";

export type ClientStage =
  | "LEAD"
  | "INTAKE"
  | "STRATEGY"
  | "FOUNDATION"
  | "ACTIVE"
  | "FUNDED"
  | "CLOSED";

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

export type DocumentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PROCESSED"
  | "FAILED"
  | "REJECTED";

export type ChecklistStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "NOT_APPLICABLE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image: string | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  businessName: string;
  stage: ClientStage;
  programTrack: string | null;
  readinessScore: number;
  createdAt: Date;
  updatedAt: Date;
  user?: Pick<User, "name" | "email">;
}

export interface Document {
  id: string;
  clientId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  documentType: DocumentType;
  status: DocumentStatus;
  extractedData: Record<string, unknown>;
  classificationConfidence: number | null;
  period: string | null;
  uploadedAt: Date;
  processedAt: Date | null;
}

export interface ChecklistItem {
  id: string;
  clientId: string;
  label: string;
  description: string | null;
  category: string;
  status: ChecklistStatus;
  documentType: DocumentType | null;
  required: boolean;
  autoDetected: boolean;
  completedAt: Date | null;
  dueDate: Date | null;
}

export interface Task {
  id: string;
  assignedToId: string | null;
  clientId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: Pick<User, "name" | "email"> | null;
  client?: Pick<Client, "businessName"> | null;
}

export interface Note {
  id: string;
  authorId: string;
  clientId: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  author?: Pick<User, "name">;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  createdAt: Date;
}

export interface IntakeQuestion {
  id: string;
  step: number;
  order: number;
  label: string;
  description: string | null;
  type: "TEXT" | "TEXTAREA" | "SELECT" | "MULTISELECT" | "RADIO" | "CHECKBOX" | "DATE" | "NUMBER" | "FILE";
  options: string[];
  required: boolean;
  conditionalField: string | null;
  conditionalValue: string | null;
  active: boolean;
}

export interface ProgramTrack {
  id: string;
  name: string;
  description: string | null;
  checklistTemplate: ChecklistTemplateItem[];
  active: boolean;
}

export interface ChecklistTemplateItem {
  label: string;
  category: string;
  documentType?: DocumentType;
  required: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
  active: boolean;
  variables: string[];
}

export interface BankStatementAnalysis {
  id: string;
  documentId: string;
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
