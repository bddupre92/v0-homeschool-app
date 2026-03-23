"use client"

import { Check, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { ProgressReportCard } from "@/lib/advisor-types"

const statusConfig = {
  on_track: { icon: Check, className: "text-green-600 bg-green-50", label: "Done" },
  needs_attention: { icon: AlertTriangle, className: "text-amber-600 bg-amber-50", label: "Needs Attention" },
  ahead: { icon: TrendingUp, className: "text-blue-600 bg-blue-50", label: "Ahead" },
}

export function ProgressReportCardUI({ card }: { card: ProgressReportCard }) {
  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground">
          Learning Alignment — {card.childName}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {(card.items || []).map((item, idx) => {
          const config = statusConfig[item.status]
          const Icon = config.icon
          return (
            <div key={idx} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${config.className}`}>
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.subject}</span>
                  <span className="text-xs font-medium ml-2 shrink-0">{config.label}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-80">{item.detail}</p>
              </div>
            </div>
          )
        })}

        {card.traitGrowth && card.traitGrowth.length > 0 && (
          <div className="pt-2 border-t">
            {card.traitGrowth.map((trait, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg px-3 py-2.5 bg-purple-50 text-purple-600 mt-2">
                <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Trait Growth: {trait.trait} → {trait.level}
                    </span>
                    <span className="text-xs font-medium ml-2 shrink-0">Done</span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-80">{trait.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {card.summary && (
          <p className="text-xs text-muted-foreground pt-2 border-t">{card.summary}</p>
        )}
      </CardContent>
    </Card>
  )
}
