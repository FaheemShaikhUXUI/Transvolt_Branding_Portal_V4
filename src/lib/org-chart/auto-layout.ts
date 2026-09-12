import { OrgNode, OrgConnection, SectionBoundary } from "./types"

interface LayoutResult {
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
}

export function autoLayoutOrgChart(
  nodes: OrgNode[] = [],
  connections: OrgConnection[] = [],
  boundaries: SectionBoundary[] = []
): LayoutResult {
  const safeNodes = nodes || []
  const safeConnections = connections || []
  const safeBoundaries = boundaries || []

  if (safeNodes.length === 0) {
    return { nodes: safeNodes, connections: safeConnections, boundaries: safeBoundaries }
  }

  // Clone nodes
  const updatedNodes: OrgNode[] = JSON.parse(JSON.stringify(nodes))

  // Find root nodes (nodes without parent)
  const rootNodes = updatedNodes.filter((n) => !n.parentId)
  const childrenMap = new Map<string, OrgNode[]>()

  updatedNodes.forEach((n) => {
    if (n.parentId) {
      const existing = childrenMap.get(n.parentId) || []
      existing.push(n)
      childrenMap.set(n.parentId, existing)
    }
  })

  // Group nodes by category / structure:
  // Root -> Executives -> Management -> Departments -> Staff
  // In our model:
  // - Top levels (Executive, Management) are centered at top.
  // - Departments are arranged horizontally across columns.
  // - Children of departments (Employees, Consultants, Required) are stacked vertically under their respective department!

  const departmentNodes = updatedNodes.filter((n) => n.type === "DEPARTMENT")
  const nonStaffParents = updatedNodes.filter(
    (n) => n.type === "EXECUTIVE" || n.type === "MANAGEMENT"
  )

  // 1. Position Executives & Management centered at top
  let currentY = 40
  const centerX = Math.max(700, (departmentNodes.length * 220) / 2)

  // Sort root and management
  const topChain: OrgNode[] = []
  let curr: OrgNode | undefined = rootNodes[0] || nonStaffParents[0]

  while (curr) {
    topChain.push(curr)
    const kids = childrenMap.get(curr.id) || []
    curr = kids.find((k) => k.type === "EXECUTIVE" || k.type === "MANAGEMENT")
  }

  // Place the top vertical chain
  topChain.forEach((node) => {
    node.position = {
      x: centerX - (node.width || 220) / 2,
      y: currentY,
    }
    currentY += (node.height || 64) + 40
  })

  // 2. Identify Head Office vs Site Departments
  // If there are boundaries, check if any department is at top level
  const topDepartments = departmentNodes.filter((d) => {
    const parent = updatedNodes.find((n) => n.id === d.parentId)
    return parent && (parent.type === "EXECUTIVE" || parent.type === "MANAGEMENT")
  })

  // Check if there is a mid-level project manager
  const pmNode = updatedNodes.find(
    (n) =>
      n.type === "MANAGEMENT" &&
      n.metadata.designation?.toLowerCase().includes("project")
  )

  // Sub-departments under PM or site
  const siteDepartments = departmentNodes.filter(
    (d) => !topDepartments.includes(d) || (pmNode && d.parentId === pmNode.id)
  )

  const activeTopDepts = topDepartments.filter((d) => !siteDepartments.includes(d))

  // Place Head Office departments horizontally if any
  if (activeTopDepts.length > 0) {
    currentY += 20
    const colSpacing = 210
    const totalWidth = activeTopDepts.length * colSpacing
    const startX = Math.max(60, centerX - totalWidth / 2)

    activeTopDepts.forEach((dept, idx) => {
      dept.position = {
        x: startX + idx * colSpacing,
        y: currentY,
      }
    })

    currentY += 100
  }

  // Place Project Manager if present
  if (pmNode && !topChain.includes(pmNode)) {
    pmNode.position = {
      x: centerX - (pmNode.width || 220) / 2,
      y: currentY,
    }
    currentY += (pmNode.height || 64) + 60
  } else if (!pmNode) {
    currentY += 40
  }

  // Place Site Departments horizontally with their children stacked vertically
  const deptsToLayout = siteDepartments.length > 0 ? siteDepartments : departmentNodes
  if (deptsToLayout.length > 0) {
    const colSpacing = 215
    const totalSiteWidth = deptsToLayout.length * colSpacing
    const siteStartX = Math.max(40, centerX - totalSiteWidth / 2)

    deptsToLayout.forEach((dept, colIdx) => {
      const colX = siteStartX + colIdx * colSpacing
      dept.position = {
        x: colX,
        y: currentY,
      }

      // Stack staff/children vertically
      let staffY = currentY + (dept.height || 52) + 24
      const staffMembers = updatedNodes.filter(
        (n) =>
          n.parentId === dept.id ||
          (n.metadata.department &&
            n.metadata.department === dept.metadata.department &&
            n.id !== dept.id)
      )

      staffMembers.forEach((staff) => {
        staff.position = {
          x: colX,
          y: staffY,
        }
        staffY += (staff.height || 64) + 16
      })
    })
  }

  // Re-fit section boundaries if any exist
  const updatedBoundaries: SectionBoundary[] = safeBoundaries.map((b) => {
    if (b.id.includes("ho")) {
      return {
        ...b,
        position: { x: Math.max(40, centerX - 650), y: 220 },
        width: 1300,
        height: 140,
      }
    }
    if (b.id.includes("site")) {
      return {
        ...b,
        position: { x: 30, y: currentY - 30 },
        width: Math.max(1400, deptsToLayout.length * 215 + 60),
        height: 480,
      }
    }
    return b
  })

  // Ensure all connections are orthogonal
  const updatedConnections: OrgConnection[] = safeConnections.map((conn) => ({
    ...conn,
    type: "orthogonal",
  }))

  return {
    nodes: updatedNodes,
    connections: updatedConnections,
    boundaries: updatedBoundaries,
  }
}
