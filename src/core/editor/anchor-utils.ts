import { CanvasObject, PenNode } from "@/types/eva-editor"

// ─── SVG Path Generator from PenNode Array ──────────────────────────────────
export function buildPenSvgPath(nodes: PenNode[], isClosed: boolean): string {
  if (nodes.length === 0) return ""
  if (nodes.length === 1) return `M ${nodes[0].x} ${nodes[0].y}`

  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]
    const cur = nodes[i]
    if (prev.cpOut && cur.cpIn) {
      d += ` C ${prev.cpOut.x} ${prev.cpOut.y}, ${cur.cpIn.x} ${cur.cpIn.y}, ${cur.x} ${cur.y}`
    } else if (prev.cpOut) {
      d += ` C ${prev.cpOut.x} ${prev.cpOut.y}, ${cur.x} ${cur.y}, ${cur.x} ${cur.y}`
    } else if (cur.cpIn) {
      d += ` C ${prev.x} ${prev.y}, ${cur.cpIn.x} ${cur.cpIn.y}, ${cur.x} ${cur.y}`
    } else {
      d += ` L ${cur.x} ${cur.y}`
    }
  }

  if (isClosed) {
    const last = nodes[nodes.length - 1]
    const first = nodes[0]
    if (last.cpOut && first.cpIn) {
      d += ` C ${last.cpOut.x} ${last.cpOut.y}, ${first.cpIn.x} ${first.cpIn.y}, ${first.x} ${first.y} Z`
    } else if (last.cpOut) {
      d += ` C ${last.cpOut.x} ${last.cpOut.y}, ${first.x} ${first.y}, ${first.x} ${first.y} Z`
    } else if (first.cpIn) {
      d += ` C ${last.x} ${last.y}, ${first.cpIn.x} ${first.cpIn.y}, ${first.x} ${first.y} Z`
    } else {
      d += ` Z`
    }
  }

  return d
}

// ─── Extract Anchor Nodes from Any Canvas Object ─────────────────────────────
export function extractPenNodesFromObject(obj: CanvasObject): {
  nodes: PenNode[]
  isClosed: boolean
} {
  // 1. If object already has explicit penNodes
  if (obj.penNodes && obj.penNodes.length > 0) {
    const isClosed = obj.pathData
      ? obj.pathData.toUpperCase().includes("Z")
      : true
    return { nodes: obj.penNodes.map((n) => ({ ...n })), isClosed }
  }

  // 2. Rectangle: 4 corner nodes
  if (obj.type === "rectangle") {
    return {
      nodes: [
        { x: obj.x, y: obj.y, cpIn: null, cpOut: null },
        { x: obj.x + obj.width, y: obj.y, cpIn: null, cpOut: null },
        { x: obj.x + obj.width, y: obj.y + obj.height, cpIn: null, cpOut: null },
        { x: obj.x, y: obj.y + obj.height, cpIn: null, cpOut: null },
      ],
      isClosed: true,
    }
  }

  // 3. Circle / Ellipse: 4 smooth Bézier nodes (top, right, bottom, left)
  // Standard ellipse cubic Bézier kappa constant: k = 4/3 * (sqrt(2) - 1) ≈ 0.5522847498
  if (obj.type === "circle") {
    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2
    const rx = obj.width / 2
    const ry = obj.height / 2
    const kx = rx * 0.55228475
    const ky = ry * 0.55228475

    return {
      nodes: [
        {
          x: Math.round(cx),
          y: Math.round(cy - ry),
          cpIn: { x: Math.round(cx - kx), y: Math.round(cy - ry) },
          cpOut: { x: Math.round(cx + kx), y: Math.round(cy - ry) },
        },
        {
          x: Math.round(cx + rx),
          y: Math.round(cy),
          cpIn: { x: Math.round(cx + rx), y: Math.round(cy - ky) },
          cpOut: { x: Math.round(cx + rx), y: Math.round(cy + ky) },
        },
        {
          x: Math.round(cx),
          y: Math.round(cy + ry),
          cpIn: { x: Math.round(cx + kx), y: Math.round(cy + ry) },
          cpOut: { x: Math.round(cx - kx), y: Math.round(cy + ry) },
        },
        {
          x: Math.round(cx - rx),
          y: Math.round(cy),
          cpIn: { x: Math.round(cx - rx), y: Math.round(cy + ky) },
          cpOut: { x: Math.round(cx - rx), y: Math.round(cy - ky) },
        },
      ],
      isClosed: true,
    }
  }

  // 4. Shape Subtypes: line, star, hexagon, triangle, polygon, arrow
  if (obj.type === "shape" && obj.subtype) {
    if (obj.subtype === "line") {
      return {
        nodes: [
          { x: obj.x, y: obj.y, cpIn: null, cpOut: null },
          { x: obj.x + obj.width, y: obj.y + obj.height, cpIn: null, cpOut: null },
        ],
        isClosed: false,
      }
    }

    if (obj.subtype === "star") {
      const cx = obj.x + obj.width / 2
      const cy = obj.y + obj.height / 2
      const outerR = Math.min(obj.width, obj.height) / 2
      const innerR = outerR * 0.42
      const nodes: PenNode[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        nodes.push({
          x: Math.round(cx + r * Math.cos(angle)),
          y: Math.round(cy + r * Math.sin(angle)),
          cpIn: null,
          cpOut: null,
        })
      }
      return { nodes, isClosed: true }
    }

    if (obj.subtype === "hexagon") {
      const cx = obj.x + obj.width / 2
      const cy = obj.y + obj.height / 2
      const r = Math.min(obj.width, obj.height) / 2
      const nodes: PenNode[] = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 6
        nodes.push({
          x: Math.round(cx + r * Math.cos(angle)),
          y: Math.round(cy + r * Math.sin(angle)),
          cpIn: null,
          cpOut: null,
        })
      }
      return { nodes, isClosed: true }
    }

    if (obj.subtype === "triangle") {
      return {
        nodes: [
          { x: Math.round(obj.x + obj.width / 2), y: obj.y, cpIn: null, cpOut: null },
          { x: obj.x + obj.width, y: obj.y + obj.height, cpIn: null, cpOut: null },
          { x: obj.x, y: obj.y + obj.height, cpIn: null, cpOut: null },
        ],
        isClosed: true,
      }
    }
  }

  // 5. Pencil Freehand: sampled points
  if (obj.type === "pencil" && obj.points && obj.points.length > 0) {
    // Sample points every 3-4 points so anchor tool doesn't have 1000 nodes
    const step = Math.max(1, Math.floor(obj.points.length / 25))
    const sampled = obj.points
      .filter((_, idx) => idx % step === 0 || idx === obj.points!.length - 1)
      .map((p) => ({ x: p.x, y: p.y, cpIn: null, cpOut: null }))

    return { nodes: sampled, isClosed: false }
  }

  // Fallback: 4 corner box
  return {
    nodes: [
      { x: obj.x, y: obj.y, cpIn: null, cpOut: null },
      { x: obj.x + obj.width, y: obj.y, cpIn: null, cpOut: null },
      { x: obj.x + obj.width, y: obj.y + obj.height, cpIn: null, cpOut: null },
      { x: obj.x, y: obj.y + obj.height, cpIn: null, cpOut: null },
    ],
    isClosed: true,
  }
}

