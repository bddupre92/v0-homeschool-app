"use server"

import { sql } from "@vercel/postgres"

export interface ModulePreferences {
  module_advisor: boolean
  module_planner: boolean
  module_plan: boolean
  module_community: boolean
  module_resources: boolean
  module_family: boolean
  module_compliance: boolean
  module_hour_tracking: boolean
  module_groups: boolean
  module_field_trips: boolean
  module_boards: boolean
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

export async function getModulePreferences(userId: string): Promise<ModulePreferences> {
  try {
    const result = await sql`
      SELECT * FROM user_module_preferences WHERE user_id = ${userId}
    `
    if (result.rows[0]) {
      const row = result.rows[0]
      return {
        module_advisor: row.module_advisor,
        module_planner: row.module_planner,
        module_plan: row.module_plan,
        module_community: row.module_community,
        module_resources: row.module_resources,
        module_family: row.module_family,
        module_compliance: row.module_compliance,
        module_hour_tracking: row.module_hour_tracking,
        module_groups: row.module_groups,
        module_field_trips: row.module_field_trips,
        module_boards: row.module_boards,
      }
    }
    return DEFAULT_PREFERENCES
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export async function saveModulePreferences(userId: string, prefs: Partial<ModulePreferences>) {
  try {
    const result = await sql`
      INSERT INTO user_module_preferences (
        user_id,
        module_advisor,
        module_planner,
        module_plan,
        module_community,
        module_resources,
        module_family,
        module_compliance,
        module_hour_tracking,
        module_groups,
        module_field_trips,
        module_boards
      ) VALUES (
        ${userId},
        ${prefs.module_advisor ?? true},
        ${prefs.module_planner ?? true},
        ${prefs.module_plan ?? true},
        ${prefs.module_community ?? true},
        ${prefs.module_resources ?? true},
        ${prefs.module_family ?? true},
        ${prefs.module_compliance ?? true},
        ${prefs.module_hour_tracking ?? true},
        ${prefs.module_groups ?? true},
        ${prefs.module_field_trips ?? true},
        ${prefs.module_boards ?? true}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        module_advisor = EXCLUDED.module_advisor,
        module_planner = EXCLUDED.module_planner,
        module_plan = EXCLUDED.module_plan,
        module_community = EXCLUDED.module_community,
        module_resources = EXCLUDED.module_resources,
        module_family = EXCLUDED.module_family,
        module_compliance = EXCLUDED.module_compliance,
        module_hour_tracking = EXCLUDED.module_hour_tracking,
        module_groups = EXCLUDED.module_groups,
        module_field_trips = EXCLUDED.module_field_trips,
        module_boards = EXCLUDED.module_boards,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to save module preferences:", error)
    return { success: false, error: "Failed to save module preferences" }
  }
}
