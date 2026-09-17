import { Asset, PhotoItem } from "@/components/assets/asset-tile"

function createSitePhotoSvg(
  title: string,
  subtitle: string,
  badgeText: string,
  bgColor1: string,
  bgColor2: string,
  accentColor: string
): string {
  const safeTitle = title.replace(/&/g, "&amp;")
  const safeSubtitle = subtitle.replace(/&/g, "&amp;")
  const safeBadge = badgeText.replace(/&/g, "&amp;")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor1}"/>
        <stop offset="100%" stop-color="${bgColor2}"/>
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    
    <!-- Background Canvas -->
    <rect width="1200" height="900" fill="url(#bg)"/>
    <rect width="1200" height="900" fill="url(#glow)"/>
    
    <!-- Geometric Architecture Grid Lines -->
    <g stroke="rgba(255,255,255,0.08)" stroke-width="1.5">
      <line x1="0" y1="200" x2="1200" y2="200"/>
      <line x1="0" y1="450" x2="1200" y2="450"/>
      <line x1="0" y1="700" x2="1200" y2="700"/>
      <line x1="300" y1="0" x2="300" y2="900"/>
      <line x1="600" y1="0" x2="600" y2="900"/>
      <line x1="900" y1="0" x2="900" y2="900"/>
    </g>

    <!-- Outer Structural Frame -->
    <rect x="50" y="50" width="1100" height="800" rx="28" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2.5"/>

    <!-- Site Category Tag Pill -->
    <g transform="translate(90, 95)">
      <rect width="170" height="38" rx="19" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="1.5"/>
      <circle cx="20" cy="19" r="5" fill="${accentColor}"/>
      <text x="35" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff" letter-spacing="1.5">${safeBadge}</text>
    </g>

    <!-- Transvolt Brandmark Header -->
    <text x="1110" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="rgba(255,255,255,0.7)" text-anchor="end" letter-spacing="3">TRANSVOLT INFRASTRUCTURE</text>

    <!-- Central High-Tech Icon Graphic -->
    <g transform="translate(600, 360)">
      <!-- Outer Glow Hexagon / Circle -->
      <circle cx="0" cy="0" r="105" fill="none" stroke="${accentColor}" stroke-width="3" stroke-dasharray="10 8" opacity="0.65"/>
      <circle cx="0" cy="0" r="85" fill="${accentColor}" fill-opacity="0.12"/>
      <!-- Lightning Bolt / Charging Symbol -->
      <path d="M-15 -60 L25 -60 L-5 0 L35 0 L-25 70 L-5 10 L-35 10 Z" fill="${accentColor}"/>
    </g>

    <!-- Site Title & Description -->
    <text x="600" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">${safeTitle}</text>
    <text x="600" y="585" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.75)" text-anchor="middle">${safeSubtitle}</text>

    <!-- Metadata Footer Bar -->
    <g transform="translate(90, 750)">
      <rect width="1020" height="54" rx="14" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <text x="25" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.85)">LOCATION VERIFIED • LIVE CHARGING TERMINAL</text>
      <text x="995" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${accentColor}" text-anchor="end">ORIGINAL RESOLUTION • 1200x900</text>
    </g>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function createSiteVideoSvg(
  title: string,
  subtitle: string,
  badgeText: string,
  bgColor1: string,
  bgColor2: string,
  accentColor: string
): string {
  const safeTitle = title.replace(/&/g, "&amp;")
  const safeSubtitle = subtitle.replace(/&/g, "&amp;")
  const safeBadge = badgeText.replace(/&/g, "&amp;")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor1}"/>
        <stop offset="100%" stop-color="${bgColor2}"/>
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    
    <!-- Background Canvas -->
    <rect width="1200" height="900" fill="url(#bg)"/>
    <rect width="1200" height="900" fill="url(#glow)"/>
    
    <!-- Video Play Central Graphic -->
    <g transform="translate(600, 360)">
      <circle cx="0" cy="0" r="115" fill="none" stroke="${accentColor}" stroke-width="4" stroke-dasharray="12 8" opacity="0.8"/>
      <circle cx="0" cy="0" r="90" fill="${accentColor}" fill-opacity="0.25"/>
      <!-- Play Triangle -->
      <polygon points="-25,-45 50,0 -25,45" fill="#ffffff"/>
    </g>

    <!-- Outer Structural Frame -->
    <rect x="50" y="50" width="1100" height="800" rx="28" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2.5"/>

    <!-- Video Category Tag Pill -->
    <g transform="translate(90, 95)">
      <rect width="160" height="38" rx="19" fill="#E11D48" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5"/>
      <polygon points="20,13 32,19 20,25" fill="#ffffff"/>
      <text x="42" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#ffffff" letter-spacing="1.5">${safeBadge}</text>
    </g>

    <!-- Transvolt Header -->
    <text x="1110" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="rgba(255,255,255,0.8)" text-anchor="end" letter-spacing="3">TRANSVOLT VIDEO REPOSITORY</text>

    <!-- Title & Description -->
    <text x="600" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">${safeTitle}</text>
    <text x="600" y="585" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.8)" text-anchor="middle">${safeSubtitle}</text>

    <!-- Metadata Footer Bar -->
    <g transform="translate(90, 750)">
      <rect width="1020" height="54" rx="14" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <text x="25" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.9)">FORMAT: MP4 • 4K ULTRA HD • 60 FPS AUDIO</text>
      <text x="995" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${accentColor}" text-anchor="end">LOSSLESS STREAM READY</text>
    </g>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getInitialSitePhotoAssets(): Asset[] {
  const bkcPhotos: PhotoItem[] = [
    {
      id: "site_photo_bkc_01",
      name: "BKC_DC_Fast_Chargers_Bay.jpg",
      url: createSitePhotoSvg(
        "120kW Dual-Gun DC Fast Chargers",
        "Bay 01 - Heavy EV & Fleet Rapid Charging Terminal",
        "SITE HUB",
        "#0B192C",
        "#1E3E62",
        "#00D2FF"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "120kW Dual-Gun DC",
        "Bay 01 Terminal",
        "SITE",
        "#0B192C",
        "#1E3E62",
        "#00D2FF"
      ),
      size: 4280000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_02",
      name: "Heavy_EV_Bus_Charging_Dispenser.jpg",
      url: createSitePhotoSvg(
        "240kW Heavy Commercial EV Bay",
        "High-Power Liquid-Cooled Dispenser Line",
        "HEAVY EV",
        "#0A2540",
        "#134B70",
        "#00FFA3"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "240kW Heavy EV Bay",
        "Dispenser Line",
        "HEAVY EV",
        "#0A2540",
        "#134B70",
        "#00FFA3"
      ),
      size: 5120000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_03",
      name: "Transvolt_Solar_Canopy_Terminal.jpg",
      url: createSitePhotoSvg(
        "Bifacial Solar Canopy Array",
        "Renewable Microgrid Integrated Roof Structure",
        "SOLAR HUB",
        "#111827",
        "#1F2937",
        "#F59E0B"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Solar Canopy Array",
        "Renewable Roof",
        "SOLAR",
        "#111827",
        "#1F2937",
        "#F59E0B"
      ),
      size: 3840000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_04",
      name: "Substation_Transformer_Unit.jpg",
      url: createSitePhotoSvg(
        "1.5 MVA Compact Substation",
        "Dedicated High-Voltage Grid Step-Down Transformer",
        "GRID UNIT",
        "#1E1E2F",
        "#2D2B55",
        "#A78BFA"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "1.5 MVA Substation",
        "High-Voltage Unit",
        "GRID",
        "#1E1E2F",
        "#2D2B55",
        "#A78BFA"
      ),
      size: 4720000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_05",
      name: "Fleet_EV_Lane_View.jpg",
      url: createSitePhotoSvg(
        "Multi-Lane Automated Charging Bays",
        "Fleet Flow Directional Signage & Sensor Gates",
        "FLEET LANE",
        "#064E3B",
        "#047857",
        "#34D399"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Automated Charging Bays",
        "Fleet Lane View",
        "LANE",
        "#064E3B",
        "#047857",
        "#34D399"
      ),
      size: 4180000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_06",
      name: "Battery_Energy_Storage_System.jpg",
      url: createSitePhotoSvg(
        "500kWh BESS Containerized Unit",
        "Peak-Shaving Lithium Battery Storage Facility",
        "STORAGE",
        "#1C1917",
        "#292524",
        "#38BDF8"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "500kWh BESS Storage",
        "Peak Shaving Unit",
        "BESS",
        "#1C1917",
        "#292524",
        "#38BDF8"
      ),
      size: 4600000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_07",
      name: "Night_Operations_Illumination.jpg",
      url: createSitePhotoSvg(
        "Night 24/7 Illumination Perimeter",
        "High-Lumen LED Fleet Security & Operational Lighting",
        "NIGHT 24/7",
        "#0F172A",
        "#1E293B",
        "#818CF8"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Night Illumination",
        "24/7 Perimeter",
        "NIGHT",
        "#0F172A",
        "#1E293B",
        "#818CF8"
      ),
      size: 4950000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_photo_bkc_08",
      name: "Driver_Amenity_Lounge_Exterior.jpg",
      url: createSitePhotoSvg(
        "Driver Rest & Operations Lounge",
        "Turnkey Hub Amenities & Monitoring Office",
        "AMENITY",
        "#1E3A8A",
        "#172554",
        "#60A5FA"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Operations Lounge",
        "Hub Exterior",
        "AMENITY",
        "#1E3A8A",
        "#172554",
        "#60A5FA"
      ),
      size: 3910000,
      type: "image/jpeg",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_video_bkc_09",
      name: "BKC_Mega_Hub_Aerial_Flythrough.mp4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      originalUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: createSiteVideoSvg(
        "4K Drone Aerial Flythrough",
        "BKC Mega Hub Operational Fleet & Solar Canopy",
        "4K VIDEO",
        "#030712",
        "#111827",
        "#F43F5E"
      ),
      size: 24800000,
      type: "video/mp4",
      uploadedAt: "02 September 2026",
    },
    {
      id: "site_video_bkc_10",
      name: "Fast_Charging_Automated_Sequence.mp4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      originalUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnailUrl: createSiteVideoSvg(
        "Automated Bay Connection Demo",
        "Heavy EV Bus Fast Charge Connection Sequence",
        "4K VIDEO",
        "#0F172A",
        "#1E293B",
        "#E11D48"
      ),
      size: 19500000,
      type: "video/mp4",
      uploadedAt: "02 September 2026",
    },
  ]

  const bengaluruPhotos: PhotoItem[] = [
    {
      id: "site_photo_blr_01",
      name: "Depot_EBus_Charging_Corridor.jpg",
      url: createSitePhotoSvg(
        "Depot E-Bus Charging Corridor",
        "Dedicated Multi-Port Fast Charger Line - Electronic City",
        "DEPOT",
        "#18181B",
        "#27272A",
        "#38BDF8"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "E-Bus Corridor",
        "Electronic City Depot",
        "DEPOT",
        "#18181B",
        "#27272A",
        "#38BDF8"
      ),
      size: 4420000,
      type: "image/jpeg",
      uploadedAt: "28 August 2026",
    },
    {
      id: "site_photo_blr_02",
      name: "Pantograph_Ultra_Fast_Dispenser.jpg",
      url: createSitePhotoSvg(
        "Top-Down Automated Pantograph Charger",
        "400kW Opportunity Rapid Bus Charging Inverted Mast",
        "PANTOGRAPH",
        "#0C4A6E",
        "#075985",
        "#0284C7"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Pantograph Mast",
        "400kW Ultra Fast",
        "MAST",
        "#0C4A6E",
        "#075985",
        "#0284C7"
      ),
      size: 5180000,
      type: "image/jpeg",
      uploadedAt: "28 August 2026",
    },
    {
      id: "site_photo_blr_03",
      name: "Depot_SCADA_Control_Center.jpg",
      url: createSitePhotoSvg(
        "Site Telemetry & SCADA Operations",
        "Central Energy Management & Load Balancing Screens",
        "SCADA",
        "#1E1B4B",
        "#312E81",
        "#C084FC"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "SCADA Control Center",
        "Telemetry Hub",
        "SCADA",
        "#1E1B4B",
        "#312E81",
        "#C084FC"
      ),
      size: 3890000,
      type: "image/jpeg",
      uploadedAt: "28 August 2026",
    },
    {
      id: "site_photo_blr_04",
      name: "Overnight_Fleet_Charging_Dock.jpg",
      url: createSitePhotoSvg(
        "Overnight AC/DC Slow & Fast Staging",
        "Sequential Smart Balancing Depot Docks",
        "STAGING",
        "#14532D",
        "#166534",
        "#4ADE80"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Overnight Staging Dock",
        "Smart Balancing",
        "DOCK",
        "#14532D",
        "#166534",
        "#4ADE80"
      ),
      size: 4320000,
      type: "image/jpeg",
      uploadedAt: "28 August 2026",
    },
    {
      id: "site_photo_blr_05",
      name: "Transformer_Yard_Safety_Fencing.jpg",
      url: createSitePhotoSvg(
        "High-Voltage Transformer Sub-Yard",
        "Safety Perimeter Enclosure & Fire Suppression",
        "SAFETY",
        "#450A0A",
        "#7F1D1D",
        "#F87171"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Transformer Yard",
        "Perimeter Enclosure",
        "SAFETY",
        "#450A0A",
        "#7F1D1D",
        "#F87171"
      ),
      size: 4790000,
      type: "image/jpeg",
      uploadedAt: "28 August 2026",
    },
    {
      id: "site_photo_blr_06",
      name: "Depot_Entry_Branding_Pylon.jpg",
      url: createSitePhotoSvg(
        "Transvolt Illuminated Entry Totem",
        "Digital LED Status Display & Site Pylon Sign",
        "BRANDING",
        "#1E3A8A",
        "#1D4ED8",
        "#38BDF8"
      ),
      thumbnailUrl: createSitePhotoSvg(
        "Entry Pylon Sign",
        "Illuminated Totem",
        "TOTEM",
        "#1E3A8A",
        "#1D4ED8",
        "#38BDF8"
      ),
      size: 4120000,
      type: "image/jpeg",
      uploadedAt: "28 August 2026",
    },
    {
      id: "site_video_blr_07",
      name: "Bengaluru_Fleet_Night_TimeLapse.mp4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      originalUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: createSiteVideoSvg(
        "Night Fleet Operations Time-Lapse",
        "Electronic City Terminal 12-Hour Continuous Charging Cycle",
        "4K VIDEO",
        "#09090B",
        "#18181B",
        "#E11D48"
      ),
      size: 31200000,
      type: "video/mp4",
      uploadedAt: "28 August 2026",
    },
  ]

  return [
    {
      id: "photo_col_site_bkc_hub",
      name: "BKC EV Mega Charging Hub - Mumbai",
      category: "photos",
      subCategory: "Site",
      status: "active",
      createdAt: "02 September 2026",
      updatedAt: "02 September 2026",
      createdBy: "Infrastructure Operations",
      date: "02 September 2026",
      thumbnail: bkcPhotos[0].thumbnailUrl,
      photos: bkcPhotos,
      formats: {
        JPG: {
          fileName: bkcPhotos[0].name,
          fileData: bkcPhotos[0].url,
        },
      },
    },
    {
      id: "photo_col_site_bengaluru_depot",
      name: "Bengaluru Central Fleet Terminal Depot",
      category: "photos",
      subCategory: "Site",
      status: "active",
      createdAt: "28 August 2026",
      updatedAt: "28 August 2026",
      createdBy: "Project Delivery Team",
      date: "28 August 2026",
      thumbnail: bengaluruPhotos[0].thumbnailUrl,
      photos: bengaluruPhotos,
      formats: {
        JPG: {
          fileName: bengaluruPhotos[0].name,
          fileData: bengaluruPhotos[0].url,
        },
      },
    },
  ]
}
