"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SmartUploadZone } from "./SmartUploadZone";
import {
  IntakeWizard as ManualIntakeWizard,
  IntakeWizardProps,
} from "./IntakeWizard";

interface DualPathwayIntakeProps extends IntakeWizardProps {
  caseId: string;
}

type PathwayType = "none" | "document-first" | "manual";

interface ProcessedDocument {
  documentType: string;
}

export function DualPathwayIntake({
  caseId,
  ...wizardProps
}: DualPathwayIntakeProps) {
  const [selectedPathway, setSelectedPathway] = useState<PathwayType>("none");
  const [uploadedDocuments, setUploadedDocuments] = useState<ProcessedDocument[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const handleDocumentProcessed = (doc: ProcessedDocument) => {
    const nextDocuments = [...uploadedDocuments, doc];
    setUploadedDocuments(nextDocuments);

    // Update completion percentage based on documents
    let completion = 0;
    const docTypes = new Set(
      nextDocuments.map((d) => d.documentType)
    );

    if (docTypes.has("W2") || docTypes.has("FORM_1099")) completion += 20;
    if (docTypes.has("BANK_STATEMENT")) completion += 15;
    if (docTypes.has("TAX_RETURN")) completion += 10;
    if (docTypes.has("EIN_letter")) completion += 20;

    setCompletionPercentage(Math.min(completion, 85));
  };

  if (selectedPathway === "none") {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#414042] mb-4">
            Welcome to Your Smart Tax Intake
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose how you&apos;d like to get started. Upload documents for instant
            AI analysis, or fill in your information manually.
          </p>
        </div>

        {/* Pathway Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Document-First Card */}
          <Card
            className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#1591cd]"
            onClick={() => setSelectedPathway("document-first")}
          >
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-[#414042] mb-3">
              Upload Documents
            </h2>
            <p className="text-gray-600 mb-4">
              Upload your financial documents (W-2s, bank statements, tax
              returns, etc.) and our AI will instantly extract and organize
              your information.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-[#1591cd]">✓</span> Faster—AI fills fields
                automatically
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#1591cd]">✓</span> More accurate—AI
                extracts official documents
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#1591cd]">✓</span> Recommended option
              </li>
            </ul>
            <Button className="w-full bg-[#1591cd] text-white hover:bg-[#0d6aaa]">
              Get Started with Upload
            </Button>
          </Card>

          {/* Manual Card */}
          <Card
            className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-400"
            onClick={() => setSelectedPathway("manual")}
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-[#414042] mb-3">
              Fill Manually
            </h2>
            <p className="text-gray-600 mb-4">
              Answer a series of guided questions about your business, income,
              and tax situation. You can upload documents later to supplement
              your answers.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-gray-600">•</span> Step-by-step
                questionnaire
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-600">•</span> Clear explanations for
                each question
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-600">•</span> Hybrid—upload docs
                anytime
              </li>
            </ul>
            <Button
              variant="secondary"
              className="w-full border-2 border-gray-400"
            >
              Fill Out Form
            </Button>
          </Card>
        </div>

        {/* Trust Section */}
        <Card className="p-6 bg-blue-50 border-l-4 border-[#1591cd]">
          <h3 className="font-semibold text-[#414042] mb-2">🔒 Your data is secure</h3>
          <p className="text-sm text-gray-600">
            All documents are processed with end-to-end encryption and HIPAA-compliant
            servers. Your data never leaves the secure BBA network.
          </p>
        </Card>
      </div>
    );
  }

  if (selectedPathway === "document-first") {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          onClick={() => setSelectedPathway("none")}
          variant="secondary"
          className="mb-4"
        >
          ← Back to Choose
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#414042] mb-2">
            Upload Your Documents
          </h1>
          <p className="text-gray-600">
            Our AI will instantly classify and extract information from your
            uploads.
          </p>
        </div>

        {/* AI Guidance */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-[#1591cd]">
          <h3 className="font-semibold text-[#414042] mb-2">💡 AI Guidance</h3>
          <p className="text-sm text-gray-700 mb-3">
            Start with these documents for best results:
          </p>
          <ul className="grid md:grid-cols-2 gap-3 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-[#1591cd]">→</span> Bank statements (last 3 months, best
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#1591cd]">→</span> W-2 or 1099 forms
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#1591cd]">→</span> Prior year tax returns
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#1591cd]">→</span> Business formation docs
            </li>
          </ul>
        </Card>

        {/* Completion Progress */}
        {uploadedDocuments.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-[#414042] mb-3">
              Intake Progress
            </h3>
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#1591cd] h-3 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {completionPercentage}% complete
              </p>
            </div>
            <p className="text-sm text-gray-700">
              {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? "s" : ""}{" "}
              uploaded. Your AI confidence score will improve as you add more documents.
            </p>
          </Card>
        )}

        {/* Upload Zone */}
        <SmartUploadZone
          caseId={caseId}
          onDocumentProcessed={handleDocumentProcessed}
        />

        {/* Continue to Review */}
        {completionPercentage >= 60 && (
          <Card className="p-6 bg-green-50 border-l-4 border-green-500">
            <h3 className="font-semibold text-green-900 mb-2">✓ Ready to proceed</h3>
            <p className="text-sm text-green-800 mb-4">
              Your intake is {completionPercentage}% complete. Continue to review
              with your AI advisor.
            </p>
            <Button className="bg-green-600 text-white hover:bg-green-700">
              Continue to Review & Advisor
            </Button>
          </Card>
        )}
      </div>
    );
  }

  if (selectedPathway === "manual") {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          onClick={() => setSelectedPathway("none")}
          variant="secondary"
          className="mb-4"
        >
          ← Back to Choose
        </Button>

        {/* Manual Intake Wizard */}
        <ManualIntakeWizard {...wizardProps} />

        {/* Hybrid Option */}
        <Card className="p-6 bg-amber-50 border-l-4 border-amber-500">
          <h3 className="font-semibold text-amber-900 mb-2">
            💡 Enhance with Documents
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            After submitting this form, you can upload documents to boost your AI
            confidence score and unlock additional insights.
          </p>
        </Card>
      </div>
    );
  }

  return null;
}
