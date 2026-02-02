import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT * FROM groups WHERE id = ${params.id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to fetch group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

// PUT update a group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, location, groupType, stateAbbreviation, maxMembers, isPrivate, imageUrl } = body

    const result = await sql`
      UPDATE groups
      SET 
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description || null}, description),
        location = COALESCE(${location || null}, location),
        group_type = COALESCE(${groupType || null}, group_type),
        state_abbreviation = COALESCE(${stateAbbreviation || null}, state_abbreviation),
        max_members = COALESCE(${maxMembers || null}, max_members),
        is_private = COALESCE(${isPrivate !== undefined ? isPrivate : null}, is_private),
        image_url = COALESCE(${imageUrl || null}, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update group:', error)
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

// DELETE a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      DELETE FROM groups WHERE id = ${params.id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}
