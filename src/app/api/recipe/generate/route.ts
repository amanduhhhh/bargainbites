import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface RecipeGenerationRequest {
  mealName: string;
  ingredients: string[];
  measurements: string[];
  servingSize: number;
  pantryItems: string[];
  dietaryRestrictions: string[];
  cookingExperience: string;
  cuisineType: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 Recipe generation API called at:', new Date().toISOString());
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Gemini API key not configured');
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body: RecipeGenerationRequest = await request.json();
    const {
      mealName,
      ingredients,
      measurements,
      servingSize,
      pantryItems,
      dietaryRestrictions,
      cookingExperience,
      cuisineType
    } = body;

    console.log('📝 Request details:', {
      mealName,
      ingredientsCount: ingredients.length,
      servingSize,
      cookingExperience,
      cuisineType
    });

    // Enhanced prompt for detailed cooking instructions
    const prompt = `You are a professional chef creating detailed cooking instructions for a home cook. Generate comprehensive, step-by-step cooking instructions for this meal.

MEAL: ${mealName}
INGREDIENTS: ${ingredients.join(', ')}
SERVING SIZE: ${servingSize} people
COOKING EXPERIENCE: ${cookingExperience}
DIETARY RESTRICTIONS: ${dietaryRestrictions.join(', ') || 'None'}
PANTRY ITEMS: ${pantryItems.join(', ') || 'None'}

Create detailed cooking instructions that include:

**Preparation Phase:**
- Ingredient preparation (chopping, measuring, prepping)
- Equipment needed
- Preheating requirements

**Cooking Phase:**
- Step-by-step cooking process with specific techniques
- Exact temperatures and cooking times
- Visual cues for doneness
- Proper heat levels (high, medium, low)
- Stirring, flipping, or mixing instructions

**Finishing Phase:**
- Plating instructions
- Garnishing suggestions
- Serving temperature
- Storage tips if applicable

**Pro Tips:**
- Common mistakes to avoid
- Substitution suggestions
- Time-saving techniques
- Flavor enhancement tips

Format as clear numbered steps. Be specific about techniques, temperatures, and timing. Make it easy for a ${cookingExperience} level cook to follow successfully.`;

    console.log('📏 Prompt length:', prompt.length, 'characters');
    console.log('⏰ Starting Gemini API call...');
    const geminiStartTime = Date.now();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cookingInstructions = response.text();

    const geminiEndTime = Date.now();
    const geminiDuration = geminiEndTime - geminiStartTime;
    console.log(`✅ Gemini API call completed in ${geminiDuration}ms`);
    console.log('📊 Response details:', {
      model: 'gemini-1.5-flash',
      responseLength: cookingInstructions.length
    });
    
    // Clean up the response - remove conversational text
    const cleanedInstructions = cookingInstructions
      .replace(/^(Certainly!|Here is|Let me|I'll|I can|Let me know|This recipe|This should|This honors).*/gim, '')
      .replace(/Let me know if you would like[\s\S]*$/gim, '')
      .replace(/I can also provide[\s\S]*$/gim, '')
      .replace(/This recipe honors[\s\S]*$/gim, '')
      .replace(/This should be[\s\S]*$/gim, '')
      .replace(/This honors[\s\S]*$/gim, '')
      .replace(/^#+.*$/gm, '') // Remove markdown headers
      .trim();

    const totalDuration = Date.now() - startTime;
    console.log(`🎉 Total API processing time: ${totalDuration}ms`);
    console.log('📤 Sending response to client');

    return NextResponse.json({
      success: true,
      cookingInstructions: cleanedInstructions
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ Error after ${totalDuration}ms:`, error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
