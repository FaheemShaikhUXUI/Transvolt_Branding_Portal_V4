"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { orgChartService } from "@/lib/org-chart/org-chart-service";
import { OrganizationChart } from "@/lib/org-chart/types";
import { SharedOrgChartViewer } from "@/components/org-chart/viewer/shared-org-chart-viewer";
import { ShieldAlert } from "lucide-react";

export default function ShareOrgChartPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chartId = params?.id as string;
  const tokenParam = searchParams.get("t");

  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState<OrganizationChart | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!chartId) {
      setLoading(false);
      return;
    }

    async function loadSharedChart() {
      try {
        const tNumber = tokenParam ? parseInt(tokenParam, 10) : undefined
        const shareResult = await orgChartService.getSharedChart(chartId, tNumber)
        if (!shareResult.chart) {
          if (shareResult.isExpired) {
            setIsExpired(true)
            setRemainingMs(0)
          }
          setChart(null)
        } else {
          setChart(shareResult.chart)
          setIsExpired(shareResult.isExpired)
          setRemainingMs(shareResult.remainingMs)
        }
      } catch (err) {
        console.error("Error retrieving shared chart:", err)
        setChart(null)
      } finally {
        setLoading(false)
      }
    }

    loadSharedChart()
  }, [chartId, tokenParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#548235] border-t-transparent" />
          <span className="text-xs font-semibold text-muted-foreground">
            Loading Organization Chart...
          </span>
        </div>
      </div>
    );
  }

  if (!chart && !isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Chart Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested organization chart could not be loaded or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SharedOrgChartViewer
      chart={chart}
      isExpired={isExpired}
      remainingMs={remainingMs}
    />
  );
}
