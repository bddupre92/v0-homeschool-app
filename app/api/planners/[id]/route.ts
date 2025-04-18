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
    
    const planner = await prisma.planner.findUnique({
      where: {
        id: plannerId,
      },
      include: {
        items: {
          orderBy: {
            date: 'asc',
          },
          include: {
            lesson: true,
          },
        },
      },
    });
    
    if (!planner) {
      return NextResponse.json(
        { message: 'Planner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(planner);
  } catch (error) {
    console.error('Error fetching planner:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the planner' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title, description, startDate, endDate } = body;
    
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
    
    const updatedPlanner = await prisma.planner.update({
      where: {
        id: plannerId,
      },
      data: {
        title: title !== undefined ? title : planner.title,
        description: description !== undefined ? description : planner.description,
        startDate: startDate ? new Date(startDate) : planner.startDate,
        endDate: endDate ? new Date(endDate) : planner.endDate,
      },
    });
    
    return NextResponse.json(updatedPlanner);
  } catch (error) {
    console.error('Error updating planner:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the planner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Delete all planner items first
    await prisma.plannerItem.deleteMany({
      where: {
        plannerId,
      },
    });
    
    // Then delete the planner
    await prisma.planner.delete({
      where: {
        id: plannerId,
      },
    });
    
    return NextResponse.json(
      { message: 'Planner deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting planner:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the planner' },
      { status: 500 }
    );
  }
}
