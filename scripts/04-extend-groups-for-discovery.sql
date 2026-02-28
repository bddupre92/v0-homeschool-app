-- Phase 3: Extend groups for discovery & add coordination tables
-- This migration adds discovery fields to the groups table and creates
-- tables for shared packets, announcements, teaching rotations, and field trips.

-- Enable UUID extension (safe to call multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Extend groups table with discovery & coordination columns
-- ============================================================
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS philosophy VARCHAR(100),
  ADD COLUMN IF NOT EXISTS age_groups TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subjects_offered TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS schedule JSONB,
  ADD COLUMN IF NOT EXISTS meeting_frequency VARCHAR(50),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS city VARCHAR(200),
  ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS is_accepting_members BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meeting_schedule TEXT;

-- ============================================================
-- Group shared packets (links lesson_packets to groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS group_shared_packets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  packet_id UUID NOT NULL REFERENCES lesson_packets(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, packet_id)
);

-- ============================================================
-- Group announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS group_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Teaching rotations (who teaches what subject, when)
-- ============================================================
CREATE TABLE IF NOT EXISTS teaching_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Group field trips
-- ============================================================
CREATE TABLE IF NOT EXISTS group_field_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  trip_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER,
  cost_per_family DECIMAL(10,2),
  related_packet_id UUID REFERENCES lesson_packets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Field trip RSVPs
-- ============================================================
CREATE TABLE IF NOT EXISTS group_field_trip_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_trip_id UUID NOT NULL REFERENCES group_field_trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  num_children INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(field_trip_id, user_id)
);

-- ============================================================
-- Indexes for discovery & coordination queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_groups_philosophy ON groups(philosophy);
CREATE INDEX IF NOT EXISTS idx_groups_location ON groups(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_groups_accepting ON groups(is_accepting_members);
CREATE INDEX IF NOT EXISTS idx_groups_city ON groups(city);
CREATE INDEX IF NOT EXISTS idx_group_shared_packets_group ON group_shared_packets(group_id);
CREATE INDEX IF NOT EXISTS idx_group_shared_packets_packet ON group_shared_packets(packet_id);
CREATE INDEX IF NOT EXISTS idx_group_announcements_group ON group_announcements(group_id);
CREATE INDEX IF NOT EXISTS idx_teaching_rotations_group ON teaching_rotations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_field_trips_group ON group_field_trips(group_id);
CREATE INDEX IF NOT EXISTS idx_group_field_trips_date ON group_field_trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_group_field_trip_rsvps_trip ON group_field_trip_rsvps(field_trip_id);
