export type ShapeKind =
  | "terminator" | "process" | "decision" | "delay" | "data" | "document"
  | "multiple-documents" | "subroutine" | "preparation" | "display" | "manual-input"
  | "manual-loop" | "loop-limit" | "stored-data" | "connector" | "off-page-down"
  | "off-page-up" | "off-page-left" | "off-page-right" | "or" | "summing-junction"
  | "collate" | "sort" | "merge" | "database" | "internal-storage"
  | "rectangle" | "rounded-rectangle" | "ellipse" | "diamond" | "hexagon" | "triangle"
  | "line" | "arrow" | "double-arrow" | "text";

export type ShapeCategory = "Flowchart" | "Data & Storage" | "Basic" | "Lines & Connectors";

export interface ShapeDefinition {
  kind: ShapeKind;
  label: string;
  category: ShapeCategory;
  description: string;
  defaultWidth?: number;
  defaultHeight?: number;
  aspectRatio?: number;
  canContainText?: boolean;
  isLine?: boolean;
}

export interface ChartShape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  fontSize: number;
  fontWeight: number;
  textColor: string;
  textAlign: "start" | "middle" | "end";
  locked: boolean;
  zIndex: number;
}

export interface ShapeConnector {
  id: string;
  fromId: string;
  toId: string;
  stroke: string;
  strokeWidth: number;
  startArrow: boolean;
  endArrow: boolean;
  dashed: boolean;
  label: string;
}

export interface ShapesDocument {
  version: 1;
  shapes: ChartShape[];
  connectors: ShapeConnector[];
}

export type EditorTool = "select" | "pan" | "draw" | "connect";
