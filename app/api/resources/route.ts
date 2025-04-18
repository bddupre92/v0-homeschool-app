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
    
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { userId: user.id },
          { visibility: 'PUBLIC' }
        ]
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching resources' },
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
    const { title, description, type, url, filePath, tags, visibility } = body;
    
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type: type || 'DOCUMENT',
        url,
        filePath,
        tags,
        visibility: visibility || 'PRIVATE',
        userId: user.id,
      },
    });
    
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the resource' },
      { status: 500 }
    );
  }
}
