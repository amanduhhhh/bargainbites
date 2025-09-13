import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/mongodb';

// GET /api/user/preferences - Get user preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        householdSize: true,
        cookingExperience: true,
        pantryStaples: true,
        weeklyBudget: true,
        equipment: true,
        dietaryRestrictions: true,
        preferencesSet: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: user
    });

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/user/preferences - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { householdSize, cookingExperience, pantryStaples, weeklyBudget, equipment, dietaryRestrictions } = body;

    // Validate required fields
    if (householdSize === undefined || cookingExperience === undefined || 
        !Array.isArray(pantryStaples) || weeklyBudget === undefined || 
        !Array.isArray(equipment) || !Array.isArray(dietaryRestrictions)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        householdSize: parseInt(householdSize),
        cookingExperience,
        pantryStaples,
        weeklyBudget: parseFloat(weeklyBudget),
        equipment,
        dietaryRestrictions,
        preferencesSet: true,
      },
      select: {
        householdSize: true,
        cookingExperience: true,
        pantryStaples: true,
        weeklyBudget: true,
        equipment: true,
        dietaryRestrictions: true,
        preferencesSet: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: updatedUser
    });

  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
