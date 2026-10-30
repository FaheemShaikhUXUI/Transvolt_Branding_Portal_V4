import { OrganizationChart, OrgNode, SectionBoundary, TextAnnotation, OrgConnection, OrgFooter } from "./types"
import { calculateManpowerSummary } from "./rag-calculator"
import { ChartShape } from "@/components/org-chart/builder-v2/shapes/types"

export type ExportScope = "CURRENT" | "ALL" | "RANGE"

export interface ExportScopeOptions {
  scope?: ExportScope
  activePageIndex?: number
  fromPage?: number // 1-indexed
  toPage?: number   // 1-indexed
}

export interface PdfExportOptions extends ExportScopeOptions {
  pageSize?: "A4" | "A3" | "A2" | "A1" | "A0"
  orientation?: "landscape" | "portrait"
  includeFooter?: boolean
  includeAnnotations?: boolean
  includeMetadata?: boolean
}

export interface ExportPageData {
  pageNumber: number
  title: string
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  annotations?: TextAnnotation[]
  shapes?: ChartShape[]
  footer: OrgFooter
}

/**
 * Resolve the exact pages to export based on scope and options
 */
export function getPagesToExport(
  chart: OrganizationChart,
  options?: ExportScopeOptions
): ExportPageData[] {
  // If chart has multi-page data defined
  const pages = chart.pages && chart.pages.length > 0 ? chart.pages : []

  // Fallback single page from root chart if no pages array exists
  const rootPage: ExportPageData = {
    pageNumber: 1,
    title: chart.title || "Main Organization Chart",
    nodes: chart.nodes || [],
    connections: chart.connections || [],
    boundaries: chart.boundaries || [],
    annotations: chart.annotations || [],
    shapes: chart.shapes || [],
    footer: chart.footer,
  }

  if (pages.length === 0) {
    return [rootPage]
  }

  const scope = options?.scope || "CURRENT"

  if (scope === "ALL") {
    return pages.map((p, idx) => ({
      pageNumber: idx + 1,
      title: p.title || `Page ${idx + 1}`,
      nodes: p.nodes || [],
      connections: p.connections || [],
      boundaries: p.boundaries || [],
      annotations: p.annotations || [],
      shapes: p.shapes || [],
      footer: p.footer || chart.footer,
    }))
  }

  if (scope === "RANGE") {
    const from = Math.max(1, Math.min(options?.fromPage ?? 1, pages.length))
    const to = Math.max(from, Math.min(options?.toPage ?? pages.length, pages.length))

    return pages.slice(from - 1, to).map((p, i) => ({
      pageNumber: from + i,
      title: p.title || `Page ${from + i}`,
      nodes: p.nodes || [],
      connections: p.connections || [],
      boundaries: p.boundaries || [],
      annotations: p.annotations || [],
      shapes: p.shapes || [],
      footer: p.footer || chart.footer,
    }))
  }

  // Default: CURRENT page
  const activeIdx = Math.max(
    0,
    Math.min(options?.activePageIndex ?? chart.activePageIndex ?? 0, pages.length - 1)
  )
  const activeP = pages[activeIdx]

  return [
    {
      pageNumber: activeIdx + 1,
      title: activeP?.title || `Page ${activeIdx + 1}`,
      nodes: activeP?.nodes || chart.nodes || [],
      connections: activeP?.connections || chart.connections || [],
      boundaries: activeP?.boundaries || chart.boundaries || [],
      annotations: activeP?.annotations || chart.annotations || [],
      shapes: activeP?.shapes || chart.shapes || [],
      footer: activeP?.footer || chart.footer,
    },
  ]
}

/**
 * Calculates auto-fit transform parameters so any org chart elements fit inside the
 * available rectangular space between the executive header and the bottom matrix footer.
 */
export function calculateAutoFitTransform(
  nodes: OrgNode[],
  boundaries: SectionBoundary[],
  shapes: ChartShape[] = [],
  annotations: TextAnnotation[] = [],
  availRect = { left: 24, top: 110, width: 1552, height: 700 }
) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach((n) => {
    const w = n.width || 190
    const h = n.height || 64
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + w)
    maxY = Math.max(maxY, n.position.y + h)
  })

  boundaries.forEach((b) => {
    minX = Math.min(minX, b.position.x)
    minY = Math.min(minY, b.position.y)
    maxX = Math.max(maxX, b.position.x + b.width)
    maxY = Math.max(maxY, b.position.y + b.height)
  })

  shapes.forEach((s) => {
    minX = Math.min(minX, s.x)
    minY = Math.min(minY, s.y)
    maxX = Math.max(maxX, s.x + s.width)
    maxY = Math.max(maxY, s.y + s.height)
  })

  annotations.forEach((a) => {
    const w = a.width || 220
    const h = a.height || 50
    minX = Math.min(minX, a.position.x)
    minY = Math.min(minY, a.position.y)
    maxX = Math.max(maxX, a.position.x + w)
    maxY = Math.max(maxY, a.position.y + h)
  })

  if (minX === Infinity) {
    minX = 100
    minY = 100
    maxX = 1100
    maxY = 600
  }

  const padding = 20
  const contentLeft = minX - padding
  const contentTop = minY - padding
  const contentWidth = Math.max(100, maxX - minX + padding * 2)
  const contentHeight = Math.max(100, maxY - minY + padding * 2)

  // Auto-fit scale factor: scale down if larger than available rect; cap at 1.05 to avoid over-enlarging
  const scaleX = availRect.width / contentWidth
  const scaleY = availRect.height / contentHeight
  const scale = Math.min(1.0, scaleX, scaleY)

  // Center within available space
  const renderedWidth = contentWidth * scale
  const renderedHeight = contentHeight * scale
  const transX = availRect.left + (availRect.width - renderedWidth) / 2 - contentLeft * scale
  const transY = availRect.top + (availRect.height - renderedHeight) / 2 - contentTop * scale

  return { scale, transX, transY, contentWidth, contentHeight, minX, minY, maxX, maxY }
}

