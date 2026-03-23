-- Migration 05: Family profiles, child profiles, and compliance tracking
-- Adds family blueprint, child profiles, and hour/subject logging

-- Family blueprint (values, philosophy, trait pillars)
CREATE TABLE IF NOT EXISTS family_blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_name TEXT,
  values TEXT[] DEFAULT '{}',
  philosophy TEXT[] DEFAULT '{}',
  trait_pillars JSONB DEFAULT '[]'::jsonb,
  state_abbreviation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Child profiles
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  grade TEXT,
  learning_style TEXT,
  interests TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hour logging for compliance tracking
CREATE TABLE IF NOT EXISTS hour_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  lesson_packet_id UUID REFERENCES lesson_packets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance filings tracker
CREATE TABLE IF NOT EXISTS compliance_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state_abbreviation TEXT NOT NULL,
  filing_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  filed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_blueprints_user_id ON family_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_hour_logs_user_id ON hour_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hour_logs_child_id ON hour_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_hour_logs_date ON hour_logs(date);
CREATE INDEX IF NOT EXISTS idx_hour_logs_subject ON hour_logs(subject);
CREATE INDEX IF NOT EXISTS idx_compliance_filings_user_id ON compliance_filings(user_id);
