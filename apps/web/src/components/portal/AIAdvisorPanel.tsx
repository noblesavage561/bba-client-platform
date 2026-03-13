"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AIAdvisorPanelProps {
  caseId: string;
  userRole?: "client" | "staff";
  className?: string;
}

interface ConfidenceBreakdown {
  identityVerification: number;
  incomeDocumentation: number;
  cashFlowAnalysis: number;
  deductionsCredits: number;
  priorYearFiling: number;
}

interface NextAction {
  label: string;
  type: "upload" | "form" | "schedule" | "review";
  target: string;
}

interface AdvisorData {
  score: number;
  breakdown: ConfidenceBreakdown;
  advisorMessage: string;
  confidenceExplanation: string;
  nextActions: NextAction[];
  stageUnlockCondition: string;
  flags: string[];
}

export function AIAdvisorPanel({
  caseId,
  userRole = "client",
  className = "",
}: AIAdvisorPanelProps) {
  const router = useRouter();
  const [data, setData] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<
    keyof ConfidenceBreakdown | null
  >(null);
  const [question, setQuestion] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const fetchAdvisorData = useCallback(
    async (showLoadingState = false) => {
      try {
        if (showLoadingState) {
          setLoading(true);
        }

        const response = await fetch(
          `/api/advisor?caseId=${caseId}&role=${userRole}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch advisor data");
        }

        const advisorData = (await response.json()) as AdvisorData;
        setData(advisorData);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Advisor panel error:", err);
      } finally {
        if (showLoadingState) {
          setLoading(false);
        }
      }
    },
    [caseId, userRole]
  );

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let eventSource: EventSource | null = null;

    const startPolling = () => {
      if (!pollInterval) {
        pollInterval = setInterval(() => {
          void fetchAdvisorData();
        }, 30000);
      }
    };

    void fetchAdvisorData(true);

    try {
      const params = new URLSearchParams({
        caseId,
        role: userRole,
      });

      eventSource = new EventSource(`/api/signals/stream?${params.toString()}`);

      eventSource.addEventListener("signals", (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data) as {
            signals?: Array<unknown>;
          };

          if (Array.isArray(payload.signals) && payload.signals.length > 0) {
            void fetchAdvisorData();
          }
        } catch {
          // Ignore malformed stream payloads and keep listening.
        }
      });

      eventSource.addEventListener("error", () => {
        startPolling();
      });
    } catch {
      startPolling();
    }

    if (!eventSource) {
      startPolling();
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [caseId, userRole, fetchAdvisorData]);

  const getConfidenceColor = (score: number): string => {
    if (score >= 90) return "#059669"; // green
    if (score >= 71) return "#1591cd"; // blue
    if (score >= 41) return "#d97706"; // amber
    return "#dc2626"; // red
  };

  const getConfidenceStatus = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 71) return "Good";
    if (score >= 41) return "Fair";
    return "Needs Work";
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setSubmittingQuestion(true);
      const response = await fetch(`/api/advisor/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          question: question.trim(),
        }),
      });

      if (response.ok) {
        setQuestion("");
        void fetchAdvisorData();
      }
    } catch (err) {
      console.error("Error asking question:", err);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 border-l-4 border-red-500 ${className}`}>
        <h3 className="font-semibold text-[#414042] mb-2">Connection Error</h3>
        <p className="text-sm text-gray-600">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const confidenceColor = getConfidenceColor(data.score);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Confidence Ring Section */}
      <Card className="p-6 text-center">
        <h2 className="text-lg font-semibold text-[#414042] mb-4">
          AI Confidence Score
        </h2>

        {/* Animated Confidence Ring */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={confidenceColor}
                strokeWidth="8"
                strokeDasharray={`${(data.score / 100) * 282.7} 282.7`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: confidenceColor }}>
                {data.score}%
              </span>
              <span className="text-xs font-semibold text-gray-600">
                {getConfidenceStatus(data.score)}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence explanation */}
        <p className="text-sm text-gray-700">{data.confidenceExplanation}</p>
      </Card>

      {/* Confidence Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold text-[#414042] mb-4">
          What&apos;s Affecting Your Score
        </h3>
        <div className="space-y-3">
          {Object.entries(data.breakdown).map(([category, score]) => {
            const displayName = category
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .trim();

            return (
              <div key={category}>
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category
                        ? null
                        : (category as keyof ConfidenceBreakdown)
                    )
                  }
                >
                  <span className="font-medium text-[#414042] text-sm">
                    {displayName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          backgroundColor:
                            score >= 50 ? "#059669" : score >= 25 ? "#d97706" : "#dc2626",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                      {score}%
                    </span>
                  </div>
                </div>
                {expandedCategory === category && (
                  <div className="mt-2 ml-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border-l-2 border-[#1591cd]">
                    <p className="mb-2">
                      <strong>Complete:</strong> Documents and information we have
                    </p>
                    <p className="mb-2">
                      <strong>Missing:</strong> Items you can provide to improve your score
                    </p>
                    <p>
                      <strong>Unlocks:</strong> Access to next steps in your journey
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Advisor Message */}
      <Card className="p-6 bg-blue-50 border-l-4" style={{ borderLeftColor: confidenceColor }}>
        <h3 className="font-semibold text-[#414042] mb-3">Your AI Advisor</h3>
        <p className="text-gray-700 mb-4">{data.advisorMessage}</p>

        {data.stageUnlockCondition && (
          <div className="bg-white rounded p-3 text-xs text-gray-600 border border-[#1591cd]">
            <strong>To Advance:</strong> {data.stageUnlockCondition}
          </div>
        )}
      </Card>

      {/* Next Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-[#414042] mb-4">AI-Guided Next Steps</h3>
        <div className="space-y-2">
          {data.nextActions.map((action, i) => (
            <Button
              key={i}
              onClick={() => {
                // Navigate to action target
                if (action.target.startsWith("/")) {
                  router.push(action.target);
                }
              }}
              className="w-full text-left bg-white hover:bg-gray-50 text-[#414042] border border-gray-200 justify-start"
            >
              <span className="mr-3">
                {action.type === "upload" && "📤"}
                {action.type === "form" && "📋"}
                {action.type === "schedule" && "📅"}
                {action.type === "review" && "👁️"}
              </span>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Critical Flags */}
      {data.flags && data.flags.length > 0 && (
        <Card className="p-6 border-l-4 border-red-500 bg-red-50">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ Important Alerts</h3>
          <ul className="space-y-2">
            {data.flags.map((flag, i) => (
              <li key={i} className="text-sm text-red-800">
                • {flag}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Ask a Question */}
      <Card className="p-6">
        <h3 className="font-semibold text-[#414042] mb-4">Ask a Question</h3>
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <Input
            type="text"
            placeholder="E.g., 'Can I claim home office deduction?'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={submittingQuestion}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={submittingQuestion || !question.trim()}
            className="bg-[#1591cd] text-white hover:bg-[#0d6aaa]"
          >
            {submittingQuestion ? "..." : "Send"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
