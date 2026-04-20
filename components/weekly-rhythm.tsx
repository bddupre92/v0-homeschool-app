"use client"

/**
 * Weekly rhythm — Sun→Sat grid, one row per kid, fill shows hours per
 * day. Reads portfolio items (minutes / date / kidId) directly from
 * atoz-store so the view always reflects captured work.
 */

import { useEffect, useMemo, useState } from "react"
import { listPortfolio, onStorageChange, type PortfolioItem } from "@/lib/atoz-store"
import { KidDot } from "@/components/primitives"
import type { DemoKid } from "@/lib/demo-kids"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

function dayIndex(iso: string, weekStart: Date): number {
  const d = new Date(iso)
  const diffMs = d.getTime() - weekStart.getTime()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

export default function WeeklyRhythm({ kids }: { kids: DemoKid[] }) {
  const [items, setItems] = useState<PortfolioItem[]>([])

  useEffect(() => {
    setItems(listPortfolio())
    return onStorageChange(() => setItems(listPortfolio()))
  }, [])

  const now = useMemo(() => new Date(), [])
  const weekStart = useMemo(() => startOfWeek(now), [now])
  const todayIdx = now.getDay()

  const hoursByKidByDay = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const kid of kids) map.set(kid.id, new Array(7).fill(0))
    for (const item of items) {
      const idx = dayIndex(item.date, weekStart)
      if (idx < 0 || idx > 6) continue
      const row = map.get(item.kidId)
      if (!row) continue
      row[idx] += (item.minutes ?? 0) / 60
    }
    return map
  }, [items, kids, weekStart])

  const maxHours = useMemo(() => {
    let max = 0
    for (const row of hoursByKidByDay.values()) {
      for (const h of row) if (h > max) max = h
    }
    return Math.max(3, max) // min scale of 3 so empty weeks still look calm
  }, [hoursByKidByDay])

  if (kids.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-[var(--rule)] bg-white p-4">
      <div className="atoz-eyebrow mb-3">Weekly rhythm</div>
      <div className="min-w-full overflow-x-auto">
        <div
          role="grid"
          aria-label="Weekly hours by kid"
          className="grid gap-x-2 gap-y-3 text-xs"
          style={{ gridTemplateColumns: `auto repeat(7, minmax(0, 1fr))` }}
        >
          <div role="columnheader" aria-hidden="true" />
          {WEEKDAYS.map((label, i) => (
            <div
              key={label}
              role="columnheader"
              className={`text-center font-medium ${
                i === todayIdx ? "text-[var(--sage-dd)]" : "text-[var(--ink-3)]"
              }`}
            >
              {label}
            </div>
          ))}

          {kids.map((kid) => {
            const row = hoursByKidByDay.get(kid.id) ?? []
            const kidTotal = row.reduce((a, b) => a + b, 0)
            return (
              <FragmentRow key={kid.id}>
                <div className="flex items-center gap-2 pr-2">
                  <KidDot name={kid.name} color={kid.color} size="xs" />
                  <div>
                    <div className="font-medium text-[var(--ink)]">{kid.name}</div>
                    <div className="text-[10px] text-[var(--ink-3)]">
                      {kidTotal.toFixed(1)} hr this week
                    </div>
                  </div>
                </div>
                {row.map((hrs, i) => {
                  const pct = Math.min(100, Math.round((hrs / maxHours) * 100))
                  const isToday = i === todayIdx
                  return (
                    <div
                      key={i}
                      role="gridcell"
                      className={`relative h-14 rounded-md border overflow-hidden ${
                        isToday
                          ? "border-[var(--sage-d)] bg-[var(--sage-ll)]"
                          : "border-[var(--rule)] bg-white"
                      }`}
                      aria-label={`${kid.name} ${WEEKDAYS[i]}: ${hrs.toFixed(1)} hours`}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all"
                        style={{
                          height: `${pct}%`,
                          background: kid.color,
                          opacity: hrs > 0 ? 0.35 : 0,
                        }}
                        aria-hidden="true"
                      />
                      <div className="relative z-10 h-full flex items-end justify-center pb-1">
                        <span className={hrs > 0 ? "text-[var(--ink)] font-medium" : "text-[var(--ink-4)]"}>
                          {hrs > 0 ? hrs.toFixed(1) : ""}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </FragmentRow>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
