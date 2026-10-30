import React from "react";
import type { ChartShape, ShapeKind } from "./types";

const pts = (pairs: number[][]) => pairs.map(([x,y]) => `${x},${y}`).join(" ");
const pathFor = (kind: ShapeKind, w: number, h: number) => {
  const x = w, y = h, cx = w/2, cy = h/2;
  switch (kind) {
    case "terminator": return <rect x="0" y="0" width={x} height={y} rx={y/2} />;
    case "process": case "rectangle": return <rect x="0" y="0" width={x} height={y} />;
    case "rounded-rectangle": return <rect x="0" y="0" width={x} height={y} rx={Math.min(14,h/4)} />;
    case "decision": case "diamond": return <polygon points={pts([[cx,0],[x,cy],[cx,y],[0,cy]])} />;
    case "delay": return <path d={`M0 0 H${w-h/2} A${h/2} ${h/2} 0 0 1 ${w-h/2} ${h} H0 Z`} />;
    case "data": return <polygon points={pts([[w*.18,0],[x,y],[w*.82,y],[0,0]])} />;
    case "document": return <path d={`M0 0 H${x} V${y*.78} C${w*.75} ${y*1.02},${w*.62} ${y*.68},${w*.42} ${y*.82} C${w*.24} ${y*.96},${w*.12} ${y*.78},0 ${y*.85} Z`} />;
    case "multiple-documents": return <g><path d={`M8 0 H${x-8} V${y*.8} C${w*.7} ${y*.98},${w*.55} ${y*.7},${w*.4} ${y*.84} C${w*.2} ${y*.96},${w*.1} ${y*.8},8 ${y*.86} Z`} transform="translate(8 0)" /><path d={`M0 8 H${x-8} V${y*.82} C${w*.7} ${y},${w*.55} ${y*.73},${w*.4} ${y*.86} C${w*.2} ${y},${w*.1} ${y*.82},0 ${y*.88} Z`} /></g>;
    case "subroutine": return <g><rect width={x} height={y}/><path d={`M${w*.12} 0 V${y} M${w*.88} 0 V${y}`} /></g>;
    case "preparation": return <polygon points={pts([[w*.2,0],[w*.8,0],[x,y/2],[w*.8,y],[w*.2,y],[0,y/2]])} />;
    case "display": return <path d={`M${h*.35} 0 H${w-h*.35} Q${w} 0 ${w} ${h/2} Q${w} ${h} ${w-h*.35} ${h} H${h*.35} Q0 ${h} 0 ${h/2} Q0 0 ${h*.35} 0 Z`} />;
    case "manual-input": return <polygon points={pts([[0,h*.25],[x,0],[x,y],[0,y]])} />;
    case "manual-loop": return <polygon points={pts([[0,0],[x,0],[w*.82,y],[w*.18,y]])} />;
    case "loop-limit": return <polygon points={pts([[12,0],[x-12,0],[x,12],[x,y-12],[x-12,y],[12,y],[0,y-12],[0,12]])} />;
    case "stored-data": return <path d={`M0 0 H${w*.78} C${w*.98} 0 ${w*.98} ${h} ${w*.78} ${h} H0 C${w*.2} ${h} ${w*.2} 0 0 0 Z`} />;
    case "connector": return <ellipse cx={cx} cy={cy} rx={cx} ry={cy} />;
    case "off-page-down": return <polygon points={pts([[0,0],[x,0],[x,y*.65],[cx,y],[0,y*.65]])} />;
    case "off-page-up": return <polygon points={pts([[cx,0],[x,y*.35],[x,y],[0,y],[0,y*.35]])} />;
    case "off-page-left": return <polygon points={pts([[0,cy],[w*.35,0],[x,y*.0],[x,y],[w*.35,y]])} />;
    case "off-page-right": return <polygon points={pts([[0,0],[w*.65,0],[x,cy],[w*.65,y],[0,y]])} />;
    case "or": return <g><circle cx={cx} cy={cy} r={Math.min(cx,cy)} /><path d={`M${cx} 0 V${h} M0 ${cy} H${w}`} /></g>;
    case "summing-junction": return <g><circle cx={cx} cy={cy} r={Math.min(cx,cy)} /><path d={`M${w*.15} ${h*.15} L${w*.85} ${h*.85} M${w*.85} ${h*.15} L${w*.15} ${h*.85}`} /></g>;
    case "collate": return <g><polygon points={pts([[0,0],[x,0],[cx,cy]])}/><polygon points={pts([[0,y],[x,y],[cx,cy]])}/></g>;
    case "sort": return <g><polygon points={pts([[cx,0],[x,cy],[cx,y],[0,cy]])}/><path d={`M0 ${cy} H${x}`} /></g>;
    case "merge": return <polygon points={pts([[0,0],[x,0],[cx,y]])} />;
    case "database": return <g><path d={`M0 ${h*.15} C0 -${h*.05} ${w} -${h*.05} ${w} ${h*.15} V${h*.82} C${w} ${h*1.05} 0 ${h*1.05} 0 ${h*.82} Z`} /><ellipse cx={cx} cy={h*.15} rx={cx} ry={h*.15} /><path d={`M0 ${h*.48} C0 ${h*.7} ${w} ${h*.7} ${w} ${h*.48}`} fill="none"/></g>;
    case "internal-storage": return <g><rect width={x} height={y}/><path d={`M${w*.1} 0 V${h*.14} M0 ${h*.14} H${w}`} /></g>;
    case "hexagon": return <polygon points={pts([[w*.2,0],[w*.8,0],[x,y/2],[w*.8,y],[w*.2,y],[0,y/2]])} />;
    case "triangle": return <polygon points={pts([[cx,0],[x,y],[0,y]])} />;
    default: return null;
  }
};

