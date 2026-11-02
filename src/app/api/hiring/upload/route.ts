import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const UPLOADS_DIR = path.join(process.cwd(), ".data", "hiring-uploads")

function ensureUploadDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    } catch (e) {
      console.error("Failed to create uploads dir:", e)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureUploadDir()
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "document"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File exceeds 10MB limit." }, { status: 400 })
    }

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const filePath = path.join(UPLOADS_DIR, safeName)
    fs.writeFileSync(filePath, buffer)

    // For images, we can also return base64 preview so it displays everywhere without server hosting dependencies
    const isImage = file.type.startsWith("image/")
    const base64Url = isImage
      ? `data:${file.type};base64,${buffer.toString("base64")}`
      : `/api/hiring/upload?file=${safeName}`

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      url: base64Url,
      storedName: safeName,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileName = searchParams.get("file")
  if (!fileName) return new Response("File not found", { status: 404 })

  const filePath = path.join(UPLOADS_DIR, path.basename(fileName))
  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 })
  }

  const content = fs.readFileSync(filePath)
  return new Response(content, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  })
}

