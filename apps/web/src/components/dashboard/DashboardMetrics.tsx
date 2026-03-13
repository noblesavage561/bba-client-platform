"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";

interface DashboardMetric {
  label: string;
  value: string | number;
  icon: string;
  unit?: string;
  color?: string;
  target?: string;
  trend?: "up" | "down";
}

interface DashboardMetricsProps {
  caseId: string;
  className?: string;
}

export function DashboardMetrics({
  caseId,
  className = "",
}: DashboardMetricsProps) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/metrics?caseId=${caseId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [caseId]);

  if (loading) {
    return (
      <div className={`grid md:grid-cols-5 gap-4 ${className}`}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
      </div>
    );
  }

  return (
    <div className={`grid md:grid-cols-5 gap-4 ${className}`}>
      {metrics.map((metric, i) => (
        <Card
          key={i}
          className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${
            metric.target ? "hover:border-[#1591cd]" : ""
          }`}
          onClick={() => {
            if (metric.target) {
              router.push(metric.target);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#414042]">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-sm text-gray-600">{metric.unit}</span>
                )}
              </div>
              {metric.trend && (
                <p className="text-xs mt-2 text-green-600">
                  {metric.trend === "up" ? "↑" : "↓"} Improving
                </p>
              )}
            </div>
            <div className="text-4xl">{metric.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
