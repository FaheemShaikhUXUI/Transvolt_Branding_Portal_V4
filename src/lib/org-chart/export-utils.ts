import { OrganizationChart } from "./types"

export function exportOrgChartToPrintPdf(chart: OrganizationChart): void {
  const printWindow = window.open("", "_blank", "width=1200,height=800")
  if (!printWindow) {
    alert("Please allow popups to download/print the Organization Chart PDF.")
    return
  }

  // Calculate overall bounding box
  let maxX = 1600
  let maxY = 1100

  chart.nodes.forEach((n) => {
    maxX = Math.max(maxX, n.position.x + (n.width || 200) + 60)
    maxY = Math.max(maxY, n.position.y + (n.height || 64) + 60)
  })
  if (chart.footer.enabled) {
    maxY += 350
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${chart.title} - Official Organization Chart</title>
  <style>
    @page {
      size: A3 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 16px;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #548235;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header-left h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }
    .header-left p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #475569;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .header-right strong {
      color: #0f172a;
    }
    .chart-container {
      position: relative;
      width: ${maxX}px;
      min-height: ${maxY}px;
      margin: 0 auto;
    }
    .boundary-box {
      position: absolute;
      border: 1px dashed #cbd5e1;
      background: #f8fafc;
      border-radius: 12px;
      z-index: 1;
    }
    .boundary-title {
      position: absolute;
      top: 10px;
      left: 16px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #475569;
    }
    .node-card {
      position: absolute;
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      background: #ffffff;
    }
    .node-executive {
      background: #0f172a;
      color: #ffffff;
      border: 2px solid #1e293b;
    }
    .node-management {
      background: #1e3a8a;
      color: #ffffff;
      border: 2px solid #2563eb;
    }
    .node-dept {
      background: #2563eb;
      color: #ffffff;
      border: 1px solid #1d4ed8;
      font-weight: 700;
    }
    .node-employee {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #0f172a;
    }
    .node-consultant {
      background: #faf5ff;
      border: 1px solid #d8b4fe;
      color: #581c87;
    }
    .node-required {
      background: #fffbeb;
      border: 1px dashed #f59e0b;
      color: #b45309;
    }
    .node-title {
      font-size: 12px;
      font-weight: 700;
      margin: 0;
    }
    .node-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .node-badge {
      display: inline-block;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 9999px;
      margin-top: 4px;
      font-weight: 600;
    }
    .footer-container {
      margin-top: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      background: #f8fafc;
      page-break-inside: avoid;
    }
    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 8px;
    }
    .matrix-table th, .matrix-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: center;
    }
    .matrix-table th {
      background: #e2e8f0;
      font-weight: 700;
    }
    .no-print {
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #548235;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="color: #548235; font-size: 15px;">Transvolt Organization Chart Export</strong>
      <p style="margin: 2px 0 0; font-size: 12px; color: #475569;">Ready for A3 / A4 Landscape print or Save as PDF.</p>
    </div>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header-bar">
    <div class="header-left">
      <h1>${chart.title}</h1>
      <p><strong>Site:</strong> ${chart.siteName} &bull; <strong>Location:</strong> ${chart.siteLocation} &bull; <strong>Status:</strong> ${chart.status}</p>
    </div>
    <div class="header-right">
      <p><strong>Version:</strong> ${chart.version}</p>
      <p><strong>Effective Date:</strong> ${chart.effectiveFrom}</p>
      <p><strong>Last Updated:</strong> ${new Date(chart.updatedAt).toLocaleDateString("en-IN")}</p>
    </div>
  </div>

  <div class="chart-container">
    <!-- Boundaries -->
    ${chart.boundaries
      .map(
        (b) => `
      <div class="boundary-box" style="left: ${b.position.x}px; top: ${b.position.y}px; width: ${b.width}px; height: ${b.height}px;">
        <span class="boundary-title">${b.title}</span>
      </div>
    `
      )
      .join("")}

    <!-- SVG Connectors -->
    <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
        </marker>
      </defs>
      ${chart.connections
        .map((c) => {
          const sNode = chart.nodes.find((n) => n.id === c.source)
          const tNode = chart.nodes.find((n) => n.id === c.target)
          if (!sNode || !tNode) return ""
          const sx = sNode.position.x + (sNode.width || 180) / 2
          const sy = sNode.position.y + (sNode.height || 60)
          const tx = tNode.position.x + (tNode.width || 180) / 2
          const ty = tNode.position.y
          const midY = sy + (ty - sy) / 2
          return `<path d="M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />`
        })
        .join("")}
    </svg>

    <!-- Nodes -->
    ${chart.nodes
      .map((n) => {
        let cls = "node-card node-employee"
        let badge = ""
        if (n.type === "EXECUTIVE") cls = "node-card node-executive"
        else if (n.type === "MANAGEMENT") cls = "node-card node-management"
        else if (n.type === "DEPARTMENT") cls = "node-card node-dept"
        else if (n.type === "CONSULTANT") {
          cls = "node-card node-consultant"
          badge = `<span class="node-badge" style="background: #f3e8ff; color: #7e22ce;">● Consultant</span>`
        } else if (n.type === "REQUIRED_POSITION") {
          cls = "node-card node-required"
          badge = `<span class="node-badge" style="background: #fef3c7; color: #b45309;">○ Required: ${n.metadata.requiredQuantity || 1}</span>`
        } else if (n.type === "EMPLOYEE") {
          badge = `<span class="node-badge" style="background: #dcfce7; color: #15803d;">● Employee</span>`
        }

        return `
        <div class="${cls}" style="left: ${n.position.x}px; top: ${n.position.y}px; width: ${n.width || 190}px; height: ${n.height || 64}px;">
          <p class="node-title">${n.label}</p>
          ${n.metadata.designation ? `<p class="node-sub">${n.metadata.designation}</p>` : ""}
          ${n.metadata.employeeId ? `<p class="node-sub" style="font-size: 9px;">${n.metadata.employeeId}</p>` : ""}
          ${badge}
        </div>
      `
      })
      .join("")}
  </div>

  ${
    chart.footer.enabled
      ? `
    <div class="footer-container">
      <div style="display: flex; justify-content: space-between; gap: 24px;">
        <div style="flex: 1;">
          <strong style="font-size: 12px; text-transform: uppercase; color: #475569;">Project Information</strong>
          <table class="matrix-table" style="margin-top: 6px;">
            <tr><td><strong>Project Name</strong></td><td>${chart.footer.projectInfo.projectName}</td></tr>
            <tr><td><strong>Location</strong></td><td>${chart.footer.projectInfo.projectLocation}</td></tr>
            <tr><td><strong>Project Code</strong></td><td>${chart.footer.projectInfo.projectCode}</td></tr>
            <tr><td><strong>Project Manager</strong></td><td>${chart.footer.projectInfo.projectManager}</td></tr>
            <tr><td><strong>Effective Date</strong></td><td>${chart.footer.projectInfo.effectiveDate}</td></tr>
          </table>
        </div>

        <div style="flex: 1.5;">
          <strong style="font-size: 12px; text-transform: uppercase; color: #475569;">Manpower RAG Matrix</strong>
          <table class="matrix-table" style="margin-top: 6px;">
            <thead>
              <tr>
                <th>Status</th>
                ${chart.footer.manpowerColumns.map((c) => `<th>${c.label}</th>`).join("")}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${chart.footer.manpowerRows
                .map((r) => {
                  let total = 0
                  chart.footer.manpowerColumns.forEach((col) => {
                    total += r.values[col.id] || 0
                  })
                  const colorStyle =
                    r.key === "GAP"
                      ? total < 0
                        ? "color: #dc2626; font-weight: bold;"
                        : "color: #16a34a; font-weight: bold;"
                      : ""
                  return `
                  <tr>
                    <td><strong>${r.label}</strong></td>
                    ${chart.footer.manpowerColumns
                      .map((col) => `<td>${r.values[col.id] ?? 0}</td>`)
                      .join("")}
                    <td style="${colorStyle}">${total}</td>
                  </tr>
                `
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div style="flex: 1;">
          <strong style="font-size: 12px; text-transform: uppercase; color: #475569;">Fleet & Assets</strong>
          <table class="matrix-table" style="margin-top: 6px;">
            <thead><tr><th>Asset</th><th>Req</th><th>Avl</th><th>Gap</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>Electric Vehicles</strong></td>
                <td>${chart.footer.vehicleMatrix.vehicles.required}</td>
                <td>${chart.footer.vehicleMatrix.vehicles.available}</td>
                <td style="color: ${chart.footer.vehicleMatrix.vehicles.available - chart.footer.vehicleMatrix.vehicles.required < 0 ? "#dc2626" : "#16a34a"}; font-weight: bold;">${chart.footer.vehicleMatrix.vehicles.available - chart.footer.vehicleMatrix.vehicles.required}</td>
              </tr>
              <tr>
                <td><strong>EV Chargers</strong></td>
                <td>${chart.footer.vehicleMatrix.chargers.required}</td>
                <td>${chart.footer.vehicleMatrix.chargers.available}</td>
                <td style="color: ${chart.footer.vehicleMatrix.chargers.available - chart.footer.vehicleMatrix.chargers.required < 0 ? "#dc2626" : "#16a34a"}; font-weight: bold;">${chart.footer.vehicleMatrix.chargers.available - chart.footer.vehicleMatrix.chargers.required}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      ${chart.footer.customNotes ? `<p style="margin: 12px 0 0; font-size: 11px; color: #64748b; font-style: italic;"><strong>Note:</strong> ${chart.footer.customNotes}</p>` : ""}
    </div>
  `
      : ""
  }
</body>
</html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

export function exportOrgChartToSvg(chart: OrganizationChart): void {
  let maxX = 1600
  let maxY = 1100

  chart.nodes.forEach((n) => {
    maxX = Math.max(maxX, n.position.x + (n.width || 200) + 80)
    maxY = Math.max(maxY, n.position.y + (n.height || 64) + 80)
  })

  let svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${maxX} ${maxY}" width="${maxX}" height="${maxY}">
  <style>
    .title { font-family: sans-serif; font-size: 20px; font-weight: bold; fill: #0f172a; }
    .sub { font-family: sans-serif; font-size: 12px; fill: #64748b; }
    .node-text { font-family: sans-serif; font-size: 12px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
    .node-text-dark { font-family: sans-serif; font-size: 12px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
    .node-subtext { font-family: sans-serif; font-size: 10px; fill: #64748b; text-anchor: middle; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" />
  <text x="40" y="50" class="title">${chart.title}</text>
  <text x="40" y="75" class="sub">Site: ${chart.siteLocation} | Version: ${chart.version} | Effective: ${chart.effectiveFrom}</text>

  <!-- Boundaries -->
  ${chart.boundaries
    .map(
      (b) => `
    <rect x="${b.position.x}" y="${b.position.y}" width="${b.width}" height="${b.height}" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="4 4" />
    <text x="${b.position.x + 16}" y="${b.position.y + 24}" font-family="sans-serif" font-size="11px" font-weight="bold" fill="#475569">${b.title}</text>
  `
    )
    .join("")}

  <!-- Connectors -->
  ${chart.connections
    .map((c) => {
      const sNode = chart.nodes.find((n) => n.id === c.source)
      const tNode = chart.nodes.find((n) => n.id === c.target)
      if (!sNode || !tNode) return ""
      const sx = sNode.position.x + (sNode.width || 180) / 2
      const sy = sNode.position.y + (sNode.height || 60)
      const tx = tNode.position.x + (tNode.width || 180) / 2
      const ty = tNode.position.y
      const midY = sy + (ty - sy) / 2
      return `<path d="M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}" fill="none" stroke="#64748b" stroke-width="1.5" />`
    })
    .join("")}

  <!-- Nodes -->
  ${chart.nodes
    .map((n) => {
      const w = n.width || 190
      const h = n.height || 64
      const cx = n.position.x + w / 2
      let fill = "#ffffff"
      let stroke = "#e2e8f0"
      let textColor = "node-text-dark"

      if (n.type === "EXECUTIVE") {
        fill = "#0f172a"
        stroke = "#1e293b"
        textColor = "node-text"
      } else if (n.type === "MANAGEMENT") {
        fill = "#1e3a8a"
        stroke = "#2563eb"
        textColor = "node-text"
      } else if (n.type === "DEPARTMENT") {
        fill = "#2563eb"
        stroke = "#1d4ed8"
        textColor = "node-text"
      } else if (n.type === "CONSULTANT") {
        fill = "#faf5ff"
        stroke = "#d8b4fe"
      } else if (n.type === "REQUIRED_POSITION") {
        fill = "#fffbeb"
        stroke = "#f59e0b"
      }

      return `
      <g>
        <rect x="${n.position.x}" y="${n.position.y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        <text x="${cx}" y="${n.position.y + 24}" class="${textColor}">${n.label}</text>
        ${n.metadata.designation ? `<text x="${cx}" y="${n.position.y + 40}" class="node-subtext">${n.metadata.designation}</text>` : ""}
      </g>
    `
    })
    .join("")}
</svg>
  `

  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${chart.title.replace(/\s+/g, "_")}_${chart.version}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportOrgChartToPng(chart: OrganizationChart): void {
  // Convert SVG to PNG via Image & Canvas
  let maxX = 1600
  let maxY = 1100

  chart.nodes.forEach((n) => {
    maxX = Math.max(maxX, n.position.x + (n.width || 200) + 80)
    maxY = Math.max(maxY, n.position.y + (n.height || 64) + 80)
  })

  // Create an offscreen canvas
  const canvas = document.createElement("canvas")
  canvas.width = maxX * 2 // 2x high DPI
  canvas.height = maxY * 2
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.scale(2, 2)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, maxX, maxY)

  // Title
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 22px sans-serif"
  ctx.fillText(chart.title, 40, 50)
  ctx.fillStyle = "#64748b"
  ctx.font = "12px sans-serif"
  ctx.fillText(
    `Site: ${chart.siteLocation} | Version: ${chart.version} | Effective: ${chart.effectiveFrom}`,
    40,
    75
  )

  // Boundaries
  chart.boundaries.forEach((b) => {
    ctx.fillStyle = "#f8fafc"
    ctx.strokeStyle = "#cbd5e1"
    ctx.setLineDash([4, 4])
    ctx.strokeRect(b.position.x, b.position.y, b.width, b.height)
    ctx.fillRect(b.position.x, b.position.y, b.width, b.height)
    ctx.setLineDash([])
    ctx.fillStyle = "#475569"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText(b.title, b.position.x + 16, b.position.y + 24)
  })

  // Connectors
  ctx.strokeStyle = "#64748b"
  ctx.lineWidth = 1.5
  chart.connections.forEach((c) => {
    const sNode = chart.nodes.find((n) => n.id === c.source)
    const tNode = chart.nodes.find((n) => n.id === c.target)
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
  chart.nodes.forEach((n) => {
    const w = n.width || 190
    const h = n.height || 64
    const cx = n.position.x + w / 2

    let fill = "#ffffff"
    let stroke = "#e2e8f0"
    let textColor = "#0f172a"

    if (n.type === "EXECUTIVE") {
      fill = "#0f172a"
      stroke = "#1e293b"
      textColor = "#ffffff"
    } else if (n.type === "MANAGEMENT") {
      fill = "#1e3a8a"
      stroke = "#2563eb"
      textColor = "#ffffff"
    } else if (n.type === "DEPARTMENT") {
      fill = "#2563eb"
      stroke = "#1d4ed8"
      textColor = "#ffffff"
    } else if (n.type === "CONSULTANT") {
      fill = "#faf5ff"
      stroke = "#d8b4fe"
      textColor = "#581c87"
    } else if (n.type === "REQUIRED_POSITION") {
      fill = "#fffbeb"
      stroke = "#f59e0b"
      textColor = "#b45309"
    }

    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(n.position.x, n.position.y, w, h, 6)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(n.label, cx, n.position.y + 24)

    if (n.metadata.designation) {
      ctx.fillStyle = textColor === "#ffffff" ? "#cbd5e1" : "#64748b"
      ctx.font = "10px sans-serif"
      ctx.fillText(n.metadata.designation, cx, n.position.y + 40)
    }
  })

  // Trigger download
  const url = canvas.toDataURL("image/png")
  const a = document.createElement("a")
  a.href = url
  a.download = `${chart.title.replace(/\s+/g, "_")}_${chart.version}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
