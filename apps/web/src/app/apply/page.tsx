"use client";

import { IntakeWizard } from "@/components/intake/IntakeWizard";

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-blue mb-3">
            Business Growth Assessment
          </h1>
          <p className="text-gray-600 text-lg">
            Complete this assessment to help us understand your business and
            design the best funding strategy for you.
          </p>
        </div>
        <IntakeWizard />
      </div>
    </div>
  );
}