export function formatDateDMY(dateInput?: string | Date | null): string {
  if (!dateInput) return "00/00/0000"
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Generate Printable Executive White Canvas PDF (Multi-page supported)
 */
export function exportOrgChartToPrintPdf(
  chart: OrganizationChart,
  options?: PdfExportOptions
): void {
  const printWindow = window.open("", "_blank", "width=1320,height=920")
  if (!printWindow) {
    alert("Please allow popups to download or print the Organization Chart PDF.")
    return
  }

  const pageSize = options?.pageSize || "A3"
  const orientation = options?.orientation || "landscape"
  const includeFooter = options?.includeFooter !== false
  const includeAnnotations = options?.includeAnnotations !== false
  const includeMetadata = options?.includeMetadata !== false

  const pagesToExport = getPagesToExport(chart, options)
  const totalBookletPages = chart.pages?.length || 1

  // Build each page's sheet HTML
  const pagesHtml = pagesToExport
    .map((pageData) => {
      const { pageNumber, title: pageTitle, nodes, connections, boundaries, annotations = [], shapes = [], footer } = pageData
      const summary = calculateManpowerSummary(nodes, footer)

      const isPortrait = orientation === "portrait"
      const sheetWidth = isPortrait ? 1100 : 1600
      const sheetHeight = isPortrait ? 1600 : 1100
      const footerH = includeFooter ? 240 : 20
      const availH = sheetHeight - 82 - footerH
      const { scale, transX, transY } = calculateAutoFitTransform(
        nodes,
        boundaries,
        shapes,
        includeAnnotations ? annotations : [],
        { left: 24, top: 82, width: sheetWidth - 48, height: availH }
      )

      return `
      <div class="sheet-page">
        <!-- 1. Executive Top Header (Solid Black Banner) -->
        ${
          includeMetadata
            ? `
        <div class="header-bar">
          <div class="header-left">
            <h1 class="header-main-title">${chart.siteName || chart.title || "Name of the Organization Chart"}</h1>
            <p class="header-subtitle">Organization Structure</p>
          </div>
          <div class="header-right">
            <img src="/logos/SVG/Logo_White.svg" alt="Transvolt" class="header-logo-img" />
          </div>
        </div>
        <div class="sub-header-bar">
          <span>Date Created: ${formatDateDMY(chart.createdAt)} | Date Updated: ${formatDateDMY(chart.updatedAt)}</span>
        </div>
        `
            : ""
        }

        <!-- 2. Middle Canvas Content (Auto-fitted without clipping) -->
        <div class="chart-content-layer" style="transform: translate(${transX.toFixed(2)}px, ${transY.toFixed(2)}px) scale(${scale.toFixed(4)});">
          <!-- Boundaries -->
          ${boundaries
            .map(
              (b) => `
            <div class="boundary-box" style="left: ${b.position.x}px; top: ${b.position.y}px; width: ${b.width}px; height: ${b.height}px; border: 1.5px ${b.borderStyle || "dashed"} ${b.color || "#94a3b8"}; background: ${b.bgColor || "rgba(248, 250, 252, 0.55)"};">
              ${b.title ? `<span class="boundary-title" style="color: ${b.color || "#475569"}; border: 1px solid ${b.color || "#cbd5e1"};">${b.title}</span>` : ""}
            </div>
          `
            )
            .join("")}

          <!-- Shapes -->
          ${shapes
            .map((s) => {
              const rx = s.kind === "rounded-rectangle" ? 8 : 4
              return `
              <div class="shape-box" style="left: ${s.x}px; top: ${s.y}px; width: ${s.width}px; height: ${s.height}px; background: ${s.fill || "#f1f5f9"}; border: ${s.strokeWidth || 1.5}px ${s.strokeStyle || "solid"} ${s.stroke || "#94a3b8"}; border-radius: ${rx}px; color: ${s.textColor || "#0f172a"}; font-size: ${s.fontSize || 12}px;">
                ${s.text ? `<span>${s.text}</span>` : ""}
              </div>
            `
            })
            .join("")}

          <!-- Connectors SVG -->
          <svg class="connectors-svg">
            <defs>
              <marker id="arrow-m" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
              </marker>
            </defs>
            ${connections
              .map((c) => {
                const sNode = nodes.find((n) => n.id === c.source)
                const tNode = nodes.find((n) => n.id === c.target)
                if (!sNode || !tNode) return ""
                const sx = sNode.position.x + (sNode.width || 180) / 2
                const sy = sNode.position.y + (sNode.height || 54)
                const tx = tNode.position.x + (tNode.width || 180) / 2
                const ty = tNode.position.y

                const midY = sy + (ty - sy) / 2
                const path = `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`

                return `<path d="${path}" fill="none" stroke="${c.color || "#64748b"}" stroke-width="1.75" ${c.dashed ? 'stroke-dasharray="4 4"' : ""} marker-end="url(#arrow-m)" />`
              })
              .join("")}
          </svg>

          <!-- Annotations -->
          ${
            includeAnnotations && annotations
              ? annotations
                  .map(
                    (a) => `
              <div class="annotation-box" style="left: ${a.position.x}px; top: ${a.position.y}px; width: ${a.width || 220}px; color: ${a.color || "#0f172a"}; font-size: ${a.fontSize || 12}px; border: 1px dashed ${a.borderColor || "#cbd5e1"}; background: ${a.bgColor || "rgba(255,255,255,0.92)"};">
                ${a.text}
              </div>
            `
                  )
                  .join("")
              : ""
          }

          <!-- Node Cards -->
          ${nodes
            .map((node) => {
              let nodeClass = "node-employee"
              if (node.type === "ORGANIZATION") {
                nodeClass = "node-organization"
              } else if (node.type === "EXECUTIVE" || node.type === "MANAGEMENT") {
                nodeClass = "node-executive"
              } else if (node.type === "DEPARTMENT") {
                nodeClass = "node-dept"
              } else if (node.type === "HOD" || node.metadata.employmentType === "HOD") {
                nodeClass = "node-hod"
              } else if (node.type === "CONSULTANT" || node.metadata.employmentType === "CONSULTANT") {
                nodeClass = "node-consultant"
              } else if (node.type === "REQUIRED_POSITION") {
                nodeClass = "node-required"
              }

              const w = node.width || 190
              const h = node.height || 60
              const title = node.label || node.metadata.name || "Position"
              const subtitle =
                node.metadata.departmentCode ||
                node.metadata.code ||
                node.metadata.designation ||
                node.metadata.department ||
                (node.type === "REQUIRED_POSITION" && node.metadata.requiredQuantity ? `${node.metadata.requiredQuantity} Vacancies` : "") ||
                ""
              const empId = node.metadata.employeeId ? `<span class="emp-id">#${node.metadata.employeeId}</span>` : ""
              const customStyle = node.metadata.bgColor
                ? `background: ${node.metadata.bgColor} !important; border-color: ${node.metadata.color || node.metadata.bgColor} !important; color: ${node.metadata.textColor || "#ffffff"} !important;`
                : ""

              return `
              <div class="node-card ${nodeClass}" style="left: ${node.position.x}px; top: ${node.position.y}px; width: ${w}px; height: ${h}px; ${customStyle}">
                <div class="node-title">${title}</div>
                ${subtitle ? `<div class="node-subtitle">${subtitle}</div>` : ""}
                ${empId}
              </div>
            `
            })
            .join("")}
        </div>

        <!-- 3. Bottom Operations & Live Manpower RAG Matrix -->
        ${
          includeFooter
            ? `
        <div class="matrix-footer">
          <div class="matrix-top-bar">
            <div class="matrix-top-title">
              <div class="matrix-icon-box">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
                  <path d="M6 3H2V21H6V18.5H4.5V5.5H6V3Z" />
                  <path d="M18 3H22V21H18V18.5H19.5V5.5H18V3Z" />
                  <rect x="6.8" y="5.8" width="2.6" height="2.6" rx="0.3" />
                  <rect x="10.7" y="5.8" width="2.6" height="2.6" rx="0.3" />
                  <rect x="14.6" y="5.8" width="2.6" height="2.6" rx="0.3" />
                  <rect x="6.8" y="10.7" width="2.6" height="2.6" rx="0.3" />
                  <rect x="10.7" y="10.7" width="2.6" height="2.6" rx="0.3" />
                  <rect x="14.6" y="10.7" width="2.6" height="2.6" rx="0.3" />
                  <rect x="6.8" y="15.6" width="2.6" height="2.6" rx="0.3" />
                  <rect x="10.7" y="15.6" width="2.6" height="2.6" rx="0.3" />
                  <rect x="14.6" y="15.6" width="2.6" height="2.6" rx="0.3" />
                </svg>
              </div>
              <span class="matrix-title-text">OPERATIONS &amp; LIVE MANPOWER RAG MATRIX</span>
              <span class="matrix-subtitle-text">${chart.siteLocation || chart.siteName || "Transvolt Project Site"} &bull; Effective: ${chart.effectiveFrom || "2026-10-28"}</span>
            </div>
            <span style="font-size: 14px; color: #94a3b8; font-weight: bold;">&times;</span>
          </div>

          <div class="footer-grid">
            <!-- Section A: Project Information -->
            <div class="footer-col col-a">
              <div>
                <strong class="col-title text-blue">SECTION A: PROJECT INFORMATION</strong>
                <table class="matrix-info-table">
                  <tr><td class="info-lbl">Company:</td><td class="info-val">${chart.companyName || chart.siteName || "Transvolt Mobility Private Limited"}</td></tr>
                  <tr><td class="info-lbl">Site / Location:</td><td class="info-val">${chart.siteLocation || "Site Operations"}</td></tr>
                  <tr><td class="info-lbl">Project Manager:</td><td class="info-val">${chart.projectManager || footer?.projectInfo?.projectManager || "Project Head"}</td></tr>
                  <tr><td class="info-lbl">Effective Date:</td><td class="info-val text-green" style="font-weight: 700;">${chart.effectiveFrom || "2026-10-28"}</td></tr>
                </table>
              </div>
              <div class="total-personnel-row">
                <span>Total Personnel:</span>
                <strong>${summary.totalAvailable} Active</strong>
              </div>
            </div>

            <!-- Section B: Live Manpower RAG Matrix -->
            <div class="footer-col col-b">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong class="col-title text-green" style="margin: 0;">SECTION B: MANPOWER RAG MATRIX (LIVE AUTO-CALCULATED)</strong>
                <span style="font-size: 9.5px; color: #64748b; font-family: monospace;">${summary.rows.length} Department${summary.rows.length !== 1 ? "s" : ""}</span>
              </div>
              <div class="matrix-table-wrap">
                <table class="matrix-table">
                  <thead>
                    <tr>
                      <th>DEPARTMENT</th>
                      <th style="text-align: center;">EMP</th>
                      <th style="text-align: center;">CONS</th>
                      <th style="text-align: center;">AVAIL</th>
                      <th style="text-align: center;">REQ</th>
                      <th style="text-align: center;">GAP</th>
                      <th style="text-align: center;">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${summary.rows.length === 0 ? `
                      <tr>
                        <td colspan="7" style="text-align: center; color: #64748b; font-style: italic; padding: 12px 6px;">
                          No departments mapped. Total chart active headcount is shown below.
                        </td>
                      </tr>
                    ` : summary.rows.slice(0, 3).map((r) => `
                      <tr>
                        <td><strong>${r.departmentName}</strong></td>
                        <td style="text-align: center; color: #16a34a; font-weight: bold;">${r.employees}</td>
                        <td style="text-align: center; color: #ea580c; font-weight: bold;">${r.consultants}</td>
                        <td style="text-align: center; font-weight: bold;">${r.available}</td>
                        <td style="text-align: center; color: #64748b;">${r.required}</td>
                        <td style="text-align: center; font-weight: bold; color: ${r.gap < 0 ? "#dc2626" : "#16a34a"};">${r.gap >= 0 ? `+${r.gap}` : r.gap}</td>
                        <td style="text-align: center;"><span class="badge-rag bg-green">${r.status}</span></td>
                      </tr>
                    `).join("")}
                    <tr class="total-row">
                      <td>Total Manpower</td>
                      <td style="text-align: center; color: #16a34a;">${summary.totalEmployees}</td>
                      <td style="text-align: center; color: #ea580c;">${summary.totalConsultants}</td>
                      <td style="text-align: center; font-weight: 900;">${summary.totalAvailable}</td>
                      <td style="text-align: center; color: #64748b;">${summary.totalRequired}</td>
                      <td style="text-align: center; font-weight: 900; color: ${summary.totalGap < 0 ? "#dc2626" : "#16a34a"};">${summary.totalGap >= 0 ? `+${summary.totalGap}` : summary.totalGap}</td>
                      <td style="text-align: center;"><span class="badge-rag bg-green">${summary.ragStatus}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section C: Fleet & Infrastructure -->
            <div class="footer-col col-c">
              <strong class="col-title text-blue">SECTION C: FLEET &amp; INFRASTRUCTURE</strong>
              <div class="matrix-table-wrap">
                <table class="matrix-table">
                  <thead>
                    <tr><th>ASSET</th><th style="text-align: center;">REQ</th><th style="text-align: center;">AVAIL</th><th style="text-align: center;">GAP</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Electric Vehicles</td>
                      <td style="text-align: center;">${footer?.vehicleMatrix?.vehicles?.required || 50}</td>
                      <td style="text-align: center; font-weight: bold;">${footer?.vehicleMatrix?.vehicles?.available || 50}</td>
                      <td style="text-align: center; font-weight: bold; color: #16a34a;">+0</td>
                    </tr>
                    <tr>
                      <td>EV Chargers</td>
                      <td style="text-align: center;">${footer?.vehicleMatrix?.chargers?.required || 8}</td>
                      <td style="text-align: center; font-weight: bold;">${footer?.vehicleMatrix?.chargers?.available || 8}</td>
                      <td style="text-align: center; font-weight: bold; color: #16a34a;">+0</td>
                    </tr>
                    <tr>
                      <td>Charging Bays</td>
                      <td style="text-align: center;">${footer?.vehicleMatrix?.infrastructure?.required || 4}</td>
                      <td style="text-align: center; font-weight: bold;">${footer?.vehicleMatrix?.infrastructure?.available || 4}</td>
                      <td style="text-align: center; font-weight: bold; color: #16a34a;">+0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="legend-note" style="justify-content: space-between; margin-top: 6px;">
                <span>Fleet: <strong class="text-green">100% Operational</strong></span>
                <span>Audit: <strong>Approved</strong></span>
              </div>
            </div>
          </div>
        </div>
        `
            : ""
        }
      </div>
      `
    })
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${chart.title} - Official Organization Chart</title>
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: 6mm;
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Screen Print Bar */
    .screen-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #ffffff;
      border-bottom: 2px solid #548235;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .btn-print {
      background: #548235;
      color: #ffffff;
      border: none;
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 2px 6px rgba(84,130,53,0.3);
    }
    .btn-print:hover { background: #466e2c; }

    /* Each White Canvas Sheet */
    .sheet-page {
      position: relative;
      width: ${orientation === "portrait" ? 1100 : 1600}px;
      height: ${orientation === "portrait" ? 1600 : 1100}px;
      margin: 24px auto;
      background: #ffffff;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
      page-break-after: always;
    }
    .sheet-page:last-child {
      page-break-after: auto;
    }

    /* Header Bar (Solid Black Banner) */
    .header-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 60px;
      background: #000000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      box-sizing: border-box;
      z-index: 20;
    }
    .header-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .header-main-title {
      margin: 0;
      font-size: 16.5px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.25;
      letter-spacing: -0.01em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header-subtitle {
      margin: 2px 0 0 0;
      font-size: 11px;
      font-weight: 400;
      color: #ffffff;
      opacity: 0.9;
      line-height: 1.2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header-right {
      display: flex;
      align-items: center;
    }
    .header-logo-img {
      height: 24px;
      width: auto;
      max-width: 232px;
      object-fit: contain;
      display: block;
    }
    .header-logo-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .logo-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.08em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .logo-arrows {
      width: 24px;
      height: 19px;
      display: inline-block;
    }
    .logo-reg {
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      vertical-align: super;
      margin-left: -2px;
    }
    .sub-header-bar {
      position: absolute;
      top: 64px;
      right: 32px;
      font-size: 9.5px;
      color: #52525b;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 20;
    }

    /* Middle Canvas Viewport Layer */
    .chart-content-layer {
      position: absolute;
      left: 0;
      top: 0;
      width: 1600px;
      height: 1100px;
      transform-origin: 0 0;
      pointer-events: none;
      z-index: 10;
    }

    .boundary-box {
      position: absolute;
      border-radius: 12px;
      z-index: 2;
    }
    .boundary-title {
      position: absolute;
      top: 8px;
      left: 12px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      background: rgba(255,255,255,0.95);
      border-radius: 4px;
      letter-spacing: 0.06em;
    }
    .shape-box {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6px;
      font-weight: 600;
      z-index: 3;
    }
    .connectors-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    }
    .annotation-box {
      position: absolute;
      border-radius: 6px;
      padding: 6px 10px;
      z-index: 8;
      line-height: 1.35;
    }

    /* Node Cards */
    .node-card {
      position: absolute;
      border-radius: 12px;
      padding: 6px 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      z-index: 12;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-sizing: border-box;
      background: #ffffff;
    }
    .node-organization {
      background: #c2410c;
      color: #ffffff;
      border: 1.5px solid #9a3412;
      text-align: center;
    }
    .node-organization .node-title { color: #ffffff; font-size: 12px; font-weight: 800; }
    .node-organization .node-subtitle { color: #ffedd5; font-size: 10px; }
    .node-executive {
      background: #0f172a;
      color: #ffffff;
      border: 1.5px solid #1e293b;
      text-align: center;
    }
    .node-executive .node-title { color: #ffffff; font-size: 12px; font-weight: 800; }
    .node-executive .node-subtitle { color: #cbd5e1; font-size: 10px; }
    .node-dept {
      background: #1e40af;
      color: #ffffff;
      border: 1.5px solid #1e3a8a;
      text-align: center;
    }
    .node-dept .node-title { color: #ffffff; font-size: 11px; font-weight: 800; }
    .node-dept .node-subtitle { color: #bfdbfe; font-size: 10px; }
    .node-hod {
      background: #15803d;
      color: #ffffff;
      border: 1.5px solid #166534;
      text-align: center;
    }
    .node-hod .node-title { color: #ffffff; font-size: 11px; font-weight: 800; }
    .node-hod .node-subtitle { color: #bbf7d0; font-size: 10px; }
    .node-employee {
      background: #ffffff;
      border: 1.5px solid #94a3b8;
      color: #0f172a;
      text-align: center;
    }
    .node-employee .node-title { font-size: 11px; font-weight: 800; color: #0f172a; }
    .node-employee .node-subtitle { font-size: 10px; color: #64748b; }
    .node-consultant {
      background: #ea580c;
      border: 1.5px solid #c2410c;
      color: #ffffff;
      text-align: center;
    }
    .node-consultant .node-title { font-size: 11px; font-weight: 800; color: #ffffff; }
    .node-consultant .node-subtitle { font-size: 10px; color: #fed7aa; }
    .node-required {
      background: #f8fafc;
      border: 1.5px dashed #94a3b8;
      color: #334155;
      text-align: left;
    }
    .node-required .node-title { font-size: 11px; font-weight: 700; color: #334155; }
    .node-required .node-subtitle { font-size: 10px; color: #64748b; }
    .emp-id { font-size: 9px; color: #94a3b8; margin-top: 1px; }

    /* Bottom Matrix Footer (Exact Match to Image 2) */
    .matrix-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 245px;
      background: #ffffff;
      border-top: 1px solid #cbd5e1;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      z-index: 20;
      overflow: hidden;
    }
    .matrix-top-bar {
      height: 36px;
      padding: 0 28px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .matrix-top-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .matrix-icon-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: rgba(22, 163, 74, 0.15);
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .matrix-title-text {
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
    }
    .matrix-subtitle-text {
      font-size: 10.5px;
      color: #64748b;
      margin-left: 8px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 3.2fr 5.8fr 3fr;
      height: calc(100% - 36px);
      background: #ffffff;
    }
    .footer-col {
      padding: 10px 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .footer-col.col-a {
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
    }
    .footer-col.col-b {
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
    }
    .footer-col.col-c {
      background: #f8fafc;
    }
    .matrix-info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-top: 4px;
    }
    .matrix-info-table tr {
      border-bottom: 1px solid #e2e8f0;
    }
    .matrix-info-table td {
      padding: 3px 0;
    }
    .info-lbl {
      color: #64748b;
      font-weight: 500;
    }
    .info-val {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
    }
    .total-personnel-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
      border-top: 1px solid #cbd5e1;
      font-size: 10.5px;
    }
    .col-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 6px;
    }
    .text-blue { color: #2563eb; }
    .text-green { color: #16a34a; }
    .matrix-table-wrap {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      background: #ffffff;
    }
    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .matrix-table th, .matrix-table td {
      border-bottom: 1px solid #e2e8f0;
      padding: 3px 6px;
      text-align: left;
    }
    .matrix-table th {
      background: #f1f5f9;
      font-weight: 700;
      font-size: 9px;
      color: #475569;
      text-transform: uppercase;
    }
    .total-row {
      background: #f8fafc;
      font-weight: 800;
    }
    .badge-rag {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .bg-green {
      background: rgba(22, 163, 74, 0.15);
      color: #16a34a;
    }

    @media print {
      body { background: #ffffff; }
      .screen-bar { display: none !important; }
      .sheet-page {
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always;
      }
      .sheet-page:last-child {
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <div class="screen-bar">
    <div>
      <strong style="color: #548235; font-size: 15px;">Transvolt Organization Chart Export &bull; ${pageSize} ${orientation}</strong>
      <p style="margin: 2px 0 0; font-size: 12px; color: #475569;">
        Executive White Canvas &bull; Total Pages: ${pagesToExport.length} &bull; Auto-scaled middle content with full Operations & RAG Matrix
      </p>
    </div>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>

  ${pagesHtml}
</body>
</html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * Export Organization Chart to SVG with formal White Canvas, Header and Matrix Footer
 */
export function exportOrgChartToSvg(
  chart: OrganizationChart,
  options?: ExportScopeOptions
): void {
  const pages = getPagesToExport(chart, options)
  const targetPage = pages[0] // Primary page to export
  const { pageNumber, title: pageTitle, nodes, connections, boundaries, shapes = [], footer } = targetPage
  const summary = calculateManpowerSummary(nodes, footer)

  const { scale, transX, transY } = calculateAutoFitTransform(
    nodes,
    boundaries,
    shapes,
    targetPage.annotations || [],
    { left: 24, top: 82, width: 1552, height: 778 }
  )

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1100" width="1600" height="1100">
  <style>
    .title { font-family: sans-serif; font-size: 16.5px; font-weight: bold; fill: #ffffff; }
    .sub { font-family: sans-serif; font-size: 11px; fill: #ffffff; fill-opacity: 0.9; }
    .card-title { font-family: sans-serif; font-size: 11px; font-weight: bold; }
    .card-sub { font-family: sans-serif; font-size: 10px; fill: #64748b; }
  </style>

  <!-- Clean White Canvas Paper -->
  <rect width="1600" height="1100" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />

  <!-- 1. Executive Top Header (Solid Black Banner) -->
  <rect x="0" y="0" width="1600" height="60" fill="#000000" />
  <text x="32" y="27" class="title">${chart.title || "Name of the Organization Chart"}</text>
  <text x="32" y="46" class="sub">Organization Structure</text>

  <!-- Right Logo White SVG from Basic Logo -->
  <g transform="translate(1335, 18)">
    <svg width="233" height="24" viewBox="0 0 11741.1 1211.82" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="export_svg_logo_clip">
          <path d="M-0 1211.82l11569.03 0 0 -1069.03 -11569.03 0 0 1069.03z"/>
        </clipPath>
      </defs>
      <g>
        <g style="clip-path:url(#export_svg_logo_clip)">
          <path fill="#ffffff" d="M772.25 340.93l-270.02 0 0 843.66 -236.98 0 0 -843.66 -265.24 0 0 -183.46 772.2 0 0 183.46 0.04 0zm583.31 449.99l0 393.65 -236.97 0 0 -1027.1 355.43 0c118.26,0 212.12,27.69 281.26,82.59 69.18,55.12 103.9,130.26 103.9,225.86 0,52.95 -14.11,98.68 -41.89,136.73 -27.75,38.03 -68.68,69.09 -123.04,93.2 62.72,17.8 107.72,47.4 134.99,89.06 27.28,41.67 40.96,93.43 40.96,155.55l0 64.99c0,26.75 4.07,57.32 11.97,91.76 8.14,34.2 21.75,58.76 41.42,73.18l0 14.19 -244.65 0c-18.65,-14.68 -30.87,-40.21 -36.63,-76.81 -5.51,-36.83 -8.38,-71.26 -8.38,-103.77l0 -62.12c0,-48.87 -12.92,-86.2 -38.53,-112.2 -25.62,-25.76 -63.45,-38.77 -112.99,-38.77l-126.84 0 -0.01 0.01zm0 -183.44l119.91 0c47.63,0 84.27,-10.83 109.38,-32.74 25.37,-21.94 37.82,-53.22 37.82,-94.16 0,-41.9 -12.92,-75.61 -38.78,-101.12 -26.1,-25.76 -62.73,-38.55 -109.88,-38.55l-118.47 0 0 266.54 0.02 0.03zm1463.48 377.52l-303.53 0 -58.89 199.59 -249.67 0 332.96 -1027.09 127.09 0 0 0.72 0.73 -0.72 126.86 0 333.69 1027.09 -249.67 0 -59.59 -199.59 0.02 0zm-248.97 -183.46l194.37 0 -95.49 -318.78 -4.08 0 -94.8 318.78zm1732.99 383.05l-236.49 0 -373.65 -646.22 -4.31 1.45 0 644.77 -236.98 0 0 -1027.09 236.98 0 373.89 645.48 4.07 -1.44 0 -644.04 236.49 0 0 1027.09zm939.51 -272.28c0,-36.61 -11.99,-64.78 -35.69,-84.29 -23.92,-19.49 -67.26,-40.22 -129.73,-62.36 -126.85,-41.42 -220.93,-85.48 -282.46,-132.44 -61.26,-46.71 -92.14,-114.11 -92.14,-201.99 0,-85.96 35.89,-155.53 107.23,-208.74 71.58,-53.2 162.53,-79.68 272.91,-79.68 116.33,0 210.16,27.44 281.25,82.08 71.08,54.92 105.34,131.95 103.17,231.86l-1.43 4.1 -230.07 0c0,-48.38 -13.16,-83.54 -39.25,-105.45 -26.34,-21.94 -65.83,-32.75 -118.48,-32.75 -43.07,0 -77.09,10.58 -101.75,31.8 -24.89,21.19 -37.08,47.18 -37.08,78.23 0,30.11 12.69,54.17 38.05,72.23 25.61,18.07 73.01,40.93 142.66,68.13 118.24,35.17 207.78,78.25 268.59,129.08 60.79,50.8 91.23,120.38 91.23,208.74 0,90.28 -34.97,161.07 -105.1,212.09 -70.14,51.05 -163.25,76.34 -279.11,76.56 -115.62,-0.22 -213.3,-27.44 -293.48,-82.33 -80.18,-54.66 -119.21,-140.86 -116.83,-258.58l1.45 -4.1 230.77 0c0,59.72 14.6,102.1 43.81,127.36 29.19,25.05 73.97,37.58 134.29,37.58 49.57,0 86.42,-9.88 110.83,-29.63 24.16,-19.73 36.39,-45.5 36.39,-77.51l-0.03 0.01zm982.33 -6.29l6.94 37.34 4.31 0 6.94 -34.65 202.75 -751.21 248.22 0 -331.06 1027.09 -255.87 0 -329.63 -1027.09 247.5 0 199.88 748.52 0.02 0zm1640.35 -142.53c0,126.39 -39.98,230.66 -119.68,312.77 -79.7,82.1 -183.83,123.03 -312.37,123.26 -129.53,-0.22 -234.37,-41.15 -314.78,-123.26 -80.44,-82.11 -120.64,-186.36 -120.64,-312.77l0 -184.91c0,-125.93 39.98,-230.2 120.18,-312.28 80.16,-82.35 184.78,-123.52 313.78,-123.52 128.08,0 232.45,41.16 312.86,123.52 80.43,82.08 120.65,186.33 120.65,312.28l0 184.91zm-236.49 -186.11c0,-73.43 -16.98,-133.63 -51.46,-180.57 -34.25,-47.2 -82.82,-70.54 -145.55,-70.54 -63.89,0 -112.98,23.34 -146.97,70.07 -33.74,46.7 -50.72,107.14 -50.72,181.05l0 186.11c0,74.39 17.23,134.84 51.45,182.03 34.46,46.95 83.8,70.52 147.71,70.52 62.24,0 110.36,-23.59 144.58,-70.52 33.99,-47.2 50.98,-107.62 50.98,-182.03l0 -186.11 -0.02 -0.01zm868.15 423.74l438.29 0 0 183.47 -675.27 0 0 -1027.09 236.98 0 0 843.63 0 -0.01zm1382.32 -660.19l-270.02 0 0 843.66 -236.98 0 0 -843.66 -265.23 0 0 -183.46 772.19 0 0 183.46 0.04 0z"/>
          <polygon fill="#548235" points="10229.22,142.78 10625.05,142.78 11007.99,677.3 10625.05,1211.82 10229.22,1211.82 10612.15,677.3 "/>
          <polygon fill="#4472C4" points="10790.27,142.78 11186.11,142.78 11569.02,677.3 11186.11,1211.82 10790.27,1211.82 11173.19,677.3 "/>
        </g>
        <path fill="#ffffff" d="M11598.32 0c-78.73,0 -142.79,64.06 -142.79,142.78 0,78.73 64.06,142.79 142.79,142.79 78.72,0 142.78,-64.06 142.78,-142.79 0,-78.72 -64.06,-142.78 -142.78,-142.78zm0 21.97c66.84,0 120.81,53.97 120.81,120.81 0,66.85 -53.97,120.82 -120.81,120.82 -66.84,0 -120.82,-53.97 -120.82,-120.82 0,-66.84 53.98,-120.81 120.82,-120.81zm-43.93 54.92l0 131.79 21.96 0 0 -43.93 37.41 0 17.51 43.93 21.96 0 -18.54 -46.67c17.17,-5.97 29.53,-21.97 29.53,-41.19 0,-24.27 -19.65,-43.93 -43.94,-43.93l-65.89 0zm21.96 21.96l43.93 0c13.08,0 21.97,8.89 21.97,21.97 0,13.08 -8.89,21.96 -21.97,21.96l-43.93 0 0 -43.93z"/>
      </g>
    </svg>
  </g>

  <!-- Sub Header Dates -->
  <text x="1568" y="76" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9.5px" fill="#52525b">Date Created: ${formatDateDMY(chart.createdAt)} | Date Updated: ${formatDateDMY(chart.updatedAt)}</text>

  <!-- Auto-Fitted Middle Chart Content -->
  <g transform="translate(${transX.toFixed(2)}, ${transY.toFixed(2)}) scale(${scale.toFixed(4)})">
    <!-- Boundaries -->
    ${boundaries
      .map(
        (b) => `
      <rect x="${b.position.x}" y="${b.position.y}" width="${b.width}" height="${b.height}" rx="10" fill="#f8fafc" stroke="${b.color || "#cbd5e1"}" stroke-dasharray="4 4" stroke-width="1.5" />
      <text x="${b.position.x + 14}" y="${b.position.y + 22}" font-family="sans-serif" font-size="11px" font-weight="bold" fill="#475569">${b.title}</text>
    `
      )
      .join("")}

    <!-- Connectors -->
    ${connections
      .map((c) => {
        const sNode = nodes.find((n) => n.id === c.source)
        const tNode = nodes.find((n) => n.id === c.target)
        if (!sNode || !tNode) return ""
        const sx = sNode.position.x + (sNode.width || 180) / 2
        const sy = sNode.position.y + (sNode.height || 60)
        const tx = tNode.position.x + (tNode.width || 180) / 2
        const ty = tNode.position.y
        const midY = sy + (ty - sy) / 2
        return `<path d="M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}" fill="none" stroke="${c.color || "#64748b"}" stroke-width="1.75" />`
      })
      .join("")}

    <!-- Nodes -->
    ${nodes
      .map((n) => {
        const w = n.width || 190
        const h = n.height || 60
        const cx = n.position.x + w / 2
        let fill = "#ffffff"
        let stroke = "#94a3b8"
        let textColor = "#0f172a"

        if (n.type === "ORGANIZATION") {
          fill = n.metadata.bgColor || "#c2410c"
          stroke = n.metadata.color || "#9a3412"
          textColor = n.metadata.textColor || "#ffffff"
        } else if (n.type === "EXECUTIVE" || n.type === "MANAGEMENT") {
          fill = n.metadata.bgColor || "#0f172a"
          stroke = n.metadata.color || "#1e293b"
          textColor = n.metadata.textColor || "#ffffff"
        } else if (n.type === "DEPARTMENT") {
          fill = n.metadata.bgColor || "#1e40af"
          stroke = n.metadata.color || "#1e3a8a"
          textColor = n.metadata.textColor || "#ffffff"
        } else if (n.type === "HOD" || n.metadata.employmentType === "HOD") {
          fill = n.metadata.bgColor || "#15803d"
          stroke = n.metadata.color || "#166534"
          textColor = n.metadata.textColor || "#ffffff"
        } else if (n.type === "CONSULTANT" || n.metadata.employmentType === "CONSULTANT") {
          fill = n.metadata.bgColor || "#ea580c"
          stroke = n.metadata.color || "#c2410c"
          textColor = n.metadata.textColor || "#ffffff"
        } else if (n.type === "REQUIRED_POSITION") {
          fill = n.metadata.bgColor || "#f8fafc"
          stroke = n.metadata.color || "#94a3b8"
          textColor = n.metadata.textColor || "#334155"
        } else {
          fill = n.metadata.bgColor || "#ffffff"
          stroke = n.metadata.color || "#94a3b8"
          textColor = n.metadata.textColor || "#0f172a"
        }

        const subtitle =
          n.metadata.departmentCode ||
          n.metadata.code ||
          n.metadata.designation ||
          (n.type === "REQUIRED_POSITION" && n.metadata.requiredQuantity ? `${n.metadata.requiredQuantity} Vacancies` : "") ||
          ""
        const subColor = textColor === "#ffffff" ? (n.type === "DEPARTMENT" ? "#bfdbfe" : n.type === "ORGANIZATION" ? "#ffedd5" : "#cbd5e1") : "#64748b"

        return `
        <g>
          <rect x="${n.position.x}" y="${n.position.y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.75" />
          <text x="${cx}" y="${n.position.y + 22}" text-anchor="middle" class="card-title" fill="${textColor}">${n.label}</text>
          ${subtitle ? `<text x="${cx}" y="${n.position.y + 38}" text-anchor="middle" class="card-sub" fill="${subColor}">${subtitle}</text>` : ""}
        </g>
      `
      })
      .join("")}
  </g>

  <!-- Bottom Matrix Footer (Exact Match to Image 2) -->
  <g transform="translate(0, 855)">
    <!-- White background & top divider -->
    <rect x="0" y="0" width="1600" height="245" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    
    <!-- Top Matrix Title Bar -->
    <rect x="0" y="0" width="1600" height="36" fill="#ffffff" />
    <line x1="0" y1="36" x2="1600" y2="36" stroke="#e2e8f0" stroke-width="1" />
    <rect x="28" y="8" width="20" height="20" rx="4" fill="rgba(22, 163, 74, 0.15)" />
    <text x="56" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5px" font-weight="bold" fill="#0f172a" letter-spacing="0.5">OPERATIONS &amp; LIVE MANPOWER RAG MATRIX</text>
    <text x="350" y="22" font-family="sans-serif" font-size="10.5px" fill="#64748b">${chart.siteLocation || "Transvolt Project Site"} &bull; Effective: ${chart.effectiveFrom || "2026-10-28"}</text>

    <!-- SECTION A (Col 1) -->
    <rect x="0" y="36" width="420" height="209" fill="#f8fafc" />
    <line x1="420" y1="36" x2="420" y2="245" stroke="#e2e8f0" stroke-width="1" />
    <text x="28" y="62" font-family="sans-serif" font-size="10.5px" font-weight="800" fill="#2563eb" letter-spacing="0.5">SECTION A: PROJECT INFORMATION</text>
    <text x="28" y="88" font-family="sans-serif" font-size="10.5px" fill="#64748b">Company:</text>
    <text x="400" y="88" text-anchor="end" font-family="sans-serif" font-size="10.5px" font-weight="bold" fill="#0f172a">${chart.companyName || "Transvolt Mobility Private Limited"}</text>
    <text x="28" y="112" font-family="sans-serif" font-size="10.5px" fill="#64748b">Site / Location:</text>
    <text x="400" y="112" text-anchor="end" font-family="sans-serif" font-size="10.5px" font-weight="bold" fill="#0f172a">${chart.siteLocation || "Site Operations"}</text>
    <text x="28" y="136" font-family="sans-serif" font-size="10.5px" fill="#64748b">Project Manager:</text>
    <text x="400" y="136" text-anchor="end" font-family="sans-serif" font-size="10.5px" font-weight="bold" fill="#0f172a">${chart.projectManager || "Project Head"}</text>
    <text x="28" y="160" font-family="sans-serif" font-size="10.5px" fill="#64748b">Effective Date:</text>
    <text x="400" y="160" text-anchor="end" font-family="sans-serif" font-size="10.5px" font-weight="bold" fill="#16a34a">${chart.effectiveFrom || "2026-10-28"}</text>
    <line x1="28" y1="180" x2="400" y2="180" stroke="#cbd5e1" stroke-width="1" />
    <text x="28" y="202" font-family="sans-serif" font-size="10.5px" fill="#64748b">Total Personnel:</text>
    <text x="400" y="202" text-anchor="end" font-family="sans-serif" font-size="11px" font-weight="900" fill="#0f172a">${summary.totalAvailable} Active</text>

    <!-- SECTION B (Col 2) -->
    <rect x="420" y="36" width="760" height="209" fill="#ffffff" />
    <line x1="1180" y1="36" x2="1180" y2="245" stroke="#e2e8f0" stroke-width="1" />
    <text x="444" y="62" font-family="sans-serif" font-size="10.5px" font-weight="800" fill="#16a34a" letter-spacing="0.5">SECTION B: MANPOWER RAG MATRIX (LIVE AUTO-CALCULATED)</text>
    <rect x="444" y="76" width="712" height="24" rx="4" fill="#f1f5f9" />
    <text x="456" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">DEPARTMENT</text>
    <text x="640" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">EMP</text>
    <text x="730" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">CONS</text>
    <text x="820" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">AVAIL</text>
    <text x="910" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">REQ</text>
    <text x="1000" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">GAP</text>
    <text x="1100" y="92" font-family="sans-serif" font-size="9.5px" font-weight="bold" fill="#475569">STATUS</text>

    <!-- Total Manpower Row -->
    <rect x="444" y="180" width="712" height="32" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
    <text x="456" y="200" font-family="sans-serif" font-size="10.5px" font-weight="bold" fill="#0f172a">Total Manpower</text>
    <text x="640" y="200" font-family="monospace" font-size="10.5px" font-weight="bold" fill="#16a34a">${summary.totalEmployees}</text>
    <text x="730" y="200" font-family="monospace" font-size="10.5px" font-weight="bold" fill="#ea580c">${summary.totalConsultants}</text>
    <text x="820" y="200" font-family="monospace" font-size="11px" font-weight="900" fill="#0f172a">${summary.totalAvailable}</text>
    <text x="910" y="200" font-family="monospace" font-size="10.5px" fill="#64748b">${summary.totalRequired}</text>
    <text x="1000" y="200" font-family="monospace" font-size="11px" font-weight="900" fill="#16a34a">+${summary.totalGap}</text>
    <rect x="1080" y="188" width="60" height="16" rx="3" fill="rgba(22, 163, 74, 0.15)" />
    <text x="1110" y="200" text-anchor="middle" font-family="sans-serif" font-size="9px" font-weight="bold" fill="#16a34a">${summary.ragStatus}</text>

    <!-- SECTION C (Col 3) -->
    <rect x="1180" y="36" width="420" height="209" fill="#f8fafc" />
    <text x="1204" y="62" font-family="sans-serif" font-size="10.5px" font-weight="800" fill="#2563eb" letter-spacing="0.5">SECTION C: FLEET &amp; INFRASTRUCTURE</text>
    <text x="1204" y="92" font-family="sans-serif" font-size="10px" font-weight="bold" fill="#0f172a">Electric Vehicles</text>
    <text x="1440" y="92" font-family="monospace" font-size="10px" font-weight="bold" fill="#0f172a">${footer?.vehicleMatrix?.vehicles?.available || 50} Avail</text>
    <text x="1540" y="92" font-family="monospace" font-size="10px" font-weight="bold" fill="#16a34a">+0 Gap</text>
    <text x="1204" y="122" font-family="sans-serif" font-size="10px" font-weight="bold" fill="#0f172a">EV Chargers</text>
    <text x="1440" y="122" font-family="monospace" font-size="10px" font-weight="bold" fill="#0f172a">${footer?.vehicleMatrix?.chargers?.available || 8} Avail</text>
    <text x="1540" y="122" font-family="monospace" font-size="10px" font-weight="bold" fill="#16a34a">+0 Gap</text>
    <text x="1204" y="152" font-family="sans-serif" font-size="10px" font-weight="bold" fill="#0f172a">Charging Bays</text>
    <text x="1440" y="152" font-family="monospace" font-size="10px" font-weight="bold" fill="#0f172a">${footer?.vehicleMatrix?.infrastructure?.available || 4} Avail</text>
    <text x="1540" y="152" font-family="monospace" font-size="10px" font-weight="bold" fill="#16a34a">+0 Gap</text>
    <line x1="1204" y1="180" x2="1570" y2="180" stroke="#cbd5e1" stroke-width="1" />
    <text x="1204" y="202" font-family="sans-serif" font-size="10px" fill="#64748b">Fleet Status: <tspan font-weight="bold" fill="#16a34a">100% Operational</tspan></text>
  </g>
