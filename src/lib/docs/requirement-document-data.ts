export interface ModuleRequirement {
  id: string
  title: string
  route: string
  category: "Core Architecture" | "Brand & Design" | "Fleet & Infra" | "Creative Studio" | "Operations & HR" | "Governance & QA"
  iconName: string
  badge: string
  requirementParagraph: string
  requirementPoints: string[]
  problem: {
    title: string
    description: string
    impactPoints: string[]
  }
  solution: {
    title: string
    description: string
    keyFeatures: string[]
  }
}

export interface PortalRequirementDoc {
  title: string
  version: string
  documentId: string
  lastUpdated: string
  author: string
  organization: string
  executiveSummaryParagraph: string
  executiveSummaryPoints: string[]
  architecturalPillars: {
    title: string
    description: string
  }[]
  modules: ModuleRequirement[]
}

export const PORTAL_REQUIREMENTS_DATA: PortalRequirementDoc = {
  title: "Transvolt Branding Portal V4 — Comprehensive System Requirement Document",
  version: "4.2.0 (Enterprise Release)",
  documentId: "TV-SRS-PRD-2026-V4",
  lastUpdated: "November 2026",
  author: "Product Engineering & Brand Governance Architecture Group",
  organization: "Transvolt Mobility Private Limited",
  executiveSummaryParagraph:
    "The Transvolt Branding Portal V4 is an enterprise-grade, multi-tenant digital brand operating system engineered specifically for Transvolt Mobility Private Limited, India's pioneer in heavy commercial and passenger electric mobility solutions. The primary objective of the portal is to serve as an immutable, real-time, single source of truth for all corporate brand governance, creative asset distribution, fleet livery standards, charging infrastructure specifications, legal document compliance, and multi-depot operational communications across all regional operating depots, corporate headquarters, and external agency ecosystems. Designed to eliminate brand fragmentation across distributed teams and high-velocity field sites, the portal unifies digital asset management, browser-based AI audio tools, automated legal document production, site-specific organization hierarchy builders, and comprehensive corporate guidelines into a secure, responsive, zero-trust web application with granular role-based access control.",
  executiveSummaryPoints: [
    "Centralized Brand Asset Governance: Instant distribution of high-resolution vector logos, color codes, approved typography, digital banners, and commercial print collateral across all departments.",
    "Fleet & Infrastructure OEM Compliance: Rigid engineering specifications and technical blueprints for 9m/12m electric buses, commercial EV trucks, and EVSE fast-charging depot installations.",
    "Integrated AI Audio Studio: AI voiceover synthesis studio (Generate Audio) for instant multilingual depot safety announcements, EV training modules, and sonic branding cues.",
    "Granular Zero-Trust Access Control: Page-by-page permission assignment (View Only, Download, Share, Upload, Replace, Hold, Delete, Site Management) with Super Admin auditability.",
    "Multi-Site Legal Entity Synchronisation: Integrated Company Master keeping corporate CIN, GSTIN, and registered depot addresses synchronized across all official stationery and letterheads.",
  ],
  architecturalPillars: [
    {
      title: "1. Immutable Single Source of Truth (SSOT)",
      description:
        "Every logo, color token, typeface, template, and fleet specification is centrally managed and locked against unauthorized local alterations, ensuring 100% brand fidelity across all print, digital, and physical vehicle applications.",
    },
    {
      title: "2. Zero-Trust Role-Based Access Control (RBAC)",
      description:
        "Multi-tiered permission matrix enforcing least-privilege security. External partners, agencies, regional depot staff, and internal executives receive strictly bounded rights on a per-page and per-action basis.",
    },
    {
      title: "3. Enterprise Multi-Site Legal Entity Synchronization",
      description:
        "Unified corporate registry dynamically binding registered company CIN, GSTIN, and physical depot facilities across official stationery, vehicle badges, and legal agreements.",
    },
    {
      title: "4. High-Performance Client-Side Studio & Cloud DAM",
      description:
        "In-browser sound synthesis pipelines and high-speed digital asset management running on native Web APIs, enabling immediate asset production without heavy third-party software licensing.",
    },
  ],
  modules: [
    {
      id: "dashboard",
      title: "Executive Dashboard",
      route: "/dashboard",
      category: "Core Architecture",
      iconName: "LayoutDashboard",
      badge: "Core Hub",
      requirementParagraph:
        "The Dashboard acts as the mission-control command center of the Transvolt Branding Portal. It must aggregate live telemetry on all digital assets, corporate entities, active users, pending access requests, and quick-launch shortcuts into an executive-grade visual layout. The dashboard must provide instant search capabilities across the entire portal inventory, display recent brand activity feeds, and allow immediate navigation to core modules without cognitive friction.",
      requirementPoints: [
        "Real-time visual telemetry tiles reporting total asset count, vehicle branding variants, registered companies, active users, and pending access approvals.",
        "Global omni-search bar capable of indexing all vector files, guidelines, documents, media assets, and employee templates.",
        "Interactive Brand Book quick-access tile launching comprehensive corporate style guides with 1-click preview and download.",
        "Quick-action launcher cards directing users to high-frequency tasks: Uploading Assets, Generating Letterheads, Creating Vehicle Graphics, and Reviewing Candidates.",
        "Live system status badge confirming operational sync with the central Transvolt asset cloud repository.",
      ],
      problem: {
        title: "Disorganized Brand Repositories & Lack of Operational Visibility",
        description:
          "Previously, brand resources and collateral were scattered haphazardly across decentralized Google Drive folders, local employee workstations, and disparate email attachments. Stakeholders had zero visibility into which files were updated, how many active users held edit permissions, or where to find canonical vector logos. This resulted in delayed project turnarounds, redundant graphic requests sent to marketing, and widespread confusion regarding brand asset locations.",
        impactPoints: [
          "Hours wasted weekly by marketing teams repeatedly sending basic logo files and color hex codes to internal departments.",
          "Complete lack of visibility into unauthorized asset deletions or outdated template distributions.",
          "High onboarding latency for new employees and vendors trying to navigate messy shared cloud folders.",
        ],
      },
      solution: {
        title: "Unified Command Center with Instant Telemetry & Omni-Search",
        description:
          "The Dashboard consolidates all corporate assets, operational metrics, and navigation pathways into a single cohesive interface. Users are greeted with real-time counters, verified cloud health indicators, and a universal search engine that resolves file queries in milliseconds. Role-specific shortcut cards accelerate daily workflows while maintaining top-level brand alignment.",
        keyFeatures: [
          "Dynamic status tiles that automatically reflect inventory updates across all sub-modules.",
          "Instant omni-search with instant keyboard navigation (Ctrl+K) and auto-suggest filters.",
          "High-contrast, uncluttered executive UI aligned with Transvolt's dark-slate and electric-green visual language.",
        ],
      },
    },
    {
      id: "logo-color",
      title: "Logo & Color Guidelines",
      route: "/logo-color",
      category: "Brand & Design",
      iconName: "Palette",
      badge: "Guidelines",
      requirementParagraph:
        "The Logo & Color module must establish and protect the primary visual identity of Transvolt Mobility. It must host the official Transvolt dual-arrow symbol, primary wordmark, vertical lockups, and monochrome variations across multiple industry formats (SVG, PNG, EPS, PDF). In addition, it must publish the certified corporate color hierarchy—including Transvolt Electric Green (#548235), Forest Green (#385723), Slate Dark (#1E293B), and Neutral Grey (#F1F5F9)—with complete HEX, RGB, CMYK, and Pantone specifications alongside interactive 1-click clipboard copy utilities and visual DOs & DON'Ts rules.",
      requirementPoints: [
        "Downloadable vector and raster packages for Primary Logo, Secondary Emblem, White/Monochrome Reverse, and Favicon assets.",
        "Interactive color swatches displaying exact color codes across digital (HEX, RGB) and commercial offset print (CMYK, Pantone).",
        "1-click 'Copy Code' buttons with visual toast confirmation for instant developer and designer handoff.",
        "Strict Logo Exclusion Zone and Minimum Sizing mathematical standards to prevent cramped or illegible placements.",
        "Side-by-side visual DOs & DON'Ts matrix forbidding distortion, unauthorized color changes, drop shadows, or busy background placements.",
      ],
      problem: {
        title: "Rampant Brand Dilution, Distorted Logos & Incorrect Green Shades",
        description:
          "Without an enforced digital standard, field depots, third-party vehicle fabricators, and regional printers consistently utilized distorted screenshots of the Transvolt logo found on Google Images. Furthermore, printers guessed shades of green, resulting in neon-yellowish or muted olive hues on physical signage, uniforms, and corporate stationery that degraded Transvolt's modern electric mobility image.",
        impactPoints: [
          "Inconsistent corporate identity across regional transit depots and investor presentations.",
          "Costly reprinting cycles due to RGB files being sent to CMYK commercial offset printers.",
          "Uncontrolled usage of low-resolution pixelated JPEGs on high-visibility commercial event backdrops.",
        ],
      },
      solution: {
        title: "Digital Brand Token Repository with Certified Vector Assets",
        description:
          "The module enforces absolute color and logo fidelity through certified, pre-tested asset downloads and 1-click color token copy utilities. Clear space grids and visual prohibition examples provide foolproof guidance for both technical fabricators and external advertising agencies, permanently preventing color drift and symbol distortion.",
        keyFeatures: [
          "Lossless SVG vector source downloads alongside high-resolution transparent PNGs.",
          "Exact digital (HEX/RGB) and offset print (CMYK/PMS) color formulas tested for physical substrate reproduction.",
          "Interactive DOs & DON'Ts visual cards demonstrating approved versus prohibited usage scenarios.",
        ],
      },
    },
    {
      id: "typography",
      title: "Typography System",
      route: "/typography",
      category: "Brand & Design",
      iconName: "Type",
      badge: "Guidelines",
      requirementParagraph:
        "The Typography module must document and deliver the official typographic architecture of Transvolt Mobility. It must articulate the primary brand typeface hierarchy, weight variations (Light, Regular, Medium, Semi-Bold, Bold, Extra-Bold), web font integration instructions (CSS @font-face and Google Fonts), and desktop font file downloads (TTF, OTF, WOFF2). It must also specify the corporate type scale, baseline grid, line-height ratios, and letter-spacing standards for both screen UI and printed corporate documentation.",
      requirementPoints: [
        "Official downloadable font packages containing verified desktop (OTF/TTF) and web font (WOFF/WOFF2) font binaries.",
        "Comprehensive typographic scale matrix defining font sizes, line heights, and letter-spacing for Display, H1 through H6, Body, and Captions.",
        "Interactive live specimen tester allowing users to preview customized text strings across different weights and sizes in real time.",
        "Detailed font pairing rules and hierarchy guidelines distinguishing headline emphasis from long-form technical reading.",
        "Ready-to-use CSS snippets and Tailwind CSS configuration objects for immediate engineering team implementation.",
      ],
      problem: {
        title: "Arbitrary Typographic Inconsistencies Across Proposals & Reports",
        description:
          "Internal staff and regional administrative teams routinely prepared corporate customer proposals, tender responses, and depot signage using random default system fonts like Calibri, Arial, Times New Roman, or Comic Sans. The absence of a downloadable canonical font bundle and clear hierarchy resulted in amateurish, disjointed presentations that compromised Transvolt's enterprise credibility in multi-million dollar EV tenders.",
        impactPoints: [
          "Substandard visual polish in high-stakes tender submissions and government EV concession bids.",
          "Broken layout hierarchies and mismatched font weights across cross-functional department memos.",
          "Developers manually embedding unapproved web fonts resulting in slow page load times and FOUT (Flash of Unstyled Text).",
        ],
      },
      solution: {
        title: "Centralized Typographic Engine & Interactive Specimen Studio",
        description:
          "The Typography module provides instant 1-click desktop font downloads, web integration snippets, and a live testing sandbox. By publishing mathematically calibrated type scales and strict hierarchy rules, every team member—from executive assistants to senior front-end engineers—can effortlessly produce immaculate, typography-compliant collateral.",
        keyFeatures: [
          "Direct font binary download links for full multi-weight brand typeface packages.",
          "Interactive live type playground for real-time rendering and letter-spacing evaluation.",
          "Production-ready CSS typography tokens and print measurement conversion charts.",
        ],
      },
    },
    {
      id: "graphics-drive",
      title: "Graphics Drive",
      route: "/graphics-drive",
      category: "Creative Studio",
      iconName: "FolderTree",
      badge: "Cloud DAM",
      requirementParagraph:
        "The Graphics Drive is a high-performance Digital Asset Management (DAM) workspace built directly into the portal. It must provide hierarchical multi-level folder tree navigation, drag-and-drop file uploading, instant file format previews (PNG, JPG, SVG, PDF, AI, CDR, PSD), batch asset actions (download, move, tag, delete), automated duplicate detection, search filtering by keyword and file type, and granular folder-level access controls for cross-departmental creative collaboration.",
      requirementPoints: [
        "Dynamic nested folder hierarchy supporting infinite depth for campaigns, depot sites, legal documents, and marketing assets.",
        "Multi-format file upload pipeline supporting raster images, vector files (SVG, AI, CDR, EPS), presentation decks, and audio files.",
        "Instant multi-resolution visual thumbnail generation with inline zoom and lightbox inspections.",
        "Comprehensive file metadata inspector detailing file size, dimensions, resolution, uploaded date, author, and associated category.",
        "Batch selection operations enabling multi-file download, folder archiving (.ZIP), and bulk asset tagging.",
      ],
      problem: {
        title: "Fragmented File Storage, Lost Heavy Vectors & Storage Duplication",
        description:
          "Heavy creative files (often multiple gigabytes in size, such as high-resolution vehicle wrap CorelDRAW .cdr and Adobe Illustrator .ai files) were scattered across local employee hard drives, personal Google Drives, and expired WeTransfer links. Creative teams frequently lost the latest editable source files, resulting in costly redesigns from scratch, accidental asset overwrites, and massive storage redundancy.",
        impactPoints: [
          "Loss of master editable artwork for operational fleets, forcing agencies to charge recurring redesign fees.",
          "High risk of security leaks when creative assets were hosted on unmonitored personal cloud storage accounts.",
          "Crippling delays when field teams urgently required vector files for on-site bus repair livery.",
        ],
      },
      solution: {
        title: "Enterprise Cloud Digital Asset Management with Instant Previews",
        description:
          "The Graphics Drive establishes a unified, secure cloud repository tailored specifically for heavy creative and vector assets. With hierarchical folder structures, instant previewing of vector and raster files without third-party software, and automated metadata indexing, all stakeholders can discover and retrieve canonical assets in seconds.",
        keyFeatures: [
          "Nested directory tree with smooth drag-and-drop file organization.",
          "Embedded vector file inspector supporting instant rendering of complex graphics.",
          "Automated duplicate warning system and storage quota optimization.",
        ],
      },
    },
    {
      id: "letterhead",
      title: "Letterhead System",
      route: "/letterhead",
      category: "Brand & Design",
      iconName: "FileText",
      badge: "Legal Stationery",
      requirementParagraph:
        "The Letterhead System must automate the generation and distribution of official Transvolt corporate stationery. It must link directly with the Company Master database to dynamically render site-specific corporate letterheads (Mumbai Corporate HQ, Regional Operating Depots, Registered Office) with validated CIN, GSTIN, and registered addresses. The module must provide editable document previewing, locked brand headers and footers, print-ready PDF export with bleed and margin calibration, and downloadable Microsoft Word (.docx) templates for office administrative staff.",
      requirementPoints: [
        "Dynamic multi-site corporate letterhead templates reflecting verified legal entity details from Company Master.",
        "Locked header and footer zones ensuring zero accidental tampering with corporate logos, addresses, or statutory registration numbers.",
        "Live interactive letterhead editor allowing users to draft correspondence with real-time typography styling and page margins.",
        "1-click print-ready PDF generation strictly compliant with commercial A4 paper dimensions (210 x 297 mm) and 300 DPI print standards.",
        "Downloadable official Microsoft Word (.docx) template bundles configured with locked header/footer watermarks.",
      ],
      problem: {
        title: "Tampered Stationery, Outdated Registered Addresses & Legal Exposure",
        description:
          "Administrative staff across different state depots frequently edited old Microsoft Word letterhead files manually. Over time, employees inadvertently deleted statutory CIN or GST numbers, shifted logos out of alignment, or used obsolete corporate office addresses on official tender documents, contracts, and vendor agreements, exposing the company to statutory non-compliance and legal disputes.",
        impactPoints: [
          "Legal and tax vulnerabilities caused by circulating letterheads bearing obsolete or incorrect GSTIN numbers.",
          "Distorted logos and inconsistent margins creating an unprofessional corporate impression with institutional financiers.",
          "Heavy administrative friction in generating official communications across geographically dispersed EV depots.",
        ],
      },
      solution: {
        title: "Automated, Legally Bound Multi-Site Stationery Generator",
        description:
          "The Letterhead System programmatically binds stationery headers and footers to the verified corporate database. Staff simply select their operating entity or depot site to instantly generate perfectly aligned, statutory-compliant correspondence in PDF or Word formats, eliminating human error and safeguarding corporate legal integrity.",
        keyFeatures: [
          "Direct synchronization with Company Master for guaranteed accurate CIN, GSTIN, and depot addresses.",
          "Locked print-ready layout preventing accidental shifts in logo position or margin dimensions.",
          "Instant dual-format output: Vector-sharp A4 PDF and native Microsoft Word template.",
        ],
      },
    },
    {
      id: "id-business-cards",
      title: "ID Cards & Business Cards",
      route: "/id-business-cards",
      category: "Brand & Design",
      iconName: "IdCard",
      badge: "Identity",
      requirementParagraph:
        "The ID Cards & Business Cards module must govern the physical identity collateral of Transvolt personnel. It must offer standardized, dual-sided templates for employee identification cards, visitor badges, depot access passes, and executive business cards. The module must incorporate automated vCard QR code generation, employee photo placement guides, blood group and emergency contact standards, RFID chip placement clearance zones, and vendor-ready CMYK print packages with trim marks.",
      requirementPoints: [
        "Dual-sided vertical and horizontal ID card templates customized for Corporate HQ, Fleet Drivers, Depot Technicians, and Visitors.",
        "Dynamic vCard QR code generator embedding employee contact details directly into the reverse side of business cards.",
        "Standardized employee photo framing guidelines with automated aspect ratio enforcement and circular/square masks.",
        "Inclusion of statutory safety data fields: Blood Group, Emergency Contact Person, Employee ID, and Access Gate Authorization.",
        "Commercial print-ready export including 3mm bleed margins, crop marks, and CMYK color space profiles for card manufacturing machines.",
      ],
      problem: {
        title: "Disparate Employee Badges, Unreadable QR Codes & Vendor Delays",
        description:
          "Employee badges were previously ordered through multiple regional vendors who improvised card layouts, resulting in mismatched fonts, distorted employee headshots, and missing emergency medical information. Business cards were often printed with non-functional QR codes or low-contrast text that failed to scan on modern smartphones, while vendor turnaround times stretched into weeks.",
        impactPoints: [
          "Security risks at high-voltage charging depots when security guards could not verify driver badge authenticity.",
          "Lack of emergency medical data (blood group, emergency contact) on technician badges during depot workplace incidents.",
          "High printing costs caused by frequent one-off card batches with inconsistent vendor specifications.",
        ],
      },
      solution: {
        title: "Standardized Card Studio with Automated QR & Vendor-Ready Artwork",
        description:
          "The module standardizes employee identity collateral across the entire organization. HR and facility managers input employee details into a structured form that dynamically renders a front-and-back preview, generates an encrypted vCard QR code, and exports vendor-ready artwork with precision bleed margins for instant batch printing.",
        keyFeatures: [
          "Automated dynamic vCard QR code creation for seamless digital contact exchange.",
          "Strict field validation ensuring mandatory blood group and emergency contact inclusion.",
          "Pre-flighted print artwork generation compatible with standard CR80 PVC card printers.",
        ],
      },
    },
    {
      id: "digital-assets",
      title: "Digital Assets",
      route: "/digital-assets",
      category: "Brand & Design",
      iconName: "Monitor",
      badge: "Social & Web",
      requirementParagraph:
        "The Digital Assets module must centralize and curate all on-screen corporate graphics and social media collateral. It must provide ready-to-use templates and graphics optimized for LinkedIn, Twitter/X, Instagram, Facebook, YouTube, email signatures, digital billboard displays, and mobile app interfaces. The module must enforce exact pixel dimension specifications, aspect ratio locks, compressed file weight benchmarks for high-speed web delivery, and dark/light UI theme variations.",
      requirementPoints: [
        "Platform-specific social media bundles (LinkedIn Company Banners, Post Square 1080x1080, Story 1080x1920, Twitter Headers 1500x500).",
        "Standardized HTML/Rich-Text email signature generator for all Transvolt corporate email accounts.",
        "Website and application UI graphic kits including app icons, splash screens, hero background vectors, and badge graphics.",
        "Digital outdoor billboard graphics calibrated for large-format LED screens with high-contrast color ratios.",
        "1-click batch download of seasonal announcements, hiring banners, EV milestone celebration cards, and press release headers.",
      ],
      problem: {
        title: "Cropped Social Posts, Pixelated Web Banners & Disjointed Email Signatures",
        description:
          "Marketing teams and agency contractors repeatedly produced social media creatives with incorrect aspect ratios, resulting in critical text being cropped by LinkedIn or Instagram UI overlays. Corporate email signatures varied wildly from employee to employee—some featuring outdated phone numbers, broken image links, or non-brand animations—eroding brand professionalism across thousands of client emails.",
        impactPoints: [
          "Suboptimal social engagement and brand perception due to illegible or awkwardly cropped graphics.",
          "Inconsistent corporate email communication lacking disclaimers and mobile-friendly layouts.",
          "Excessive time spent by graphic designers repeatedly resizing the same graphic for five different social platforms.",
        ],
      },
      solution: {
        title: "Curated Multi-Platform Digital Graphic Hub & Signature Generator",
        description:
          "The Digital Assets repository provides pre-sized, pixel-perfect creative templates tailored to every major digital channel. An integrated email signature builder allows staff to generate sleek, brand-approved signatures in seconds, while the social media library ensures high-impact visual consistency across all public touchpoints.",
        keyFeatures: [
          "Pre-calibrated dimension presets for all major enterprise social channels and digital displays.",
          "Interactive HTML email signature generator with dynamic vCard and social profile links.",
          "Optimized WebP and PNG assets balanced for rapid web loading and razor-sharp mobile display.",
        ],
      },
    },
    {
      id: "printing-assets",
      title: "Printing Assets",
      route: "/printing-assets",
      category: "Brand & Design",
      iconName: "Printer",
      badge: "Commercial Print",
      requirementParagraph:
        "The Printing Assets module must govern all physical commercial printing collateral for Transvolt Mobility. It must deliver production-ready artwork files for roll-up standees, event backdrops, tri-fold corporate brochures, depot informational flyers, corporate presentation folders, vehicle handover certificates, and branded promotional merchandise. The module must enforce strict 300 DPI resolution minimums, CMYK color separation standards, die-cut vector lines, and standardized print vendor handover documentation.",
      requirementPoints: [
        "High-resolution (300 DPI CMYK) print files for corporate brochures, event standees, backdrop walls, and company flyers.",
        "Precise mechanical vector templates indicating trim lines, safety margins, fold creases, and bleed boundaries.",
        "Merchandise printing guidelines for staff uniforms, safety helmets, high-visibility reflective vests, and promotional gifts.",
        "Print procurement checklist specifying recommended paper grammage (GSM), matte/gloss lamination, and UV spot coatings.",
        "Direct download packages formatted in industry-standard PDF/X-1a, EPS, and high-res TIFF formats ready for commercial offset presses.",
      ],
      problem: {
        title: "Catastrophic Color Shifts in Print, Blurry Backdrops & Trim Mismatches",
        description:
          "When marketing or depot managers commissioned regional printers for trade shows or depot inaugurations, they frequently supplied RGB digital files or web-resolution JPEGs. The results were disastrous: washed-out muddy greens, pixelated event backdrops measuring 20 feet wide, and text accidentally chopped off during machine guillotine trimming due to missing bleed margins.",
        impactPoints: [
          "Wasteful corporate expenditure on ruined print batches and rushed emergency reprints.",
          "Embarrassing visual presentations at international clean mobility expos and high-profile ministerial depot inaugurations.",
          "Prolonged technical back-and-forth between regional printers and corporate marketing regarding missing vector files.",
        ],
      },
      solution: {
        title: "Pre-Flighted Commercial Print Center with Mechanical Guidelines",
        description:
          "The Printing Assets module acts as a bulletproof commercial print distribution center. Every asset is pre-flighted in native 300 DPI CMYK with verified 3mm bleed margins and vector trim paths. Comprehensive vendor instruction sheets accompany each package, ensuring flawless physical reproduction on any substrate.",
        keyFeatures: [
          "Certified PDF/X-1a artwork files guaranteed to separate accurately on 4-color offset and flexographic presses.",
          "Mechanical schematics clearly distinguishing artwork bleed, trim boundaries, and safe text zones.",
          "Detailed paper substrate and textile print specifications for apparel and promotional merchandise.",
        ],
      },
    },
    {
      id: "presentation",
      title: "Presentation Repository",
      route: "/presentation",
      category: "Brand & Design",
      iconName: "MonitorPlay",
      badge: "Slide Hub",
      requirementParagraph:
        "The Presentation module must serve as the central slide repository and pitch deck ecosystem for Transvolt. It must host certified master presentation decks (.pptx and widescreen 16:9 formats) tailored for Investor Relations, Government EV Concession Tenders, Commercial Fleet Operators, Corporate ESG Briefings, and Internal Quarterly Business Reviews. The module must provide modular slide templates (Title, Agenda, Metrics, Milestones, Technical Specs, Leadership, Financials), icon libraries, and locked brand master styles.",
      requirementPoints: [
        "Master 16:9 widescreen presentation templates with embedded corporate typography and color palettes.",
        "Modular slide layouts: Executive Executive Summaries, Fleet Route Economics, Depot Charging Curves, and ESG Impact Dashboards.",
        "Approved vector icon bundles depicting EV powertrains, battery storage, pantograph charging, telemetry, and smart city infrastructure.",
        "Downloadable presentation bundles in native Microsoft PowerPoint (.pptx), Google Slides links, and vector PDF pitch decks.",
        "Usage guidelines advising executives on slide contrast, maximum text density, and effective data storytelling.",
      ],
      problem: {
        title: "Conflicting Corporate Numbers, Distorted Charts & Outdated Investor Decks",
        description:
          "Executives and business development managers frequently copied slides from old decks dating back several years. Consequently, investor presentations and government tender bids contained contradictory EV fleet performance metrics, outdated financial figures, distorted vehicle diagrams, and inconsistent typography that diluted executive credibility during high-value commercial pitches.",
        impactPoints: [
          "Severe credibility loss when presenting conflicting fleet operational figures to government transit authorities.",
          "Hours wasted by executives manually aligning charts, formatting font styles, and searching for vector icons.",
          "Mismatched aspect ratios causing black letterbox bars on modern boardroom projection screens and virtual meetings.",
        ],
      },
      solution: {
        title: "Master Slide Ecosystem with Locked Templates & Verified Metrics",
        description:
          "The Presentation module supplies locked, professionally engineered PowerPoint and Google Slides master templates. Every slide is designed with mathematically balanced negative space, verified corporate milestone data, and a custom vector EV icon kit, empowering leadership to assemble pitch-perfect presentations in minutes.",
        keyFeatures: [
          "Locked master slides preventing accidental font changes or color corruption across corporate departments.",
          "Pre-designed EV operational data visualization widgets (charging timelines, fleet total cost of ownership charts).",
          "Single-click download of verified company overview and investor pitch decks.",
        ],
      },
    },
    {
      id: "photos",
      title: "Photos and Videos Repository",
      route: "/photos",
      category: "Creative Studio",
      iconName: "ImageIcon",
      badge: "Media DAM",
      requirementParagraph:
        "The Photos and Videos Repository must manage Transvolt's high-value digital media assets. It must house commercial-grade photography and 4K video footage of operational electric buses, commercial EV trucks, fast-charging depot hubs, automated battery swapping stations, factory assembly lines, and corporate leadership portraits. The module must feature faceted tag filtering by vehicle model, site location, and campaign; high-speed thumbnail caching; lightbox previews; and variable-resolution download pipelines.",
      requirementPoints: [
        "Cloud storage and streaming distribution of high-resolution RAW, TIFF, and JPEG photography alongside 4K MP4/MOV b-roll video footage.",
        "Faceted taxonomy search filtering by Vehicle Model (9m, 12m, Cargo EV), Site Depot (Mumbai, Delhi, Bangalore), and Category (Fleet, Infra, People).",
        "Interactive high-speed lightbox modal with zoom inspection and full-screen video playback.",
        "Automated multi-resolution image generator providing instant Web, Social, and Original Print Resolution downloads.",
        "Rights management metadata indicating photographer credits, usage licensing, model release status, and embargo dates.",
      ],
      problem: {
        title: "Buried Media Assets, Expired Cloud Links & Low-Quality Phone Photos",
        description:
          "Expensive professional photoshoots produced gigabytes of media that routinely became trapped on photographers' external hard drives or shared via temporary WeTransfer links that expired in seven days. Field personnel subsequently resorted to snapping blurry, unflattering smartphone photos of dirty buses to send to press outlets, severely damaging Transvolt's image as a high-tech EV OEM.",
        impactPoints: [
          "Wasted investment in professional media shoots due to inaccessible, forgotten file storage.",
          "Public relations disasters caused by low-resolution, poorly lit smartphone images published in national media.",
          "Legal vulnerabilities stemming from the accidental commercial use of unreleased or embargoed vehicle prototype footage.",
        ],
      },
      solution: {
        title: "High-Speed Media DAM with Faceted Tagging & Multi-Res Downloads",
        description:
          "The Photos and Videos Repository organizes all commercial footage into an easily searchable, permanent digital vault. Users can locate studio-lit vehicle imagery or depot aerial footage in seconds, inspect it in a high-speed lightbox, and download the exact resolution required for their specific medium without burdening the original creative team.",
        keyFeatures: [
          "High-performance media streaming and thumbnail caching for immediate visual discovery.",
          "Granular tag-based filtering separating vehicle models, infrastructure depots, and corporate leadership.",
          "Automated on-the-fly resolution resizing for web, social media, and heavy print publication.",
        ],
      },
    },
    {
      id: "vehicle-branding",
      title: "Vehicle Branding (Fleet Guidelines)",
      route: "/vehicle-branding",
      category: "Fleet & Infra",
      iconName: "Car",
      badge: "Fleet OEM",
      requirementParagraph:
        "The Vehicle Branding module must define the exact technical and visual livery specifications for Transvolt's entire electric mobility fleet. It must host engineering blueprint schematics for 9m and 12m low-floor electric buses, electric feeder vans, and commercial EV freight trucks. The module must detail front, rear, curb-side, and street-side graphic placements; vinyl decal cut paths; micro-prismatic retroreflective tape safety rules; state transport authority (RTO) compliance markings; and automotive-grade vinyl film durability standards.",
      requirementPoints: [
        "Precision orthographic blueprint schematics (Front, Rear, Left Side, Right Side, Roof) for all operational fleet vehicle models.",
        "Downloadable 1:1 scale vector die-cut files (.CDR, .AI, .DXF) for vehicle wrap vinyl cutters and CNC plotters.",
        "Automotive-grade material specifications specifying cast vinyl film types (Avery Dennison, 3M), UV overlaminates, and 7-year weather warranties.",
        "Mandatory regulatory compliance markings: State Transport Undertaking (STU) logo clearances, emergency exit decals, and high-voltage warning labels.",
        "Micro-prismatic retroreflective tape placement diagrams complying with national vehicle safety standards (AIS-090).",
      ],
      problem: {
        title: "Distorted Livery on Multimillion-Dollar Fleets & RTO Regulatory Fines",
        description:
          "Regional bus body fabricators and depot mechanics previously applied vinyl wraps by visual guesswork. Logos were stretched across bus passenger windows, emergency exit markings were inadvertently covered, and non-automotive monomeric vinyl was used that peeled and faded within months under harsh tropical sunlight, causing regulatory fines from RTO inspectors and a shoddy appearance on city roads.",
        impactPoints: [
          "Heavy fines and vehicle impoundment risks due to violation of regional transport authority livery and reflective tape mandates.",
          "Premature vinyl peeling and adhesive damage to expensive composite bus body panels.",
          "Inconsistent corporate branding across public transit contracts in different smart city municipal zones.",
        ],
      },
      solution: {
        title: "Precision Engineering Blueprints & Certified Livery Specifications",
        description:
          "The Vehicle Branding module provides full-scale, precision CAD-calibrated vector schematics and rigid material guidelines for every vehicle variant. Body fabricators and wrap installers download exact vector cut-paths and substrate specifications, ensuring flawless, legally compliant livery application that endures heavy commercial transit duty.",
        keyFeatures: [
          "1:1 scale vector templates with precise window cutouts, wheel arches, and panel seams.",
          "Rigid automotive vinyl material standards with UV protection and anti-graffiti lamination rules.",
          "Strict regulatory compliance diagrams ensuring 100% adherence to RTO and safety requirements.",
        ],
      },
    },
    {
      id: "charger-branding",
      title: "Charger Branding (EV Infrastructure)",
      route: "/charger-branding",
      category: "Fleet & Infra",
      iconName: "Zap",
      badge: "EVSE Infra",
      requirementParagraph:
        "The Charger Branding module must establish comprehensive visual and safety identity standards for all Transvolt Electric Vehicle Supply Equipment (EVSE). It must encompass DC Ultra-Fast High-Voltage Chargers (60kW to 240kW), AC Type-2 Commercial Chargers, charging gun holster bezels, illuminated overhead canopy signage, high-voltage danger notices, and step-by-step user charging instruction decals.",
      requirementPoints: [
        "Dimensional livery templates for single-gun, dual-gun, and pantograph ultra-fast DC charging kiosks.",
        "Electrical safety and statutory hazard signage compliant with Central Electricity Authority (CEA) safety guidelines.",
        "Weatherproof, UV-resistant, and high-temperature poly-carbonate substrate specifications for extreme outdoor depot environments.",
        "High-contrast, multilingual step-by-step charging procedure decals (Plug In -> RFID Tap -> Charge -> Disconnect).",
        "Nocturnal depot illumination specifications including LED backlit canopy logos and retroreflective bollard markings.",
      ],
      problem: {
        title: "Confusing Charger Decals, Weather Peeling & High-Voltage Safety Hazards",
        description:
          "Charging stations in regional depots featured inconsistent instruction stickers and deteriorating warning signs that peeled under summer heat and monsoon rain. Fleet drivers frequently struggled to operate fast-chargers at night due to poor label contrast, while missing statutory high-voltage danger markings exposed Transvolt to severe electrical safety audit penalties.",
        impactPoints: [
          "Driver operational confusion leading to charging gun drops, damaged connector pins, and depot turnaround delays.",
          "Severe safety liability risks from inadequate or weathered high-voltage electrical hazard warnings.",
          "Diluted brand presence at premier public and intercity highway charging plazas.",
        ],
      },
      solution: {
        title: "Standardized EVSE Livery Suite with Weatherproof Safety Signage",
        description:
          "The Charger Branding module delivers certified, weather-tested graphic layouts and CEA-compliant hazard decals for all EVSE hardware. High-contrast typography and intuitive pictograms streamline driver self-service charging while heavy-duty polycarbonate and retroreflective specifications ensure lifelong depot durability.",
        keyFeatures: [
          "CEA-compliant high-voltage electrical hazard warnings and emergency stop indicator decals.",
          "Four-step multilingual user instruction graphics tested for instant driver comprehension.",
          "Industrial-grade outdoor substrate specifications resistant to oil, rain, and extreme solar radiation.",
        ],
      },
    },
    {
      id: "generate-audio",
      title: "Generate Audio (Voiceover Studio)",
      route: "/generate-audio",
      category: "Creative Studio",
      iconName: "Music2",
      badge: "AI Audio Studio",
      requirementParagraph:
        "The Generate Audio module is an integrated AI-powered sound synthesis and sonic branding workstation. It must allow Transvolt administrators to convert text scripts into natural, studio-quality spoken audio across multiple official Indian languages (English, Hindi, Marathi, Gujarati) for depot safety announcements, EV training modules, and promotional videos. In addition, it must serve as the repository for official Transvolt sonic branding assets, including vehicle acoustic startup sounds, pedestrian warning chimes (AVAS), and commercial radio jingles.",
      requirementPoints: [
        "Advanced Text-to-Speech (TTS) engine with multilingual voice synthesis, pitch modulation, and speaking speed calibration.",
        "Multi-speaker voice talent selection covering professional Indian English, Hindi, Marathi, and Gujarati vocal profiles.",
        "Sonic Branding Soundboard hosting official Transvolt vehicle audio cues: EV Startup Chimes, Acoustic Vehicle Alerting Systems (AVAS), and Turn Signal tones.",
        "Audio waveform visualizer with timeline playback scrubbing, volume gain controls, and peak audio level monitoring.",
        "Broadcast-grade audio export pipeline providing high-bitrate MP3 and lossless WAV audio file downloads.",
      ],
      problem: {
        title: "Costly Studio Recording Sessions, Slow Turnarounds & Mismatched Depot Audio",
        description:
          "Creating professional voice announcements for regional depot public address systems, driver training modules, and social media video reels required booking external recording studios and professional voiceover artists. Turnaround times took weeks and costs escalated rapidly, leading depots to use muffled, unscripted smartphone voice recordings that sounded unprofessional and difficult to comprehend.",
        impactPoints: [
          "Delayed launch of regional driver training courses due to lack of multilingual audio narrations.",
          "Poor safety adherence at busy EV charging depots caused by garbled, amateurish loudspeaker announcements.",
          "Absence of standardized acoustic branding in Transvolt vehicles, missing a key opportunity for sonic brand recognition.",
        ],
      },
      solution: {
        title: "Instant Multilingual AI Voice Synthesis & Acoustic Brand Repository",
        description:
          "The Generate Audio studio enables any authorized user to type a script and generate crystal-clear, studio-grade voiceover audio in seconds. With pre-calibrated regional voice models and a permanent sonic branding library, Transvolt delivers flawless auditory communications across all depots and digital channels.",
        keyFeatures: [
          "Real-time multilingual voiceover generation across English, Hindi, Marathi, and Gujarati.",
          "Official Transvolt AVAS and vehicle acoustic chime library ready for immediate OEM firmware integration.",
          "Direct broadcast-quality WAV and MP3 export with integrated waveform audio analysis.",
        ],
      },
    },
    {
      id: "organization-chart",
      title: "Organization Chart Builder",
      route: "/organization-chart",
      category: "Operations & HR",
      iconName: "Network",
      badge: "Hold",
      requirementParagraph:
        "The Organization Chart Builder must provide an interactive, visual hierarchy mapping system for Transvolt Mobility. It must support multiple organizational models: Corporate Executive HQ, Regional Fleet Depot Operations, and Project-Specific Site Depots. The module must feature interactive tree nodes with employee profiles (Photo, Name, Designation, Department, Contact, Employment Type), dynamic branch expansion/collapse, drag-and-drop structural updates, site location filtering, and export to PDF and high-res images.",
      requirementPoints: [
        "Interactive hierarchical tree visualizer supporting pan, zoom, auto-layout balancing, and node branch collapse/expand.",
        "Comprehensive employee node cards displaying designation badges, reporting lines, site location tags, and contact links.",
        "Multi-site organizational topology modes: Corporate Headquarters, Regional Operating Depots, and Concession Project Sites.",
        "Search and filter controls enabling instant lookup of personnel by department, technical role, or geographical depot.",
        "High-resolution vector export generating publication-ready organization structure charts in PDF and PNG formats for corporate reports.",
      ],
      problem: {
        title: "Chaotic Reporting Lines, Obsolete PowerPoint Trees & Depot Confusion",
        description:
          "As Transvolt scaled rapidly from a single depot to multiple municipal transit concessions across several states, reporting structures became opaque. Management relied on outdated PowerPoint slides that were never updated when site engineers transferred or new depot managers were hired, resulting in operational confusion, duplicate approvals, and delayed escalation during field emergencies.",
        impactPoints: [
          "Operational paralysis during depot breakdowns due to staff not knowing who the designated on-duty site supervisor was.",
          "Time-consuming manual recreation of organizational charts for external government transit authority audits.",
          "Disjointed cross-functional communication between corporate HQ leadership and remote field maintenance teams.",
        ],
      },
      solution: {
        title: "Interactive Real-Time Organizational Tree Builder with Multi-Site Filters",
        description:
          "The Organization Chart Builder delivers a live, interactive visualization of Transvolt's corporate and operational hierarchy. With instant node searching, site-specific filtering, and 1-click exportable vector diagrams, leadership and field teams maintain total clarity over operational reporting structures.",
        keyFeatures: [
          "Fluid canvas supporting infinite pan, zoom, and automated hierarchical tree restructuring.",
          "Site-specific operational views isolating individual depot maintenance teams from corporate governance.",
          "1-click high-resolution PDF/PNG export for audits, board meetings, and facility noticeboards.",
        ],
      },
    },
    {
      id: "brand-philosophy",
      title: "Brand Philosophy & Cultural Manifesto",
      route: "/brand-philosophy",
      category: "Brand & Design",
      iconName: "Compass",
      badge: "Hold",
      requirementParagraph:
        "The Brand Philosophy module must articulate the foundational purpose, environmental vision, and cultural principles of Transvolt Mobility. It must communicate Transvolt's mission to accelerate zero-emission commercial transit across India, define the brand's core values (Innovation, Integrity, Sustainability, Safety, Excellence), and outline the official corporate Tone of Voice (Optimistic, Authoritative, Innovative, Responsible) across external and internal communications.",
      requirementPoints: [
        "Interactive digital presentation of Transvolt's corporate vision, mission statement, and clean transit environmental manifesto.",
        "Core corporate values matrix detailing operational definitions and expected employee behavioral standards.",
        "Tone of Voice guidelines specifying writing rules, preferred vocabulary, prohibited clichés, and editorial voice benchmarks.",
        "Social and environmental impact metrics (metric tons of CO2 offset, diesel liters displaced, green kilometers logged).",
        "Downloadable Brand Manifesto brochure formatted for new employee onboarding kits and annual corporate sustainability reports.",
      ],
      problem: {
        title: "Diluted Corporate Vision, Misaligned PR & Disconnected Remote Teams",
        description:
          "With hundreds of field technicians, drivers, and regional office staff joining across different states, the core environmental mission of Transvolt became lost in daily operational grind. External PR agencies and regional spokespersons issued press releases with inconsistent corporate messaging, while new employees lacked a clear understanding of the company's ethical and sustainability commitments.",
        impactPoints: [
          "Conflicting public statements and advertising copy that failed to convey Transvolt's technological leadership.",
          "Disengaged remote workforce lacking an emotional connection to the company's zero-emission mission.",
          "Difficulties in presenting a unified corporate sustainability narrative to global ESG investors and grant committees.",
        ],
      },
      solution: {
        title: "Inspiring Digital Brand Manifesto & Comprehensive Tone of Voice Guide",
        description:
          "The Brand Philosophy module provides an interactive cultural home for Transvolt. It immerses staff, investors, and media partners in the company's zero-emission vision, establishes precise editorial guardrails, and publishes live environmental impact metrics that reinforce Transvolt's position as a purpose-driven leader in sustainable mobility.",
        keyFeatures: [
          "Engaging multimedia presentation of corporate mission, environmental goals, and technological milestones.",
          "Concrete Tone of Voice rules with practical 'Say This, Not That' editorial examples.",
          "Downloadable cultural onboarding materials for immediate integration into employee welcome packages.",
        ],
      },
    },
    {
      id: "user-access",
      title: "User Access & Role-Based Control (RBAC)",
      route: "/users",
      category: "Governance & QA",
      iconName: "ShieldCheck",
      badge: "Security & RBAC",
      requirementParagraph:
        "The User Access & Control system must enforce zero-trust security and granular permissions across the entire Transvolt Branding Portal. It must provide a centralized administration console where Super Admins can manage user accounts, assign corporate roles (Super Admin, In-House Marketing, Regional Manager, External Agency), and configure page-by-page access rights. Each specific page must support ten distinct permission controls: View Only, Download, Share, Upload, Replace, Hold, Delete (Risk), Create New Groups (Risk), Add Company (Risk), and Site Management (Risk).",
      requirementPoints: [
        "Multi-tiered role hierarchy: Super Admin, In-House Core Team, Regional Depot Officer, External Agency Partner, and Guest Reviewer.",
        "Granular 10-point permission matrix for every individual portal page with space-efficient accordion controls.",
        "Dedicated highlight styling for high-impact and administrative permission tiles with distinct visual warning cues.",
        "Active user session management console displaying login timestamps, assigned page scopes, and 1-click credential revocation.",
        "Access Request approval inbox enabling administrators to review, approve, or reject employee permission escalation requests.",
      ],
      problem: {
        title: "Shared Master Passwords, Accidental Deletions & Agency Data Leakage",
        description:
          "Previously, team members shared a single master login password. As a result, external graphic designers and regional contractors had unrestricted access to confidential executive presentations, internal HR salary files, and master brand templates. Furthermore, accidental file deletions could not be traced to any specific user, creating a severe operational and security vulnerability.",
        impactPoints: [
          "Severe data leakage risk exposing confidential future vehicle designs and financial models to outside contractors.",
          "Accidental permanent deletion of critical master artwork files by junior staff with unchecked delete permissions.",
          "Inability to meet enterprise cybersecurity compliance mandates or pass external information security audits.",
        ],
      },
      solution: {
        title: "Granular Zero-Trust Access Engine with 10-Point Page Control Matrix",
        description:
          "The User Access & Control module implements rigorous, fine-grained access control. Super Admins configure access on a per-user, per-page basis with individual toggles for viewing, downloading, uploading, and destructive operations. High-risk actions are color-coded, sessions are fully auditable, and external agencies are strictly sequestered within their authorized workspace.",
        keyFeatures: [
          "Accordion-based per-page permission selection saving vertical screen real estate while offering exhaustive control.",
          "Distinct color-coded warning badges highlighting destructive actions (Delete, Add Company, Site Management).",
          "Automated access request workflow with real-time notifications for rapid, compliant privilege escalation.",
        ],
      },
    },
    {
      id: "company-master",
      title: "Company Master Management",
      route: "/company-master",
      category: "Core Architecture",
      iconName: "Building2",
      badge: "Multi-Tenant",
      requirementParagraph:
        "The Company Master module must serve as the authoritative legal entity and operational site repository for Transvolt Mobility and all its corporate subsidiaries. It must manage complete corporate entity profiles including Registered Corporate Name, Corporate Identity Number (CIN), Goods and Services Tax Identification Number (GSTIN), Registered Head Office, Regional Operating Depots, Official Signatory Authorities, and primary brand assets. All other portal modules (Letterhead, Vehicle Branding, Charger Branding) must inherit data dynamically from this single master record.",
      requirementPoints: [
        "Centralized database of Transvolt Mobility Private Limited, subsidiary holding entities, and concession joint ventures.",
        "Statutory compliance fields: Legal Entity Name, CIN, GSTIN, PAN, Registered Address, and Primary Operating Depots.",
        "Direct dynamic data binding: Changes made in Company Master automatically update all letterhead footers and billing collateral across the portal.",
        "Site Location management mapping municipal EV concession depots (e.g., Mumbai Worli Depot, Pune Chakan Facility, Delhi Rohini Hub).",
        "Authorized Corporate Signatories directory with digital signature validation for official documentation.",
      ],
      problem: {
        title: "Conflicting Corporate Addresses, Invoicing Errors & Multiple Sub-Entities",
        description:
          "Operating across multiple state legal entities and concession agreements resulted in employees constantly using mismatched corporate names and outdated tax identification numbers on contracts and official communications. Invoices were frequently rejected by municipal transit corporations due to incorrect GSTIN registrations, delaying vital concession milestone payments.",
        impactPoints: [
          "Substantial financial delays caused by government transit authorities rejecting invoices with mismatched corporate CIN/GST numbers.",
          "Widespread confusion across depots regarding which subsidiary entity held concession rights for specific regional routes.",
          "Massive administrative overhead required to manually update company addresses across dozens of separate template files.",
        ],
      },
      solution: {
        title: "Centralized Corporate Registry with Automatic Cross-Portal Synchronization",
        description:
          "The Company Master module acts as the single source of corporate truth. When a corporate address, tax identification number, or designated signatory is updated in the master registry, the changes immediately propagate across the entire portal—updating letterheads, vehicle concession badges, and legal agreements automatically without manual intervention.",
        keyFeatures: [
          "Master multi-entity corporate registry ensuring 100% legal and statutory tax compliance.",
          "Automated real-time data inheritance across Letterhead, Charger Branding, and Vehicle Branding modules.",
          "Depot site location mapping coordinating physical fleet infrastructure with corporate governance.",
        ],
      },
    },
  ],
}

