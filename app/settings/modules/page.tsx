"use client"

import Navigation from "@/components/navigation"
import ModulePreferencesSettings from "@/components/module-preferences-settings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ModulesSettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
      <Navigation />
      <main className="flex-1 container py-8 px-4 md:px-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Settings
            </Link>
          </Button>
        </div>
        <ModulePreferencesSettings />
      </main>
    </div>
  )
}
