import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/mongodb';

// PUT - Update a grocery list item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, quantity, notes, completed } = await request.json();


    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the item belongs to the user
    const existingItem = await prisma.groceryListItem.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updatedItem = await prisma.groceryListItem.update({
      where: { id: id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(quantity !== undefined && { quantity: quantity?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(completed !== undefined && { completed })
      }
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('Error updating grocery list item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a grocery list item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the item belongs to the user
    const existingItem = await prisma.groceryListItem.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.groceryListItem.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grocery list item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
