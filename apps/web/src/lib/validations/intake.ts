import { z } from "zod";

// Step 1: Business Basics
export const step1Schema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.enum(["LLC", "Corporation", "Sole Proprietorship", "Partnership", "Other"]),
  industry: z.string().min(1, "Please select an industry"),
  yearsInBusiness: z.coerce.number().min(0, "Years must be 0 or more"),
  state: z.string().length(2, "Please enter a 2-letter state code"),
  ein: z.string().optional(),
});

// Step 2: Owner Info
export const step2Schema = z.object({
  ownerName: z.string().min(2, "Owner name is required"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  ownerSSN: z.string().optional(),
  ownershipPercentage: z.coerce.number().min(1).max(100),
  coOwners: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
        percentage: z.coerce.number().min(1).max(99),
      })
    )
    .optional(),
});

// Step 3: Financial Snapshot
export const step3Schema = z.object({
  annualRevenue: z.string().min(1, "Please select your annual revenue range"),
  monthlyRevenue: z.coerce.number().optional(),
  businessBankAccount: z.enum(["yes", "no"]),
  avgMonthlyDeposits: z.coerce.number().optional(),
  existingDebt: z.coerce.number().min(0).optional(),
  creditScore: z.enum([
    "under-580",
    "580-619",
    "620-659",
    "660-699",
    "700-739",
    "740-plus",
  ]),
});

// Step 4: Funding Goals
export const step4Schema = z.object({
  fundingAmount: z.coerce.number().min(1000, "Funding amount must be at least $1,000"),
  fundingPurpose: z
    .array(
      z.enum([
        "working-capital",
        "equipment",
        "real-estate",
        "expansion",
        "payroll",
        "marketing",
        "inventory",
        "debt-refinancing",
        "other",
      ])
    )
    .min(1, "Please select at least one purpose"),
  fundingTimeline: z.enum(["asap", "1-3-months", "3-6-months", "6-plus-months"]),
  previousFundingAttempts: z.enum(["never", "rejected", "approved-insufficient", "other"]),
  previousFundingDetails: z.string().optional(),
});

// Step 5: Document Readiness
export const step5Schema = z.object({
  availableDocuments: z.array(
    z.enum([
      "bank-statements",
      "tax-returns",
      "w2",
      "1099",
      "formation-docs",
      "invoices",
      "contracts",
      "id",
      "none",
    ])
  ),
});

// Full intake form
export const intakeFormSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
});

export const intakeSubmissionSchema = z.object({
  clientId: z.string().min(1),
  answers: z.record(z.unknown()),
  step: z.number().int().min(1).max(5),
  completed: z.boolean(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;
export type IntakeSubmissionData = z.infer<typeof intakeSubmissionSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
