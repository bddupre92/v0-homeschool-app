-- Migration 08: User module preferences — modular platform visibility
-- Lets users choose which sections of the platform they see

CREATE TABLE IF NOT EXISTS user_module_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Core modules (all default to true)
  module_advisor BOOLEAN DEFAULT true,
  module_planner BOOLEAN DEFAULT true,
  module_plan BOOLEAN DEFAULT true,
  module_community BOOLEAN DEFAULT true,
  module_resources BOOLEAN DEFAULT true,
  module_family BOOLEAN DEFAULT true,
  -- Optional modules (default visibility varies)
  module_compliance BOOLEAN DEFAULT true,
  module_hour_tracking BOOLEAN DEFAULT true,
  module_groups BOOLEAN DEFAULT true,
  module_field_trips BOOLEAN DEFAULT true,
  module_boards BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_module_prefs_user ON user_module_preferences(user_id);
