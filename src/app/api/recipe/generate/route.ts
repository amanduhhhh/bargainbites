import { NextRequest, NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

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
    if (!process.env.COHERE_API_KEY) {
      console.error('❌ Cohere API key not configured');
      return NextResponse.json(
        { success: false, error: 'Cohere API key not configured' },
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

    // Simple prompt for cooking instructions only
    const prompt = `Generate detailed cooking instructions for this meal. Do not include any conversational text, greetings, or responses to the user. Only provide the cooking instructions.

MEAL: ${mealName}
INGREDIENTS: ${ingredients.join(', ')}
SERVING SIZE: ${servingSize} people
COOKING EXPERIENCE: ${cookingExperience}
DIETARY RESTRICTIONS: ${dietaryRestrictions.join(', ') || 'None'}
PANTRY ITEMS: ${pantryItems.join(', ') || 'None'}

Provide step-by-step cooking instructions that are:
- Clear and easy to follow
- Appropriate for ${cookingExperience} level
- Include timing and temperature when helpful
- Use the available ingredients efficiently
- Include helpful cooking tips

Format as numbered steps with clear instructions. Do not include any markdown headers, just the instructions.`;

    console.log('📏 Prompt length:', prompt.length, 'characters');
    console.log('⏰ Starting Cohere API call...');
    const cohereStartTime = Date.now();

    const response = await cohere.generate({
      model: 'command',
      prompt: prompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    const cohereEndTime = Date.now();
    const cohereDuration = cohereEndTime - cohereStartTime;
    console.log(`✅ Cohere API call completed in ${cohereDuration}ms`);
    console.log('📊 Response details:', {
      model: 'command',
      responseLength: response.generations[0].text.length,
      tokensUsed: response.meta?.billed_units?.input_tokens + response.meta?.billed_units?.output_tokens || 'unknown'
    });

    let cookingInstructions = response.generations[0].text;
    
    // Clean up the response - remove conversational text
    cookingInstructions = cookingInstructions
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
      cookingInstructions
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
