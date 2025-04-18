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
    
    // Verify board exists and user has access
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
    
    if (board.userId !== user.id && board.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const items = await prisma.boardItem.findMany({
      where: {
        boardId,
      },
      orderBy: {
        position: 'asc',
      },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching board items:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching board items' },
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
    
    const boardId = params.id;
    const body = await request.json();
    const { title, content, type } = body;
    
    // Verify board exists and user has access
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
    
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Get the highest position to place the new item at the end
    const highestPositionItem = await prisma.boardItem.findFirst({
      where: {
        boardId,
      },
      orderBy: {
        position: 'desc',
      },
    });
    
    const position = highestPositionItem ? highestPositionItem.position + 1 : 0;
    
    const item = await prisma.boardItem.create({
      data: {
        title,
        content,
        type: type || 'NOTE',
        position,
        boardId,
        userId: user.id,
      },
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating board item:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the board item' },
      { status: 500 }
    );
  }
}
