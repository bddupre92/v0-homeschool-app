import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function POST() {
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

    // Groups
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

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
  // Quick health check - just verify connection works
  try {
    const result = await sql`SELECT 1 as ok`

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
