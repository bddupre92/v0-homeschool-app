"use client"

/**
 * Trait picker — curated observations a parent can tap to describe
 * the learner's mode during the lesson. Deliberately NOT scored:
 * no numeric ratings, no rollup, no "progress." Just a tag cloud
 * on the kid portfolio that helps a parent notice patterns over time.
 */

export const TRAIT_OPTIONS = [
  "Curious",
  "Focused",
  "Persistent",
  "Collaborative",
  "Playful",
  "Quiet",
  "Making connections",
  "Asking great questions",
  "Reading deeply",
  "Writing freely",
  "Needing company",
  "Needing space",
  "Tired",
  "Joyful",
] as const

export type Trait = (typeof TRAIT_OPTIONS)[number]

export default function TraitPicker({
  value,
  onChange,
  dark = false,
}: {
  value: string[]
  onChange: (next: string[]) => void
  dark?: boolean
}) {
  const toggle = (trait: string) => {
    const has = value.includes(trait)
    onChange(has ? value.filter((t) => t !== trait) : [...value, trait])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TRAIT_OPTIONS.map((trait) => {
        const active = value.includes(trait)
        return (
          <button
            key={trait}
            type="button"
            onClick={() => toggle(trait)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              active
                ? dark
                  ? "bg-white/15 border-white/30 text-white"
                  : "bg-[var(--sage-ll)] border-[var(--sage-d)] text-[var(--sage-d)]"
                : dark
                  ? "border-white/15 text-white/60 hover:border-white/30 hover:text-white/80"
                  : "border-[var(--rule)] text-[var(--ink-3)] hover:border-[var(--sage-d)] hover:text-[var(--ink)]"
            }`}
          >
            {trait}
          </button>
        )
      })}
    </div>
  )
}
