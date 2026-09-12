import { OrganizationChart, ChartStatus, OrgChartFilter } from "./types"
import { INITIAL_ORG_CHARTS } from "./seed-data"

const STORAGE_KEY = "transvolt_organization_charts_v1"
const SIX_HOURS_MS = 6 * 60 * 60 * 1000 // 6 hours expiration

export function computeChartStatus(
  effectiveFrom: string,
  effectiveTo?: string,
  isDraft = false
): ChartStatus {
  if (isDraft) return "DRAFT"

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const from = new Date(effectiveFrom)
  from.setHours(0, 0, 0, 0)

  if (today < from) {
    return "FUTURE"
  }

  if (effectiveTo) {
    const to = new Date(effectiveTo)
    to.setHours(23, 59, 59, 999)
    if (today > to) {
      return "ARCHIVED"
    }
  }

  return "CURRENT"
}

export class OrgChartService {
  private memoryCharts: OrganizationChart[] = JSON.parse(JSON.stringify(INITIAL_ORG_CHARTS))

  private getStoredCharts(): OrganizationChart[] {
    if (typeof window === "undefined") {
      return this.memoryCharts
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORG_CHARTS))
        } catch {}
        return this.memoryCharts
      }
      return JSON.parse(stored)
    } catch {
      return this.memoryCharts
    }
  }

  private saveStoredCharts(charts: OrganizationChart[]): void {
    this.memoryCharts = charts
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
    } catch (e) {
      console.warn("Storage quota exceeded, using in-memory state", e)
    }
  }

  public async getCharts(filter?: OrgChartFilter): Promise<OrganizationChart[]> {
    let list = this.getStoredCharts()

    if (filter) {
      if (filter.search) {
        const q = filter.search.toLowerCase()
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.siteName.toLowerCase().includes(q) ||
            c.siteLocation.toLowerCase().includes(q) ||
            c.nodes.some(
              (n) =>
                n.label.toLowerCase().includes(q) ||
                n.metadata.designation?.toLowerCase().includes(q) ||
                n.metadata.department?.toLowerCase().includes(q)
            )
        )
      }
      if (filter.siteId && filter.siteId !== "ALL") {
        list = list.filter((c) => c.siteId === filter.siteId)
      }
      if (filter.status && filter.status !== "ALL") {
        list = list.filter((c) => c.status === filter.status)
      }
      if (filter.date) {
        list = list.filter((c) => c.effectiveFrom.startsWith(filter.date!))
      }
    }

    // Sort: Current first, then by effectiveFrom descending
    return list.sort((a, b) => {
      if (a.status === "CURRENT" && b.status !== "CURRENT") return -1
      if (b.status === "CURRENT" && a.status !== "CURRENT") return 1
      return new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
    })
  }

  public async getChartById(id: string): Promise<OrganizationChart | null> {
    const list = this.getStoredCharts()
    const found = list.find((c) => c.id === id)
    return found || null
  }

  public async saveChart(chart: OrganizationChart): Promise<OrganizationChart> {
    const list = this.getStoredCharts()
    const now = new Date().toISOString()
    const updatedStatus = computeChartStatus(
      chart.effectiveFrom,
      chart.effectiveTo,
      chart.status === "DRAFT"
    )

    const updatedChart: OrganizationChart = {
      ...chart,
      status: updatedStatus,
      updatedAt: now,
    }

    const idx = list.findIndex((c) => c.id === chart.id)
    if (idx >= 0) {
      list[idx] = updatedChart
    } else {
      list.unshift(updatedChart)
    }

    this.saveStoredCharts(list)
    return updatedChart
  }

  public async createVersion(
    existingChartId: string,
    newVersion: string,
    effectiveFrom: string,
    changeSummary: string,
    userName: string
  ): Promise<OrganizationChart> {
    const list = this.getStoredCharts()
    const existing = list.find((c) => c.id === existingChartId)
    if (!existing) throw new Error("Chart not found to version")

    const now = new Date().toISOString()

    // Mark existing current chart as archived or set effectiveTo
    existing.effectiveTo = effectiveFrom
    existing.status = "ARCHIVED"
    existing.updatedAt = now

    // Create the new version
    const newChartId = `org-chart-${Date.now()}`
    const newChart: OrganizationChart = {
      ...JSON.parse(JSON.stringify(existing)),
      id: newChartId,
      version: newVersion,
      effectiveFrom,
      effectiveTo: undefined,
      status: computeChartStatus(effectiveFrom),
      createdAt: now,
      updatedAt: now,
      createdBy: userName,
      updatedBy: userName,
      changeSummary,
    }

    list.unshift(newChart)
    this.saveStoredCharts(list)
    return newChart
  }

  public async duplicateChart(
    sourceChartId: string,
    targetSiteId: string,
    targetSiteName: string,
    targetSiteLocation: string,
    newTitle: string,
    userName: string
  ): Promise<OrganizationChart> {
    const list = this.getStoredCharts()
    const source = list.find((c) => c.id === sourceChartId)
    if (!source) throw new Error("Source chart not found")

    const now = new Date().toISOString()
    const duplicated: OrganizationChart = {
      ...JSON.parse(JSON.stringify(source)),
      id: `org-chart-${Date.now()}`,
      title: newTitle,
      siteId: targetSiteId,
      siteName: targetSiteName,
      siteLocation: targetSiteLocation,
      version: "v1.0",
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
      createdBy: userName,
      updatedBy: userName,
      changeSummary: `Duplicated from ${source.title} (${source.siteLocation})`,
    }

    list.unshift(duplicated)
    this.saveStoredCharts(list)
    return duplicated
  }

  public async archiveChart(id: string): Promise<OrganizationChart> {
    const list = this.getStoredCharts()
    const found = list.find((c) => c.id === id)
    if (!found) throw new Error("Chart not found")

    found.status = "ARCHIVED"
    found.effectiveTo = found.effectiveTo || new Date().toISOString().split("T")[0]
    found.updatedAt = new Date().toISOString()

    this.saveStoredCharts(list)
    return found
  }

  public async deleteChart(id: string): Promise<void> {
    const list = this.getStoredCharts()
    const filtered = list.filter((c) => c.id !== id)
    this.saveStoredCharts(filtered)
  }

  public async generateShareLink(chartId: string): Promise<{ url: string; expiresAt: number }> {
    const chart = await this.getChartById(chartId)
    if (!chart) throw new Error("Chart not found")

    const timestamp = Date.now()
    const expiresAt = timestamp + SIX_HOURS_MS

    // Save share snapshot in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`branding_share_org_chart_${chartId}_data`, JSON.stringify(chart))
      localStorage.setItem(`branding_share_org_chart_${chartId}_time`, timestamp.toString())
    }

    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const url = `${origin}/share/org-chart/${chartId}?t=${timestamp}`

    return { url, expiresAt }
  }

  public async getSharedChart(chartId: string, timestampParam?: number): Promise<{
    chart: OrganizationChart | null
    isExpired: boolean
    expiresAt: number
    remainingMs: number
  }> {
    let chart: OrganizationChart | null = null
    let creationTime = Date.now()

    if (typeof window !== "undefined") {
      const snap = localStorage.getItem(`branding_share_org_chart_${chartId}_data`)
      if (snap) {
        try {
          chart = JSON.parse(snap)
        } catch {
          // ignore
        }
      }
      if (!chart) {
        chart = await this.getChartById(chartId)
      }

      if (timestampParam && !isNaN(timestampParam)) {
        creationTime = timestampParam
      } else {
        const storedTime = localStorage.getItem(`branding_share_org_chart_${chartId}_time`)
        if (storedTime && !isNaN(parseInt(storedTime, 10))) {
          creationTime = parseInt(storedTime, 10)
        }
      }
    }

    const now = Date.now()
    const expiresAt = creationTime + SIX_HOURS_MS
    const remainingMs = Math.max(0, expiresAt - now)
    const isExpired = remainingMs <= 0

    return {
      chart,
      isExpired,
      expiresAt,
      remainingMs,
    }
  }
}

export const orgChartService = new OrgChartService()
