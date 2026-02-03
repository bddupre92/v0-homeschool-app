import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET all curricula for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT * FROM curricula 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch curricula:', error)
    return NextResponse.json(
      { error: 'Failed to fetch curricula' },
      { status: 500 }
    )
  }
}

// POST create a new curriculum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, gradeLevel, stateAbbreviation } = body

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO curricula (user_id, title, description, grade_level, state_abbreviation)
      VALUES (${userId}, ${title}, ${description || null}, ${gradeLevel || null}, ${stateAbbreviation || null})
      RETURNING *
    `

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    )
  }
}
