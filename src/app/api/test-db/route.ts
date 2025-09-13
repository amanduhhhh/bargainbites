import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Test basic operations
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Test a simple operation
    const testCollection = db.collection('test');
    const count = await testCollection.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      database: db.databaseName,
      collections: collectionNames,
      testCollectionCount: count
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
