import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// GET - Retrieve meal plans for a user (optionally for a specific week)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const weekParam = url.searchParams.get('week');
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const whereClause: { userId: string; weekStartDate?: Date } = { userId: user.id };
    
    // If week parameter is provided, filter by specific week
    if (weekParam) {
      const weekDate = new Date(weekParam);
      const weekStart = getWeekStart(weekDate);
      whereClause.weekStartDate = weekStart;
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: whereClause,
      orderBy: { weekStartDate: 'desc' }
    });

    return NextResponse.json({
      success: true,
      mealPlans
    });

  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save a new meal plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      weekStartDate,
      store,
      totalWeeklyCost,
      savings,
      lunchPreference,
      mealPlan
    } = body;

    // Validate required fields
    if (!weekStartDate || !store || !mealPlan) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const weekStart = getWeekStart(new Date(weekStartDate));

    // Use upsert to either create new or update existing meal plan for the week
    const savedMealPlan = await prisma.mealPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: user.id,
          weekStartDate: weekStart
        }
      },
      update: {
        store,
        totalWeeklyCost: totalWeeklyCost || 0,
        savings: savings || 0,
        lunchPreference,
        monday: mealPlan.monday || {},
        tuesday: mealPlan.tuesday || {},
        wednesday: mealPlan.wednesday || {},
        thursday: mealPlan.thursday || {},
        friday: mealPlan.friday || {},
        saturday: mealPlan.saturday || {},
        sunday: mealPlan.sunday || {},
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        weekStartDate: weekStart,
        store,
        totalWeeklyCost: totalWeeklyCost || 0,
        savings: savings || 0,
        lunchPreference,
        monday: mealPlan.monday || {},
        tuesday: mealPlan.tuesday || {},
        wednesday: mealPlan.wednesday || {},
        thursday: mealPlan.thursday || {},
        friday: mealPlan.friday || {},
        saturday: mealPlan.saturday || {},
        sunday: mealPlan.sunday || {}
      }
    });

    return NextResponse.json({
      success: true,
      mealPlan: savedMealPlan
    });

  } catch (error) {
    console.error('Error saving meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a meal plan
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const mealPlanId = url.searchParams.get('id');
    
    if (!mealPlanId) {
      return NextResponse.json(
        { success: false, error: 'Meal plan ID is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the meal plan (only if it belongs to the user)
    const deletedMealPlan = await prisma.mealPlan.deleteMany({
      where: {
        id: mealPlanId,
        userId: user.id
      }
    });

    if (deletedMealPlan.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Meal plan not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
