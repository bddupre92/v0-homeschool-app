import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const planners = await prisma.planner.findMany({
      include: {
        items: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
    
    return NextResponse.json(planners);
  } catch (error) {
    console.error('Error fetching planners:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching planners' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, description, startDate, endDate } = body;
    
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Start date and end date are required' },
        { status: 400 }
      );
    }
    
    const planner = await prisma.planner.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    
    return NextResponse.json(planner, { status: 201 });
  } catch (error) {
    console.error('Error creating planner:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the planner' },
      { status: 500 }
    );
  }
}
