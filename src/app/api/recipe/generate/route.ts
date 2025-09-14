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

    // Direct prompt for cooking instructions only
    const prompt = `Cooking instructions for ${mealName}:

Available ingredients: ${ingredients.join(', ')}
Serving size: ${servingSize} people
Cooking level: ${cookingExperience}

STRICT RULE: You can ONLY use the ingredients listed above. Do not add any other ingredients not in the list.

Provide only numbered cooking steps. Use ONLY the provided ingredients. No additional ingredients allowed.`;

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
      tokensUsed: (response.meta?.billedUnits?.inputTokens || 0) + (response.meta?.billedUnits?.outputTokens || 0) || 'unknown'
    });

    let cookingInstructions = response.generations[0].text;
    
    // Simple cleanup - just remove any remaining conversational text
    cookingInstructions = cookingInstructions
      .replace(/^(Certainly!|Here is|Let me|I'll|I can|Let me know|This recipe|This should|This honors|Absolutely!|Of course!|I'd be happy to|I'm happy to|I can help|Here's|Here are|Let's|I'll help).*/gim, '')
      .replace(/Let me know if[\s\S]*$/gim, '')
      .replace(/I hope this helps[\s\S]*$/gim, '')
      .replace(/Enjoy your meal[\s\S]*$/gim, '')
      .replace(/Happy cooking[\s\S]*$/gim, '')
      .replace(/^#+.*$/gm, '') // Remove markdown headers
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/gm, '') // Trim each line
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
