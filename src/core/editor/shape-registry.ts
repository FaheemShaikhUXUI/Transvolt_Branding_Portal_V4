import { ShapeSubtype } from "@/types/eva-editor"

export interface ShapeDefinition {
  id: ShapeSubtype
  name: string
  generatePath: (w: number, h: number) => string
}

export const ShapeRegistry: Record<ShapeSubtype, ShapeDefinition> = {
  triangle: {
    id: "triangle",
    name: "Triangle",
    generatePath: (w: number, h: number) => {
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`
    },
  },
  star: {
    id: "star",
    name: "Star (5-point)",
    generatePath: (w: number, h: number) => {
      const cx = w / 2
      const cy = h / 2
      const outerR = Math.min(w, h) / 2
      const innerR = outerR * 0.42
      const points: string[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`)
      }
      return `${points.join(" ")} Z`
    },
  },
  polygon: {
    id: "polygon",
    name: "Pentagon",
    generatePath: (w: number, h: number) => {
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) / 2
      const points: string[] = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`)
      }
      return `${points.join(" ")} Z`
    },
  },
  hexagon: {
    id: "hexagon",
    name: "Hexagon",
    generatePath: (w: number, h: number) => {
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) / 2
      const points: string[] = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 6
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`)
      }
      return `${points.join(" ")} Z`
    },
  },
  pentagon: {
    id: "pentagon",
    name: "Regular Pentagon",
    generatePath: (w: number, h: number) => {
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) / 2
      const points: string[] = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`)
      }
      return `${points.join(" ")} Z`
    },
  },
  arrow: {
    id: "arrow",
    name: "Right Arrow",
    generatePath: (w: number, h: number) => {
      const headW = w * 0.4
      const shaftH = h * 0.4
      const shaftY = (h - shaftH) / 2
      return `M 0 ${shaftY} L ${w - headW} ${shaftY} L ${w - headW} 0 L ${w} ${h / 2} L ${w - headW} ${h} L ${w - headW} ${shaftY + shaftH} L 0 ${shaftY + shaftH} Z`
    },
  },
  line: {
    id: "line",
    name: "Line",
    generatePath: (w: number, h: number) => {
      return `M 0 ${h / 2} L ${w} ${h / 2}`
    },
  },
  diamond: {
    id: "diamond",
    name: "Diamond",
    generatePath: (w: number, h: number) => {
      const cx = w / 2
      const cy = h / 2
      return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`
    },
  },
  cross: {
    id: "cross",
    name: "Cross / Plus",
    generatePath: (w: number, h: number) => {
      const t = Math.min(w, h) * 0.3 // arm thickness (30% of size)
      const cx = w / 2
      const cy = h / 2
      const hx = t / 2
      const hy = t / 2
      return [
        `M ${cx - hx} 0`,
        `L ${cx + hx} 0`,
        `L ${cx + hx} ${cy - hy}`,
        `L ${w} ${cy - hy}`,
        `L ${w} ${cy + hy}`,
        `L ${cx + hx} ${cy + hy}`,
        `L ${cx + hx} ${h}`,
        `L ${cx - hx} ${h}`,
        `L ${cx - hx} ${cy + hy}`,
        `L 0 ${cy + hy}`,
        `L 0 ${cy - hy}`,
        `L ${cx - hx} ${cy - hy}`,
        `Z`,
      ].join(" ")
    },
  },
}
