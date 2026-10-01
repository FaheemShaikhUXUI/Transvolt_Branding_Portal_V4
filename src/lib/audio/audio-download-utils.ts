/**
 * Audio Download and ZIP Packaging Utility for Transvolt Branding Portal
 * Generates single MP3 files and multi-track ZIP archives in exact sequential order.
 * Native PKZIP implementation guarantees zero dependency lag and 100% Windows File Explorer compatibility.
 */

// CRC-32 Table for standard ZIP compliance
const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[i] = c
}

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

interface ZipEntry {
  path: string
  data: Uint8Array
}

/**
 * Creates a standard uncompressed PKZIP (method 0) Blob
 * Works seamlessly with Windows Explorer, macOS Finder, WinRAR, and 7-Zip.
 */
export function createZipBlob(entries: ZipEntry[]): Blob {
  const localHeaders: Uint8Array[] = []
  const centralHeaders: Uint8Array[] = []
  let offset = 0

  const encoder = new TextEncoder()
  const now = new Date()
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f)
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f)

  for (const entry of entries) {
    const filenameBytes = encoder.encode(entry.path)
    const crc = calculateCrc32(entry.data)
    const size = entry.data.length

    // 1. Local File Header (30 bytes + filename + data)
    const localHeader = new Uint8Array(30 + filenameBytes.length + size)
    const localView = new DataView(localHeader.buffer)

    localView.setUint32(0, 0x04034b50, true) // Signature
    localView.setUint16(4, 20, true) // Version needed (2.0)
    localView.setUint16(6, 0x0800, true) // Flags (UTF-8 enabled)
    localView.setUint16(8, 0, true) // Compression: 0 = Stored
    localView.setUint16(10, dosTime, true)
    localView.setUint16(12, dosDate, true)
    localView.setUint32(14, crc, true)
    localView.setUint32(18, size, true) // Compressed size
    localView.setUint32(22, size, true) // Uncompressed size
    localView.setUint16(26, filenameBytes.length, true)
    localView.setUint16(28, 0, true) // Extra field length

    localHeader.set(filenameBytes, 30)
    localHeader.set(entry.data, 30 + filenameBytes.length)
    localHeaders.push(localHeader)

    // 2. Central Directory Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + filenameBytes.length)
    const centralView = new DataView(centralHeader.buffer)

    centralView.setUint32(0, 0x02014b50, true) // Signature
    centralView.setUint16(4, 20, true) // Version made by
    centralView.setUint16(6, 20, true) // Version needed
    centralView.setUint16(8, 0x0800, true) // Flags (UTF-8)
    centralView.setUint16(10, 0, true) // Compression: 0
    centralView.setUint16(12, dosTime, true)
    centralView.setUint16(14, dosDate, true)
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, size, true)
    centralView.setUint32(24, size, true)
    centralView.setUint16(28, filenameBytes.length, true)
    centralView.setUint16(30, 0, true) // Extra field length
    centralView.setUint16(32, 0, true) // File comment length
    centralView.setUint16(34, 0, true) // Disk number start
    centralView.setUint16(36, 0, true) // Internal file attributes
    centralView.setUint32(38, 0x00000020, true) // External file attributes (Archive)
    centralView.setUint32(42, offset, true) // Relative offset of local header

    centralHeader.set(filenameBytes, 46)
    centralHeaders.push(centralHeader)

    offset += localHeader.length
  }

  const centralDirectoryOffset = offset
  let centralDirectorySize = 0
  for (const h of centralHeaders) {
    centralDirectorySize += h.length
  }

  // 3. End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22)
  const eocdView = new DataView(eocd.buffer)
  eocdView.setUint32(0, 0x06054b50, true)
  eocdView.setUint16(4, 0, true) // Disk number
  eocdView.setUint16(6, 0, true) // Start disk
  eocdView.setUint16(8, entries.length, true) // Disk entries
  eocdView.setUint16(10, entries.length, true) // Total entries
  eocdView.setUint32(12, centralDirectorySize, true)
  eocdView.setUint32(16, centralDirectoryOffset, true)
  eocdView.setUint16(20, 0, true) // Comment length

  return new Blob([...localHeaders, ...centralHeaders, eocd] as unknown as BlobPart[], {
    type: "application/zip",
  })
}

/**
 * Triggers a native browser file download (opens Windows Save dialog or downloads to Downloads folder)
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.style.display = "none"
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 1000)
}

/**
 * Clean filename helper
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim()
}

/**
 * Synthesizes MP3 audio buffer from the neural TTS API
 */
export async function fetchAudioData(
  text: string,
  voiceModel: string = "hi-swara",
  voiceGender: string = "Female",
  speed: number = 0,
  pitch: number = 0
): Promise<Uint8Array> {
  const res = await fetch("/api/tts/dhwani", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voiceModel,
      gender: voiceGender,
      speed,
      pitch,
    }),
  })

  if (!res.ok) {
    throw new Error(`TTS synthesis returned status ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
