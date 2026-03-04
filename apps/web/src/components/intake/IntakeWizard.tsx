"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Progress } from "@/components/ui/Progress";

const STEPS = [
  "Business Basics",
  "Owner Info",
  "Financial Snapshot",
  "Funding Goals",
  "Document Readiness",
];

const AVAILABLE_DOCS = [
  { value: "bank-statements", label: "📊 Bank Statements (last 3 months)" },
  { value: "tax-returns", label: "📑 Business Tax Returns (last 2 years)" },
  { value: "w2", label: "📋 W-2 Forms" },
  { value: "1099", label: "📋 1099 Forms" },
  { value: "formation-docs", label: "🏢 Business Formation Documents (EIN, Articles, Operating Agreement)" },
  { value: "invoices", label: "📄 Recent Invoices or Contracts" },
  { value: "id", label: "🪪 Government-Issued Photo ID" },
];

const FUNDING_PURPOSES = [
  { value: "working-capital", label: "Working Capital" },
  { value: "equipment", label: "Equipment Purchase" },
  { value: "real-estate", label: "Real Estate" },
  { value: "expansion", label: "Business Expansion" },
  { value: "payroll", label: "Payroll" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "inventory", label: "Inventory" },
  { value: "debt-refinancing", label: "Debt Refinancing" },
  { value: "other", label: "Other" },
];

type FormData = Record<string, unknown>;

export function IntakeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      if (!formData.fundingAmount) newErrors.fundingAmount = "Funding amount is required";
      if (!formData.fundingTimeline) newErrors.fundingTimeline = "Timeline is required";
      if (!formData.previousFundingAttempts) newErrors.previousFundingAttempts = "Please answer this question";
      const purposes = (formData.fundingPurpose as string[]) ?? [];
      if (purposes.length === 0) newErrors.fundingPurpose = "Please select at least one purpose";
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
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "demo-client-id",
          answers: formData,
          step: 5,
          completed: true,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch {
      // Handle silently in demo mode
    } finally {
      setLoading(false);
      setSubmitted(true); // Demo: always show success
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-brand-blue mb-3">
          Application Submitted!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Thank you for submitting your Business Growth Assessment. Our team will
          review your information and reach out within 1-2 business days.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm mb-6">
          <strong>What happens next:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
            <li>Our advisors review your application</li>
            <li>You'll receive a strategy call invitation</li>
            <li>Access your client portal to upload documents</li>
          </ol>
        </div>
        <a
          href="/portal"
          className="bg-brand-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-blue-light transition-colors inline-block"
        >
          Access Your Portal
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
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
              label="Business Legal Name"
              required
              placeholder="e.g., Apex Tech Solutions LLC"
              value={(formData.businessName as string) ?? ""}
              onChange={(e) => update("businessName", e.target.value)}
              error={errors.businessName}
            />
            <Select
              label="Business Structure"
              required
              placeholder="Select business type"
              options={["LLC", "Corporation", "Sole Proprietorship", "Partnership", "Other"]}
              value={(formData.businessType as string) ?? ""}
              onChange={(e) => update("businessType", e.target.value)}
              error={errors.businessType}
            />
            <Select
              label="Industry"
              required
              placeholder="Select your industry"
              options={[
                "Technology", "Construction", "Retail", "Healthcare",
                "Food & Beverage", "Professional Services", "Transportation",
                "Manufacturing", "Real Estate", "Other",
              ]}
              value={(formData.industry as string) ?? ""}
              onChange={(e) => update("industry", e.target.value)}
              error={errors.industry}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Years in Business"
                type="number"
                min="0"
                placeholder="e.g., 3"
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
              label="EIN (Employer Identification Number)"
              placeholder="e.g., 12-3456789"
              value={(formData.ein as string) ?? ""}
              onChange={(e) => update("ein", e.target.value)}
              helperText="Optional – required for funding applications"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <Input
              label="Owner Full Name"
              required
              placeholder="e.g., Marcus Johnson"
              value={(formData.ownerName as string) ?? ""}
              onChange={(e) => update("ownerName", e.target.value)}
              error={errors.ownerName}
            />
            <Input
              label="Owner Email"
              type="email"
              required
              placeholder="e.g., marcus@apextech.com"
              value={(formData.ownerEmail as string) ?? ""}
              onChange={(e) => update("ownerEmail", e.target.value)}
              error={errors.ownerEmail}
            />
            <Input
              label="Owner Phone"
              type="tel"
              required
              placeholder="e.g., (555) 234-5678"
              value={(formData.ownerPhone as string) ?? ""}
              onChange={(e) => update("ownerPhone", e.target.value)}
              error={errors.ownerPhone}
            />
            <Input
              label="Last 4 of SSN"
              placeholder="e.g., 1234"
              maxLength={4}
              value={(formData.ownerSSN as string) ?? ""}
              onChange={(e) => update("ownerSSN", e.target.value)}
              helperText="Used for credit inquiry purposes only"
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
              label="Annual Business Revenue"
              required
              placeholder="Select revenue range"
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
                Do you have a dedicated business bank account?{" "}
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
              label="Existing Business Debt"
              type="number"
              placeholder="e.g., 15000 (enter 0 if none)"
              value={(formData.existingDebt as string) ?? ""}
              onChange={(e) => update("existingDebt", e.target.value)}
            />
            <Select
              label="Estimated Business Credit Score"
              required
              placeholder="Select credit score range"
              options={[
                { value: "under-580", label: "Under 580 (Poor)" },
                { value: "580-619", label: "580–619 (Fair)" },
                { value: "620-659", label: "620–659 (Fair-Good)" },
                { value: "660-699", label: "660–699 (Good)" },
                { value: "700-739", label: "700–739 (Very Good)" },
                { value: "740-plus", label: "740+ (Excellent)" },
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
              label="How much funding are you seeking?"
              type="number"
              required
              placeholder="e.g., 150000"
              value={(formData.fundingAmount as string) ?? ""}
              onChange={(e) => update("fundingAmount", e.target.value)}
              error={errors.fundingAmount}
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                What will the funding be used for? (select all that apply){" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FUNDING_PURPOSES.map((p) => {
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
              label="Funding Timeline"
              required
              placeholder="When do you need funding?"
              options={[
                { value: "asap", label: "As soon as possible (within 30 days)" },
                { value: "1-3-months", label: "1–3 months" },
                { value: "3-6-months", label: "3–6 months" },
                { value: "6-plus-months", label: "6+ months (planning ahead)" },
              ]}
              value={(formData.fundingTimeline as string) ?? ""}
              onChange={(e) => update("fundingTimeline", e.target.value)}
              error={errors.fundingTimeline}
            />
            <Select
              label="Previous Funding Attempts"
              required
              placeholder="Have you applied for funding before?"
              options={[
                { value: "never", label: "Never applied before" },
                { value: "rejected", label: "Applied and was declined" },
                { value: "approved-insufficient", label: "Approved but amount was insufficient" },
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
                Don't worry if you don't have everything – we'll guide you through what's needed.
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
              placeholder="Share any additional context about your business or funding needs..."
              value={(formData.additionalInfo as string) ?? ""}
              onChange={(e) => update("additionalInfo", e.target.value)}
              rows={3}
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>By submitting this form, you agree to:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Allow BBA to review your information for funding qualification</li>
                <li>Be contacted by a BBA advisor via email or phone</li>
                <li>Our privacy policy and terms of service</li>
              </ul>
            </div>
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
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