// ─── Bounding Box Calculator ────────────────────────────────────────────────
export function computeBoundsFromNodes(nodes: PenNode[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (nodes.length === 0) return { x: 0, y: 0, width: 50, height: 50 }

  const allX = nodes.flatMap((n) => [
    n.x,
    ...(n.cpIn ? [n.cpIn.x] : []),
    ...(n.cpOut ? [n.cpOut.x] : []),
  ])
  const allY = nodes.flatMap((n) => [
    n.y,
    ...(n.cpIn ? [n.cpIn.y] : []),
    ...(n.cpOut ? [n.cpOut.y] : []),
  ])

  const minX = Math.min(...allX)
  const minY = Math.min(...allY)
  const maxX = Math.max(...allX)
  const maxY = Math.max(...allY)

  return {
    x: Math.round(minX),
    y: Math.round(minY),
    width: Math.max(15, Math.round(maxX - minX)),
    height: Math.max(15, Math.round(maxY - minY)),
  }
}

// ─── Anchor Point Operations ─────────────────────────────────────────────────

// 1. Convert node to Smooth (generates tangent handles along adjacent vectors)
export function convertNodeToSmooth(
  nodes: PenNode[],
  index: number,
  isClosed: boolean
): PenNode[] {
  if (index < 0 || index >= nodes.length) return nodes

  const updated = [...nodes]
  const cur = { ...updated[index] }

  // Determine neighboring points
  let prev = index > 0 ? nodes[index - 1] : isClosed ? nodes[nodes.length - 1] : null
  let next = index < nodes.length - 1 ? nodes[index + 1] : isClosed ? nodes[0] : null

  let tangentDx = 0
  let tangentDy = 0

  if (prev && next) {
    tangentDx = (next.x - prev.x) / 4
    tangentDy = (next.y - prev.y) / 4
  } else if (next) {
    tangentDx = (next.x - cur.x) / 3
    tangentDy = (next.y - cur.y) / 3
  } else if (prev) {
    tangentDx = (cur.x - prev.x) / 3
    tangentDy = (cur.y - prev.y) / 3
  } else {
    tangentDx = 30
    tangentDy = 0
  }

  // Ensure minimum handle length
  const len = Math.hypot(tangentDx, tangentDy)
  if (len < 15) {
    tangentDx = (tangentDx / (len || 1)) * 30
    tangentDy = (tangentDy / (len || 1)) * 30
  }

  cur.cpOut = {
    x: Math.round(cur.x + tangentDx),
    y: Math.round(cur.y + tangentDy),
  }
  cur.cpIn = {
    x: Math.round(cur.x - tangentDx),
    y: Math.round(cur.y - tangentDy),
  }

  updated[index] = cur
  return updated
}

// 2. Convert node to Sharp Corner (retracts handles)
export function convertNodeToCorner(
  nodes: PenNode[],
  index: number
): PenNode[] {
  if (index < 0 || index >= nodes.length) return nodes
  const updated = [...nodes]
  updated[index] = { ...updated[index], cpIn: null, cpOut: null }
  return updated
}

// 3. Delete an anchor node
export function deleteNodeFromPath(
  nodes: PenNode[],
  index: number
): PenNode[] {
  if (nodes.length <= 2) return nodes // preserve minimum path
  return nodes.filter((_, idx) => idx !== index)
}

// 4. Insert an anchor node closest to given (x, y)
export function insertNodeOnSegment(
  nodes: PenNode[],
  pos: { x: number; y: number },
  isClosed: boolean
): { newNodes: PenNode[]; insertedIndex: number } {
  if (nodes.length < 2) {
    return { newNodes: [...nodes, { x: pos.x, y: pos.y, cpIn: null, cpOut: null }], insertedIndex: nodes.length }
  }

  let bestSegment = 0
  let bestDist = Infinity

  const totalSegments = isClosed ? nodes.length : nodes.length - 1

  for (let i = 0; i < totalSegments; i++) {
    const a = nodes[i]
    const b = nodes[(i + 1) % nodes.length]

    // Distance from point to line segment (a, b)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const lenSq = dx * dx + dy * dy

    let t = lenSq === 0 ? 0 : ((pos.x - a.x) * dx + (pos.y - a.y) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))

    const projX = a.x + t * dx
    const projY = a.y + t * dy
    const dist = Math.hypot(pos.x - projX, pos.y - projY)

    if (dist < bestDist) {
      bestDist = dist
      bestSegment = i
    }
  }

  const newNodes = [...nodes]
  const insertIdx = bestSegment + 1
  newNodes.splice(insertIdx, 0, {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
    cpIn: null,
    cpOut: null,
  })

  return { newNodes, insertedIndex: insertIdx }
}

