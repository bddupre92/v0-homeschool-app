import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

// GET all public groups or groups by state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateAbbr = searchParams.get('state')
    const userGroups = searchParams.get('userGroups')
    const userId = searchParams.get('userId')

    let query: any

    if (userGroups === 'true' && userId) {
      // Get groups the user is a member of
      query = await sql`
        SELECT DISTINCT g.* FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ${userId}
        ORDER BY g.created_at DESC
      `
    } else if (stateAbbr) {
      // Get public groups filtered by state
      query = await sql`
        SELECT * FROM groups 
        WHERE is_private = false AND state_abbreviation = ${stateAbbr}
        ORDER BY created_at DESC
      `
    } else {
      // Get all public groups
      query = await sql`
        SELECT * FROM groups 
        WHERE is_private = false
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(query.rows)
  } catch (error) {
    console.error('Failed to fetch groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

// POST create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      createdById,
      name,
      description,
      location,
      groupType,
      stateAbbreviation,
      maxMembers,
      isPrivate,
      imageUrl,
    } = body

    if (!createdById || !name) {
      return NextResponse.json(
        { error: 'createdById and name are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO groups (created_by_id, name, description, location, group_type, state_abbreviation, max_members, is_private, image_url)
      VALUES (${createdById}, ${name}, ${description || null}, ${location || null}, ${groupType || 'coop'}, ${stateAbbreviation || null}, ${maxMembers || null}, ${isPrivate || false}, ${imageUrl || null})
      RETURNING *
    `

    // Add the creator as a member with admin role
    if (result.rows.length > 0) {
      const groupId = result.rows[0].id
      await sql`
        INSERT INTO group_members (group_id, user_id, role)
        VALUES (${groupId}, ${createdById}, 'admin')
      `
    }

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
