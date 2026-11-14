import * as React from "react"
import { cn } from "@/lib/utils"

export interface PillSelectProps {
  options: { label: string; value: string; icon?: React.ReactNode }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PillSelect({ options, value, onChange, className }: PillSelectProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none",
              isSelected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            )}
          >
            {option.icon && (
              <span className={cn("text-gray-400", isSelected && "text-white")}>
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
