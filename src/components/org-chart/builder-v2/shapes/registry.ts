import type { ShapeDefinition, ShapeKind } from "./types";

export const SHAPE_REGISTRY: ShapeDefinition[] = [
  { kind:"terminator", label:"Terminator", category:"Flowchart", description:"Program start or end.", defaultWidth:150, defaultHeight:64, aspectRatio:2.34, canContainText:true },
  { kind:"process", label:"Process", category:"Flowchart", description:"Processing step.", defaultWidth:150, defaultHeight:70, canContainText:true },
  { kind:"decision", label:"Decision", category:"Flowchart", description:"Branch between paths.", defaultWidth:150, defaultHeight:90, canContainText:true },
  { kind:"delay", label:"Delay", category:"Flowchart", description:"Waiting or delay.", defaultWidth:150, defaultHeight:70, canContainText:true },
  { kind:"data", label:"Data / Input-Output", category:"Flowchart", description:"Input or output data.", defaultWidth:150, defaultHeight:70, aspectRatio:2.14, canContainText:true },
  { kind:"document", label:"Document", category:"Flowchart", description:"Document or printed output.", defaultWidth:150, defaultHeight:85, canContainText:true },
  { kind:"multiple-documents", label:"Multiple Documents", category:"Flowchart", description:"Multiple document sheets.", defaultWidth:155, defaultHeight:90, canContainText:true },
  { kind:"subroutine", label:"Subroutine", category:"Flowchart", description:"Predefined process or module.", defaultWidth:160, defaultHeight:70, canContainText:true },
  { kind:"preparation", label:"Preparation", category:"Flowchart", description:"Initialization or setup.", defaultWidth:150, defaultHeight:75, canContainText:true },
  { kind:"display", label:"Display", category:"Flowchart", description:"Displayed information.", defaultWidth:150, defaultHeight:70, canContainText:true },
  { kind:"manual-input", label:"Manual Input", category:"Flowchart", description:"Manually entered data.", defaultWidth:150, defaultHeight:70, canContainText:true },
  { kind:"manual-loop", label:"Manual Loop", category:"Flowchart", description:"Manual looping sequence.", defaultWidth:150, defaultHeight:70, canContainText:true },
  { kind:"loop-limit", label:"Loop Limit", category:"Flowchart", description:"Loop start or end.", defaultWidth:150, defaultHeight:75, canContainText:true },
  { kind:"stored-data", label:"Stored Data", category:"Flowchart", description:"Stored information.", defaultWidth:150, defaultHeight:75, canContainText:true },
  { kind:"connector", label:"Connector", category:"Flowchart", description:"Inspection point or connection.", defaultWidth:72, defaultHeight:72, aspectRatio:1, canContainText:true },
  { kind:"off-page-down", label:"Off-Page Connector ↓", category:"Flowchart", description:"Reference to another page.", defaultWidth:100, defaultHeight:82, canContainText:true },
  { kind:"off-page-up", label:"Off-Page Connector ↑", category:"Flowchart", description:"Upward off-page reference.", defaultWidth:100, defaultHeight:82, canContainText:true },
  { kind:"off-page-left", label:"Off-Page Connector ←", category:"Flowchart", description:"Leftward off-page reference.", defaultWidth:100, defaultHeight:82, canContainText:true },
  { kind:"off-page-right", label:"Off-Page Connector →", category:"Flowchart", description:"Rightward off-page reference.", defaultWidth:100, defaultHeight:82, canContainText:true },
  { kind:"or", label:"OR Junction", category:"Flowchart", description:"Logical OR junction.", defaultWidth:72, defaultHeight:72, aspectRatio:1, canContainText:true },
  { kind:"summing-junction", label:"Summing Junction", category:"Flowchart", description:"Logical junction symbol.", defaultWidth:72, defaultHeight:72, aspectRatio:1, canContainText:true },
  { kind:"collate", label:"Collate", category:"Flowchart", description:"Organize data into standard order.", defaultWidth:90, defaultHeight:90, canContainText:false },
  { kind:"sort", label:"Sort", category:"Flowchart", description:"Sort items sequentially.", defaultWidth:90, defaultHeight:90, canContainText:false },
  { kind:"merge", label:"Merge", category:"Flowchart", description:"Combine multiple sets.", defaultWidth:90, defaultHeight:90, canContainText:false },
  { kind:"database", label:"Database", category:"Data & Storage", description:"Structured searchable data.", defaultWidth:145, defaultHeight:90, canContainText:true },
  { kind:"internal-storage", label:"Internal Storage", category:"Data & Storage", description:"Internal storage device.", defaultWidth:145, defaultHeight:90, canContainText:true },
  { kind:"rectangle", label:"Rectangle", category:"Basic", description:"Basic rectangular shape.", defaultWidth:140, defaultHeight:80, canContainText:true },
  { kind:"rounded-rectangle", label:"Rounded Rectangle", category:"Basic", description:"Rounded rectangular shape.", defaultWidth:140, defaultHeight:80, canContainText:true },
  { kind:"ellipse", label:"Ellipse / Circle", category:"Basic", description:"Oval or circle.", defaultWidth:100, defaultHeight:100, aspectRatio:1, canContainText:true },
  { kind:"diamond", label:"Diamond", category:"Basic", description:"Diamond shape.", defaultWidth:130, defaultHeight:90, canContainText:true },
  { kind:"hexagon", label:"Hexagon", category:"Basic", description:"Six-sided polygon.", defaultWidth:140, defaultHeight:80, canContainText:true },
  { kind:"triangle", label:"Triangle", category:"Basic", description:"Triangle shape.", defaultWidth:100, defaultHeight:90, canContainText:true },
  { kind:"line", label:"Line", category:"Lines & Connectors", description:"Free line.", defaultWidth:120, defaultHeight:2, isLine:true },
  { kind:"arrow", label:"Arrow", category:"Lines & Connectors", description:"Directional arrow.", defaultWidth:120, defaultHeight:2, isLine:true },
  { kind:"double-arrow", label:"Double-Ended Arrow", category:"Lines & Connectors", description:"Arrow at both ends.", defaultWidth:120, defaultHeight:2, isLine:true },
  { kind:"text", label:"Text Label", category:"Basic", description:"Free text annotation.", defaultWidth:160, defaultHeight:48, canContainText:true },
];

export const getShapeDefinition = (kind: ShapeKind): ShapeDefinition =>
  SHAPE_REGISTRY.find((shape) => shape.kind === kind) || {
    kind,
    label: kind,
    category: "Basic",
    description: "Shape",
    defaultWidth: 140,
    defaultHeight: 80,
    canContainText: true,
  };

export const SHAPE_CATEGORIES = ["Flowchart", "Data & Storage", "Basic", "Lines & Connectors"] as const;
