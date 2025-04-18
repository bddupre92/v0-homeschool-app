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
    
    const lessonId = params.id;
    
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        resources: true,
      },
    });
    
    if (!lesson) {
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the lesson' },
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
    
    const lessonId = params.id;
    const body = await request.json();
    const { title, description, subject, gradeLevel, duration, content, resourceIds } = body;
    
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        resources: true,
      },
    });
    
    if (!lesson) {
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: title !== undefined ? title : lesson.title,
        description: description !== undefined ? description : lesson.description,
        subject: subject !== undefined ? subject : lesson.subject,
        gradeLevel: gradeLevel !== undefined ? gradeLevel : lesson.gradeLevel,
        duration: duration !== undefined ? duration : lesson.duration,
        content: content !== undefined ? content : lesson.content,
        resources: resourceIds ? {
          set: resourceIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        resources: true,
      },
    });
    
    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the lesson' },
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
    
    const lessonId = params.id;
    
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    });
    
    if (!lesson) {
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });
    
    return NextResponse.json(
      { message: 'Lesson deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the lesson' },
      { status: 500 }
    );
  }
}
