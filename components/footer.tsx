"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted py-10 mt-auto border-t">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg">AtoZ Family</h3>
            <p className="text-sm text-muted-foreground mt-1">A calm home for homeschool.</p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <button
              className="hover:text-foreground"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-cookie-preferences"))
              }}
            >
              Cookie preferences
            </button>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AtoZ Family. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
