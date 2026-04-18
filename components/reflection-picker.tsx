"use client"

import { cn } from "@/lib/utils"
import type { ReflectionRating } from "@/lib/atoz-store"

const OPTIONS: { rating: ReflectionRating; emoji: string; label: string }[] = [
  { rating: "great", emoji: "😊", label: "Great" },
  { rating: "good", emoji: "🙂", label: "Good" },
  { rating: "okay", emoji: "😐", label: "Okay" },
  { rating: "tough", emoji: "😕", label: "Tough" },
]

interface ReflectionPickerProps {
  value?: ReflectionRating
  onChange: (rating: ReflectionRating) => void
  dark?: boolean
  className?: string
}

export function ReflectionPicker({ value, onChange, dark, className }: ReflectionPickerProps) {
  return (
    <div
      className={cn("atoz-reflect-picker", className)}
      role="radiogroup"
      aria-label="How did the lesson go?"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.rating}
          type="button"
          role="radio"
          aria-checked={value === opt.rating}
          aria-label={opt.label}
          onClick={() => onChange(opt.rating)}
          className={cn(
            "atoz-reflect-btn",
            value === opt.rating && "atoz-reflect-btn--active",
          )}
          style={dark ? { color: "#fff" } : undefined}
        >
          <span aria-hidden="true">{opt.emoji}</span>
          <span className="atoz-reflect-btn__label">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
