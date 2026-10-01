import * as React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * Option 1: CorelDRAW & Design Standard - Split Alpha Checkerboard
 * Half solid object revealing the universal alpha checkerboard grid on the other half.
 */
export function TransparencyIcon({ className = "w-4 h-4", ...props }: IconProps) {
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
      {/* Outer rounded container */}
      <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2" />
      {/* Dividing diagonal / vertical guideline */}
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.6" />
      {/* Left side: Solid / semi-opaque fill */}
      <rect x="3" y="3" width="9" height="18" rx="3" fill="currentColor" fillOpacity="0.45" stroke="none" />
      {/* Right side: Alpha checkerboard grid representing see-through transparency */}
      <rect x="12" y="3" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <rect x="16.5" y="7.5" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <rect x="12" y="12" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <rect x="16.5" y="16.5" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
    </svg>
  )
}

/**
 * Option 2: Overlapping Translucent Shapes (Venn Transparency)
 * Two overlapping circular discs showing a see-through intersection with optical blend.
 */
export function TransparencyVennIcon({ className = "w-4 h-4", ...props }: IconProps) {
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
      {/* Left circle */}
      <circle
        cx="9"
        cy="12"
        r="6"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Right circle */}
      <circle
        cx="15"
        cy="12"
        r="6"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Translucent Intersection highlight */}
      <path
        d="M12 7.2A6 6 0 0 1 15 12a6 6 0 0 1-3 4.8A6 6 0 0 1 9 12a6 6 0 0 1 3-4.8z"
        fill="currentColor"
        fillOpacity="0.38"
        stroke="none"
      />
    </svg>
  )
}

/**
 * Option 3: CorelDRAW Interactive Linear Gradient Transparency
 * Vector object with an interactive transparency fade slider and start/end handles.
 */
export function TransparencyGradientIcon({ className = "w-4 h-4", ...props }: IconProps) {
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
      {/* Base container */}
      <rect x="3" y="4" width="18" height="16" rx="2.5" strokeWidth="2" />
      {/* Linear fade stripes (dense to sparse) */}
      <line x1="6" y1="7" x2="6" y2="17" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="9" y1="7" x2="9" y2="17" strokeWidth="1.75" strokeOpacity="0.7" />
      <line x1="12" y1="7" x2="12" y2="17" strokeWidth="1.5" strokeOpacity="0.45" />
      <line x1="15" y1="7" x2="15" y2="17" strokeWidth="1.25" strokeOpacity="0.25" />
      <line x1="18" y1="7" x2="18" y2="17" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="1.5 1.5" />
      {/* Interactive slider vector bar */}
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="12" r="2" fill="currentColor" />
      <circle cx="17" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Option 4: Classic CorelDRAW Wine Glass / Goblet Icon
 * The iconic vintage CorelDRAW Transparency Tool icon recognizable to millions of vector artists.
 */
export function TransparencyGobletIcon({ className = "w-4 h-4", ...props }: IconProps) {
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
      {/* Glass bowl with rounded curve */}
      <path
        d="M6 3H18V10C18 13.3137 15.3137 16 12 16C8.68629 16 6 13.3137 6 10V3Z"
        fill="currentColor"
        fillOpacity="0.12"
        strokeWidth="2"
      />
      {/* Liquid level inside glass */}
      <path
        d="M6 8C7.5 7.5 10.5 7.5 12 8C13.5 8.5 16.5 8.5 18 8"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      {/* Lower bowl shading */}
      <path
        d="M6 10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10C18 10 15 11 12 11C9 11 6 10 6 10Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="none"
      />
      {/* Stem */}
      <line x1="12" y1="16" x2="12" y2="21" strokeWidth="2" />
      {/* Base foot */}
      <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
