export type ToolType =
  | "select"
  | "frame"
  | "rectangle"
  | "circle"
  | "shape"
  | "pencil"
  | "pen"
  | "anchor"
  | "text"
  | "crop"
  | "transparency"
  | "shadow"
  | "zoom"
  | "ruler"
  | "eyedropper"
  | "blend"
  | "stroke"
  | "color"

export type ShapeSubtype =
  | "triangle"
  | "star"
  | "polygon"
  | "hexagon"
  | "pentagon"
  | "arrow"
  | "line"
  | "diamond"
  | "cross"

export type PageSizePreset =
  | "A0"
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "Letter"
  | "Legal"
  | "Tabloid"
  | "Executive"
  | "Statement"
  | "Business Card"
  | "Postcard"
  | "DL Envelope"
  | "#10 Envelope"
  | "Full HD"
  | "4K UHD"
  | "Instagram Post"
  | "Instagram Story"
  | "Custom"
  | (string & {})

export type MeasurementUnit = "px" | "mm" | "pt" | "in" | "ft" | "cm"

export type PageOrientation = "portrait" | "landscape"

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "soft-light"
  | "hard-light"
  | "difference"

export interface PenNode {
  x: number
  y: number
  cpIn?: { x: number; y: number } | null
  cpOut?: { x: number; y: number } | null
}

export type RotationAnchorType =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "node"

export interface CanvasObject {
  id: string
  name: string
  type: "frame" | "rectangle" | "circle" | "shape" | "path" | "pencil" | "text" | "image"
  subtype?: ShapeSubtype
  x: number
  y: number
  width: number
  height: number
  rotation: number // degrees 0-360
  pivotX?: number // Center of rotation X
  pivotY?: number // Center of rotation Y
  rotationAnchorType?: RotationAnchorType
  opacity: number // 0-1
  fill: string
  stroke: string
  strokeWidth: number
  strokeDashArray?: string
  strokeLineCap?: "butt" | "round" | "square"
  strokeLineJoin?: "miter" | "round" | "bevel"
  cornerRadius?: number
  blendMode: BlendMode
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  // Path data (for pencil, pen, custom shapes)
  pathData?: string
  points?: { x: number; y: number }[]
  penNodes?: PenNode[]
  // Text specific (CorelDRAW Comprehensive Typography Specification)
  text?: string
  textType?: "artistic" | "paragraph" // CorelDRAW Artistic vs Paragraph Text
  fontFamily?: string
  fontSize?: number // in pt / px
  fontWeight?: "normal" | "medium" | "bold" | "600" | "700" | "800" | string
  fontStyle?: "normal" | "italic" | "oblique"
  textDecoration?: "none" | "underline" | "line-through" | "overline" | "underline line-through"
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  fontVariant?: "normal" | "small-caps"
  verticalScript?: "normal" | "superscript" | "subscript"
  textAlign?: "left" | "center" | "right" | "justify"
  verticalAlign?: "top" | "middle" | "bottom"
  letterSpacing?: number // Character tracking / kerning in px
  wordSpacing?: number // Word spacing in px
  lineHeight?: number // Leading / line height multiplier (e.g. 1.2)
  firstLineIndent?: number // CorelDRAW first line indent
  paragraphSpacingBefore?: number
  paragraphSpacingAfter?: number
  dropCap?: boolean
  dropCapLines?: number
  listType?: "none" | "bullet" | "number" | "dash"
  textColumns?: number // Frame columns (1, 2, 3)
  columnGutter?: number
  frameBackground?: string // Background tint of paragraph frame
  frameBorderColor?: string
  frameBorderWidth?: number
  framePadding?: number
  strokeBehindFill?: boolean // CorelDRAW Outline Behind Fill
  horizontalScale?: number // Character horizontal stretch % (default 100)
  verticalScale?: number // Character vertical stretch % (default 100)
  baselineShift?: number // Baseline shift in px
  textOrientation?: "horizontal" | "vertical" // CorelDRAW text orientation
  // Image specific
  src?: string
  cropRect?: { x: number; y: number; width: number; height: number }
  locked?: boolean
  zIndex: number
  pageId?: string
}

export interface DocumentPage {
  id: string
  name: string
  pageSize: PageSizePreset
  widthMm: number
  heightMm: number
  orientation: PageOrientation
  backgroundColor?: string
}

export interface DocumentSettings {
  fileName: string
  pageSize: PageSizePreset
  widthMm: number
  heightMm: number
  orientation: PageOrientation
  unit: MeasurementUnit
  backgroundColor: string
  workspaceColor?: string
  showRulers: boolean
  zoom: number // 0.2 to 5.0
  panX: number
  panY: number
  activePageId?: string
}

export type EvaPersona = "basic" | "tapori" | "bihari"

export interface EvaBotMessage {
  id: string
  sender: "user" | "eva" | "system"
  text: string
  timestamp: string
  persona?: EvaPersona
  actionPerformed?: string
  researchSource?: string
  status?: "pending" | "confirmed" | "executed" | "error"
}

export interface GhostCursorState {
  visible: boolean
  x: number
  y: number
  targetLabel?: string
  isClicking?: boolean
  action?: string
}

export type EvaExecutionMode = "auto" | "ask"

export interface FileItem {
  srNo: number
  id: string
  name: string
  type: "Folder" | "PDF" | "PNG" | "JPG" | "SVG" | "CDR" | "AI"
  itemCountOrSize: string
  dateModified: string
  color?: string
}
