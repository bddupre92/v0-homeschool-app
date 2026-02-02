import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET all members of a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT gm.*, u.display_name, u.email, u.photo_url
      FROM group_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ${params.id}
      ORDER BY gm.role DESC, gm.joined_at ASC
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch group members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    )
  }
}

// POST add a member to a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, role } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existing = await sql`
      SELECT * FROM group_members WHERE group_id = ${params.id} AND user_id = ${userId}
    `

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      )
    }

    // Check if group has reached max members
    const group = await sql`SELECT max_members FROM groups WHERE id = ${params.id}`

    if (group.rows.length > 0 && group.rows[0].max_members) {
      const members = await sql`SELECT COUNT(*) as count FROM group_members WHERE group_id = ${params.id}`
      if (members.rows[0].count >= group.rows[0].max_members) {
        return NextResponse.json(
          { error: 'Group has reached maximum members' },
          { status: 400 }
        )
      }
    }

    const result = await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${params.id}, ${userId}, ${role || 'member'})
      RETURNING *
    `

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to add group member:', error)
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    )
  }
}
