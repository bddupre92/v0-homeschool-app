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
    
    const lessons = await prisma.lesson.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        resources: true,
      },
    });
    
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching lessons' },
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
    const { title, description, subject, gradeLevel, duration, content, resourceIds } = body;
    
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        subject,
        gradeLevel,
        duration,
        content,
        resources: {
          connect: resourceIds ? resourceIds.map((id: string) => ({ id })) : [],
        },
      },
    });
    
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the lesson' },
      { status: 500 }
    );
  }
}
