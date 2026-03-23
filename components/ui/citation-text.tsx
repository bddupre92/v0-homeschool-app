"use client"

import type { Reference } from "@/lib/types"

interface CitationTextProps {
  text: string
  references?: Reference[]
  className?: string
}

export function CitationText({ text, references, className }: CitationTextProps) {
  if (!text) return null

  // Split text on [N] patterns
  const parts = text.split(/(\[\d+\])/g)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/)
        if (!match) return part

        const refId = parseInt(match[1], 10)
        const ref = references?.find((r) => r.id === refId)

        if (ref?.url) {
          return (
            <a
              key={i}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline align-super font-medium cursor-pointer"
              title={`${ref.title}${ref.author ? ` — ${ref.author}` : ""}`}
            >
              [{refId}]
            </a>
          )
        }

        return (
          <span
            key={i}
            className="text-[10px] text-muted-foreground align-super font-medium"
            title={ref ? `${ref.title}${ref.author ? ` — ${ref.author}` : ""}` : `Reference ${refId}`}
          >
            [{refId}]
          </span>
        )
      })}
    </span>
  )
}
