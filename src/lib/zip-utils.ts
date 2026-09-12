/**
 * Robust Client-Side ZIP Packager
 * Dynamically loads JSZip when needed to package multiple files into a single ZIP archive.
 */

// Dynamically load JSZip from CDN if not already on window
async function getJSZip(): Promise<any> {
  if (typeof window === "undefined") return null
  if ((window as any).JSZip) return (window as any).JSZip

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
    script.onload = () => resolve((window as any).JSZip)
    script.onerror = () => reject(new Error("Failed to load ZIP generator library."))
    document.head.appendChild(script)
  })
}

// Convert Data URL / Blob / URL to Uint8Array or Blob
async function fileDataToBlob(fileData: string): Promise<Blob> {
  if (fileData.startsWith("data:")) {
    const res = await fetch(fileData)
    return await res.blob()
  }
  if (fileData.startsWith("blob:") || fileData.startsWith("http") || fileData.startsWith("/")) {
    const res = await fetch(fileData)
    return await res.blob()
  }
  return new Blob([fileData], { type: "application/octet-stream" })
}

export interface ZipFileInput {
  fileName: string
  fileData: string
}

/**
 * Creates and triggers download of a ZIP file containing all provided files.
 */
export async function downloadGroupAsZip(
  zipFileName: string,
  files: ZipFileInput[]
): Promise<void> {
  if (!files || files.length === 0) return

  const JSZip = await getJSZip()
  const zip = new JSZip()

  // Add each file to the zip
  for (const f of files) {
    try {
      const blob = await fileDataToBlob(f.fileData)
      zip.file(f.fileName, blob)
    } catch (err) {
      console.error(`Error packing file ${f.fileName} into ZIP:`, err)
    }
  }

  // Generate the zip archive
  const content = await zip.generateAsync({ type: "blob" })
  
  // Trigger browser download
  const url = URL.createObjectURL(content)
  const a = document.createElement("a")
  a.href = url
  a.download = zipFileName.endsWith(".zip") ? zipFileName : `${zipFileName}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Triggers a 100% lossless client download of an image file from a Data URL, Blob, or URL.
 * Converts Data URLs to native binary Blobs so browsers never truncate or re-compress the file.
 */
export async function downloadFileLossless(fileData: string | Blob, fileName: string): Promise<void> {
  if (!fileData) return

  let blob: Blob
  if (fileData instanceof Blob) {
    blob = fileData
  } else if (fileData.startsWith("data:")) {
    try {
      const parts = fileData.split(",")
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg"
      const binaryStr = atob(parts[1])
      const len = binaryStr.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      blob = new Blob([bytes], { type: mime })
    } catch {
      const res = await fetch(fileData)
      blob = await res.blob()
    }
  } else {
    const res = await fetch(fileData)
    blob = await res.blob()
  }

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000)
}
