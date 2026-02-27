-- Migration: Add lesson_packets table
-- Part of Phase 2: Database Persistence & Packet Library

CREATE TABLE IF NOT EXISTS lesson_packets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,                          -- Firebase UID (matches auth-middleware userId)
  title VARCHAR(500) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  child_name VARCHAR(200) NOT NULL,
  topic VARCHAR(500) NOT NULL,
  learning_style VARCHAR(50),
  interests TEXT,
  location VARCHAR(300),
  packet_data JSONB NOT NULL,                     -- Full 7-section packet (studentLesson, worksheet, etc.)
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  times_printed INTEGER DEFAULT 0,
  is_shared BOOLEAN DEFAULT false,
  shared_to_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_lesson_packets_user_id ON lesson_packets(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_packets_subject ON lesson_packets(subject);
CREATE INDEX IF NOT EXISTS idx_lesson_packets_grade ON lesson_packets(grade);
CREATE INDEX IF NOT EXISTS idx_lesson_packets_child_name ON lesson_packets(child_name);
CREATE INDEX IF NOT EXISTS idx_lesson_packets_created_at ON lesson_packets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_packets_is_favorite ON lesson_packets(user_id, is_favorite) WHERE is_favorite = true;
