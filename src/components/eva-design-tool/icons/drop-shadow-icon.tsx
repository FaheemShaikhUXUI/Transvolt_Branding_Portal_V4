import * as React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * Option 1: Classic CorelDRAW / Illustrator Vector Drop Shadow Tool
 * A crisp foreground shape with an offset dropped shadow and subtle offset projection ray.
 */
export function DropShadowIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <g transform="matrix(1.25 0 0 1.25 -3 -3)">
        {/* Dropped Shadow (offset down-right) */}
        <rect
          x="9"
          y="9"
          width="11"
          height="11"
          rx="2"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2.5 2"
        />
        {/* Foreground Shape */}
        <rect
          x="4"
          y="4"
          width="11"
          height="11"
          rx="2"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Vector interactive handle ray */}
        <path
          d="M15 15L20 20"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="1" fill="currentColor" />
      </g>
    </svg>
  )
}

/**
 * Option 2: Ground / Floor Elevation Shadow
 * A floating UI element casting an elliptical soft ground shadow underneath.
 */
export function DropShadowFloorIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Floating Card / Shape */}
      <rect
        x="5"
        y="3"
        width="14"
        height="12"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Elevation ray / float indicators */}
      <line x1="8" y1="8" x2="16" y2="8" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Cast Ground Shadow on Floor */}
      <ellipse
        cx="12"
        cy="20"
        rx="8.5"
        ry="2.5"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

/**
 * Option 3: Photoshop Layer Style / Offset Shadow with Multi-tier Depth
 * Two stacked layers showing crisp object casting a soft dispersed blur shadow.
 */
export function DropShadowLayersIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer shadow bloom / spread */}
      <rect
        x="10"
        y="10"
        width="11"
        height="11"
        rx="3"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="none"
      />
      {/* Mid shadow outline */}
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.45"
        strokeDasharray="2 2"
      />
      {/* Crisp foreground card */}
      <rect
        x="3"
        y="3"
        width="12"
        height="12"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  )
}

/**
 * Option 4: CorelDRAW Interactive Perspective Shadow
 * Vector object projecting a 3D perspective shadow cast to the right.
 */
export function DropShadowPerspectiveIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cast perspective shadow trapezoid */}
      <polygon
        points="14,9 21,14 17,21 10,21 14,16"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      {/* Foreground 2D Box */}
      <rect
        x="4"
        y="5"
        width="10"
        height="12"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Shadow cast origin arrow */}
      <path
        d="M14 17L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