// ─── Object Pivot & Rotation Anchor Point Calculations ───────────────────────

export function getObjectPivot(
  obj: CanvasObject,
  activeNodeIdx?: number | null
): { x: number; y: number } {
  // 1. Explicit custom pivot coordinates
  if (obj.pivotX !== undefined && obj.pivotY !== undefined) {
    return { x: obj.pivotX, y: obj.pivotY }
  }

  // 2. Pivot snapped to currently selected vector anchor node
  if (obj.rotationAnchorType === "node" && activeNodeIdx !== null && activeNodeIdx !== undefined) {
    const nodes = obj.penNodes || extractPenNodesFromObject(obj).nodes
    if (nodes && nodes[activeNodeIdx]) {
      return { x: nodes[activeNodeIdx].x, y: nodes[activeNodeIdx].y }
    }
  }

  const cx = Math.round(obj.x + obj.width / 2)
  const cy = Math.round(obj.y + obj.height / 2)

  // 3. Preset anchor alignment types (9-point anchor box)
  switch (obj.rotationAnchorType) {
    case "top-left":
      return { x: obj.x, y: obj.y }
    case "top-center":
      return { x: cx, y: obj.y }
    case "top-right":
      return { x: obj.x + obj.width, y: obj.y }
    case "center-left":
      return { x: obj.x, y: cy }
    case "center-right":
      return { x: obj.x + obj.width, y: cy }
    case "bottom-left":
      return { x: obj.x, y: obj.y + obj.height }
    case "bottom-center":
      return { x: cx, y: obj.y + obj.height }
    case "bottom-right":
      return { x: obj.x + obj.width, y: obj.y + obj.height }
    case "center":
    default:
      return { x: cx, y: cy }
  }
}

export function rotatePointAround(
  point: { x: number; y: number },
  pivot: { x: number; y: number },
  angleDegrees: number
): { x: number; y: number } {
  const rad = (angleDegrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = point.x - pivot.x
  const dy = point.y - pivot.y
  return {
    x: Math.round(pivot.x + dx * cos - dy * sin),
    y: Math.round(pivot.y + dx * sin + dy * cos),
  }
}

export function unrotateDelta(
  dx: number,
  dy: number,
  angleDegrees: number
): { dx: number; dy: number } {
  const rad = (angleDegrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  // Inverse rotation by -angle
  return {
    dx: dx * cos + dy * sin,
    dy: -dx * sin + dy * cos,
  }
}
