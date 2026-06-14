import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function POST() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json(
      { skipped: true, reason: "POSTGRES_URL not configured" },
      { status: 200 },
    )
  }

  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // Users table (from 01-init-schema.sql)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        role TEXT DEFAULT 'user',
        state_abbreviation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Curricula
    await sql`
      CREATE TABLE IF NOT EXISTS curricula (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        grade_level TEXT,
        state_abbreviation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Lessons
    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        week_number INTEGER,
        day_of_week TEXT,
        duration_minutes INTEGER,
        resources JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Groups (with Phase 7 discovery columns inlined — was migration 04)
    await sql`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        group_type TEXT,
        state_abbreviation TEXT,
        max_members INTEGER,
        is_private BOOLEAN DEFAULT false,
        image_url TEXT,
        -- Phase 7 discovery fields
        philosophy VARCHAR(100),
        age_groups TEXT[] DEFAULT '{}',
        subjects_offered TEXT[] DEFAULT '{}',
        schedule JSONB,
        meeting_frequency VARCHAR(50),
        meeting_schedule TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        city VARCHAR(200),
        zip_code VARCHAR(10),
        is_accepting_members BOOLEAN DEFAULT true,
        member_count INTEGER DEFAULT 0,
        external_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Backfill discovery columns on pre-existing groups tables (idempotent).
    await sql`
      ALTER TABLE groups
        ADD COLUMN IF NOT EXISTS philosophy VARCHAR(100),
        ADD COLUMN IF NOT EXISTS age_groups TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS subjects_offered TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS schedule JSONB,
        ADD COLUMN IF NOT EXISTS meeting_frequency VARCHAR(50),
        ADD COLUMN IF NOT EXISTS meeting_schedule TEXT,
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS city VARCHAR(200),
        ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
        ADD COLUMN IF NOT EXISTS is_accepting_members BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS external_url TEXT
    `

    // Indexes for community discovery + coordination.
    await sql`CREATE INDEX IF NOT EXISTS idx_groups_location ON groups(latitude, longitude)`
    await sql`CREATE INDEX IF NOT EXISTS idx_groups_zip_code ON groups(zip_code)`
    await sql`CREATE INDEX IF NOT EXISTS idx_groups_philosophy ON groups(philosophy)`

    // Group members
    await sql`
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_id)
      )
    `

    // State requirements
    await sql`
      CREATE TABLE IF NOT EXISTS state_requirements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        state_abbreviation TEXT NOT NULL UNIQUE,
        state_name TEXT NOT NULL,
        subjects_required TEXT[] DEFAULT '{}',
        hours_per_year INTEGER,
        attendance_rules TEXT,
        assessment_requirements TEXT,
        record_keeping_requirements TEXT,
        special_needs_provisions TEXT,
        early_childhood_rules TEXT,
        high_school_rules TEXT,
        additional_info JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Lesson packets (from 03-add-lesson-packets.sql)
    await sql`
      CREATE TABLE IF NOT EXISTS lesson_packets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_name TEXT,
        topic TEXT NOT NULL,
        grade_level TEXT,
        subject TEXT,
        packet_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_favorite BOOLEAN DEFAULT false,
        times_printed INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Family blueprints (from 05-family-profiles-and-compliance.sql)
    await sql`
      CREATE TABLE IF NOT EXISTS family_blueprints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        family_name TEXT,
        "values" TEXT[] DEFAULT '{}',
        philosophy TEXT[] DEFAULT '{}',
        trait_pillars JSONB DEFAULT '[]'::jsonb,
        state_abbreviation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    // Children
    await sql`
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
      )
    `

    // Hour logs
    await sql`
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
      )
    `

    // Compliance filings
    await sql`
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
      )
    `

    // Filing documents (from 09-filing-documents.sql)
    await sql`
      CREATE TABLE IF NOT EXISTS filing_documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        filing_id UUID NOT NULL REFERENCES compliance_filings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER,
        file_url TEXT NOT NULL,
        upload_type TEXT DEFAULT 'document',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Portfolio entries (from 10-portfolio-entries.sql)
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_id UUID REFERENCES children(id) ON DELETE CASCADE,
        entry_type TEXT NOT NULL DEFAULT 'work_sample',
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        date DATE DEFAULT CURRENT_DATE,
        file_url TEXT,
        file_type TEXT,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // User module preferences (from 08-user-module-preferences.sql)
    await sql`
      CREATE TABLE IF NOT EXISTS user_module_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_advisor BOOLEAN DEFAULT true,
        module_plan BOOLEAN DEFAULT true,
        module_planner BOOLEAN DEFAULT true,
        module_community BOOLEAN DEFAULT true,
        module_resources BOOLEAN DEFAULT true,
        module_family BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    // Create key indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)`
    await sql`CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_hour_logs_user_id ON hour_logs(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_hour_logs_child_id ON hour_logs(child_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_compliance_filings_user_id ON compliance_filings(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_filing_documents_filing_id ON filing_documents(filing_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_entries_user_id ON portfolio_entries(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_entries_child_id ON portfolio_entries(child_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_family_blueprints_user_id ON family_blueprints(user_id)`

    // ─── Phase 7 Community coordination tables ─────────────────────────────

    // Group shared packets — link from lesson_packets to a group's library.
    await sql`
      CREATE TABLE IF NOT EXISTS group_shared_packets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        packet_id UUID NOT NULL REFERENCES lesson_packets(id) ON DELETE CASCADE,
        shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notes TEXT,
        shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, packet_id)
      )
    `

    // Group announcements — pinned/unpinned posts per group.
    await sql`
      CREATE TABLE IF NOT EXISTS group_announcements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Teaching rotation — who teaches which subject on which day.
    await sql`
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
      )
    `

    // Group field trips + RSVPs.
    await sql`
      CREATE TABLE IF NOT EXISTS group_field_trips (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        organizer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        trip_date TIMESTAMP WITH TIME ZONE NOT NULL,
        max_attendees INTEGER,
        cost_per_family NUMERIC(10, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS group_field_trip_rsvps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        field_trip_id UUID NOT NULL REFERENCES group_field_trips(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        num_children INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'going',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(field_trip_id, user_id)
      )
    `

    // User discovery preferences — what families want in a co-op match.
    await sql`
      CREATE TABLE IF NOT EXISTS user_group_preferences (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        zip_code VARCHAR(10),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        max_distance_miles INTEGER DEFAULT 25,
        preferred_philosophy VARCHAR(100),
        child_age_groups TEXT[] DEFAULT '{}',
        wanted_subjects TEXT[] DEFAULT '{}',
        preferred_day VARCHAR(20),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Indexes for coordination queries.
    await sql`CREATE INDEX IF NOT EXISTS idx_group_announcements_group_id ON group_announcements(group_id, is_pinned DESC, created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_teaching_rotations_group_id ON teaching_rotations(group_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_group_field_trips_group_id ON group_field_trips(group_id, trip_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_group_field_trip_rsvps_trip_id ON group_field_trip_rsvps(field_trip_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_group_shared_packets_group_id ON group_shared_packets(group_id, shared_at DESC)`

    return NextResponse.json({ success: true, message: "All tables created successfully" })
  } catch (error: any) {
    console.error("Database init error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize database" },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ connected: false, reason: "POSTGRES_URL not configured" }, { status: 200 })
  }

  // Quick health check - just verify connection works
  try {
    await sql`SELECT 1 as ok`

    // Check which tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    return NextResponse.json({
      connected: true,
      tables: tables.rows.map(r => r.table_name),
    })
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, error: error.message },
      { status: 500 }
    )
  }
}
