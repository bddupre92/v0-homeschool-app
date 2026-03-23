"use client"

import { useModulePreferences } from "@/contexts/module-preferences-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, Calendar, Target, MessageSquare, Book, Heart, Shield, Clock, Users, Map, LayoutGrid } from "lucide-react"
import type { ModulePreferences } from "@/app/actions/module-preferences-actions"

interface ModuleConfig {
  key: keyof ModulePreferences
  label: string
  description: string
  icon: any
  category: "core" | "tracking" | "social"
}

const MODULES: ModuleConfig[] = [
  {
    key: "module_advisor",
    label: "AI Curriculum Advisor",
    description: "Conversational AI for curriculum planning, lesson recommendations, and progress tracking.",
    icon: Sparkles,
    category: "core",
  },
  {
    key: "module_planner",
    label: "Lesson Planner",
    description: "AI-powered lesson packet generator with print-ready output.",
    icon: Calendar,
    category: "core",
  },
  {
    key: "module_plan",
    label: "Plan & Overview",
    description: "Dashboard with hours tracking, compliance status, and children overview.",
    icon: Target,
    category: "core",
  },
  {
    key: "module_resources",
    label: "Resources",
    description: "Browse and save homeschool resources, curricula, and materials.",
    icon: Book,
    category: "core",
  },
  {
    key: "module_family",
    label: "Family Profiles",
    description: "Manage family blueprint, children profiles, values, and philosophy.",
    icon: Heart,
    category: "core",
  },
  {
    key: "module_compliance",
    label: "Compliance Tracking",
    description: "Track state-specific filings, deadlines, and requirements.",
    icon: Shield,
    category: "tracking",
  },
  {
    key: "module_hour_tracking",
    label: "Hour Logging",
    description: "Log and track instructional hours by subject for compliance.",
    icon: Clock,
    category: "tracking",
  },
  {
    key: "module_community",
    label: "Community",
    description: "Connect with other homeschool families, co-ops, and groups.",
    icon: MessageSquare,
    category: "social",
  },
  {
    key: "module_groups",
    label: "Co-op Groups",
    description: "Discover and join homeschool co-ops, share resources, and coordinate.",
    icon: Users,
    category: "social",
  },
  {
    key: "module_field_trips",
    label: "Field Trips",
    description: "Organize and discover group field trips and outings.",
    icon: Map,
    category: "social",
  },
  {
    key: "module_boards",
    label: "Boards",
    description: "Organize saved resources into boards for easy access.",
    icon: LayoutGrid,
    category: "social",
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  core: "Core Features",
  tracking: "Tracking & Compliance",
  social: "Community & Social",
}

export default function ModulePreferencesSettings() {
  const { preferences, toggleModule, loading } = useModulePreferences()

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const categories = ["core", "tracking", "social"] as const

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Customize Your Platform</h2>
        <p className="text-sm text-muted-foreground">
          Toggle which sections of the platform you want to see. Disabled modules are hidden from navigation but your data is preserved.
        </p>
      </div>

      {categories.map((category) => {
        const modules = MODULES.filter((m) => m.category === category)
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{CATEGORY_LABELS[category]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((mod) => {
                const Icon = mod.icon
                return (
                  <div key={mod.key} className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <Label htmlFor={mod.key} className="text-sm font-medium cursor-pointer">
                          {mod.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={mod.key}
                      checked={preferences[mod.key]}
                      onCheckedChange={() => toggleModule(mod.key)}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
