export interface CandidateInfo {
  fullName: string
  designation: string
  email: string
  contact: string
  emrContact: string
  bloodGroup: string
  employeeId: string
  company: string
  siteLocation: string
  photoUrl?: string
}

export interface CompanyRegularInfo {
  companyFullName: string
  companyAddress: string
  companyContact: string
  companyEmail: string
  companyWebsite: string
  companyLogoSvg: string
}

export function generateVCardString(candidate: CandidateInfo, company: CompanyRegularInfo): string {
  return `BEGIN:VCARD
VERSION:3.0
FN:${candidate.fullName || "Personnel"}
TITLE:${candidate.designation || ""}
ORG:${company.companyFullName || "Transvolt Mobility Private Limited"}
TEL;TYPE=CELL:${candidate.contact || ""}
EMAIL:${candidate.email || ""}
URL:${company.companyWebsite || "www.transvolt.in"}
END:VCARD`.trim()
}

export function toTitleCase(str: string): string {
  if (!str) return ""
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function generateVCardQrUrl(vCardString: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=L&margin=0&data=${encodeURIComponent(vCardString)}`
}

export function generateCardPrintHtml(
  candidate: CandidateInfo,
  company: CompanyRegularInfo,
  type: "both" | "id" | "business",
  origin?: string
): string {
  const qrUrl = generateVCardQrUrl(generateVCardString(candidate, company))
  
  // Use absolute URLs so logos load correctly in popup windows (about:blank)
  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  const logoWithTagline = `${baseOrigin}/logos/Logo_Black_Tagline.png`
  const basicLogo = `${baseOrigin}/logos/Logo_Black.svg`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <base href="${baseOrigin}/">
  <title>${candidate.fullName || "Personnel"} - Transvolt Card Artwork</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
    
    *, ::before, ::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-variant-numeric: normal !important;
      font-feature-settings: "zero" 0 !important;
    }
    
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-variant-numeric: normal !important;
      font-feature-settings: "zero" 0 !important;
    }

    .no-print {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 900px;
      margin: 0 auto 24px auto;
      padding: 16px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }

    .btn-print {
      background: #548235;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(84, 130, 53, 0.3);
      transition: all 0.2s;
    }
    .btn-print:hover {
      background: #44692a;
    }

    .btn-close {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      margin-left: 10px;
    }

    .print-sheet {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #548235;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #548235;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }

    .cards-row {
      display: flex;
      gap: 32px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .card-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .dimension-label {
      font-size: 11px;
      font-weight: 700;
      color: #dc2626;
      font-family: 'Poppins', sans-serif;
    }

    /* ID Card (54mm x 86mm) - STRICT STRAIGHT BORDER */
    .id-card {
      width: 54mm;
      height: 86mm;
      background: white;
      border: 1px solid #000;
      border-radius: 0 !important; /* STRICT NO CURVED BORDER */
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
    }

    /* ID Front Specific Spacing */
    .id-front-content {
      padding-top: 12.8mm; /* Moved 2% higher */
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .id-logo-img {
      width: 35.7mm; /* 5% larger logo */
      height: auto;
      display: block;
      margin: 0 auto;
    }

    .id-photo-box {
      width: 18.5mm;
      height: 22.5mm;
      background: #e9eef7;
      border: 1px solid #b8c6dc;
      border-radius: 1.5mm;
      margin: 4.8mm auto 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6.5pt;
      color: #8fa1bc;
      font-weight: 500;
      overflow: hidden;
    }
    .id-photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .id-name {
      font-size: 8.8pt;
      font-weight: 700;
      text-align: center;
      color: #111;
      line-height: 1.18;
      margin-top: 4.0mm; /* Equal gap above name */
      padding: 0 2.5mm;
      word-break: break-word;
    }

    .id-details-list {
      margin-top: 4.0mm; /* Equal gap below name */
      margin-bottom: 5.1mm; /* Exact 6.0% gap from Blood Group to Blue Belt */
      padding: 0 5.1mm; /* Exact 9.5% left margin */
      display: flex;
      flex-direction: column;
      gap: 1.1mm;
      font-size: 6.2pt; /* Exact proportional text */
      color: #1a1a1a;
      line-height: 1.25;
    }
    .id-detail-row {
      display: flex;
      align-items: center;
    }
    .id-detail-lbl {
      width: 24.5mm; /* Exact 54.6% value alignment */
      flex-shrink: 0;
      color: #1a1a1a;
      font-weight: normal;
      text-align: left;
    }
    .id-detail-val {
      flex: 1;
      font-family: inherit;
      font-weight: normal;
      font-size: 6.2pt;
      color: #1a1a1a;
      white-space: nowrap;
      text-align: left;
    }

    .id-footer-strip {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8.2mm; /* Exact 9.5% belt height */
      background: #3b6fb6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6.2pt;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* ID Back Specific Spacing - Exact Proportions from User Reference */
    .id-back-content {
      padding-top: 20.9mm; /* Exact 24.3% top offset */
      height: 100%;
    }

    .id-back-notice {
      margin-top: 19.0mm; /* Exact 22.1% gap from logo */
      text-align: center;
      font-size: 6.0pt;
      font-weight: 700;
      color: #737373;
    }

    .id-back-address {
      margin-top: 5.8mm; /* Exact 6.8% gap from notice */
      padding-left: 5.3mm; /* Exact 9.9% left margin */
      padding-right: 4mm;
      text-align: left;
    }
    .id-back-address .company-name {
      display: block;
      font-size: 6.8pt;
      font-weight: 700;
      color: #111;
      margin-bottom: 0.8mm;
      line-height: 1.2;
    }
    .id-back-address .address-text {
      font-size: 5.6pt;
      font-weight: 400;
      color: #222;
      line-height: 1.35;
    }

    .id-back-contact {
      margin-top: 4.8mm; /* Exact 5.6% gap from address */
      padding-left: 5.3mm; /* Exact 9.9% left margin */
      padding-right: 4mm;
      text-align: left;
      font-size: 5.6pt;
      font-weight: 400;
      color: #222;
      line-height: 1.38;
    }

    /* Business Card (89mm x 51mm) - STRICTLY NO CURVED BORDER (Straight Edge) */
    .business-card {
      width: 89mm;
      height: 51mm;
      background: white;
      border: 1px solid #1e293b;
      border-radius: 0 !important; /* STRICT NO CURVED BORDER */
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 5.5mm; /* Equal padding to all four sides (+5% increase) */
      page-break-inside: avoid;
    }

    .biz-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2.5mm;
    }
    .biz-name-col {
      flex: 1;
      min-width: 0;
      padding-right: 1mm;
    }
    .biz-emp-name {
      font-size: 6.5pt; /* Reduced by 15% */
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.01em;
      line-height: 1.18;
      word-break: break-word;
    }
    .biz-designation {
      font-size: 5.4pt;
      font-weight: 500;
      color: #334155;
      margin-top: 0.5mm;
      line-height: 1.25;
      word-break: break-word;
    }

    /* Basic Logo on Front - Proportional to Modal Preview (33.5mm vs 89mm width = ~37.6%) */
    .biz-logo-basic {
      width: 33.5mm;
      height: auto;
      display: block;
      flex-shrink: 0;
      transform: translateY(-0.8mm);
    }

    .biz-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 3mm;
    }

    .biz-company-name {
      font-size: 6.2pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.5mm;
      letter-spacing: 0.01em;
    }

    .biz-contact-list {
      font-size: 5.2pt;
      color: #334155;
      line-height: 1.38;
      max-width: 56mm;
    }
    .biz-contact-item {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      margin-bottom: 0.4mm;
    }
    .biz-icon-box {
      width: 2.8mm;
      height: 2.8mm;
      background: #3b6fb6;
      border-radius: 0.5mm;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .biz-icon-box svg {
      width: 1.8mm;
      height: 1.8mm;
      display: block;
    }

    .biz-qr-img {
      width: 17.5mm;
      height: 17.5mm;
      border: none;
      padding: 0;
      background: white;
      border-radius: 0; /* STRICT STRAIGHT EDGES */
    }

    /* Business Back Common - Logo with Tagline centered */
    .biz-back {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .biz-back-logo-tagline {
      width: 43.4mm; /* Adjusted (+15% from 37.7mm) */
      height: auto;
      display: block;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .id-card, .business-card {
        box-shadow: none !important;
        border: 1px solid #000 !important;
        border-radius: 0 !important;
      }
      @page {
        size: auto;
        margin: 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="font-size: 16px; color: #548235;">Transvolt Print &amp; PDF Center</strong>
      <p style="font-size: 12px; color: #64748b;">Ready to print or save as PDF. High-resolution official artwork.</p>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      <button class="btn-close" onclick="window.close()">Close Window</button>
    </div>
  </div>

  <div class="print-sheet">
    ${(type === "both" || type === "id") ? `
      <div>
        <div class="section-title">Official Employee ID Card</div>
        <div class="cards-row">
          <!-- ID Front -->
          <div class="card-wrapper">
            <span class="dimension-label">Front: 54mm Width &amp; 86mm Height</span>
            <div class="id-card">
              <div class="id-front-content">
                <img src="${logoWithTagline}" class="id-logo-img" alt="Transvolt Logo with Tagline" />

                <div class="id-photo-box">
                  ${candidate.photoUrl 
                    ? `<img src="${candidate.photoUrl}" class="id-photo-img" alt="Candidate Photo" />` 
                    : `<span>20x24 mm</span>`
                  }
                </div>

                <div class="id-name">${toTitleCase(candidate.fullName || "Candidate Full Name")}</div>

                <div class="id-details-list">
                  <div class="id-detail-row">
                    <span class="id-detail-lbl">Contact:</span>
                    <span class="id-detail-val">${candidate.contact || "+91 0000 000 000"}</span>
                  </div>
                  <div class="id-detail-row">
                    <span class="id-detail-lbl">Emergency Contact:</span>
                    <span class="id-detail-val">${candidate.emrContact || "+91 0000 000 000"}</span>
                  </div>
                  <div class="id-detail-row">
                    <span class="id-detail-lbl">Employee ID:</span>
                    <span class="id-detail-val">${candidate.employeeId || "000000"}</span>
                  </div>
                  <div class="id-detail-row">
                    <span class="id-detail-lbl">Blood Group:</span>
                    <span class="id-detail-val" style="font-family: inherit; font-weight: 700;">${candidate.bloodGroup || "O+"}</span>
                  </div>
                </div>

                <div class="id-footer-strip">
                  ${company.companyWebsite || "www.transvolt.in"}
                </div>
              </div>
            </div>
          </div>

          <!-- ID Back -->
          <div class="card-wrapper">
            <span class="dimension-label">Back Common: 54mm Width &amp; 86mm Height</span>
            <div class="id-card">
              <div class="id-back-content">
                <img src="${logoWithTagline}" class="id-logo-img" alt="Transvolt Logo with Tagline" />

                <div class="id-back-notice">
                  If Found Please Return to
                </div>

                <div class="id-back-address">
                  <strong class="company-name">${company.companyFullName || "Transvolt Mobility Pvt. Ltd."}</strong>
                  <div class="address-text">
                    5th Floor, “A” Wing, Trade Link,<br />
                    Kamala Mills Compound, Lower Parel,<br />
                    Mumbai - 400013.
                  </div>
                </div>

                <div class="id-back-contact">
                  <div>Contact No.:&nbsp;&nbsp;${company.companyContact || "+91 8657 000 732"}</div>
                  <div>Email:&nbsp;&nbsp;${company.companyEmail || "info@transvolt.in"}</div>
                  <div>Web:&nbsp;&nbsp;${company.companyWebsite || "www.transvolt.in"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ` : ""}

    ${(type === "both" || type === "business") ? `
      <div>
        <div class="section-title">Official Corporate Business Card</div>
        <div class="cards-row">
          <!-- Business Front -->
          <div class="card-wrapper">
            <span class="dimension-label">Front: 89mm Width &amp; 51mm Height</span>
            <div class="business-card">
              <div class="biz-top-row">
                <div class="biz-name-col">
                  <div class="biz-emp-name">${toTitleCase(candidate.fullName || "Candidate Full Name")}</div>
                  <div class="biz-designation">${candidate.designation || "Designation"}</div>
                </div>
                <!-- Basic Logo (No Tagline) -->
                <img src="${basicLogo}" class="biz-logo-basic" alt="Transvolt Basic Logo" />
              </div>

              <div class="biz-bottom-row">
                <div>
                  <div class="biz-company-name">${toTitleCase(company.companyFullName || "Transvolt Mobility Private Limited")}</div>
                  <div class="biz-contact-list">
                    <div class="biz-contact-item">
                      <span class="biz-icon-box">
                        <svg viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.18z"/></svg>
                      </span>
                      <span>${candidate.contact || "+91 0000 000 000"}</span>
                    </div>
                    <div class="biz-contact-item">
                      <span class="biz-icon-box">
                        <svg viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      </span>
                      <span>${candidate.email || "email@transvolt.in"}</span>
                    </div>
                    <div class="biz-contact-item">
                      <span class="biz-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </span>
                      <span>${company.companyWebsite || "www.transvolt.in"}</span>
                    </div>
                    <div class="biz-contact-item">
                      <span class="biz-icon-box" style="margin-top: 0.2mm;">
                        <svg viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                      </span>
                      <span style="line-height: 1.25;">${company.companyAddress || "5th Floor, “A” Wing, Trade Link, Kamala Mills Compound, Lower Parel, Mumbai - 400013."}</span>
                    </div>
                  </div>
                </div>

                <img src="${qrUrl}" class="biz-qr-img" alt="Scan to save contact" />
              </div>
            </div>
          </div>

          <!-- Business Back Common -->
          <div class="card-wrapper">
            <span class="dimension-label">Back Common: 89mm Width &amp; 51mm Height</span>
            <div class="business-card biz-back">
              <!-- Logo with Tagline on Back -->
              <img src="${logoWithTagline}" class="biz-back-logo-tagline" alt="Transvolt Logo with Tagline" />
            </div>
          </div>
        </div>
      </div>
    ` : ""}
  </div>
</body>
</html>`
}
