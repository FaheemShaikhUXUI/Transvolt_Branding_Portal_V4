"use client"

import * as React from "react"
import { ZoomIn, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveImageCanvasProps {
  src: string
  alt: string
  title?: string
  subTitle?: string
  className?: string
}

export function InteractiveImageCanvas({ src, alt, title, subTitle, className }: InteractiveImageCanvasProps) {
  const [zoomScale, setZoomScale] = React.useState(1)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const imageObjRef = React.useRef<HTMLImageElement | null>(null)

  const currentRef = React.useRef({ scale: 1, x: 0, y: 0 })
  const targetRef = React.useRef({ scale: 1, x: 0, y: 0 })
  const isAnimatingRef = React.useRef(false)
  const animFrameIdRef = React.useRef<number | null>(null)
  const dragStartRef = React.useRef({ x: 0, y: 0 })

  // High-DPI Lossless Canvas Renderer
  // Directly renders from original full-resolution image bitmap onto display pixels
  const renderCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const img = imageObjRef.current
    if (!canvas || !container || !img || !img.complete || img.naturalWidth === 0) return

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    const width = container.clientWidth
    const height = container.clientHeight
    if (width === 0 || height === 0) return

    const targetWidth = Math.round(width * dpr)
    const targetHeight = Math.round(height * dpr)

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth
      canvas.height = targetHeight
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)

    // Calculate initial fit-to-contain bounding dimensions with margin
    const marginX = Math.min(60, width * 0.08)
    const marginY = Math.min(60, height * 0.08)
    const availW = Math.max(10, width - marginX)
    const availH = Math.max(10, height - marginY)

    const scaleX = availW / img.naturalWidth
    const scaleY = availH / img.naturalHeight
    const baseFitScale = Math.min(scaleX, scaleY, 1)

    const baseW = img.naturalWidth * baseFitScale
    const baseH = img.naturalHeight * baseFitScale

    const scale = currentRef.current.scale
    const curX = currentRef.current.x
    const curY = currentRef.current.y

    const renderW = baseW * scale
    const renderH = baseH * scale

    const centerX = width / 2 + curX
    const centerY = height / 2 + curY

    const drawX = centerX - renderW / 2
    const drawY = centerY - renderH / 2

    // Maximum studio quality smoothing (guarantees crystal clarity on downscale & zoom)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Soft drop shadow for photo floating feel
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)"
    ctx.shadowBlur = 24
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 6

    // Clip subtle rounded corners
    const cornerRadius = Math.min(8, Math.min(renderW, renderH) * 0.05)
    ctx.beginPath()
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(drawX, drawY, renderW, renderH, cornerRadius)
    } else {
      ctx.rect(drawX, drawY, renderW, renderH)
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.01)"
    ctx.fill()
    ctx.clip()

    // Draw directly from source image bitmap with full natural resolution!
    ctx.drawImage(img, drawX, drawY, renderW, renderH)

    ctx.restore()
  }, [])

  // Continuous silky-smooth lerp animation loop (cream glide 60fps)
  const startAnimation = React.useCallback(() => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const animate = () => {
      const current = currentRef.current
      const target = targetRef.current
      const lerp = 0.2

      const diffScale = target.scale - current.scale
      const diffX = target.x - current.x
      const diffY = target.y - current.y

      if (Math.abs(diffScale) < 0.001 && Math.abs(diffX) < 0.3 && Math.abs(diffY) < 0.3) {
        current.scale = target.scale
        current.x = target.x
        current.y = target.y
        setZoomScale(current.scale)
        renderCanvas()
        isAnimatingRef.current = false
        animFrameIdRef.current = null
        return
      }

      current.scale += diffScale * lerp
      current.x += diffX * lerp
      current.y += diffY * lerp

      setZoomScale(current.scale)
      renderCanvas()
      animFrameIdRef.current = requestAnimationFrame(animate)
    }

    animFrameIdRef.current = requestAnimationFrame(animate)
  }, [renderCanvas])

  // Cancel any active animation frame on unmount
  React.useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [])

  // Load and cache full-resolution image whenever `src` changes
  React.useEffect(() => {
    setIsLoading(true)
    currentRef.current = { scale: 1, x: 0, y: 0 }
    targetRef.current = { scale: 1, x: 0, y: 0 }
    setZoomScale(1)

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      imageObjRef.current = img
      setIsLoading(false)
      renderCanvas()
    }

    img.onerror = () => {
      setIsLoading(false)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, renderCanvas])

  // ResizeObserver to re-render canvas whenever container dimensions change
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      renderCanvas()
    })

    ro.observe(container)
    return () => ro.disconnect()
  }, [renderCanvas])

  // Smooth cursor-anchored mouse wheel zoom (100% to 1000%)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - (rect.left + rect.width / 2)
    const mouseY = e.clientY - (rect.top + rect.height / 2)

    const zoomFactor = Math.exp(-e.deltaY * 0.0015)
    const prevTarget = targetRef.current

    let nextScale = Math.min(Math.max(prevTarget.scale * zoomFactor, 1), 10)
    nextScale = parseFloat(nextScale.toFixed(3))

    if (nextScale <= 1) {
      targetRef.current = { scale: 1, x: 0, y: 0 }
    } else {
      const ratio = nextScale / prevTarget.scale
      const nextX = mouseX - (mouseX - prevTarget.x) * ratio
      const nextY = mouseY - (mouseY - prevTarget.y) * ratio
      targetRef.current = {
        scale: nextScale,
        x: Math.round(nextX),
        y: Math.round(nextY),
      }
    }

    startAnimation()
  }

  // Mouse down: start left-click pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // only left click
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - currentRef.current.x,
      y: e.clientY - currentRef.current.y,
    }
  }

  // Mouse move: dragging / panning via left click hold
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const newX = Math.round(e.clientX - dragStartRef.current.x)
    const newY = Math.round(e.clientY - dragStartRef.current.y)
    currentRef.current.x = newX
    currentRef.current.y = newY
    targetRef.current.x = newX
    targetRef.current.y = newY
    renderCanvas()
  }

  // Mouse up or leave: stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleReset = () => {
    targetRef.current = { scale: 1, x: 0, y: 0 }
    startAnimation()
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-transparent">
      {/* Floating Title & Subtitle on Opposite (Left) Side */}
      {(title || alt) && (
        <div className="absolute top-4 left-5 z-30 flex flex-col text-left pointer-events-none max-w-[48%] sm:max-w-[60%]">
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.10)] line-clamp-1">
            {title || alt}
          </h3>
          {subTitle && (
            <p className="text-[11px] sm:text-xs text-white font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.10)] mt-0.5 line-clamp-1">
              {subTitle}
            </p>
          )}
        </div>
      )}

      {/* Single Volume-Type Zoom Slider Control (Up to 1000%) */}
      <div 
        className="absolute top-3.5 right-12 z-30 flex items-center gap-2.5 bg-black/15 border border-white/15 rounded-full px-3.5 py-2 shadow-lg backdrop-blur-xs transition-all hover:bg-black/25 group"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleReset}
          className="text-white hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full hover:bg-white/15"
          title="Click to Reset to 100%"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>

        {/* Volume-Style Slider Track */}
        <div className="relative flex items-center w-28 sm:w-36 group/slider cursor-pointer">
          <input
            type="range"
            min="100"
            max="1000"
            step="1"
            value={Math.round(zoomScale * 100)}
            onChange={(e) => {
              const val = Number(e.target.value) / 100
              if (val <= 1) {
                targetRef.current = { scale: 1, x: 0, y: 0 }
              } else {
                const ratio = val / (targetRef.current.scale || 1)
                targetRef.current = {
                  scale: val,
                  x: Math.round(targetRef.current.x * ratio),
                  y: Math.round(targetRef.current.y * ratio),
                }
              }
              startAnimation()
            }}
            className="w-full h-1.5 appearance-none bg-white/20 rounded-full outline-none cursor-pointer accent-[#548235] hover:accent-[#659d40] transition-all
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Zoom Level"
          />
        </div>

        {/* Zoom Percentage Label / Reset Trigger */}
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-mono font-bold text-white/90 hover:text-white px-1 py-0.5 rounded transition-colors min-w-[48px] text-right cursor-pointer"
          title="Click to Reset to 100%"
        >
          {Math.round(zoomScale * 100)}%
        </button>
      </div>

      {/* Viewport Canvas with Smooth Wheel Zoom and Left-Click Drag Pan */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "w-full h-full flex items-center justify-center p-0 relative overflow-hidden",
          isDragging ? "cursor-grabbing" : zoomScale > 1 ? "cursor-grab" : "cursor-default",
          className
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <Loader2 className="w-8 h-8 text-white/70 animate-spin" />
          </div>
        )}

        {/* Studio-Grade High-DPI Canvas Rendering Engine */}
        <canvas
          ref={canvasRef}
          className="block pointer-events-none"
        />
      </div>
    </div>
  )
}
