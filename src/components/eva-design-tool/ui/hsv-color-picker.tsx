"use client"

import * as React from "react"
import { Pipette, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Color Math Conversions ──────────────────────────────────────────────────

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
    else if (max === gn) h = ((bn - rn) / d + 2) * 60
    else h = ((rn - gn) / d + 4) * 60
  }
  return [Math.round(h), s, v]
}

export function hexToRgb(hexStr: string): [number, number, number, number] {
  let hex = (hexStr || "#000000").replace(/^#/, "").trim()
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("")
  }
  if (hex.length === 6) {
    const num = parseInt(hex, 16)
    if (isNaN(num)) return [0, 0, 0, 1]
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1]
  }
  if (hex.length === 8) {
    const num = parseInt(hex, 16)
    if (isNaN(num)) return [0, 0, 0, 1]
    return [
      (num >> 24) & 255,
      (num >> 16) & 255,
      (num >> 8) & 255,
      parseFloat(((num & 255) / 255).toFixed(2)),
    ]
  }
  return [0, 0, 0, 1]
}

export function rgbToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")
  if (a < 1) {
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, "0")
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`.toUpperCase()
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface HsvColorPickerProps {
  value: string // hex (e.g. #548235, #000000, rgba, etc.)
  onChange: (hex: string) => void
  className?: string
  theme?: "light" | "dark"
}

export function HsvColorPicker({
  value,
  onChange,
  className,
  theme = "light",
}: HsvColorPickerProps) {
  // Parse initial color
  const [rgb, a] = React.useMemo(() => {
    const [r, g, b, alpha] = hexToRgb(value || "#000000")
    return [[r, g, b] as [number, number, number], alpha]
  }, [value])

  const [initH, initS, initV] = React.useMemo(() => rgbToHsv(rgb[0], rgb[1], rgb[2]), [rgb])

  const [hue, setHue] = React.useState<number>(initH)
  const [sat, setSat] = React.useState<number>(initS)
  const [val, setVal] = React.useState<number>(initV)
  const [alpha, setAlpha] = React.useState<number>(a)
  const [formatMode, setFormatMode] = React.useState<"Hex" | "RGB" | "HSL">("Hex")
  const [hexInput, setHexInput] = React.useState<string>(() => (value || "#000000").replace(/^#/, "").toUpperCase())

  // Keep internal states synced when value prop changes externally
  React.useEffect(() => {
    const [r, g, b, newAlpha] = hexToRgb(value || "#000000")
    const [newH, newS, newV] = rgbToHsv(r, g, b)
    setHue(newH)
    setSat(newS)
    setVal(newV)
    setAlpha(newAlpha)
    setHexInput((value || "#000000").replace(/^#/, "").toUpperCase())
  }, [value])

  const satValRef = React.useRef<HTMLDivElement>(null)
  const hueRef = React.useRef<HTMLDivElement>(null)
  const alphaRef = React.useRef<HTMLDivElement>(null)

  // Commit color update
  const emitChange = React.useCallback(
    (newH: number, newS: number, newV: number, newA: number) => {
      const [r, g, b] = hsvToRgb(newH, newS, newV)
      const hex = rgbToHex(r, g, b, newA)
      setHexInput(hex.replace(/^#/, ""))
      onChange(hex)
    },
    [onChange]
  )

  // 1. Saturation / Value Canvas Mouse Drag
  const handleSatValMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const updateSatVal = (clientX: number, clientY: number) => {
      if (!satValRef.current) return
      const rect = satValRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top))
      const newSat = x / rect.width
      const newVal = 1 - y / rect.height
      setSat(newSat)
      setVal(newVal)
      emitChange(hue, newSat, newVal, alpha)
    }

    updateSatVal(e.clientX, e.clientY)

    const onMouseMove = (ev: MouseEvent) => updateSatVal(ev.clientX, ev.clientY)
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  // 2. Hue Slider Drag
  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const updateHue = (clientX: number) => {
      if (!hueRef.current) return
      const rect = hueRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      const newH = Math.round((x / rect.width) * 360) % 360
      setHue(newH)
      emitChange(newH, sat, val, alpha)
    }

    updateHue(e.clientX)

    const onMouseMove = (ev: MouseEvent) => updateHue(ev.clientX)
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  // 3. Alpha Slider Drag
  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const updateAlpha = (clientX: number) => {
      if (!alphaRef.current) return
      const rect = alphaRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      const newA = parseFloat((x / rect.width).toFixed(2))
      setAlpha(newA)
      emitChange(hue, sat, val, newA)
    }

    updateAlpha(e.clientX)

    const onMouseMove = (ev: MouseEvent) => updateAlpha(ev.clientX)
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  // 4. Native EyeDropper API (Chrome, Edge, Opera)
  const handleEyeDropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase()
          setHexInput(hex.replace(/^#/, ""))
          const [r, g, b] = hexToRgb(hex)
          const [newH, newS, newV] = rgbToHsv(r, g, b)
          setHue(newH)
          setSat(newS)
          setVal(newV)
          onChange(hex)
        }
      } catch {
        // User cancelled eyedropper
      }
    }
  }

  // Pure hue color for saturation-value background
  const pureHueRgb = hsvToRgb(hue, 1, 1)
  const pureHueHex = rgbToHex(pureHueRgb[0], pureHueRgb[1], pureHueRgb[2])
  const currentOpaqueHex = rgbToHex(rgb[0], rgb[1], rgb[2])

  const isLight = theme === "light"

  return (
    <div
      className={cn(
        "w-full rounded-2xl select-none font-sans text-xs flex flex-col gap-3 transition-colors",
        isLight
          ? "bg-white text-neutral-900 border border-neutral-200/90 shadow-sm p-3.5"
          : "bg-[#1e2024] text-white border border-white/10 shadow-2xl p-3",
        className
      )}
    >
      {/* ─── 1. Saturation / Value Gradient Canvas ───────────────────── */}
      <div
        ref={satValRef}
        onMouseDown={handleSatValMouseDown}
        className={cn(
          "relative w-full h-[155px] rounded-xl cursor-crosshair overflow-hidden shadow-inner",
          isLight ? "border border-neutral-200/60" : "border border-white/10"
        )}
        style={{
          backgroundColor: pureHueHex,
          backgroundImage: `
            linear-gradient(to top, #000000, transparent),
            linear-gradient(to right, #ffffff, transparent)
          `,
        }}
      >
        {/* Circular Pointer Handle matching Image 2 */}
        <div
          className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)] pointer-events-none transition-transform"
          style={{
            left: `${sat * 100}%`,
            top: `${(1 - val) * 100}%`,
            backgroundColor: currentOpaqueHex,
          }}
        />
      </div>

      {/* ─── 2. Hue Rainbow Slider Bar ───────────────────────────────── */}
      <div
        ref={hueRef}
        onMouseDown={handleHueMouseDown}
        className={cn(
          "relative w-full h-3.5 rounded-full cursor-pointer shadow-inner",
          isLight ? "border border-neutral-200/40" : "border border-white/10"
        )}
        style={{
          backgroundImage:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}
      >
        {/* Hue Circular Ring Thumb */}
        <div
          className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_1.5px_3px_rgba(0,0,0,0.3)] pointer-events-none transition-transform"
          style={{
            left: `${(hue / 360) * 100}%`,
            backgroundColor: pureHueHex,
          }}
        />
      </div>

      {/* ─── 3. Eyedropper Pipette & Opacity Slider Row ──────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Eyedropper Pipette Icon */}
        <button
          type="button"
          onClick={handleEyeDropper}
          title="Pick color from screen (EyeDropper)"
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer",
            isLight
              ? "text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200/80 bg-neutral-50"
              : "text-white/80 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10"
          )}
        >
          <Pipette className="w-3.5 h-3.5 transform -scale-x-100" />
        </button>

        {/* Alpha / Opacity Checkerboard Slider Bar */}
        <div
          ref={alphaRef}
          onMouseDown={handleAlphaMouseDown}
          className={cn(
            "relative flex-1 h-3.5 rounded-full cursor-pointer overflow-visible shadow-inner",
            isLight ? "border border-neutral-200/60" : "border border-white/10"
          )}
          style={{
            backgroundImage: `
              linear-gradient(to right, transparent, ${currentOpaqueHex}),
              repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 8px 8px
            `,
          }}
        >
          {/* Alpha Circular Ring Thumb */}
          <div
            className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_1.5px_3px_rgba(0,0,0,0.3)] pointer-events-none transition-transform"
            style={{
              left: `${alpha * 100}%`,
              backgroundColor: currentOpaqueHex,
            }}
          />
        </div>
      </div>

      {/* ─── 4. Bottom Controls: Format Pill, Hex Input, Opacity % ──── */}
      <div className="flex items-center gap-1.5 pt-0.5">
        {/* Format Select Pill (Hex / RGB / HSL) */}
        <div className="relative shrink-0">
          <select
            value={formatMode}
            onChange={(e) => setFormatMode(e.target.value as any)}
            className={cn(
              "h-8 pl-2.5 pr-6 rounded-lg text-[11px] font-semibold appearance-none focus:outline-hidden cursor-pointer transition-colors",
              isLight
                ? "bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 text-neutral-800"
                : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/90"
            )}
          >
            <option value="Hex" className={isLight ? "bg-white text-neutral-900" : "bg-[#1e2024] text-white"}>Hex</option>
            <option value="RGB" className={isLight ? "bg-white text-neutral-900" : "bg-[#1e2024] text-white"}>RGB</option>
            <option value="HSL" className={isLight ? "bg-white text-neutral-900" : "bg-[#1e2024] text-white"}>HSL</option>
          </select>
          <ChevronDown
            className={cn(
              "absolute right-2 top-2.5 w-3 h-3 pointer-events-none",
              isLight ? "text-neutral-500" : "text-white/60"
            )}
          />
        </div>

        {/* Color Value Input */}
        <div
          className={cn(
            "flex-1 h-8 px-2.5 rounded-lg flex items-center transition-colors",
            isLight
              ? "bg-neutral-100 border border-neutral-200 focus-within:bg-white focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400"
              : "bg-white/5 border border-white/10 focus-within:bg-white/10 focus-within:border-white/30"
          )}
        >
          <input
            type="text"
            value={hexInput}
            onChange={(e) => {
              const val = e.target.value
              setHexInput(val)
              const [r, g, b, newA] = hexToRgb(val)
              if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                const [newH, newS, newV] = rgbToHsv(r, g, b)
                setHue(newH)
                setSat(newS)
                setVal(newV)
                setAlpha(newA)
                onChange(val.startsWith("#") ? val.toUpperCase() : `#${val.toUpperCase()}`)
              }
            }}
            onBlur={() => {
              setHexInput((currentOpaqueHex || "#000000").replace(/^#/, ""))
            }}
            className={cn(
              "w-full bg-transparent text-[11px] font-mono uppercase font-bold focus:outline-hidden",
              isLight ? "text-neutral-900 placeholder:text-neutral-400" : "text-white/95 placeholder:text-white/40"
            )}
            placeholder="000000"
          />
        </div>

        {/* Opacity % Input */}
        <div
          className={cn(
            "w-16 h-8 px-1.5 rounded-lg flex items-center justify-center font-mono text-[11px] transition-colors shrink-0",
            isLight
              ? "bg-neutral-100 border border-neutral-200 text-neutral-900 focus-within:bg-white focus-within:border-neutral-400"
              : "bg-white/5 border border-white/10 text-white/95 focus-within:bg-white/10"
          )}
        >
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round(alpha * 100)}
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
              const newA = val / 100
              setAlpha(newA)
              emitChange(hue, sat, val / 100, newA)
            }}
            className="w-8 bg-transparent text-right font-bold focus:outline-hidden"
          />
          <span className={cn("ml-0.5 text-[10px]", isLight ? "text-neutral-500" : "text-white/60")}>%</span>
        </div>
      </div>
    </div>
  )
}
