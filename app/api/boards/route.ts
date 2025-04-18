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
    
    const boards = await prisma.board.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching boards' },
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
    const { title, description, visibility } = body;
    
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    
    const board = await prisma.board.create({
      data: {
        title,
        description,
        visibility: visibility || 'PRIVATE',
        userId: user.id,
      },
    });
    
    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the board' },
      { status: 500 }
    );
  }
}
