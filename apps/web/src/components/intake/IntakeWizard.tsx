"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { buildRegisterHref } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

const STEPS = [
  "Taxpayer Basics",
  "Primary Filer",
  "Income Snapshot",
  "Planning Goals",
  "Document Readiness",
];

const AVAILABLE_DOCS = [
  { value: "bank-statements", label: "📊 Bank Statements (last 3 months)" },
  { value: "tax-returns", label: "📑 Prior Year Tax Returns (last 2 years)" },
  { value: "w2", label: "📋 W-2 Forms" },
  { value: "1099", label: "📋 1099 Forms" },
  { value: "k1", label: "📋 K-1 Statements" },
  { value: "formation-docs", label: "🏢 Business Formation Documents (EIN, Articles, Operating Agreement)" },
  { value: "invoices", label: "📄 Receipts, Invoices, or Contracts" },
  { value: "id", label: "🪪 Government-Issued Photo ID" },
];

const PLANNING_PRIORITIES = [
  { value: "qbi", label: "QBI Optimization" },
  { value: "section-179", label: "Section 179 / Bonus Depreciation" },
  { value: "retirement", label: "Retirement Contribution Planning" },
  { value: "estimated-payments", label: "Estimated Payments Strategy" },
  { value: "credits", label: "Tax Credits Discovery" },
  { value: "state", label: "State Tax Planning" },
  { value: "audit-risk", label: "Audit Risk Reduction" },
  { value: "compliance", label: "Compliance Catch-Up" },
  { value: "other", label: "Other" },
];

type FormData = Record<string, unknown>;

interface SubmissionResult {
  requiresRegistration: boolean;
  ownerEmail?: string;
  businessName?: string;
}

export interface IntakeWizardProps {
  className?: string;
}

