import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const SHARES_DIR = path.join(process.cwd(), ".data")
const SHARES_FILE = path.join(SHARES_DIR, "shares.json")

// In-memory memory store for instant access
const memoryStore = new Map<string, any>()

function ensureStore() {
  if (!fs.existsSync(SHARES_DIR)) {
    try {
      fs.mkdirSync(SHARES_DIR, { recursive: true })
    } catch {}
  }
  if (!fs.existsSync(SHARES_FILE)) {
    try {
      fs.writeFileSync(SHARES_FILE, JSON.stringify({}), "utf-8")
    } catch {}
  }
}

function readAllShares(): Record<string, any> {
  try {
    ensureStore()
    const content = fs.readFileSync(SHARES_FILE, "utf-8")
    return JSON.parse(content || "{}")
  } catch {
    return {}
  }
}

function writeShare(key: string, value: any) {
  memoryStore.set(key, value)
  try {
    ensureStore()
    const all = readAllShares()
    all[key] = value
    fs.writeFileSync(SHARES_FILE, JSON.stringify(all, null, 2), "utf-8")
  } catch (err) {
    console.error("Failed to write share data to disk:", err)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const type = searchParams.get("type") || "general"

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
  }

  const key = `${type}_${id}`

  // Check memory first
  if (memoryStore.has(key)) {
    return NextResponse.json({ found: true, ...memoryStore.get(key) })
  }

  // Check disk store
  const all = readAllShares()
  if (all[key]) {
    memoryStore.set(key, all[key])
    return NextResponse.json({ found: true, ...all[key] })
  }

  // Also check without type prefix
  if (all[id]) {
    return NextResponse.json({ found: true, ...all[id] })
  }

  return NextResponse.json({ found: false }, { status: 404 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type = "general", data, createdAt = Date.now(), expiresAt } = body

    if (!id || !data) {
      return NextResponse.json({ error: "id and data are required" }, { status: 400 })
    }

    const key = `${type}_${id}`
    const record = {
      id,
      type,
      data,
      createdAt,
      expiresAt: expiresAt || createdAt + 7 * 60 * 60 * 1000,
      savedAt: Date.now(),
    }

    writeShare(key, record)

    return NextResponse.json({ success: true, key })
  } catch (err) {
    console.error("Error saving share:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
