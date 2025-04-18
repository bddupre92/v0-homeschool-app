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
    
    const resourceId = params.id;
    
    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });
    
    if (!resource) {
      return NextResponse.json(
        { message: 'Resource not found' },
        { status: 404 }
      );
    }
    
    if (resource.userId !== user.id && resource.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the resource' },
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
    
    const resourceId = params.id;
    const body = await request.json();
    const { title, description, type, url, filePath, tags, visibility } = body;
    
    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });
    
    if (!resource) {
      return NextResponse.json(
        { message: 'Resource not found' },
        { status: 404 }
      );
    }
    
    if (resource.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const updatedResource = await prisma.resource.update({
      where: {
        id: resourceId,
      },
      data: {
        title: title !== undefined ? title : resource.title,
        description: description !== undefined ? description : resource.description,
        type: type !== undefined ? type : resource.type,
        url: url !== undefined ? url : resource.url,
        filePath: filePath !== undefined ? filePath : resource.filePath,
        tags: tags !== undefined ? tags : resource.tags,
        visibility: visibility !== undefined ? visibility : resource.visibility,
      },
    });
    
    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the resource' },
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
    
    const resourceId = params.id;
    
    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });
    
    if (!resource) {
      return NextResponse.json(
        { message: 'Resource not found' },
        { status: 404 }
      );
    }
    
    if (resource.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await prisma.resource.delete({
      where: {
        id: resourceId,
      },
    });
    
    return NextResponse.json(
      { message: 'Resource deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the resource' },
      { status: 500 }
    );
  }
}