export function ShapeGeometry(props: {
  shape?: Partial<ChartShape>
  kind?: ShapeKind
  width?: number
  height?: number
  fill?: string
  fillOpacity?: number
  stroke?: string
  strokeWidth?: number
  strokeStyle?: "solid" | "dashed" | "dotted"
  preview?: boolean
}) {
  const shape = props.shape || {}
  const kind = shape.kind || props.kind || "process"
  const w = shape.width ?? props.width ?? 120
  const h = shape.height ?? props.height ?? 80
  const fill = shape.fill || props.fill || "transparent"
  const fillOpacity = shape.fillOpacity ?? props.fillOpacity ?? 1
  const stroke = shape.stroke || props.stroke || "#2563EB"
  const strokeWidth = shape.strokeWidth ?? props.strokeWidth ?? 2
  const strokeStyle = shape.strokeStyle || props.strokeStyle || "solid"
  const preview = props.preview ?? false
  const dash = strokeStyle === "dashed" ? "7 5" : strokeStyle === "dotted" ? "2 4" : undefined
  const line = kind === "line" || kind === "arrow" || kind === "double-arrow"
  const markerEnd = kind === "arrow" || kind === "double-arrow" ? "url(#shape-arrow)" : undefined
  const markerStart = kind === "double-arrow" ? "url(#shape-arrow)" : undefined
  const shapeText = shape.text || ""
  const textColor = shape.textColor || "#111827"
  const fontSize = shape.fontSize || 13
  const fontWeight = shape.fontWeight || 500
  const textAlign = shape.textAlign || "middle"
  return (
    <g opacity={preview ? 0.8 : 1}>
      {line ? (
        <line
          x1="0"
          y1={h/2}
          x2={w}
          y2={h/2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
          markerStart={markerStart}
          markerEnd={markerEnd}
        />
      ) : (
        <g
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {pathFor(kind,w,h)}
        </g>
      )}
      {shapeText && kind !== "line" && kind !== "arrow" && kind !== "double-arrow" && kind !== "collate" && kind !== "merge" && kind !== "sort" && (
        <text
          x={w/2}
          y={h/2}
          fill={textColor}
          fontSize={fontSize}
          fontWeight={fontWeight}
          textAnchor={textAlign}
          dominantBaseline="middle"
          pointerEvents="none"
          transform={textAlign === "start" ? `translate(${w*.1} 0)` : textAlign === "end" ? `translate(-${w*.1} 0)` : undefined}
        >
          {shapeText.split("\n").map((lineText, i, arr) => (
            <tspan
              key={i}
              x={textAlign === "middle" ? w/2 : textAlign === "start" ? w*.1 : w*.9}
              dy={i === 0 ? `${-(arr.length - 1) * 0.6}em` : "1.2em"}
            >
              {lineText}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}

export function ShapeDefs() {
  return (
    <defs>
      <marker
        id="shape-arrow"
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="3"
        orient="auto-start-reverse"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
      </marker>
    </defs>
  );
}

/** Standalone SVG preview component for library list & tooltips */
export function ShapeIconPreview({ kind, className = "h-8 w-12" }: { kind: ShapeKind; className?: string }) {
  const dummyShape: ChartShape = {
    id: "preview",
    kind,
    x: 0,
    y: 0,
    width: 60,
    height: 36,
    rotation: 0,
    text: "",
    fill: "#eff6ff",
    fillOpacity: 1,
    stroke: "#3b82f6",
    strokeWidth: 1.5,
    strokeStyle: "solid",
    fontSize: 10,
    fontWeight: 500,
    textColor: "#1e3a8a",
    textAlign: "middle",
    locked: false,
    zIndex: 1,
  };

  return (
    <svg viewBox="0 0 60 36" className={className}>
      <ShapeDefs />
      <ShapeGeometry shape={dummyShape} />
    </svg>
  );
}
