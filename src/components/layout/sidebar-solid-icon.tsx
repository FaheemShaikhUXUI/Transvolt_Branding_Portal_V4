import React from "react"
import { LucideIcon } from "lucide-react"

interface SidebarSolidIconProps {
  href: string
  icon: LucideIcon
  isActive: boolean
  className?: string
}

export function SidebarSolidIcon({
  href,
  icon: FallbackIcon,
  isActive,
  className = "h-[18px] w-[18px]",
}: SidebarSolidIconProps) {
  if (!isActive) {
    return <FallbackIcon strokeWidth={2} className={className} />
  }

  // Active / Selected state: Render crisp, high-contrast solid icon with negative space cutouts
  switch (href) {
    case "/brand-guidelines":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <rect width="7.5" height="7.5" x="2.5" y="2.5" rx="1.8" />
          <rect width="7.5" height="7.5" x="14" y="2.5" rx="1.8" />
          <rect width="7.5" height="7.5" x="14" y="14" rx="1.8" />
          <rect width="7.5" height="7.5" x="2.5" y="14" rx="1.8" />
        </svg>
      )

    case "/assets/logo-colors":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <mask id="solid-palette-mask">
            <rect width="24" height="24" fill="white" />
            <circle cx="13.5" cy="6.5" r="1.3" fill="black" />
            <circle cx="17.5" cy="10.5" r="1.3" fill="black" />
            <circle cx="6.5" cy="12.5" r="1.3" fill="black" />
            <circle cx="8.5" cy="7.5" r="1.3" fill="black" />
          </mask>
          <path
            d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10a1 1 0 0 0 .7-.3 1 1 0 0 0 .3-.7v-.2c0-.966.784-1.75 1.75-1.75H17a5 5 0 0 0 5-5c0-6.627-4.477-12-10-12z"
            mask="url(#solid-palette-mask)"
          />
        </svg>
      )

    case "/assets/typography":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className={className} aria-hidden="true">
          <polyline points="4 7 4 4 20 4 20 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="9" x2="15" y1="20" y2="20" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" x2="12" y1="4" y2="20" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      )

    case "/assets/brand-assets":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z" />
          <path
            d="M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )

    case "/assets/stationery":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-filetext-mask">
            <rect width="24" height="24" fill="white" />
            <path d="M8 12h8M8 16h6" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          </mask>
          <path
            d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
            fill="currentColor"
            mask="url(#solid-filetext-mask)"
          />
          <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )

    case "/assets/id-cards":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-idcard-mask">
            <rect width="24" height="24" fill="white" />
            <circle cx="8" cy="11" r="2.2" fill="black" />
            <path d="M5 16a3.2 3.2 0 0 1 6 0" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 10.5h5M14 14h5" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          </mask>
          <rect x="2" y="5" width="20" height="14" rx="2.5" fill="currentColor" mask="url(#solid-idcard-mask)" />
        </svg>
      )

    case "/assets/digital-assets":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" />
          <line x1="8" x2="16" y1="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" x2="12" y1="17" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )

    case "/assets/printing-assets":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-printer-mask">
            <rect width="24" height="24" fill="white" />
            <rect x="6" y="14" width="12" height="7" rx="1" fill="black" />
          </mask>
          <path
            d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
            fill="currentColor"
            mask="url(#solid-printer-mask)"
          />
          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" fill="currentColor" />
          <rect x="6" y="14" width="12" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )

    case "/assets/company-presentation":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-presentation-mask">
            <rect width="24" height="24" fill="white" />
            <polygon points="10 7.2 15.5 10 10 12.8" fill="black" />
          </mask>
          <rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" mask="url(#solid-presentation-mask)" />
          <line x1="8" x2="16" y1="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" x2="12" y1="17" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )

    case "/assets/photo-repository":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-photo-mask">
            <rect width="24" height="24" fill="white" />
            {/* Cutout sun */}
            <circle cx="8.5" cy="8.5" r="2.2" fill="black" />
            {/* Cutout mountain ridge */}
            <path
              d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </mask>
          <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" mask="url(#solid-photo-mask)" />
        </svg>
      )

    case "/assets/vehicle-branding":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-car-mask">
            <rect width="24" height="24" fill="white" />
            <circle cx="7" cy="17" r="2.2" fill="black" />
            <circle cx="17" cy="17" r="2.2" fill="black" />
          </mask>
          <path
            d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            mask="url(#solid-car-mask)"
          />
          <circle cx="7" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="17" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="9" x2="15" y1="17" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )

    case "/assets/charger-branding":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )

    case "/assets/social-media-kit":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4M22 4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="4" cy="20" r="1.5" />
        </svg>
      )

    case "/assets/sonic-branding":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )

    case "/assets/org-chart":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <rect x="16" y="16" width="6" height="6" rx="1.5" />
          <rect x="2" y="16" width="6" height="6" rx="1.5" />
          <rect x="9" y="2" width="6" height="6" rx="1.5" />
          <path
            d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case "/assets/brand-philosophy":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-compass-mask">
            <rect width="24" height="24" fill="white" />
            <polygon points="16.24 7.76 14.436 13.171 7.76 16.24 9.564 10.829" fill="black" />
          </mask>
          <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#solid-compass-mask)" />
          <polygon points="16.24 7.76 14.436 13.171 7.76 16.24 9.564 10.829" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      )

    case "/assets/forms-documents":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <mask id="solid-clipboard-mask">
            <rect width="24" height="24" fill="white" />
            <path d="m9 14 2 2 4-4" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </mask>
          <rect x="4" y="4" width="16" height="18" rx="2" fill="currentColor" mask="url(#solid-clipboard-mask)" />
          <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        </svg>
      )

    default:
      return <FallbackIcon strokeWidth={2.5} className={className} />
  }
}

