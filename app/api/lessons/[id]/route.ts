import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET a specific lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT * FROM lessons WHERE id = ${params.id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to fetch lesson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}

// PUT update a lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, subject, weekNumber, dayOfWeek, durationMinutes, resources } = body

    const result = await sql`
      UPDATE lessons
      SET 
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description || null}, description),
        subject = COALESCE(${subject || null}, subject),
        week_number = COALESCE(${weekNumber || null}, week_number),
        day_of_week = COALESCE(${dayOfWeek || null}, day_of_week),
        duration_minutes = COALESCE(${durationMinutes || null}, duration_minutes),
        resources = COALESCE(${JSON.stringify(resources) || null}, resources),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update lesson:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

// DELETE a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      DELETE FROM lessons WHERE id = ${params.id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete lesson:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
