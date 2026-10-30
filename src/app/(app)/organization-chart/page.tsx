"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrgChartLibraryPage } from "@/components/org-chart/library/org-chart-library-page";
import { OrgChartBuilderV2Page } from "@/components/org-chart/builder-v2/org-chart-builder-v2-page";
import { ShareChartModal } from "@/components/org-chart/library/share-chart-modal";
import { OrganizationChart } from "@/lib/org-chart/types";
import { orgChartService } from "@/lib/org-chart/org-chart-service";

function createDefaultNewChart(): OrganizationChart {
  const now = new Date().toISOString();
  const dateOnly = now.split("T")[0];
  return {
    id: `org-chart-${Date.now()}`,
    title: "Organization Structure: New Project",
    chartType: "PROJECT_SITE",
    siteId: `site-${Date.now()}`,
    companyName: "Transvolt Mobility Private Limited",
    siteName: "",
    siteLocation: "",
    clientName: "",
    projectManager: "",
    version: "v1.0",
    status: "DRAFT",
    isBasicInfoSaved: false,
    effectiveFrom: dateOnly,
    createdAt: now,
    updatedAt: now,
    createdBy: "Super Admin",
    updatedBy: "Super Admin",
    nodes: [
      {
        id: "node-root",
        type: "EXECUTIVE",
        label: "Project Manager",
        parentId: null,
        position: { x: 480, y: 70 },
        width: 220,
        height: 65,
        metadata: {
          name: "Project Manager",
          designation: "Project Head",
          employmentType: "EMPLOYEE",
          color: "#1e293b",
        },
      },
    ],
    connections: [],
    boundaries: [],
    footer: {
      enabled: true,
      projectInfo: {
        projectName: "Project Site Operations",
        projectLocation: "Location",
        projectCode: "SITE-NEW",
        projectManager: "Project Head",
        effectiveDate: dateOnly,
      },
      manpowerColumns: [
        { id: "col-pilots", label: "Pilots" },
        { id: "col-roll", label: "Staff On Roll" },
        { id: "col-outsource", label: "Staff Outsource" },
      ],
      manpowerRows: [
        { key: "REQUIRED", label: "Required", values: { "col-pilots": 50, "col-roll": 8, "col-outsource": 6 } },
        { key: "AVAILABLE", label: "Available", values: { "col-pilots": 50, "col-roll": 8, "col-outsource": 6 } },
        { key: "GAP", label: "Gap", values: { "col-pilots": 0, "col-roll": 0, "col-outsource": 0 } },
      ],
      vehicleMatrix: {
        vehicles: { required: 50, available: 50 },
        chargers: { required: 8, available: 8 },
      },
      legendItems: [
        { id: "leg-req", label: "Required Position", color: "#64748b", type: "REQUIRED_POSITION" },
        { id: "leg-emp", label: "Employee (On Roll)", color: "#16a34a", type: "EMPLOYEE" },
        { id: "leg-con", label: "Consultant / Agency", color: "#ea580c", type: "CONSULTANT" },
      ],
    },
  };
}

function OrganizationChartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuilder = searchParams.get("mode") === "builder";
  const [activeChart, setActiveChart] = useState<OrganizationChart | null>(null);

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareChartId, setShareChartId] = useState<string | null>(null);
  const [shareChartTitle, setShareChartTitle] = useState("");

  // Sync state if user loads or refreshes with ?mode=builder
  React.useEffect(() => {
    if (isBuilder) {
      const chartId = searchParams.get("id");
      if (chartId) {
        if (activeChart && activeChart.id === chartId) return;
        const found = orgChartService.getChartByIdSync(chartId);
        if (found) {
          setActiveChart(found);
          return;
        }
      }
      if (!activeChart) {
        const newChart = createDefaultNewChart();
        setActiveChart(newChart);
      }
    } else if (!isBuilder && activeChart) {
      setActiveChart(null);
    }
  }, [isBuilder, searchParams, activeChart]);

  const handleOpenBuilder = (chart?: OrganizationChart) => {
    if (chart) {
      const cleanChart = JSON.parse(JSON.stringify(chart));
      setActiveChart(cleanChart);
      router.push(`/organization-chart?mode=builder&id=${cleanChart.id}`);
    } else {
      const newChart = createDefaultNewChart();
      orgChartService.saveChart(newChart);
      setActiveChart(newChart);
      router.push(`/organization-chart?mode=builder&id=${newChart.id}`);
    }
  };

  const handleBackToLibrary = () => {
    setActiveChart(null);
    router.push("/organization-chart");
  };

  const handleOpenShareModal = (chartId: string) => {
    setShareChartId(chartId);
    setShareChartTitle(activeChart?.title || "Organization Chart");
    setShareModalOpen(true);
  };

  return (
    <>
      {isBuilder && activeChart ? (
        <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
          <OrgChartBuilderV2Page
            key={activeChart.id}
            initialChart={activeChart}
            onBackToLibrary={handleBackToLibrary}
            onOpenShareModal={handleOpenShareModal}
          />
        </div>
      ) : (
        <div className="w-full flex-1">
          <OrgChartLibraryPage onOpenBuilder={handleOpenBuilder} />
        </div>
      )}

      {/* Share Modal */}
      <ShareChartModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        chartId={shareChartId}
        chartTitle={shareChartTitle}
      />
    </>
  );
}

export default function OrganizationChartPage() {
  return (
    <React.Suspense fallback={<div className="h-screen w-screen bg-background" />}>
      <OrganizationChartPageContent />
    </React.Suspense>
  );
}