</svg>
  `

  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${chart.title.replace(/\s+/g, "_")}_Page_${pageNumber}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export Organization Chart to PNG with formal White Canvas, Header and Matrix Footer
 */
export function exportOrgChartToPng(
  chart: OrganizationChart,
  options?: ExportScopeOptions
): void {
  const pages = getPagesToExport(chart, options)
  const targetPage = pages[0]
  const { pageNumber, title: pageTitle, nodes, connections, boundaries, shapes = [], footer } = targetPage
  const summary = calculateManpowerSummary(nodes, footer)

  const { scale, transX, transY } = calculateAutoFitTransform(
    nodes,
    boundaries,
    shapes,
    targetPage.annotations || [],
    { left: 24, top: 82, width: 1552, height: 778 }
  )

  const canvas = document.createElement("canvas")
  canvas.width = 1600 * 2 // High-DPI 2x
  canvas.height = 1100 * 2
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.scale(2, 2)

  // White Canvas Background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, 1600, 1100)

  // 1. Executive Top Header (Solid Black Banner)
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, 1600, 60)

  // Left Title & Subtitle
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 16.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "left"
  ctx.fillText(chart.title || "Name of the Organization Chart", 32, 27)

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillText("Organization Structure", 32, 46)

  // Right Logo TRANSVOLT >>®
  ctx.fillStyle = "#ffffff"
  ctx.font = "900 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "right"
  ctx.fillText("TRANSVOLT", 1520, 36)

  // Chevron 1 (Green)
  ctx.fillStyle = "#548235"
  ctx.beginPath()
  ctx.moveTo(1530, 22)
  ctx.lineTo(1537, 22)
  ctx.lineTo(1543, 31)
  ctx.lineTo(1537, 40)
  ctx.lineTo(1530, 40)
  ctx.lineTo(1536, 31)
  ctx.closePath()
  ctx.fill()

  // Chevron 2 (Blue)
  ctx.fillStyle = "#4472C4"
  ctx.beginPath()
  ctx.moveTo(1539, 22)
  ctx.lineTo(1546, 22)
  ctx.lineTo(1552, 31)
  ctx.lineTo(1546, 40)
  ctx.lineTo(1539, 40)
  ctx.lineTo(1545, 31)
  ctx.closePath()
  ctx.fill()

  // Registered (R) symbol
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 9px sans-serif"
  ctx.textAlign = "left"
  ctx.fillText("®", 1554, 26)

  // Sub-header date row
  ctx.fillStyle = "#52525b"
  ctx.font = "9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "right"
  ctx.fillText(`Date Created: ${formatDateDMY(chart.createdAt)} | Date Updated: ${formatDateDMY(chart.updatedAt)}`, 1568, 76)

  // Middle auto-fit transformation
  ctx.save()
  ctx.translate(transX, transY)
  ctx.scale(scale, scale)

  // Boundaries
  boundaries.forEach((b) => {
    ctx.fillStyle = "#f8fafc"
    ctx.strokeStyle = b.color || "#cbd5e1"
    ctx.setLineDash([4, 4])
    ctx.strokeRect(b.position.x, b.position.y, b.width, b.height)
    ctx.fillRect(b.position.x, b.position.y, b.width, b.height)
    ctx.setLineDash([])
    ctx.fillStyle = "#475569"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText(b.title, b.position.x + 14, b.position.y + 22)
  })

  // Connectors
  ctx.strokeStyle = "#64748b"
  ctx.lineWidth = 1.75
  connections.forEach((c) => {
    const sNode = nodes.find((n) => n.id === c.source)
    const tNode = nodes.find((n) => n.id === c.target)
    if (!sNode || !tNode) return
    const sx = sNode.position.x + (sNode.width || 180) / 2
    const sy = sNode.position.y + (sNode.height || 60)
    const tx = tNode.position.x + (tNode.width || 180) / 2
    const ty = tNode.position.y
    const midY = sy + (ty - sy) / 2

    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx, midY)
    ctx.lineTo(tx, midY)
    ctx.lineTo(tx, ty)
    ctx.stroke()
  })

  // Nodes
  nodes.forEach((n) => {
    const w = n.width || 190
    const h = n.height || 60
    const cx = n.position.x + w / 2

    let fill = "#ffffff"
    let stroke = "#94a3b8"
    let textColor = "#0f172a"

    if (n.type === "ORGANIZATION") {
      fill = n.metadata.bgColor || "#c2410c"
      stroke = n.metadata.color || "#9a3412"
      textColor = n.metadata.textColor || "#ffffff"
    } else if (n.type === "EXECUTIVE" || n.type === "MANAGEMENT") {
      fill = n.metadata.bgColor || "#0f172a"
      stroke = n.metadata.color || "#1e293b"
      textColor = n.metadata.textColor || "#ffffff"
    } else if (n.type === "DEPARTMENT") {
      fill = n.metadata.bgColor || "#1e40af"
      stroke = n.metadata.color || "#1e3a8a"
      textColor = n.metadata.textColor || "#ffffff"
    } else if (n.type === "HOD" || n.metadata.employmentType === "HOD") {
      fill = n.metadata.bgColor || "#15803d"
      stroke = n.metadata.color || "#166534"
      textColor = n.metadata.textColor || "#ffffff"
    } else if (n.type === "CONSULTANT" || n.metadata.employmentType === "CONSULTANT") {
      fill = n.metadata.bgColor || "#ea580c"
      stroke = n.metadata.color || "#c2410c"
      textColor = n.metadata.textColor || "#ffffff"
    } else if (n.type === "REQUIRED_POSITION") {
      fill = n.metadata.bgColor || "#f8fafc"
      stroke = n.metadata.color || "#94a3b8"
      textColor = n.metadata.textColor || "#334155"
    } else {
      fill = n.metadata.bgColor || "#ffffff"
      stroke = n.metadata.color || "#94a3b8"
      textColor = n.metadata.textColor || "#0f172a"
    }

    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(n.position.x, n.position.y, w, h, 12)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = "bold 11px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(n.label, cx, n.position.y + 22)

    const subtitle =
      n.metadata.departmentCode ||
      n.metadata.code ||
      n.metadata.designation ||
      (n.type === "REQUIRED_POSITION" && n.metadata.requiredQuantity ? `${n.metadata.requiredQuantity} Vacancies` : "") ||
      ""

    if (subtitle) {
      ctx.fillStyle = textColor === "#ffffff" ? (n.type === "DEPARTMENT" ? "#bfdbfe" : n.type === "ORGANIZATION" ? "#ffedd5" : "#cbd5e1") : "#64748b"
      ctx.font = "10px sans-serif"
      ctx.fillText(subtitle, cx, n.position.y + 38)
    }
  })

  ctx.restore()

  // Bottom Operations & Live Manpower RAG Matrix (Exact Match to Image 2)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 855, 1600, 245)
  ctx.strokeStyle = "#cbd5e1"
  ctx.lineWidth = 1
  ctx.strokeRect(0, 855, 1600, 245)

  // Top Bar
  ctx.fillStyle = "#16a34a"
  ctx.fillRect(28, 865, 16, 16)
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "left"
  ctx.fillText("OPERATIONS & LIVE MANPOWER RAG MATRIX", 52, 878)
  ctx.fillStyle = "#64748b"
  ctx.font = "10.5px sans-serif"
  ctx.fillText(`${chart.siteLocation || "Transvolt Project Site"} • Effective: ${chart.effectiveFrom || "2026-10-28"}`, 360, 878)

  // Section A
  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(0, 891, 420, 209)
  ctx.strokeStyle = "#e2e8f0"
  ctx.beginPath()
  ctx.moveTo(420, 891)
  ctx.lineTo(420, 1100)
  ctx.stroke()
  ctx.fillStyle = "#2563eb"
  ctx.font = "bold 10.5px sans-serif"
  ctx.fillText("SECTION A: PROJECT INFORMATION", 28, 915)
  ctx.fillStyle = "#64748b"
  ctx.font = "10.5px sans-serif"
  ctx.fillText("Company: " + (chart.companyName || "Transvolt Mobility Private Limited"), 28, 940)
  ctx.fillText("Site: " + (chart.siteLocation || "Site Operations"), 28, 965)
  ctx.fillText("Project Manager: " + (chart.projectManager || "Project Head"), 28, 990)
  ctx.fillText("Effective Date: " + (chart.effectiveFrom || "2026-10-28"), 28, 1015)
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 11px sans-serif"
  ctx.fillText(`Total Personnel: ${summary.totalAvailable} Active`, 28, 1055)

  // Section B
  ctx.fillStyle = "#16a34a"
  ctx.font = "bold 10.5px sans-serif"
  ctx.fillText("SECTION B: MANPOWER RAG MATRIX (LIVE AUTO-CALCULATED)", 444, 915)
  ctx.fillStyle = "#f1f5f9"
  ctx.fillRect(444, 930, 712, 24)
  ctx.fillStyle = "#475569"
  ctx.font = "bold 9.5px sans-serif"
  ctx.fillText("DEPARTMENT", 456, 946)
  ctx.fillText("EMP", 640, 946)
  ctx.fillText("CONS", 730, 946)
  ctx.fillText("AVAIL", 820, 946)
  ctx.fillText("REQ", 910, 946)
  ctx.fillText("GAP", 1000, 946)
  ctx.fillText("STATUS", 1100, 946)

  // Total Manpower Row
  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(444, 1030, 712, 32)
  ctx.strokeRect(444, 1030, 712, 32)
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 10.5px sans-serif"
  ctx.fillText("Total Manpower", 456, 1050)
  ctx.fillStyle = "#16a34a"
  ctx.fillText(String(summary.totalEmployees), 640, 1050)
  ctx.fillStyle = "#ea580c"
  ctx.fillText(String(summary.totalConsultants), 730, 1050)
  ctx.fillStyle = "#0f172a"
  ctx.font = "900 11px sans-serif"
  ctx.fillText(String(summary.totalAvailable), 820, 1050)
  ctx.fillStyle = "#64748b"
  ctx.font = "bold 10.5px sans-serif"
  ctx.fillText(String(summary.totalRequired), 910, 1050)
  ctx.fillStyle = "#16a34a"
  ctx.font = "900 11px sans-serif"
  ctx.fillText(`+${summary.totalGap}`, 1000, 1050)
  ctx.fillText(`[${summary.ragStatus}]`, 1100, 1050)

  // Section C
  ctx.beginPath()
  ctx.moveTo(1180, 891)
  ctx.lineTo(1180, 1100)
  ctx.stroke()
  ctx.fillStyle = "#2563eb"
  ctx.font = "bold 10.5px sans-serif"
  ctx.fillText("SECTION C: FLEET & INFRASTRUCTURE", 1204, 915)
  ctx.fillStyle = "#0f172a"
  ctx.font = "10px sans-serif"
  ctx.fillText(`Electric Vehicles: ${footer?.vehicleMatrix?.vehicles?.available || 50} Avail | +0 Gap`, 1204, 945)
  ctx.fillText(`EV Chargers: ${footer?.vehicleMatrix?.chargers?.available || 8} Avail | +0 Gap`, 1204, 975)
  ctx.fillText(`Charging Bays: ${footer?.vehicleMatrix?.infrastructure?.available || 4} Avail | +0 Gap`, 1204, 1005)
  ctx.fillStyle = "#16a34a"
  ctx.font = "bold 10px sans-serif"
  ctx.fillText("Fleet Status: 100% Operational • Audit: Approved", 1204, 1055)

  const url = canvas.toDataURL("image/png")
  const a = document.createElement("a")
  a.href = url
  a.download = `${chart.title.replace(/\s+/g, "_")}_Page_${pageNumber}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