export function IntakeWizard({ className = "" }: IntakeWizardProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleMultiSelect = (field: string, value: string) => {
    const current = (formData[field] as string[]) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update(field, next);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.businessName) newErrors.businessName = "Business name is required";
      if (!formData.businessType) newErrors.businessType = "Business type is required";
      if (!formData.industry) newErrors.industry = "Industry is required";
      if (!formData.state) newErrors.state = "State is required";
    }
    if (currentStep === 2) {
      if (!formData.ownerName) newErrors.ownerName = "Owner name is required";
      if (!formData.ownerEmail) newErrors.ownerEmail = "Email is required";
      if (!formData.ownerPhone) newErrors.ownerPhone = "Phone is required";
    }
    if (currentStep === 3) {
      if (!formData.annualRevenue) newErrors.annualRevenue = "Please select revenue range";
      if (!formData.businessBankAccount) newErrors.businessBankAccount = "Please answer this question";
      if (!formData.creditScore) newErrors.creditScore = "Please select credit score range";
    }
    if (currentStep === 4) {
      if (!formData.fundingAmount) newErrors.fundingAmount = "Expected outcome is required";
      if (!formData.fundingTimeline) newErrors.fundingTimeline = "Filing timeline is required";
      if (!formData.previousFundingAttempts) newErrors.previousFundingAttempts = "Please answer this question";
      const purposes = (formData.fundingPurpose as string[]) ?? [];
      if (purposes.length === 0) newErrors.fundingPurpose = "Please select at least one planning priority";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep((s) => Math.min(5, s + 1));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setSubmitError(null);

    try {
      // In production, retrieve the authenticated client's ID from session
      // For now, submit the intake data to create a new lead client record
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "pending", // Server will create/find client by session
          answers: formData,
          step: 5,
          completed: true,
        }),
      });

      const payload = await response.json().catch(() => ({ error: "Submission failed. Please try again." }));

      if (!response.ok) {
        setSubmitError(payload.error ?? "Submission failed. Please try again.");
        return;
      }

      setSubmissionResult({
        requiresRegistration: Boolean(payload.requiresRegistration),
        ownerEmail: typeof payload.ownerEmail === "string" ? payload.ownerEmail : undefined,
        businessName: typeof payload.businessName === "string" ? payload.businessName : undefined,
      });

      setSubmitted(true);
    } catch {
      setSubmitError("Unable to submit right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const registerHref = buildRegisterHref(ROUTES.PORTAL, {
      email: submissionResult?.ownerEmail,
      businessName: submissionResult?.businessName,
      fromIntake: true,
    });

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-brand-blue mb-3">
          Tax Intake Submitted
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Thanks for completing your guided intake. Our team and AI pipeline
          will process your information and move your return into preparation.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm mb-6">
          <strong>What happens next:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
            <li>AI classifies uploaded documents and computes confidence levels</li>
            <li>Your preparer reviews yellow and red confidence fields</li>
            <li>You receive checklist nudges for missing filing items</li>
          </ol>
        </div>
        {submissionResult?.requiresRegistration ? (
          <div className="space-y-3">
            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              One more step: create your secure sign-in to unlock the portal.
            </div>
            <Link
              href={registerHref}
              className="bg-brand-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-blue-light transition-colors inline-block"
            >
              Create Portal Sign-In
            </Link>
          </div>
        ) : (
          <Link
            href={ROUTES.PORTAL}
            className="bg-brand-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-blue-light transition-colors inline-block"
          >
            Open Client Portal
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Progress Header */}
      <div className="bg-brand-blue p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]}
          </h2>
          <span className="text-blue-200 text-sm">
            {Math.round(((currentStep - 1) / STEPS.length) * 100)}% complete
          </span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < currentStep ? "bg-brand-gold" : "bg-blue-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {currentStep === 1 && (
          <div className="space-y-4">
            <Input
              label="Taxpayer Legal Name"
              required
              placeholder="e.g., Apex Tech Solutions LLC or Jane Doe"
              value={(formData.businessName as string) ?? ""}
              onChange={(e) => update("businessName", e.target.value)}
              error={errors.businessName}
            />
            <Select
              label="Taxpayer Type"
              required
              placeholder="Select taxpayer type"
              options={["Individual", "LLC", "S-Corporation", "C-Corporation", "Partnership", "Trust", "Other"]}
              value={(formData.businessType as string) ?? ""}
              onChange={(e) => update("businessType", e.target.value)}
              error={errors.businessType}
            />
            <Select
              label="Primary Income Profile"
              required
              placeholder="Select income profile"
              options={[
                "W-2 Employee", "Small Business Owner", "Consulting / Professional Services", "Real Estate",
                "Healthcare", "Construction", "Retail", "Transportation",
                "Manufacturing", "Mixed Income", "Other",
              ]}
              value={(formData.industry as string) ?? ""}
              onChange={(e) => update("industry", e.target.value)}
              error={errors.industry}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Years Filing Returns"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={(formData.yearsInBusiness as string) ?? ""}
                onChange={(e) => update("yearsInBusiness", e.target.value)}
              />
              <Select
                label="State"
                required
                placeholder="Select state"
                options={["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]}
                value={(formData.state as string) ?? ""}
                onChange={(e) => update("state", e.target.value)}
                error={errors.state}
              />
            </div>
            <Input
              label="EIN or SSN (last 4)"
              placeholder="e.g., 12-3456789 or 1234"
              value={(formData.ein as string) ?? ""}
              onChange={(e) => update("ein", e.target.value)}
              helperText="Stored securely and used only for filing workflows"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <Input
              label="Primary Filer Full Name"
              required
              placeholder="e.g., Marcus Johnson"
              value={(formData.ownerName as string) ?? ""}
              onChange={(e) => update("ownerName", e.target.value)}
              error={errors.ownerName}
            />
            <Input
              label="Primary Filer Email"
              type="email"
              required
              placeholder="e.g., marcus@apextech.com"
              value={(formData.ownerEmail as string) ?? ""}
              onChange={(e) => update("ownerEmail", e.target.value)}
              error={errors.ownerEmail}
            />
            <Input
              label="Primary Filer Phone"
              type="tel"
              required
              placeholder="e.g., (555) 234-5678"
              value={(formData.ownerPhone as string) ?? ""}
              onChange={(e) => update("ownerPhone", e.target.value)}
              error={errors.ownerPhone}
            />
            <Input
              label="Last 4 of SSN / TIN"
              placeholder="e.g., 1234"
              maxLength={4}
              value={(formData.ownerSSN as string) ?? ""}
              onChange={(e) => update("ownerSSN", e.target.value)}
              helperText="Used for secure identity matching"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Percentage <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={(formData.ownershipPercentage as number) ?? 100}
                  onChange={(e) => update("ownershipPercentage", parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-brand-blue font-bold w-12 text-right">
                  {(formData.ownershipPercentage as number) ?? 100}%
                </span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <Select
              label="Estimated Annual Taxable Income"
              required
              placeholder="Select income range"
              options={[
                { value: "under-100k", label: "Under $100,000" },
                { value: "100k-250k", label: "$100,000 – $250,000" },
                { value: "250k-500k", label: "$250,000 – $500,000" },
                { value: "500k-1m", label: "$500,000 – $1,000,000" },
                { value: "1m-5m", label: "$1,000,000 – $5,000,000" },
                { value: "5m-plus", label: "Over $5,000,000" },
              ]}
              value={(formData.annualRevenue as string) ?? ""}
              onChange={(e) => update("annualRevenue", e.target.value)}
              error={errors.annualRevenue}
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Do you maintain separate business and personal finances?{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                {["yes", "no"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="businessBankAccount"
                      value={opt}
                      checked={formData.businessBankAccount === opt}
                      onChange={() => update("businessBankAccount", opt)}
                      className="text-brand-blue"
                    />
                    <span className="text-sm capitalize">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.businessBankAccount && (
                <p className="text-xs text-red-600 mt-1">{errors.businessBankAccount}</p>
              )}
            </div>
            <Input
              label="Average Monthly Deposits"
              type="number"
              placeholder="e.g., 25000"
              value={(formData.avgMonthlyDeposits as string) ?? ""}
              onChange={(e) => update("avgMonthlyDeposits", e.target.value)}
            />
            <Input
              label="Estimated Annual Deductible Expenses"
              type="number"
              placeholder="e.g., 15000"
              value={(formData.existingDebt as string) ?? ""}
              onChange={(e) => update("existingDebt", e.target.value)}
            />
            <Select
              label="Record-Keeping Confidence"
              required
              placeholder="Select confidence range"
              options={[
                { value: "low", label: "Low - Records are incomplete" },
                { value: "medium", label: "Medium - Most records available" },
                { value: "high", label: "High - Complete and organized" },
              ]}
              value={(formData.creditScore as string) ?? ""}
              onChange={(e) => update("creditScore", e.target.value)}
              error={errors.creditScore}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <Input
              label="Expected Federal Outcome"
              type="number"
              required
              placeholder="Estimated refund or balance due"
              value={(formData.fundingAmount as string) ?? ""}
              onChange={(e) => update("fundingAmount", e.target.value)}
              error={errors.fundingAmount}
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Primary planning priorities (select all that apply){" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PLANNING_PRIORITIES.map((p) => {
                  const selected = ((formData.fundingPurpose as string[]) ?? []).includes(p.value);
                  return (
                    <label
                      key={p.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors
                        ${selected ? "border-brand-blue bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMultiSelect("fundingPurpose", p.value)}
                        className="text-brand-blue rounded"
                      />
                      <span className="text-sm">{p.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.fundingPurpose && (
                <p className="text-xs text-red-600 mt-1">{errors.fundingPurpose}</p>
              )}
            </div>
            <Select
              label="Filing Timeline"
              required
              placeholder="When are you targeting filing completion?"
              options={[
                { value: "asap", label: "As soon as possible (within 30 days)" },
                { value: "1-3-months", label: "1-3 months" },
                { value: "3-6-months", label: "3-6 months" },
                { value: "6-plus-months", label: "6+ months (planning ahead)" },
              ]}
              value={(formData.fundingTimeline as string) ?? ""}
              onChange={(e) => update("fundingTimeline", e.target.value)}
              error={errors.fundingTimeline}
            />
            <Select
              label="Prior Year Filing Status"
              required
              placeholder="How did last year's filing cycle go?"
              options={[
                { value: "never", label: "First year with BBA" },
                { value: "rejected", label: "Filed with unresolved notices" },
                { value: "approved-insufficient", label: "Filed but missed optimization opportunities" },
                { value: "other", label: "Other" },
              ]}
              value={(formData.previousFundingAttempts as string) ?? ""}
              onChange={(e) => update("previousFundingAttempts", e.target.value)}
              error={errors.previousFundingAttempts}
            />
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Which of these documents do you currently have available?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Do not worry if you do not have everything. We will guide you through what is needed.
              </p>
              <div className="space-y-2">
                {AVAILABLE_DOCS.map((doc) => {
                  const selected = ((formData.availableDocuments as string[]) ?? []).includes(doc.value);
                  return (
                    <label
                      key={doc.value}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all
                        ${selected ? "border-green-400 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMultiSelect("availableDocuments", doc.value)}
                        className="text-green-500 rounded w-4 h-4"
                      />
                      <span className="text-sm">{doc.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <Textarea
              label="Anything else you'd like us to know?"
              placeholder="Share any additional context about your return, life events, or tax goals..."
              value={(formData.additionalInfo as string) ?? ""}
              onChange={(e) => update("additionalInfo", e.target.value)}
              rows={3}
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>By submitting this form, you agree to:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Allow BBA to process your information for tax preparation and advisory</li>
                <li>Be contacted by a BBA preparer via secure portal, email, or phone</li>
                <li>Our privacy policy and terms of service</li>
              </ul>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            ← Back
          </Button>
          <div className="text-sm text-gray-400">
            Step {currentStep} of {STEPS.length}
          </div>
          {currentStep < STEPS.length ? (
            <Button variant="secondary" onClick={handleNext}>
              Continue →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              Submit Tax Intake
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
