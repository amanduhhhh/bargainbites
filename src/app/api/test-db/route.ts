import { NextResponse } from 'next/server';
import { prisma } from '@/lib/mongodb';

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    // Test basic operations with Prisma
    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    const sessionCount = await prisma.session.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      database: 'bargainbites',
      collections: ['users', 'accounts', 'sessions', 'verificationtokens'],
      userCount,
      accountCount,
      sessionCount
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
