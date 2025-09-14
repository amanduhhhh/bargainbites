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

  // Function to get recipe image based on meal name using dynamic Unsplash search
  const getRecipeImage = (mealName: string) => {
    // Clean and prepare the meal name for URL encoding
    const cleanMealName = mealName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '+') // Replace spaces with + for URL encoding
      .trim();

    // Create a dynamic Unsplash URL with the meal name as search query
    // Using Unsplash's search API with food category and specific meal name
    const searchQuery = encodeURIComponent(cleanMealName);
    const imageUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&utm_source=unsplash&utm_medium=referral&utm_campaign=api-credit&q=${searchQuery}`;
    
    return imageUrl;
  };

  // Alternative function using Unsplash's source API for more specific results
  const getRecipeImageFromUnsplash = async (mealName: string): Promise<string> => {
    try {
      // Clean the meal name for better search results
      const searchQuery = mealName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Use Unsplash's search API (requires API key, but we can use a fallback approach)
      // For now, we'll use a more intelligent URL construction
      const encodedQuery = encodeURIComponent(searchQuery);
      
      // Try to get a more specific image by constructing a search-based URL
      // This uses Unsplash's public search endpoint
      const searchUrl = `https://source.unsplash.com/800x600/?food,${encodedQuery}`;
      
      return searchUrl;
    } catch (error) {
      console.error('Error generating image URL:', error);
      // Fallback to a general food image
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
    }
  };

  useEffect(() => {
    if (recipeData && !recipeData.imageUrl) {
      // Use the more dynamic Unsplash source API for better image matching
      getRecipeImageFromUnsplash(recipeData.meal).then((imageUrl) => {
        setRecipeData(prev => prev ? { ...prev, imageUrl } : null);
        setImageLoading(false);
      }).catch((error) => {
        console.error('Error fetching recipe image:', error);
        // Fallback to the basic function
        const fallbackUrl = getRecipeImage(recipeData.meal);
        setRecipeData(prev => prev ? { ...prev, imageUrl: fallbackUrl } : null);
        setImageLoading(false);
      });
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
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            {recipeData.meal}
          </h1>
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
                  setImageLoading(false);
                  // Try fallback image generation
                  const fallbackUrl = getRecipeImage(recipeData.meal);
                  const target = e.target as HTMLImageElement;
                  if (target.src !== fallbackUrl) {
                    target.src = fallbackUrl;
                  } else {
                    // Final fallback to a general food image
                    target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
                  }
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
            <div className="prose prose-sm max-w-none">
              <div className="bg-white pl-2">
                <p className="text-black/80 leading-relaxed whitespace-pre-line">
                  {recipeData.cookingInstructions}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
