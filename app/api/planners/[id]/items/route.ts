import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const plannerId = params.id;
    
    // Verify planner exists
    const planner = await prisma.planner.findUnique({
      where: {
        id: plannerId,
      },
    });
    
    if (!planner) {
      return NextResponse.json(
        { message: 'Planner not found' },
        { status: 404 }
      );
    }
    
    const items = await prisma.plannerItem.findMany({
      where: {
        plannerId,
      },
      include: {
        lesson: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching planner items:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching planner items' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const plannerId = params.id;
    const body = await request.json();
    const { title, description, date, startTime, endTime, status, lessonId } = body;
    
    // Verify planner exists
    const planner = await prisma.planner.findUnique({
      where: {
        id: plannerId,
      },
    });
    
    if (!planner) {
      return NextResponse.json(
        { message: 'Planner not found' },
        { status: 404 }
      );
    }
    
    if (!title || !date) {
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      );
    }
    
    const item = await prisma.plannerItem.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        status: status || 'PLANNED',
        plannerId,
        lessonId,
        userId: user.id,
      },
      include: {
        lesson: true,
      },
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating planner item:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the planner item' },
      { status: 500 }
    );
  }
}
