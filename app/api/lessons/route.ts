import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET all lessons for a curriculum
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const curriculumId = searchParams.get('curriculumId')

    if (!curriculumId) {
      return NextResponse.json(
        { error: 'curriculumId is required' },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT * FROM lessons 
      WHERE curriculum_id = ${curriculumId}
      ORDER BY week_number, day_of_week
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

// POST create a new lesson
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { curriculumId, title, description, subject, weekNumber, dayOfWeek, durationMinutes, resources } = body

    if (!curriculumId || !title) {
      return NextResponse.json(
        { error: 'curriculumId and title are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO lessons (curriculum_id, title, description, subject, week_number, day_of_week, duration_minutes, resources)
      VALUES (${curriculumId}, ${title}, ${description || null}, ${subject || null}, ${weekNumber || null}, ${dayOfWeek || null}, ${durationMinutes || null}, ${JSON.stringify(resources || [])})
      RETURNING *
    `

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
