"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Signal {
  id: string;
  signalType: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  source: string;
  isClientVisible: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

interface SignalFeedProps {
  caseId: string;
  role?: "client" | "staff";
  className?: string;
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SIGNAL_ICONS: Record<string, string> = {
  document_classified: "📄",
  document_needs_review: "⚠️",
  confidence_increased: "📈",
  confidence_blocked: "🔴",
  stage_advanced: "🎉",
  stage_blocked: "🚫",
  staff_note: "💬",
  inactivity_alert: "⏰",
  document_expiring: "📋",
  opportunity_detected: "💡",
};

const SEVERITY_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  info: {
    bg: "bg-blue-50",
    border: "border-l-4 border-blue-500",
    icon: "ℹ️",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-l-4 border-amber-500",
    icon: "⚠️",
  },
  critical: {
    bg: "bg-red-50",
    border: "border-l-4 border-red-500",
    icon: "🔴",
  },
};

export function SignalFeed({
  caseId,
  role = "client",
  className = "",
  maxItems = 10,
  autoRefresh = true,
  refreshInterval = 10000,
}: SignalFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const mergeSignals = useCallback(
    (incoming: Signal[]) => {
      if (incoming.length === 0) return;

      setSignals((prev) => {
        const byId = new Map<string, Signal>();
        for (const signal of prev) byId.set(signal.id, signal);
        for (const signal of incoming) byId.set(signal.id, signal);

        return Array.from(byId.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, maxItems);
      });
    },
    [maxItems]
  );

  const fetchSignals = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        caseId,
        role,
        limit: maxItems.toString(),
      });

      const response = await fetch(`/api/signals?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch signals");
      }

      const data = await response.json();
      setSignals(data.signals || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("SignalFeed error:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId, role, maxItems]);

  useEffect(() => {
    fetchSignals();

    if (!autoRefresh) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let eventSource: EventSource | null = null;

    try {
      const params = new URLSearchParams({
        caseId,
        role,
      });

      eventSource = new EventSource(`/api/signals/stream?${params.toString()}`);

      eventSource.addEventListener("signals", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as {
          signals?: Signal[];
          unreadCount?: number;
        };

        if (Array.isArray(payload.signals)) {
          mergeSignals(payload.signals);
        }
        if (typeof payload.unreadCount === "number") {
          setUnreadCount(payload.unreadCount);
        }
      });

      eventSource.addEventListener("error", () => {
        if (!interval) {
          interval = setInterval(fetchSignals, refreshInterval);
        }
      });
    } catch {
      interval = setInterval(fetchSignals, refreshInterval);
    }

    if (!eventSource) {
      interval = setInterval(fetchSignals, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [fetchSignals, autoRefresh, refreshInterval, caseId, role, mergeSignals]);

  const handleResolve = async (signalId: string) => {
    try {
      await fetch(`/api/signals/${signalId}/resolve`, {
        method: "POST",
      });
      fetchSignals();
    } catch (err) {
      console.error("Error resolving signal:", err);
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 border-l-4 border-red-500 ${className}`}>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  }

  if (signals.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-gray-600">No recent signals. Check back later!</p>
      </Card>
    );
  }

  const groupedByDate = signals.reduce(
    (acc, signal) => {
      const date = new Date(signal.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(signal);
      return acc;
    },
    {} as Record<string, Signal[]>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notification Badge */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <span className="text-sm font-semibold text-blue-900">
            {unreadCount} new signal{unreadCount !== 1 ? "s" : ""}
          </span>
          <Button
            onClick={fetchSignals}
            variant="secondary"
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      )}

      {/* Signals Grouped by Date */}
      {Object.entries(groupedByDate).map(([date, dateSignals]) => (
        <div key={date}>
          <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3 px-2">
            {date}
          </h3>
          <div className="space-y-3">
            {dateSignals.map((signal) => {
              const colors =
                SEVERITY_COLORS[signal.severity] || SEVERITY_COLORS.info;
              const icon =
                SIGNAL_ICONS[signal.signalType] ||
                SEVERITY_COLORS[signal.severity].icon;

              return (
                <Card
                  key={signal.id}
                  className={`p-4 ${colors.bg} ${colors.border}`}
                >
                  <div className="flex gap-4">
                    <div className="text-2xl flex-shrink-0">{icon}</div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-[#414042] text-sm mb-1">
                        {signal.title}
                      </h4>
                      <p className="text-xs text-gray-700 mb-2">
                        {signal.body}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(signal.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!signal.isResolved && (
                        <Button
                          onClick={() => handleResolve(signal.id)}
                          className="text-xs bg-white hover:bg-gray-100 border border-gray-300 text-gray-700"
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  {signal.metadata && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-10 text-xs text-gray-600">
                      <details className="cursor-pointer">
                        <summary className="font-semibold hover:underline">
                          Details
                        </summary>
                        <pre className="mt-2 text-xs overflow-auto">
                          {JSON.stringify(signal.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* View All Link */}
      {signals.length >= maxItems && (
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = "/portal/signals";
          }}
          className="w-full"
        >
          View All Signals
        </Button>
      )}
    </div>
  );
}
