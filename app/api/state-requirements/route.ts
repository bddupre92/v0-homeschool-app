import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

// GET all state requirements or a specific state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateAbbr = searchParams.get('state')

    if (stateAbbr) {
      // Get specific state requirements
      const doc = await collection("stateRequirements").doc(stateAbbr).get()

      if (!doc.exists) {
        return NextResponse.json(
          { error: 'State requirements not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(docToData(doc))
    } else {
      // Get all states
      const snapshot = await collection("stateRequirements")
        .orderBy("stateName", "asc")
        .get()
      return NextResponse.json(snapshot.docs.map(docToData))
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

    const docRef = collection("stateRequirements").doc(stateAbbreviation)
    const existing = await docRef.get()
    const timestamp = nowIso()
    const payload = {
      stateAbbreviation,
      stateName,
      subjectsRequired: subjectsRequired || [],
      hoursPerYear: hoursPerYear ?? null,
      attendanceRules: attendanceRules || "",
      assessmentRequirements: assessmentRequirements || "",
      recordKeepingRequirements: recordKeepingRequirements || "",
      specialNeedsProvisions: specialNeedsProvisions || "",
      earlyChildhoodRules: earlyChildhoodRules || "",
      highSchoolRules: highSchoolRules || "",
      additionalInfo: additionalInfo || {},
      updatedAt: timestamp,
      ...(existing.exists ? {} : { createdAt: timestamp }),
    }

    await docRef.set(payload, { merge: true })
    const saved = await docRef.get()

    return NextResponse.json(docToData(saved), { status: existing.exists ? 200 : 201 })
  } catch (error) {
    console.error('Failed to create/update state requirements:', error)
    return NextResponse.json(
      { error: 'Failed to create/update state requirements' },
      { status: 500 }
    )
  }
}
