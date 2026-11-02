import { PORTAL_REQUIREMENTS_DATA, PortalRequirementDoc } from "./requirement-document-data"

export function generateWordDocumentHtml(doc: PortalRequirementDoc = PORTAL_REQUIREMENTS_DATA): string {
  const dateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${doc.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1E293B;
      background-color: #FFFFFF;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: bold;
      color: #548235;
      margin-bottom: 8pt;
      line-height: 1.2;
    }
    .cover-subtitle {
      font-size: 15.5pt;
      color: #475569;
      margin-bottom: 24pt;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28pt;
    }
    .meta-table td {
      padding: 7pt 12pt;
      border: 1pt solid #E2E8F0;
      font-size: 11pt;
    }
    .meta-label {
      font-weight: bold;
      background-color: #F8FAFC;
      color: #334155;
      width: 25%;
    }
    h1 {
      font-size: 22pt;
      font-weight: bold;
      color: #548235;
      border-bottom: 2pt solid #548235;
      padding-bottom: 4pt;
      margin-top: 24pt;
      margin-bottom: 12pt;
    }
    h2 {
      font-size: 16.5pt;
      font-weight: bold;
      color: #1E293B;
      border-bottom: 1pt solid #CBD5E1;
      padding-bottom: 3pt;
      margin-top: 20pt;
      margin-bottom: 8pt;
    }
    h3 {
      font-size: 13.5pt;
      font-weight: bold;
      color: #548235;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    p {
      margin-bottom: 10pt;
      text-align: justify;
    }
    ul, ol {
      margin-top: 4pt;
      margin-bottom: 12pt;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 5pt;
    }
    .badge {
      display: inline-block;
      background-color: #548235;
      color: #FFFFFF;
      font-size: 10pt;
      font-weight: bold;
      padding: 3pt 9pt;
      border-radius: 4pt;
      margin-bottom: 6pt;
    }
    .problem-box {
      background-color: #FFF1F2;
      border-left: 5pt solid #E11D48;
      border-top: 1pt solid #FFE4E6;
      border-right: 1pt solid #FFE4E6;
      border-bottom: 1pt solid #FFE4E6;
      padding: 10pt 14pt;
      margin: 12pt 0;
    }
    .problem-title {
      font-size: 12pt;
      font-weight: bold;
      color: #9F1239;
      margin-bottom: 4pt;
    }
    .solution-box {
      background-color: #F0FDF4;
      border-left: 5pt solid #16A34A;
      border-top: 1pt solid #DCFCE7;
      border-right: 1pt solid #DCFCE7;
      border-bottom: 1pt solid #DCFCE7;
      padding: 10pt 14pt;
      margin: 12pt 0;
    }
    .solution-title {
      font-size: 12pt;
      font-weight: bold;
      color: #166534;
      margin-bottom: 4pt;
    }
    .toc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16pt 0;
    }
    .toc-table td {
      padding: 5pt 10pt;
      border-bottom: 1pt dotted #CBD5E1;
      font-size: 11.5pt;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- COVER / HEADER -->
    <div style="border-bottom: 4pt solid #548235; padding-bottom: 16pt; margin-bottom: 20pt;">
      <div style="font-size: 12pt; font-weight: bold; color: #548235; text-transform: uppercase; letter-spacing: 1pt; margin-bottom: 6pt;">
        Transvolt Mobility Private Limited
      </div>
      <div class="cover-title">${doc.title}</div>
      <div class="cover-subtitle">Enterprise Software Requirements Specification (SRS) & Complete Product Requirement Document (PRD)</div>
    </div>

    <!-- METADATA TABLE -->
    <table class="meta-table">
      <tr>
        <td class="meta-label">Document ID:</td>
        <td><strong>${doc.documentId}</strong></td>
        <td class="meta-label">Document Version:</td>
        <td><strong>${doc.version}</strong></td>
      </tr>
      <tr>
        <td class="meta-label">Organization:</td>
        <td>${doc.organization}</td>
        <td class="meta-label">Effective Date:</td>
        <td>${dateFormatted}</td>
      </tr>
      <tr>
        <td class="meta-label">Author / Group:</td>
        <td>${doc.author}</td>
        <td class="meta-label">Classification:</td>
        <td>Confidential — Transvolt Internal & Partner Governance</td>
      </tr>
    </table>

    <!-- TABLE OF CONTENTS -->
    <h2>Table of Contents</h2>
    <table class="toc-table">
      <tr>
        <td><strong>1. Executive Portal Requirement Overview</strong></td>
        <td style="text-align: right; color: #64748B;">Section 1</td>
      </tr>
      <tr>
        <td><strong>2. Architectural Pillars & Core System Goals</strong></td>
        <td style="text-align: right; color: #64748B;">Section 2</td>
      </tr>
      <tr>
        <td><strong>3. Comprehensive Module-by-Module Specifications (${doc.modules.length} Modules)</strong></td>
        <td style="text-align: right; color: #64748B;">Section 3</td>
      </tr>
      ${doc.modules
        .map(
          (m, idx) => `
      <tr>
        <td style="padding-left: 20pt;">3.${idx + 1} ${m.title} (${m.route})</td>
        <td style="text-align: right; color: #64748B;">Module ${idx + 1}</td>
      </tr>`
        )
        .join("")}
      <tr>
        <td><strong>4. Security, Multi-Tenancy & Zero-Trust RBAC Model</strong></td>
        <td style="text-align: right; color: #64748B;">Section 4</td>
      </tr>
      <tr>
        <td><strong>5. Non-Functional Requirements & Performance SLAs</strong></td>
        <td style="text-align: right; color: #64748B;">Section 5</td>
      </tr>
    </table>

    <div class="page-break"></div>

    <!-- SECTION 1: EXECUTIVE PORTAL REQUIREMENT -->
    <h1>1. Executive Portal Requirement Overview</h1>
    <p><strong>${doc.executiveSummaryParagraph}</strong></p>

    <h3>Key Enterprise Capabilities & Core System Requirements:</h3>
    <ul>
      ${doc.executiveSummaryPoints.map((pt) => `<li>${pt}</li>`).join("")}
    </ul>

    <!-- SECTION 2: ARCHITECTURAL PILLARS -->
    <h1>2. Architectural Pillars & Core System Goals</h1>
    ${doc.architecturalPillars
      .map(
        (p) => `
    <h3>${p.title}</h3>
    <p>${p.description}</p>`
      )
      .join("")}

    <div class="page-break"></div>

    <!-- SECTION 3: MODULE SPECIFICATIONS -->
    <h1>3. Comprehensive Module-by-Module Specifications</h1>
    <p>The following subsections detail every page and operational module deployed inside the Transvolt Branding Portal V4, including functional requirements, the exact operational problem addressed, and the engineered solution implemented.</p>

    ${doc.modules
      .map(
        (m, idx) => `
    <div style="margin-top: 24pt; border-top: 1pt solid #E2E8F0; padding-top: 16pt;">
      <span class="badge">${m.category}</span>
      ${m.badge === 'Hold' ? '<span class="badge" style="background-color: #D97706; margin-left: 4pt;">STATUS: ON HOLD</span>' : ''}
      <h2>3.${idx + 1} ${m.title} <span style="font-size: 11pt; color: #64748B; font-weight: normal;">(Route: ${m.route})</span></h2>

      <h3>1. Module Requirements & Operational Scope</h3>
      <p>${m.requirementParagraph}</p>
      
      <p><strong>Functional Specifications:</strong></p>
      <ul>
        ${m.requirementPoints.map((rp) => `<li>${rp}</li>`).join("")}
      </ul>

      <!-- PROBLEM CALLOUT -->
      <div class="problem-box">
        <div class="problem-title">OPERATIONAL PROBLEM: ${m.problem.title}</div>
        <p style="margin-bottom: 6pt; color: #881337;">${m.problem.description}</p>
        <p style="margin-bottom: 4pt; font-weight: bold; color: #9F1239; font-size: 10pt;">Direct Business & Operational Impacts:</p>
        <ul style="color: #9F1239; margin-bottom: 0;">
          ${m.problem.impactPoints.map((ip) => `<li>${ip}</li>`).join("")}
        </ul>
      </div>

      <!-- SOLUTION CALLOUT -->
      <div class="solution-box">
        <div class="solution-title">ENGINEERED SOLUTION: ${m.solution.title}</div>
        <p style="margin-bottom: 6pt; color: #14532D;">${m.solution.description}</p>
        <p style="margin-bottom: 4pt; font-weight: bold; color: #166534; font-size: 10pt;">Key Solution Deliverables in Portal V4:</p>
        <ul style="color: #166534; margin-bottom: 0;">
          ${m.solution.keyFeatures.map((kf) => `<li>${kf}</li>`).join("")}
        </ul>
      </div>
    </div>`
      )
      .join("")}

    <div class="page-break"></div>

    <!-- SECTION 4: SECURITY & RBAC -->
    <h1>4. Security, Multi-Tenancy & Zero-Trust RBAC Model</h1>
    <p>Transvolt Branding Portal V4 enforces a defense-in-depth zero-trust architecture. All user sessions are authenticated using encrypted HTTP-only session cookies with rigorous cryptographic validation. Access control is enforced at both the application router and the individual component level through a 10-point granular permission model:</p>
    <ul>
      <li><strong>View Only:</strong> Permits asset inspection without download or mutation rights.</li>
      <li><strong>Download:</strong> Allows local retrieval of digital and vector assets.</li>
      <li><strong>Share:</strong> Enables link generation for authorized external stakeholders.</li>
      <li><strong>Upload:</strong> Permits adding new assets to approved categories and folders.</li>
      <li><strong>Replace:</strong> Allows updating existing files while preserving canonical IDs.</li>
      <li><strong>Hold:</strong> Freezes assets under administrative or legal review.</li>
      <li><strong>Delete (High Risk):</strong> Strictly gated removal of assets with audit logging.</li>
      <li><strong>Create New Groups (High Risk):</strong> Permits creating new asset taxonomy groupings.</li>
      <li><strong>Add Company (High Risk):</strong> Authorizes creating new legal entity masters.</li>
      <li><strong>Site Management (High Risk):</strong> Allows managing physical depot operating sites.</li>
    </ul>

    <!-- SECTION 5: NON-FUNCTIONAL REQUIREMENTS -->
    <h1>5. Non-Functional Requirements & Performance SLAs</h1>
    <table class="meta-table">
      <tr>
        <td class="meta-label">Performance & Latency:</td>
        <td>Sub-800ms initial page load, sub-200ms client-side route transitions, 60fps canvas vector rendering in Eva Design Tool.</td>
      </tr>
      <tr>
        <td class="meta-label">Availability & Reliability:</td>
        <td>99.9% uptime target with automated failover and local browser persistence for active forms.</td>
      </tr>
      <tr>
        <td class="meta-label">Browser Compatibility:</td>
        <td>Modern evergreen Chromium (Chrome, Edge, Brave), Firefox, and Safari on Desktop and Mobile.</td>
      </tr>
      <tr>
        <td class="meta-label">Data Integrity & Privacy:</td>
        <td>End-to-end sanitization of candidate submissions, encrypted storage of identity documents, and zero transmission of sensitive keys.</td>
      </tr>
    </table>

    <div style="margin-top: 36pt; border-top: 1pt solid #CBD5E1; padding-top: 12pt; text-align: center; color: #64748B; font-size: 9pt;">
      © 2026 Transvolt Mobility Private Limited. All Rights Reserved. Confidential & Proprietary Document.
    </div>
  </div>
</body>
</html>`
}

export function downloadWordDocument(doc: PortalRequirementDoc = PORTAL_REQUIREMENTS_DATA, filename: string = "Transvolt_Branding_Portal_V4_Complete_Requirement_Document.doc") {
  const htmlContent = generateWordDocumentHtml(doc)
  const blob = new Blob(["\ufeff", htmlContent], {
    type: "application/msword;charset=utf-8",
  })

  const downloadUrl = URL.createObjectURL(blob)
  const downloadLink = document.createElement("a")
  downloadLink.href = downloadUrl
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadUrl)
}

