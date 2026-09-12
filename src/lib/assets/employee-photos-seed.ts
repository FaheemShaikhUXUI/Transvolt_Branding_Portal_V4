import { Asset, PhotoItem } from "@/components/assets/asset-tile"

function createEmployeePortraitSvg(
  name: string,
  initials: string,
  designation: string,
  bgColor1: string,
  bgColor2: string,
  accentColor: string
): string {
  const safeName = name.replace(/&/g, "&amp;")
  const safeInitials = initials.replace(/&/g, "&amp;")
  const safeDesignation = designation.replace(/&/g, "&amp;")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor1}"/>
        <stop offset="100%" stop-color="${bgColor2}"/>
      </linearGradient>
      <radialGradient id="avatarGlow" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#E2E8F0"/>
        <stop offset="100%" stop-color="#CBD5E1"/>
      </linearGradient>
    </defs>

    <!-- Background Canvas -->
    <rect width="600" height="600" fill="url(#avatarBg)"/>
    <circle cx="300" cy="300" r="280" fill="url(#avatarGlow)"/>

    <!-- Subtle Ambient Rings -->
    <circle cx="300" cy="250" r="160" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.25" stroke-dasharray="8 6"/>
    <circle cx="300" cy="250" r="185" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.12"/>

    <!-- Stylized Executive Torso & Collar -->
    <g transform="translate(300, 300)">
      <!-- Shoulders / Business Suit -->
      <path d="M-170 280 C-160 210, -90 170, -45 155 L-45 140 L45 140 L45 155 C90 170, 160 210, 170 280 Z" fill="url(#suitGrad)"/>
      <!-- Inner Shirt V-Neck -->
      <path d="M-45 155 L0 235 L45 155 Z" fill="#F8FAFC"/>
      <!-- Necktie with Brand Accent Color -->
      <path d="M-14 175 L14 175 L18 250 L0 275 L-18 250 Z" fill="${accentColor}"/>
      
      <!-- Neck -->
      <path d="M-36 120 L-36 155 L36 155 L36 120 Z" fill="url(#skinGrad)"/>

      <!-- Head / Face Silhouette -->
      <ellipse cx="0" cy="60" rx="68" ry="82" fill="url(#skinGrad)"/>

      <!-- Professional Hairstyle Silhouette -->
      <path d="M-72 55 C-72 -20, -50 -45, 0 -45 C50 -45, 72 -20, 72 55 C65 25, 45 5, 0 5 C-45 5, -65 25, -72 55 Z" fill="#0F172A"/>

      <!-- Initials Monogram Badge in Center of Lapel -->
      <circle cx="0" cy="62" r="48" fill="rgba(15, 23, 42, 0.08)"/>
      <text x="0" y="76" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">${safeInitials}</text>
    </g>

    <!-- Transvolt Official Accent Indicator -->
    <circle cx="480" cy="480" r="28" fill="${accentColor}" stroke="#ffffff" stroke-width="4"/>
    <path d="M474 480 L479 485 L488 474" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getInitialEmployeePhotoAssets(): Asset[] {
  const employeesData = [
    {
      name: "Rajesh Sharma",
      initials: "RS",
      designation: "Chief Technology Officer",
      company: "Transvolt Mobility Private Limited",
      siteLocation: "Mumbai HQ",
      bg1: "#0F172A",
      bg2: "#1E3A8A",
      accent: "#38BDF8",
    },
    {
      name: "Ananya Verma",
      initials: "AV",
      designation: "Lead EV Powertrain Engineer",
      company: "Transvolt Mobility Private Limited",
      siteLocation: "Pune Hub",
      bg1: "#064E3B",
      bg2: "#047857",
      accent: "#34D399",
    },
    {
      name: "Vikram Patel",
      initials: "VP",
      designation: "Head of Charging Infrastructure",
      company: "Transvolt Energy Private Limited",
      siteLocation: "Bengaluru Plant",
      bg1: "#4C1D95",
      bg2: "#6D28D9",
      accent: "#A78BFA",
    },
    {
      name: "Pooja Hegde",
      initials: "PH",
      designation: "Senior Brand & Communications Manager",
      company: "Transvolt Mobility Private Limited",
      siteLocation: "Mumbai HQ",
      bg1: "#831843",
      bg2: "#BE185D",
      accent: "#F472B6",
    },
    {
      name: "Arjun Nair",
      initials: "AN",
      designation: "Fleet Operations Director",
      company: "Transvolt Fleet Services",
      siteLocation: "Hyderabad Yard",
      bg1: "#78350F",
      bg2: "#B45309",
      accent: "#FBBF24",
    },
    {
      name: "Sunita Deshmukh",
      initials: "SD",
      designation: "VP, Safety & Compliance",
      company: "Transvolt Logistics",
      siteLocation: "Delhi NCR Depot",
      bg1: "#1E293B",
      bg2: "#334155",
      accent: "#60A5FA",
    },
  ]

  const todayFormatted = "07 Sep 2026"

  return employeesData.map((emp, idx) => {
    const portraitUrl = createEmployeePortraitSvg(
      emp.name,
      emp.initials,
      emp.designation,
      emp.bg1,
      emp.bg2,
      emp.accent
    )

    const photoItem: PhotoItem = {
      id: `photo_emp_${idx + 1}_${Date.now()}`,
      name: `${emp.name} - Official Portrait.jpg`,
      url: portraitUrl,
      thumbnailUrl: portraitUrl,
      size: 2450000,
      type: "image/jpeg",
      uploadedAt: todayFormatted,
    }

    return {
      id: `photo_col_emp_${idx + 1}`,
      name: emp.name,
      designation: emp.designation,
      companyName: emp.company,
      siteLocation: emp.siteLocation,
      category: "photos",
      subCategory: "Employee",
      status: "active",
      createdAt: todayFormatted,
      updatedAt: todayFormatted,
      createdBy: "HR Operations",
      date: todayFormatted,
      thumbnail: portraitUrl,
      photos: [photoItem],
      formats: {
        JPG: {
          fileName: `${emp.name} - Official Portrait.jpg`,
          fileData: portraitUrl,
        },
      },
    }
  })
}
