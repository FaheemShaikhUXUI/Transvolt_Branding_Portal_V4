"use client";

import React, { useState } from "react";
import { OrgChartLibraryPage } from "@/components/org-chart/library/org-chart-library-page";
import { OrgChartBuilderPage } from "@/components/org-chart/builder/org-chart-builder-page";
import { OrgChartBuilderV2Page } from "@/components/org-chart/builder-v2/org-chart-builder-v2-page";
import { ShareChartModal } from "@/components/org-chart/library/share-chart-modal";
import { OrganizationChart } from "@/lib/org-chart/types";

function createDefaultNewChart(): OrganizationChart {
  const now = new Date().toISOString();
  const dateOnly = now.split("T")[0];
  return {
    id: `org-chart-${Date.now()}`,
    title: "Organization Structure: New Project",
    chartType: "PROJECT_SITE",
    siteId: "SITE-NEW",
    siteName: "Project Site / Branch",
    siteLocation: "Project Location",
    version: "v1.0",
    status: "DRAFT",
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
          designation: "Project Head",
          employmentType: "EMPLOYEE",
          color: "#1e293b",
        },
      },
    ],
    connections: [],
    boundaries: [],
    footer: {
      projectInformation: {
        projectName: "Project Site Operations",
        projectLocation: "Location",
        effectiveDate: dateOnly,
      },
      manpowerMatrix: {
        columns: ["Pilots", "Staff On Roll", "Staff Outsource", "Total"],
        rows: [
          { label: "Required", values: { Pilots: 50, "Staff On Roll": 8, "Staff Outsource": 6 } },
          { label: "Available", values: { Pilots: 50, "Staff On Roll": 8, "Staff Outsource": 6 } },
          { label: "Gap", values: { Pilots: 0, "Staff On Roll": 0, "Staff Outsource": 0 } },
        ],
      },
      vehicleChargerMatrix: {
        columns: ["Vehicles", "Chargers", "Total"],
        rows: [
          { label: "Required", values: { Vehicles: 50, Chargers: 8 } },
          { label: "Available", values: { Vehicles: 50, Chargers: 8 } },
          { label: "Gap", values: { Vehicles: 0, Chargers: 0 } },
        ],
      },
      legend: [
        { id: "leg-req", label: "Required Position", color: "#64748b", type: "REQUIRED" },
        { id: "leg-emp", label: "Employee (On Roll)", color: "#16a34a", type: "EMPLOYEE" },
        { id: "leg-con", label: "Consultant / Agency", color: "#8b5cf6", type: "CONSULTANT" },
      ],
    },
  };
}

export default function OrganizationChartPage() {
  const [mode, setMode] = useState<"library" | "builder">("library");
  const [builderVersion, setBuilderVersion] = useState<"v1" | "v2">("v2");
  const [activeChart, setActiveChart] = useState<OrganizationChart | null>(null);

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareChartId, setShareChartId] = useState<string | null>(null);
  const [shareChartTitle, setShareChartTitle] = useState("");

  const handleOpenBuilder = (chart?: OrganizationChart, version?: "v1" | "v2") => {
    setBuilderVersion(version || "v2");
    if (chart) {
      setActiveChart(chart);
    } else {
      setActiveChart(createDefaultNewChart());
    }
    setMode("builder");
  };

  const handleBackToLibrary = () => {
    setActiveChart(null);
    setMode("library");
  };

  const handleOpenShareModal = (chartId: string) => {
    setShareChartId(chartId);
    setShareChartTitle(activeChart?.title || "Organization Chart");
    setShareModalOpen(true);
  };

  return (
    <>
      {mode === "builder" && activeChart ? (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-background">
          {builderVersion === "v2" ? (
            <OrgChartBuilderV2Page
              initialChart={activeChart}
              onBackToLibrary={handleBackToLibrary}
              onOpenShareModal={handleOpenShareModal}
            />
          ) : (
            <OrgChartBuilderPage
              initialChart={activeChart}
              onBackToLibrary={handleBackToLibrary}
              onOpenShareModal={handleOpenShareModal}
            />
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-background p-4 md:p-8">
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
