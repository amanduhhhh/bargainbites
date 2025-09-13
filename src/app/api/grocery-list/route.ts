import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/mongodb';

// GET - Fetch all grocery list items for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        groceryListItems: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ items: user.groceryListItems });
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new grocery list item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, quantity, notes } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newItem = await prisma.groceryListItem.create({
      data: {
        name: name.trim(),
        quantity: quantity?.trim() || null,
        notes: notes?.trim() || null,
        userId: user.id
      }
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating grocery list item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
