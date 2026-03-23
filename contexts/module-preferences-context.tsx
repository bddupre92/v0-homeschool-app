"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import {
  getModulePreferences,
  saveModulePreferences,
  type ModulePreferences,
} from "@/app/actions/module-preferences-actions"

interface ModulePreferencesContextType {
  preferences: ModulePreferences
  loading: boolean
  isModuleEnabled: (moduleKey: keyof ModulePreferences) => boolean
  toggleModule: (moduleKey: keyof ModulePreferences) => Promise<void>
  updatePreferences: (prefs: Partial<ModulePreferences>) => Promise<void>
}

const DEFAULT_PREFERENCES: ModulePreferences = {
  module_advisor: true,
  module_planner: true,
  module_plan: true,
  module_community: true,
  module_resources: true,
  module_family: true,
  module_compliance: true,
  module_hour_tracking: true,
  module_groups: true,
  module_field_trips: true,
  module_boards: true,
}

const ModulePreferencesContext = createContext<ModulePreferencesContextType>({
  preferences: DEFAULT_PREFERENCES,
  loading: true,
  isModuleEnabled: () => true,
  toggleModule: async () => {},
  updatePreferences: async () => {},
})

export function ModulePreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<ModulePreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      getModulePreferences(user.uid)
        .then(setPreferences)
        .catch(() => setPreferences(DEFAULT_PREFERENCES))
        .finally(() => setLoading(false))
    } else {
      setPreferences(DEFAULT_PREFERENCES)
      setLoading(false)
    }
  }, [user?.uid])

  const isModuleEnabled = useCallback(
    (moduleKey: keyof ModulePreferences) => preferences[moduleKey],
    [preferences]
  )

  const toggleModule = useCallback(
    async (moduleKey: keyof ModulePreferences) => {
      const newPrefs = { ...preferences, [moduleKey]: !preferences[moduleKey] }
      setPreferences(newPrefs)
      if (user?.uid) {
        await saveModulePreferences(user.uid, newPrefs)
      }
    },
    [preferences, user?.uid]
  )

  const updatePreferences = useCallback(
    async (prefs: Partial<ModulePreferences>) => {
      const newPrefs = { ...preferences, ...prefs }
      setPreferences(newPrefs)
      if (user?.uid) {
        await saveModulePreferences(user.uid, newPrefs)
      }
    },
    [preferences, user?.uid]
  )

  return (
    <ModulePreferencesContext.Provider
      value={{ preferences, loading, isModuleEnabled, toggleModule, updatePreferences }}
    >
      {children}
    </ModulePreferencesContext.Provider>
  )
}

export function useModulePreferences() {
  return useContext(ModulePreferencesContext)
}
