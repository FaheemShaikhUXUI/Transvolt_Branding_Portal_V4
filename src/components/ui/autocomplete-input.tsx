"use client"

import * as React from "react"
import { ChevronDown, Check, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AutocompleteInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  inputClassName?: string
  leftIcon?: React.ReactNode
  allowCustom?: boolean
  emptyMessage?: string
}

export function AutocompleteInput({
  id,
  value,
  onChange,
  options,
  placeholder = "Select or type...",
  disabled = false,
  required = false,
  className,
  inputClassName,
  leftIcon,
  allowCustom = true,
  emptyMessage = "No matching options",
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  // Filter options based on user query
  const filteredOptions = React.useMemo(() => {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed) return options

    return options.filter((opt) => opt.toLowerCase().includes(trimmed))
  }, [options, value])

  const hasExactMatch = React.useMemo(() => {
    return options.some((opt) => opt.toLowerCase() === value.trim().toLowerCase())
  }, [options, value])

  // Handle outside clicks to close the dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Auto-scroll highlighted item into view
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li")
      const target = items[highlightedIndex]
      if (target) {
        target.scrollIntoView({ block: "nearest" })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(0)
        return
      }
    }

    if (isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        } else if (value.trim()) {
          setIsOpen(false)
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        setIsOpen(false)
      }
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {leftIcon}
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            if (!isOpen) setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={cn(
            "w-full h-11 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm text-foreground",
            "focus:bg-background focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon ? "pl-9" : "pl-3",
            value ? "pr-16" : "pr-10",
            inputClassName
          )}
        />

        {/* Right Action Icons: Clear & Chevron Toggle */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 z-10">
          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
                inputRef.current?.focus()
                setIsOpen(true)
              }}
              className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              title="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen((prev) => !prev)
              inputRef.current?.focus()
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-transform cursor-pointer"
            title={isOpen ? "Close dropdown" : "Open dropdown"}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180 text-primary"
              )}
            />
          </button>
        </div>
      </div>

      {/* Sleek Custom Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-border/90 bg-card/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150">
          <ul
            ref={listRef}
            className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pr-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const isSelected = option.toLowerCase() === value.trim().toLowerCase()
                const isHighlighted = idx === highlightedIndex

                return (
                  <li
                    key={option}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none",
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold"
                        : isHighlighted
                        ? "bg-muted/80 text-foreground"
                        : "text-foreground/90 hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
                  </li>
                )
              })
            ) : (
              <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                {emptyMessage}
              </div>
            )}

            {/* Custom Input Option if user typed something not matching options */}
            {allowCustom && value.trim() && !hasExactMatch && (
              <li
                onClick={() => {
                  handleSelect(value.trim())
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border-t border-border/50 mt-1 cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Use &quot;{value.trim()}&quot;</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
