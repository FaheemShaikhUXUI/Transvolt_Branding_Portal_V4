import { OrgNode, OrgFooter } from "./types"

export interface DepartmentManpowerRow {
  departmentId: string
  departmentName: string
  employees: number
  consultants: number
  available: number
  vacancies: number
  required: number
  gap: number
  status: "ADEQUATE" | "SURPLUS" | "SHORTFALL"
  statusLabel: string
}

export interface ManpowerSummary {
  rows: DepartmentManpowerRow[]
  totalEmployees: number
  totalConsultants: number
  totalAvailable: number
  totalVacancies: number
  totalRequired: number
  totalGap: number
  ragStatus: "GREEN" | "AMBER" | "RED"
  ragLabel: string
}

/**
 * Calculates live Manpower RAG statistics from structured chart nodes.
 * Distinguishes employees, consultants, and required vacancies per department.
 */
export function calculateManpowerSummary(
  nodes: OrgNode[],
  footer?: OrgFooter
): ManpowerSummary {
  const departments = nodes.filter((n) => n.type === "DEPARTMENT")

  // Map each person / vacancy to their nearest ancestor department or explicit department metadata
  const deptMap = new Map<string, DepartmentManpowerRow>()

  // Initialize department rows
  departments.forEach((dept) => {
    deptMap.set(dept.id, {
      departmentId: dept.id,
      departmentName: dept.label || "Unnamed Department",
      employees: 0,
      consultants: 0,
      available: 0,
      vacancies: 0,
      required: 0,
      gap: 0,
      status: "ADEQUATE",
      statusLabel: "Adequate",
    })
  })

  // Function to find department for a node
  const findDepartmentId = (node: OrgNode): string | null => {
    if (node.departmentId && deptMap.has(node.departmentId)) {
      return node.departmentId
    }

    let curr: OrgNode | undefined = node
    const visited = new Set<string>()

    while (curr && curr.parentId && !visited.has(curr.id)) {
      visited.add(curr.id)
      const parent: OrgNode | undefined = nodes.find((n) => n.id === curr?.parentId)
      if (parent && parent.type === "DEPARTMENT") {
        return parent.id
      }
      curr = parent
    }
    return null
  }

  // Count employees, consultants, vacancies
  let unassignedEmp = 0
  let unassignedCons = 0
  let unassignedVac = 0

  nodes.forEach((node) => {
    if (node.type === "EXECUTIVE" || node.type === "MANAGEMENT" || node.type === "DEPARTMENT") {
      return
    }

    const deptId = findDepartmentId(node)
    const target = deptId ? deptMap.get(deptId) : null

    if (node.type === "REQUIRED_POSITION") {
      const qty = node.metadata.requiredQuantity || 1
      if (target) {
        target.vacancies += qty
      } else {
        unassignedVac += qty
      }
    } else if (node.type === "CONSULTANT" || node.metadata.employmentType === "CONSULTANT") {
      if (target) {
        target.consultants += 1
      } else {
        unassignedCons += 1
      }
    } else {
      // Employee
      if (target) {
        target.employees += 1
      } else {
        unassignedEmp += 1
      }
    }
  })

  // Add General / Site row if there are unassigned staff
  if (unassignedEmp > 0 || unassignedCons > 0 || unassignedVac > 0) {
    deptMap.set("general-site", {
      departmentId: "general-site",
      departmentName: "Project Leadership & Operations",
      employees: unassignedEmp,
      consultants: unassignedCons,
      available: unassignedEmp + unassignedCons,
      vacancies: unassignedVac,
      required: unassignedEmp + unassignedCons + unassignedVac,
      gap: -unassignedVac,
      status: unassignedVac > 0 ? "SHORTFALL" : "ADEQUATE",
      statusLabel: unassignedVac > 0 ? "Shortfall" : "Adequate",
    })
  }

  // Calculate Available, Required, and Gap for each department
  const rows: DepartmentManpowerRow[] = []
  let totalEmployees = 0
  let totalConsultants = 0
  let totalVacancies = 0

  deptMap.forEach((row) => {
    row.available = row.employees + row.consultants
    row.required = row.available + row.vacancies
    row.gap = row.available - row.required // will be -vacancies

    if (row.gap < 0) {
      row.status = "SHORTFALL"
      row.statusLabel = "Shortfall"
    } else if (row.gap > 0) {
      row.status = "SURPLUS"
      row.statusLabel = "Surplus"
    } else {
      row.status = "ADEQUATE"
      row.statusLabel = "Adequate"
    }

    rows.push(row)
    totalEmployees += row.employees
    totalConsultants += row.consultants
    totalVacancies += row.vacancies
  })

  const totalAvailable = totalEmployees + totalConsultants
  const totalRequired = totalAvailable + totalVacancies
  const totalGap = totalAvailable - totalRequired

  // Determine overall RAG status
  let ragStatus: "GREEN" | "AMBER" | "RED" = "GREEN"
  let ragLabel = "Optimal Staffing"

  if (totalGap <= -5) {
    ragStatus = "RED"
    ragLabel = "Critical Shortfall"
  } else if (totalGap < 0) {
    ragStatus = "AMBER"
    ragLabel = "Moderate Shortfall"
  }

  return {
    rows,
    totalEmployees,
    totalConsultants,
    totalAvailable,
    totalVacancies,
    totalRequired,
    totalGap,
    ragStatus,
    ragLabel,
  }
}
