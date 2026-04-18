"use client"

/**
 * Floating tweaks panel — adjusts density, palette intensity, and theme.
 * Mirrors the "tweaks" in the handoff prototype.
 * Reads and writes data-attributes on <html>; persists to localStorage.
 */

import { useCallback, useEffect, useState } from "react"
import { Sliders, X } from "lucide-react"

type Density = "compact" | "comfortable" | "spacious"
type Palette = "soft" | "default" | "rich"
type Theme = "light" | "dim" | "dark"

const STORE_KEY = "atoz.tweaks"

interface Tweaks {
  density: Density
  palette: Palette
  theme: Theme
}

const DEFAULTS: Tweaks = { density: "comfortable", palette: "default", theme: "light" }

function readTweaks(): Tweaks {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...(JSON.parse(raw) as Tweaks) }
  } catch {
    return DEFAULTS
  }
}

function applyTweaks(tweaks: Tweaks): void {
  if (typeof document === "undefined") return
  const html = document.documentElement
  html.setAttribute("data-density", tweaks.density)
  if (tweaks.palette === "default") html.removeAttribute("data-palette")
  else html.setAttribute("data-palette", tweaks.palette)
  html.setAttribute("data-theme", tweaks.theme)
}

export function TweaksPanel() {
  const [open, setOpen] = useState(false)
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULTS)

  useEffect(() => {
    const t = readTweaks()
    setTweaks(t)
    applyTweaks(t)
  }, [])

  const update = useCallback((patch: Partial<Tweaks>) => {
    setTweaks((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next))
      } catch {}
      applyTweaks(next)
      return next
    })
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close tweaks" : "Open tweaks"}
        aria-expanded={open}
        className="atoz-tweaks-fab"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={18} /> : <Sliders size={18} />}
      </button>
      {open && (
        <aside className="atoz-tweaks-panel" role="region" aria-label="Design tweaks">
          <Row label="Density">
            <Seg
              value={tweaks.density}
              options={[
                { v: "compact", label: "Compact" },
                { v: "comfortable", label: "Comfortable" },
                { v: "spacious", label: "Spacious" },
              ]}
              onChange={(v) => update({ density: v as Density })}
            />
          </Row>
          <Row label="Palette">
            <Seg
              value={tweaks.palette}
              options={[
                { v: "soft", label: "Soft" },
                { v: "default", label: "Default" },
                { v: "rich", label: "Rich" },
              ]}
              onChange={(v) => update({ palette: v as Palette })}
            />
          </Row>
          <Row label="Theme">
            <Seg
              value={tweaks.theme}
              options={[
                { v: "light", label: "Light" },
                { v: "dim", label: "Dim" },
                { v: "dark", label: "Dark" },
              ]}
              onChange={(v) => update({ theme: v as Theme })}
            />
          </Row>
        </aside>
      )}
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="atoz-tweak-row">
      <span className="atoz-tweak-row__label">{label}</span>
      {children}
    </div>
  )
}

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { v: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="atoz-seg" role="radiogroup" aria-label="Options">
      {options.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={value === o.v}
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
