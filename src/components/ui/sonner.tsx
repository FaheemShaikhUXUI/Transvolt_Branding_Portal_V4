"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4.5 text-white stroke-[2.2]" />
        ),
        info: (
          <InfoIcon className="size-4.5 text-white stroke-[2.2]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4.5 text-white stroke-[2.2]" />
        ),
        error: (
          <OctagonXIcon className="size-4.5 text-white stroke-[2.2]" />
        ),
        loading: (
          <Loader2Icon className="size-4.5 text-white animate-spin stroke-[2.2]" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group toast font-sans text-sm font-medium rounded-xl shadow-2xl border px-4 py-3 flex items-center gap-3 transition-all duration-200 backdrop-blur-md",
          default: "!bg-[#0284c7] !text-white !border-[#38bdf8]/50 !shadow-lg !shadow-sky-500/25",
          info: "!bg-[#0284c7] !text-white !border-[#38bdf8]/50 !shadow-lg !shadow-sky-500/25",
          warning: "!bg-[#ea580c] !text-white !border-[#fb923c]/50 !shadow-lg !shadow-orange-500/25",
          error: "!bg-[#e11d48] !text-white !border-[#fb7185]/50 !shadow-lg !shadow-rose-500/25",
          success: "!bg-[#16a34a] !text-white !border-[#4ade80]/50 !shadow-lg !shadow-emerald-500/25",
          title: "!font-semibold !text-white text-sm",
          description: "!text-white/90 !text-xs",
          actionButton: "!bg-white !text-neutral-900 !font-semibold hover:!bg-white/90 shadow-sm",
          cancelButton: "!bg-white/20 !text-white hover:!bg-white/30",
          closeButton: "!bg-white/20 !text-white hover:!bg-white/30 !border-white/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
