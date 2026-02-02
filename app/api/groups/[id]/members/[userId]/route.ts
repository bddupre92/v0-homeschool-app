import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// DELETE remove a member from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const result = await sql`
      DELETE FROM group_members 
      WHERE group_id = ${params.id} AND user_id = ${params.userId}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove group member:', error)
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    )
  }
}

// PUT update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'role is required' },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE group_members
      SET role = ${role}
      WHERE group_id = ${params.id} AND user_id = ${params.userId}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update member role:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}
