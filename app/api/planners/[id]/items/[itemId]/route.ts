import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id, itemId } = params;
    
    const item = await prisma.plannerItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        lesson: true,
      },
    });
    
    if (!item || item.plannerId !== id) {
      return NextResponse.json(
        { message: 'Planner item not found' },
        { status: 404 }
      );
    }
    
    if (item.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching planner item:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the planner item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id, itemId } = params;
    const body = await request.json();
    const { title, description, date, startTime, endTime, status, lessonId } = body;
    
    const item = await prisma.plannerItem.findUnique({
      where: {
        id: itemId,
      },
    });
    
    if (!item || item.plannerId !== id) {
      return NextResponse.json(
        { message: 'Planner item not found' },
        { status: 404 }
      );
    }
    
    if (item.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const updatedItem = await prisma.plannerItem.update({
      where: {
        id: itemId,
      },
      data: {
        title: title !== undefined ? title : item.title,
        description: description !== undefined ? description : item.description,
        date: date ? new Date(date) : item.date,
        startTime: startTime ? new Date(startTime) : item.startTime,
        endTime: endTime ? new Date(endTime) : item.endTime,
        status: status || item.status,
        lessonId: lessonId !== undefined ? lessonId : item.lessonId,
      },
      include: {
        lesson: true,
      },
    });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating planner item:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the planner item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id, itemId } = params;
    
    const item = await prisma.plannerItem.findUnique({
      where: {
        id: itemId,
      },
    });
    
    if (!item || item.plannerId !== id) {
      return NextResponse.json(
        { message: 'Planner item not found' },
        { status: 404 }
      );
    }
    
    if (item.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await prisma.plannerItem.delete({
      where: {
        id: itemId,
      },
    });
    
    return NextResponse.json(
      { message: 'Planner item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting planner item:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the planner item' },
      { status: 500 }
    );
  }
}
