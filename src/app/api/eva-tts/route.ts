import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"
import os from "os"

// In-memory cache for fast repeated voice responses
const ttsAudioCache = new Map<string, Buffer>()

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      voice = "en-IN-NeerjaExpressiveNeural",
      rate = "+0%",
      pitch = "+0Hz",
    } = await req.json()
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 })
    }

    const cleanText = text.slice(0, 800).trim()
    const cacheKey = `${voice}:::${rate}:::${pitch}:::${cleanText}`

    if (ttsAudioCache.has(cacheKey)) {
      const cached = ttsAudioCache.get(cacheKey)!
      return new Response(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400, immutable",
          "X-TTS-Voice": voice,
          "X-TTS-Cache": "HIT",
        },
      })
    }

    const tempFile = path.join(
      os.tmpdir(),
      `eva_tts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp3`
    )

    // Execute edge-tts with voice, rate, pitch
    await new Promise<void>((resolve, reject) => {
      const py = spawn("python", [
        "-c",
        `
import asyncio, sys, edge_tts
text = sys.stdin.read()
asyncio.run(edge_tts.Communicate(text, sys.argv[1], rate=sys.argv[2], pitch=sys.argv[3]).save(sys.argv[4]))
`,
        voice,
        rate,
        pitch,
        tempFile,
      ])

      py.stdin.write(cleanText)
      py.stdin.end()

      py.on("close", (code) => {
        if (code === 0) resolve()
        else reject(new Error(`edge-tts exited with code ${code}`))
      })
      py.on("error", reject)
    })

    const audioBuffer = await fs.readFile(tempFile)
    await fs.unlink(tempFile).catch(() => {})

    // Keep cache bounded to 150 items
    if (ttsAudioCache.size > 150) {
      const firstKey = ttsAudioCache.keys().next().value
      if (firstKey) ttsAudioCache.delete(firstKey)
    }
    ttsAudioCache.set(cacheKey, audioBuffer)

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
        "X-TTS-Voice": voice,
        "X-TTS-Cache": "MISS",
      },
    })
  } catch (error: any) {
    console.error("Eva TTS generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate speech" }, { status: 500 })
  }
}
