"use client"

import { Check, Circle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { LessonSuggestionCard } from "@/lib/advisor-types"

export function LessonSuggestionCardUI({ card }: { card: LessonSuggestionCard }) {
  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground">
          Learning Support — {card.childName}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {card.items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
              item.status === "done"
                ? "text-green-600 bg-green-50"
                : "text-muted-foreground bg-muted/50"
            }`}
          >
            {item.status === "done" ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 shrink-0" />
            )}
            <span className="text-sm font-medium">{item.label}</span>
            {item.status === "done" && (
              <span className="ml-auto text-xs font-medium">Done</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
