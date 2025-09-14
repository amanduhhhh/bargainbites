'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingCart, User } from 'lucide-react';

interface RecipeData {
  id: string;
  meal: string;
  ingredients: string[];
  totalCost: number;
  cookingInstructions: string;
  day: string;
  imageUrl?: string;
}

export default function RecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [householdSize, setHouseholdSize] = useState(2); // Default to 2, will be updated from user preferences

  // Load user preferences to get household size
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (status === 'loading') return;
      
      if (session?.user) {
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.preferences?.householdSize) {
              setHouseholdSize(data.preferences.householdSize);
            }
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      } else {
        // Check for demo data in localStorage
        const demoData = localStorage.getItem('demoOnboardingData');
        if (demoData) {
          try {
            const parsedData = JSON.parse(demoData);
            if (parsedData.householdSize) {
              setHouseholdSize(parsedData.householdSize);
            }
          } catch (error) {
            console.error('Error parsing demo data:', error);
          }
        }
      }
    };

    loadUserPreferences();
  }, [session, status]);

  useEffect(() => {
    const loadRecipeData = async () => {
      try {
        // Get the meal plan data from localStorage
        const storedMealPlan = localStorage.getItem('generatedMealPlan');
        if (!storedMealPlan) {
          router.push('/meals');
          return;
        }

        const mealPlan = JSON.parse(storedMealPlan);
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Find the recipe by ID (which corresponds to the day index)
        const recipeId = params.id as string;
        const dayIndex = parseInt(recipeId) - 1;
        
        if (dayIndex >= 0 && dayIndex < days.length) {
          const dayKey = days[dayIndex];
          const dayData = mealPlan[dayKey];
          
          if (dayData && typeof dayData === 'object' && 'meal' in dayData) {
            setRecipeData({
              id: recipeId,
              meal: dayData.meal,
              ingredients: dayData.ingredients,
              totalCost: dayData.totalCost,
              cookingInstructions: dayData.cookingInstructions,
              day: dayNames[dayIndex],
              imageUrl: dayData.imageUrl,
            });
          } else {
            router.push('/meals');
            return;
          }
        } else {
          router.push('/meals');
          return;
        }
      } catch (error) {
        console.error('Error loading recipe data:', error);
        router.push('/meals');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== 'loading') {
      loadRecipeData();
    }
  }, [params.id, router, status]);

  // Function to generate detailed cooking instructions on-demand
  const generateDetailedInstructions = async () => {
    if (!recipeData || isGeneratingRecipe) return;
    
    setIsGeneratingRecipe(true);
    
    try {
      // Check if instructions are already cached
      const cacheKey = `instructions_${recipeData.meal}_${recipeData.id}`;
      const cachedInstructions = localStorage.getItem(cacheKey);
      
      if (cachedInstructions) {
        setRecipeData(prev => prev ? { 
          ...prev, 
          cookingInstructions: cachedInstructions 
        } : null);
        setIsGeneratingRecipe(false);
        return;
      }

      // Extract ingredients
      const ingredients: string[] = [];
      
      recipeData.ingredients.forEach(ingredient => {
        const match = ingredient.match(/^(.+?)\s*-\s*\$\d+\.\d+$/);
        if (match) {
          const ingredientName = match[1].replace(/\[SALE:.*?\]|\[REUSED\]/g, '').trim();
          ingredients.push(ingredientName);
        }
      });

      // Generate cooking instructions using Cohere
      console.log('🚀 Frontend: Starting recipe generation request');
      const requestStartTime = Date.now();
      
      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealName: recipeData.meal,
          ingredients,
          measurements: ingredients.map(() => 'as needed'),
          servingSize: householdSize,
          pantryItems: [],
          dietaryRestrictions: [],
          cookingExperience: 'intermediate',
          cuisineType: 'american'
        }),
      });

      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      console.log(`⏱️ Frontend: Request completed in ${requestDuration}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Frontend: API request failed:', response.status, errorText);
        throw new Error(`Failed to generate cooking instructions: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Frontend: Received response from API');
      
      if (data.success) {
        console.log('💾 Frontend: Caching instructions and updating UI');
        // Cache the instructions
        localStorage.setItem(cacheKey, data.cookingInstructions);
        
        // Update recipe data with new instructions
        setRecipeData(prev => prev ? { 
          ...prev, 
          cookingInstructions: data.cookingInstructions 
        } : null);
      } else {
        console.error('❌ Frontend: API returned success: false', data);
      }
    } catch (error) {
      console.error('Error generating cooking instructions:', error);
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  // Function to parse markdown to HTML
  const parseMarkdown = (text: string) => {
    return text
      // Convert headers first
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold mt-4 mb-2">$1</h1>')
      // Convert numbered lists (before bullet points)
      .replace(/^(\d+)\.\s+(.*)$/gim, '<div class="flex gap-3 mb-2"><span class="font-semibold text-loblaws-orange min-w-[2rem]">$1.</span><span>$2</span></div>')
      // Convert bullet points - more flexible regex
      .replace(/^\s*[-*•]\s+(.*)$/gim, '<div class="flex gap-3 mb-2"><span class="text-loblaws-orange">•</span><span>$1</span></div>')
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Convert italic text
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Convert line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      // Wrap in paragraphs (but not for divs)
      .replace(/^(?!<[h|d])/gm, '<p class="mb-3">')
      .replace(/(?<!>)$/gm, '</p>')
      // Clean up empty paragraphs
      .replace(/<p class="mb-3"><\/p>/g, '')
      .replace(/<p class="mb-3"><div/g, '<div')
      .replace(/<\/div><\/p>/g, '</div>');
  };

  // Simple fallback image for all recipes
  const getRecipeImage = () => {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
  };

  useEffect(() => {
    if (recipeData) {
      // Set default image if not already set
      if (!recipeData.imageUrl) {
        const defaultImageUrl = getRecipeImage();
        setRecipeData(prev => prev ? { ...prev, imageUrl: defaultImageUrl } : null);
      }
      setImageLoading(false);
    }
  }, [recipeData]);

  // Function to check if an ingredient is from a flyer deal
  const isFlyerDeal = (ingredient: string) => {
    return ingredient.includes('[SALE:');
  };

  // Function to extract store name from sale marker
  const getStoreFromSaleMarker = (ingredient: string) => {
    const match = ingredient.match(/\[SALE:([^\]]+)\]/);
    return match ? match[1] : 'Unknown Store';
  };

  // Function to clean ingredient name
  const cleanIngredientName = (ingredient: string) => {
    return ingredient
      .replace(/\s*\[SALE:[^\]]+\]\s*/g, '')
      .replace(/\s*-\s*\$\d+\.?\d*\s*$/g, '')
      .replace(/\s*\[REUSED\]\s*/g, '')
      .trim();
  };

  // Function to extract price from ingredient string
  const getPriceFromIngredient = (ingredient: string) => {
    const match = ingredient.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Function to check if ingredient was reused
  const isReusedIngredient = (ingredient: string) => {
    return ingredient.includes('[REUSED]');
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (isGeneratingRecipe) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Generating detailed recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipeData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-black/60">Recipe not found</p>
          <Link href="/meals" className="text-loblaws-orange hover:underline mt-2 inline-block">
            Back to meals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/meals"
            className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] hover:underline underline-offset-4"
          >
            Bargain Bites
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/list"
              className="flex items-center gap-2 text-sm text-black/60 hover:text-black/80 underline"
            >
              <ShoppingCart className="w-4 h-4" />
              Grocery List
            </Link>
            <Link
              href="/profile"
              className="w-6 h-6 rounded-full bg-loblaws-orange flex items-center justify-center hover:bg-loblaws-orange/80 transition-colors"
            >
              <User className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/meals"
          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black/80 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to meals
        </Link>

        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black/60 mb-2">
            <span>{recipeData.day}</span>
            <span>•</span>
            <span className="font-medium text-loblaws-orange">${recipeData.totalCost.toFixed(2)}</span>
          </div>
          <div className="mb-4">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              {recipeData.meal}
            </h1>
          </div>
        </div>

        {/* Recipe Image */}
        <div className="mb-8">
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-gray-100">
            {imageLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img
                src={recipeData.imageUrl}
                alt={recipeData.meal}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  console.log('🔄 Image failed to load, using fallback...');
                  setImageLoading(false);
                  // Use fallback image
                  const target = e.target as HTMLImageElement;
                  target.src = getRecipeImage();
                }}
              />
            )}
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold mb-6">Ingredients</h2>
              
              {/* Ingredients List */}
              <div className="space-y-3">
                {recipeData.ingredients.map((ingredient, index) => {
                  const price = getPriceFromIngredient(ingredient);
                  const isReused = isReusedIngredient(ingredient);
                  const isDeal = isFlyerDeal(ingredient);
                  
                  return (
                    <div key={index} className="flex items-start justify-between p-1 ">
                      <div className="flex items-start flex-1">
                        <span className="mr-2 text-loblaws-orange">•</span>
                        <div className="flex-1">
                          <span className="text-sm">{cleanIngredientName(ingredient)}</span>
                          {isDeal && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-loblaws-orange" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs text-loblaws-orange">
                                On sale at {getStoreFromSaleMarker(ingredient)}
                              </span>
                            </div>
                          )}
                          {isReused && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-600">Reused from previous days</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {!isReused && price > 0 && (
                        <span className="text-sm font-medium text-loblaws-orange ml-2">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Total Cost */}
              <div className="mt-6 p-4 bg-loblaws-orange/10 rounded-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-xl font-semibold text-loblaws-orange">
                    ${recipeData.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 pl-2">Instructions</h2>
            
            {/* Cooking Instructions */}
            <div className="prose prose-sm max-w-none">
              <div className="bg-white pl-2">
                {recipeData.cookingInstructions ? (
                  <div 
                    className="text-black/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(recipeData.cookingInstructions) 
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No detailed instructions available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Instructions Button */}
            <div className="mt-6 pl-2">
              <button
                onClick={generateDetailedInstructions}
                disabled={isGeneratingRecipe}
                className="px-4 py-2 bg-loblaws-orange text-white rounded-lg hover:bg-loblaws-orange/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingRecipe ? 'Generating...' : 'Generate Cooking Instructions'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
