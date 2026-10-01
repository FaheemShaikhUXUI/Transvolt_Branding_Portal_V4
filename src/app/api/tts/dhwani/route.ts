import { NextResponse } from "next/server"

function generateRequestId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Map requested voice ID, voice model name, or gender to exact Edge Neural Voice & Language
function resolveVoiceAndLang(voiceModel?: string, gender?: string) {
  if (voiceModel === "hi-swara" || voiceModel?.includes("Swara") || voiceModel === "hi-IN-SwaraNeural") {
    return { voiceName: "hi-IN-SwaraNeural", lang: "hi-IN" }
  }
  if (voiceModel === "gu-dhwani" || voiceModel?.includes("Dhwani") || voiceModel === "gu-IN-DhwaniNeural") {
    return { voiceName: "gu-IN-DhwaniNeural", lang: "gu-IN" }
  }
  if (voiceModel === "gu-niranjan" || voiceModel?.includes("Niranjan") || voiceModel === "gu-IN-NiranjanNeural") {
    return { voiceName: "gu-IN-NiranjanNeural", lang: "gu-IN" }
  }
  if (voiceModel === "en-aria" || voiceModel?.includes("Aria") || voiceModel === "en-IN-AriaNeural") {
    return { voiceName: "en-IN-AriaNeural", lang: "en-IN" }
  }
  if (voiceModel === "en-prabhat" || voiceModel?.includes("Prabhat") || voiceModel === "en-IN-PrabhatNeural") {
    return { voiceName: "en-IN-PrabhatNeural", lang: "en-IN" }
  }

  // Fallback by gender: Female -> hi-IN-SwaraNeural (Swara from 66. Hindi (India) - IN), Male -> gu-IN-NiranjanNeural
  if (gender === "Male") {
    return { voiceName: "gu-IN-NiranjanNeural", lang: "gu-IN" }
  }
  return { voiceName: "hi-IN-SwaraNeural", lang: "hi-IN" }
}

// Synthesize voice via Edge Neural TTS WebSocket Protocol
async function synthesizeEdgeNeural(
  text: string,
  voiceName: string,
  lang: string,
  speed: number,
  pitch: number
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const wsUrl =
      "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EA2D47289237776249847335"

    const WebSocketClient = (globalThis as any).WebSocket
    if (!WebSocketClient) {
      resolve(null)
      return
    }

    try {
      const ws = new WebSocketClient(wsUrl)
      const audioChunks: Uint8Array[] = []
      const requestId = generateRequestId().replace(/-/g, "")

      const timeout = setTimeout(() => {
        try {
          ws.close()
        } catch (e) {}
        if (audioChunks.length > 0) {
          resolve(concatUint8Arrays(audioChunks))
        } else {
          resolve(null)
        }
      }, 7000)

      ws.onopen = () => {
        // 1. Send speech.config
        const configMsg =
          `Path: speech.config\r\n` +
          `X-RequestId: ${requestId}\r\n` +
          `Content-Type: application/json; charset=utf-8\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "false" },
                  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                },
              },
            },
          })
        ws.send(configMsg)

        // 2. Send ssml with resolved voiceName and lang
        const rateStr = speed ? (speed > 0 ? `+${speed}%` : `${speed}%`) : "0%"
        const pitchStr = pitch ? (pitch > 0 ? `+${pitch}%` : `${pitch}%`) : "0%"
        const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

        const ssmlMsg =
          `Path: ssml\r\n` +
          `X-RequestId: ${requestId}\r\n` +
          `Content-Type: application/ssml+xml\r\n\r\n` +
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'>` +
          `<voice name='${voiceName}'><prosody rate='${rateStr}' pitch='${pitchStr}'>${escapedText}</prosody></voice>` +
          `</speak>`

        ws.send(ssmlMsg)
      }

      ws.onmessage = async (event: any) => {
        if (typeof event.data === "string") {
          if (event.data.includes("Path:turn.end")) {
            clearTimeout(timeout)
            try {
              ws.close()
            } catch (e) {}
            resolve(concatUint8Arrays(audioChunks))
          }
        } else {
          let buffer: Uint8Array
          if (event.data instanceof ArrayBuffer) {
            buffer = new Uint8Array(event.data)
          } else if (event.data && event.data.arrayBuffer) {
            const ab = await event.data.arrayBuffer()
            buffer = new Uint8Array(ab)
          } else {
            return
          }

          // Header separator offset (\r\n\r\n)
          let offset = 0
          for (let i = 0; i < buffer.length - 3; i++) {
            if (buffer[i] === 13 && buffer[i + 1] === 10 && buffer[i + 2] === 13 && buffer[i + 3] === 10) {
              offset = i + 4
              break
            }
          }
          if (offset > 0 && offset < buffer.length) {
            audioChunks.push(buffer.subarray(offset))
          }
        }
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        resolve(audioChunks.length > 0 ? concatUint8Arrays(audioChunks) : null)
      }
    } catch (err) {
      console.warn("Edge Neural WebSocket exception:", err)
      resolve(null)
    }
  })
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0
  for (const arr of arrays) {
    totalLength += arr.length
  }
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

export async function POST(req: Request) {
  try {
    const { text, gender, voiceModel, speed, pitch } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text parameter is required" }, { status: 400 })
    }

    const trimmedText = text.trim()
    if (!trimmedText) {
      return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 })
    }

    // Resolve exact neural voice name and lang (defaults female to hi-IN-SwaraNeural)
    const { voiceName, lang } = resolveVoiceAndLang(voiceModel, gender)

    // 1. Synthesize via Edge Neural WebSocket Protocol
    const audioData = await synthesizeEdgeNeural(trimmedText, voiceName, lang, speed || 0, pitch || 0)

    if (audioData && audioData.length > 100) {
      return new NextResponse(audioData.buffer as ArrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // 2. Fallback stream
    const fallbackLang = lang === "hi-IN" ? "hi" : "gu"
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      trimmedText
    )}&tl=${fallbackLang}&client=tw-ob`

    const fbRes = await fetch(fallbackUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (fbRes.ok) {
      const fbBuffer = await fbRes.arrayBuffer()
      return new NextResponse(fbBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
        },
      })
    }

    return NextResponse.json({ error: "TTS synthesis failed" }, { status: 500 })
  } catch (error) {
    console.error("Swara Neural API error:", error)
    return NextResponse.json({ error: "Internal TTS server error" }, { status: 500 })
  }
}

