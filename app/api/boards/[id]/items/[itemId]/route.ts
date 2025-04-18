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
    
    // Verify board exists and user has access
    const board = await prisma.board.findUnique({
      where: {
        id,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    if (board.userId !== user.id && board.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const item = await prisma.boardItem.findUnique({
      where: {
        id: itemId,
      },
    });
    
    if (!item || item.boardId !== id) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching board item:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the board item' },
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
    const { title, content, type, position, status } = body;
    
    // Verify board exists and user has access
    const board = await prisma.board.findUnique({
      where: {
        id,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    if (board.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const item = await prisma.boardItem.findUnique({
      where: {
        id: itemId,
      },
    });
    
    if (!item || item.boardId !== id) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    const updatedItem = await prisma.boardItem.update({
      where: {
        id: itemId,
      },
      data: {
        title: title !== undefined ? title : item.title,
        content: content !== undefined ? content : item.content,
        type: type !== undefined ? type : item.type,
        position: position !== undefined ? position : item.position,
        status: status !== undefined ? status : item.status,
      },
    });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating board item:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the board item' },
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
    
    // Verify board exists and user has access
    const board = await prisma.board.findUnique({
      where: {
        id,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    if (board.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const item = await prisma.boardItem.findUnique({
      where: {
        id: itemId,
      },
    });
    
    if (!item || item.boardId !== id) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    await prisma.boardItem.delete({
      where: {
        id: itemId,
      },
    });
    
    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting board item:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the board item' },
      { status: 500 }
    );
  }
}
