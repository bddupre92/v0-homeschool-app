"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, FileText, Video, Globe, FlaskConical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Reference } from "@/lib/types"

const TYPE_CONFIG: Record<string, { icon: typeof BookOpen; label: string; color: string }> = {
  book: { icon: BookOpen, label: "Book", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  article: { icon: FileText, label: "Article", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  video: { icon: Video, label: "Video", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  website: { icon: Globe, label: "Website", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  research: { icon: FlaskConical, label: "Research", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
}

export function ReferencesSection({ references }: { references: Reference[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!references || references.length === 0) return null

  return (
    <div className="border-t pt-2 mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <BookOpen className="h-3 w-3" />
        Sources ({references.length})
        {isExpanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>

      {isExpanded && (
        <ol className="mt-2 space-y-1.5 list-none">
          {references.map((ref) => {
            const config = TYPE_CONFIG[ref.type] || TYPE_CONFIG.article
            const Icon = config.icon

            return (
              <li key={ref.id} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground font-mono shrink-0 mt-0.5">[{ref.id}]</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        {ref.title}
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="font-medium">{ref.title}</span>
                    )}
                    <Badge variant="secondary" className={`text-[10px] px-1 py-0 h-4 ${config.color}`}>
                      <Icon className="h-2.5 w-2.5 mr-0.5" />
                      {config.label}
                    </Badge>
                  </div>
                  {ref.author && (
                    <span className="text-muted-foreground">by {ref.author}</span>
                  )}
                  {ref.snippet && (
                    <p className="text-muted-foreground mt-0.5 leading-snug">{ref.snippet}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
