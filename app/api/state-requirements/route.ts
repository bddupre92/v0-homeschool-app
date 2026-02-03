import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET all state requirements or a specific state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateAbbr = searchParams.get('state')

    if (stateAbbr) {
      // Get specific state requirements
      const result = await sql`
        SELECT * FROM state_requirements WHERE state_abbreviation = ${stateAbbr}
      `

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'State requirements not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(result.rows[0])
    } else {
      // Get all states
      const result = await sql`
        SELECT id, state_abbreviation, state_name FROM state_requirements ORDER BY state_name
      `
      return NextResponse.json(result.rows)
    }
  } catch (error) {
    console.error('Failed to fetch state requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch state requirements' },
      { status: 500 }
    )
  }
}

// POST create or update state requirements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      stateAbbreviation,
      stateName,
      subjectsRequired,
      hoursPerYear,
      attendanceRules,
      assessmentRequirements,
      recordKeepingRequirements,
      specialNeedsProvisions,
      earlyChildhoodRules,
      highSchoolRules,
      additionalInfo,
    } = body

    if (!stateAbbreviation || !stateName) {
      return NextResponse.json(
        { error: 'stateAbbreviation and stateName are required' },
        { status: 400 }
      )
    }

    // Check if state already exists
    const existing = await sql`
      SELECT * FROM state_requirements WHERE state_abbreviation = ${stateAbbreviation}
    `

    if (existing.rows.length > 0) {
      // Update existing
      const result = await sql`
        UPDATE state_requirements
        SET 
          state_name = ${stateName},
          subjects_required = ${JSON.stringify(subjectsRequired || [])},
          hours_per_year = ${hoursPerYear || null},
          attendance_rules = ${attendanceRules || null},
          assessment_requirements = ${assessmentRequirements || null},
          record_keeping_requirements = ${recordKeepingRequirements || null},
          special_needs_provisions = ${specialNeedsProvisions || null},
          early_childhood_rules = ${earlyChildhoodRules || null},
          high_school_rules = ${highSchoolRules || null},
          additional_info = ${JSON.stringify(additionalInfo || {})},
          updated_at = CURRENT_TIMESTAMP
        WHERE state_abbreviation = ${stateAbbreviation}
        RETURNING *
      `
      return NextResponse.json(result.rows[0])
    } else {
      // Create new
      const result = await sql`
        INSERT INTO state_requirements (state_abbreviation, state_name, subjects_required, hours_per_year, attendance_rules, assessment_requirements, record_keeping_requirements, special_needs_provisions, early_childhood_rules, high_school_rules, additional_info)
        VALUES (${stateAbbreviation}, ${stateName}, ${JSON.stringify(subjectsRequired || [])}, ${hoursPerYear || null}, ${attendanceRules || null}, ${assessmentRequirements || null}, ${recordKeepingRequirements || null}, ${specialNeedsProvisions || null}, ${earlyChildhoodRules || null}, ${highSchoolRules || null}, ${JSON.stringify(additionalInfo || {})})
        RETURNING *
      `
      return NextResponse.json(result.rows[0], { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create/update state requirements:', error)
    return NextResponse.json(
      { error: 'Failed to create/update state requirements' },
      { status: 500 }
    )
  }
}
