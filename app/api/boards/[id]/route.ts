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
    
    const boardId = params.id;
    
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        items: {
          orderBy: {
            position: 'asc',
          },
        },
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
    
    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the board' },
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
    
    const boardId = params.id;
    const body = await request.json();
    const { title, description, visibility, status } = body;
    
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
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
    
    const updatedBoard = await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        title: title !== undefined ? title : board.title,
        description: description !== undefined ? description : board.description,
        visibility: visibility !== undefined ? visibility : board.visibility,
        status: status !== undefined ? status : board.status,
      },
    });
    
    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the board' },
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
    
    const boardId = params.id;
    
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
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
    
    await prisma.board.delete({
      where: {
        id: boardId,
      },
    });
    
    return NextResponse.json(
      { message: 'Board deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the board' },
      { status: 500 }
    );
  }
}
