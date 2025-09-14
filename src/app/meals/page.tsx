'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { OnboardingData } from '../setup/page';

interface WeeklyMeal {
  id: string;
  day: string;
  meal: string;
  isSet: boolean;
  ingredients?: string[];
  totalCost?: number;
  cookingInstructions?: string;
  flyerDeals?: string[];
}

interface GeneratedMealPlan {
  monday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  tuesday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  wednesday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  thursday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  friday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  saturday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  sunday: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  totalWeeklyCost: number;
  savings: number;
}


export default function MealsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([]);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<GeneratedMealPlan | null>(null);
  const [showMealDetails, setShowMealDetails] = useState<string[]>([]);


  useEffect(() => {
    const checkSetupCompletion = async () => {
      try {
        if (session?.user) {
          // For authenticated users, check database
          try {
            const response = await fetch('/api/user/preferences');
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.preferences?.preferencesSet) {
                setOnboardingData({
                  householdSize: result.preferences.householdSize || 1,
                  weeklyBudget: result.preferences.weeklyBudget || 50,
                  cookingExperience: result.preferences.cookingExperience || 'beginner',
                  equipment: result.preferences.equipment || [],
                  pantryStaples: result.preferences.pantryStaples || [],
                  dietaryRestrictions: result.preferences.dietaryRestrictions || [],
                });
              } else {
                // No setup data found, redirect to setup
                router.push('/setup');
                return;
              }
            } else {
              // API call failed, redirect to setup
              router.push('/setup');
              return;
            }
          } catch (fetchError) {
            console.error('Error fetching user preferences:', fetchError);
            // If API call fails, redirect to setup
            router.push('/setup');
            return;
          }
        } else {
          // For non-authenticated users, check localStorage
          const demoData = localStorage.getItem('demoOnboardingData');
          if (demoData) {
            try {
              setOnboardingData(JSON.parse(demoData));
            } catch (error) {
              console.error('Error parsing demo data:', error);
              router.push('/setup');
              return;
            }
          } else {
            // No demo data found, redirect to setup
            router.push('/setup');
            return;
          }
        }

        // Initialize weekly meals with empty day boxes
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const initialMeals = dayNames.map((day, index) => ({
          id: (index + 1).toString(),
          day: day,
          meal: '',
          isSet: false,
        }));

        // Check for generated meal plan
        const storedMealPlan = localStorage.getItem('generatedMealPlan');
        console.log('Checking for stored meal plan:', storedMealPlan);
        if (storedMealPlan) {
          try {
            const mealPlan: GeneratedMealPlan = JSON.parse(storedMealPlan);
            console.log('Parsed meal plan:', mealPlan);
            setGeneratedMealPlan(mealPlan);
            
            // Update weekly meals with generated plan data
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const updatedMeals = initialMeals.map((meal, index) => {
              const dayKey = days[index];
              const dayData = mealPlan[dayKey as keyof GeneratedMealPlan];
              if (dayData && typeof dayData === 'object' && 'meal' in dayData) {
                return {
                  ...meal,
                  meal: dayData.meal,
                  isSet: true,
                  ingredients: dayData.ingredients,
                  totalCost: dayData.totalCost,
                  cookingInstructions: dayData.cookingInstructions,
                };
              }
              return meal;
            });
            setWeeklyMeals(updatedMeals);
          } catch (error) {
            console.error('Error parsing generated meal plan:', error);
            setWeeklyMeals(initialMeals);
          }
        } else {
          setWeeklyMeals(initialMeals);
        }
      } catch (error) {
        console.error('Error checking setup completion:', error);
        router.push('/setup');
        return;
      } finally {
        setIsCheckingSetup(false);
        setIsLoading(false);
      }
    };

    // Only check setup if session status is not loading
    if (status !== 'loading') {
      checkSetupCompletion();
    }
  }, [session, status, router]);


  const handlePlanWeek = () => {
    // Clear any existing meal plan to force regeneration with updated store names
    localStorage.removeItem('generatedMealPlan');
    // Navigate to plan page or trigger meal planning
    window.location.href = '/plan';
  };

  // Function to check if an ingredient is from a flyer deal
  const isFlyerDeal = (ingredient: string) => {
    // Check if the ingredient has [SALE] marker from the API
    return ingredient.includes('[SALE:');
  };

  // Function to extract store name from sale marker
  const getStoreFromSaleMarker = (ingredient: string) => {
    const match = ingredient.match(/\[SALE:([^\]]+)\]/);
    return match ? match[1] : 'Unknown Store';
  };

  // Function to clean ingredient name (remove [SALE:Store] marker and price for display)
  const cleanIngredientName = (ingredient: string) => {
    return ingredient
      .replace(/\s*\[SALE:[^\]]+\]\s*/g, '') // Remove [SALE:Store] marker
      .replace(/\s*-\s*\$\d+\.?\d*\s*$/g, '') // Remove price at the end
      .trim();
  };

  // Function to extract price from ingredient string
  const getPriceFromIngredient = (ingredient: string) => {
    const match = ingredient.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Function to get unique stores from a meal's ingredients
  const getStoresFromMeal = (ingredients: string[]) => {
    const stores = ingredients
      .filter(ingredient => isFlyerDeal(ingredient))
      .map(ingredient => getStoreFromSaleMarker(ingredient))
      .filter((store, index, arr) => arr.indexOf(store) === index); // Remove duplicates
    return stores;
  };


  // Check if all meals are set (only if there are meals to check)
  const allMealsSet = weeklyMeals.length > 0 && weeklyMeals.every(meal => meal.isSet);

  if (isLoading || isCheckingSetup || status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Saving your preferences...</p>
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
              className="text-sm text-black/60 hover:text-black/80 underline"
            >
              Grocery List
            </Link>
            <Link
              href="/profile"
              className="w-6 h-6 rounded-full bg-loblaws-orange flex items-center justify-center hover:bg-loblaws-orange/80 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-12">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">Meal Dashboard</h1>
            <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60">Plan your week, discover deals, and save money</p>
          </div>
          <button
            onClick={handlePlanWeek}
            className={`inline-flex items-center justify-center h-11 px-5 rounded-full text-background text-sm font-medium hover:opacity-90 transition-all duration-300 ${
              allMealsSet 
                ? 'bg-foreground' 
                : 'bg-loblaws-orange shadow-md shadow-loblaws-orange/60 animate-[pulse_2s_ease-in-out_infinite]'
            }`}
          >
            Plan the Week
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Meals */}
            <div className=" p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">This Week&apos;s Meals</h2>
                  <div className="text-sm text-black/60">
                    {weeklyMeals.filter(meal => meal.isSet).length} of 7 planned
                  </div>
                </div>
                
                {/* Deal Legend */}
                <div className="mb-4 p-3 bg-loblaws-orange/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-loblaws-orange" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-loblaws-orange font-medium">Items with this star are on sale in this week&apos;s flyer</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {weeklyMeals.map((meal) => (
                    <div key={meal.id} className="rounded-lg border border-black/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{meal.day}</h3>
                        <div className="flex items-center gap-2">
                          {meal.totalCost && (
                            <span className="text-xs text-accent-muted-dark font-medium">
                              ${meal.totalCost.toFixed(2)}
                            </span>
                          )}
                          {meal.isSet ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-loblaws-orange text-white">
                              Set
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-accent-muted text-white">
                              Not set
                            </span>
                          )}
                        </div>
                      </div>
                      {meal.isSet ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-black/80 font-medium">{meal.meal}</span>
                          </div>
                          {meal.ingredients && meal.ingredients.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => {
                                    setShowMealDetails(prev => 
                                      prev.includes(meal.id) 
                                        ? prev.filter(id => id !== meal.id)
                                        : [...prev, meal.id]
                                    );
                                  }}
                                  className="text-xs text-accent-muted-dark hover:text-accent-muted underline"
                                >
                                  {showMealDetails.includes(meal.id) ? 'Hide details' : 'View ingredients & instructions'}
                                </button>
                                {meal.ingredients.some(ingredient => isFlyerDeal(ingredient)) && (
                                  <div className="flex items-center gap-1 text-xs text-loblaws-orange">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span>Deals at {getStoresFromMeal(meal.ingredients || []).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                              {showMealDetails.includes(meal.id) && (
                                <div className="mt-2 space-y-2">
                                  <div>
                                    <h4 className="text-xs font-medium text-black/60 mb-1">Ingredients:</h4>
                                    <ul className="text-xs text-black/70 space-y-1">
                                      {meal.ingredients.map((ingredient, index) => {
                                        const price = getPriceFromIngredient(ingredient);
                                        return (
                                          <li key={index} className="flex items-start justify-between">
                                            <div className="flex items-start flex-1">
                                              <span className="mr-1">•</span>
                                              <span className="flex-1">{cleanIngredientName(ingredient)}</span>
                                              {isFlyerDeal(ingredient) && (
                                                <span 
                                                  className="ml-2 flex items-center" 
                                                  title={`On sale at ${getStoreFromSaleMarker(ingredient)}`}
                                                >
                                                  <svg className="w-3 h-3 text-loblaws-orange" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                  </svg>
                                                </span>
                                              )}
                                            </div>
                                            {price > 0 && (
                                              <span className="text-xs font-medium text-loblaws-orange ml-2">
                                                ${price.toFixed(2)}
                                              </span>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                  {meal.cookingInstructions && (
                                    <div>
                                      <h4 className="text-xs font-medium text-black/60 mb-1">Instructions:</h4>
                                      <p className="text-xs text-black/70">{meal.cookingInstructions}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-black/40 italic">
                          No meal planned
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="p-4">
              <h3 className="font-semibold mb-4">Calendar</h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-xs text-black/60 py-1">{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6; // Start from previous week
                  const isCurrentMonth = day > 0 && day <= 31;
                  const isToday = day === new Date().getDate();
                  
                  return (
                    <div
                      key={i}
                      className={`text-xs py-1 rounded ${
                        isCurrentMonth 
                          ? isToday 
                            ? 'bg-loblaws-orange text-white' 
                            : 'hover:bg-black/5'
                          : 'text-black/20'
                      }`}
                    >
                      {isCurrentMonth ? day : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meal Plan Summary */}
            {generatedMealPlan && (
              <div className="pb-4 px-4">
                <h3 className="font-semibold mb-4">This Week&apos;s Plan</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Total Cost:</span>
                    <span className="font-medium text-loblaws-orange">${generatedMealPlan.totalWeeklyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Savings:</span>
                    <span className="font-medium text-green-600">${generatedMealPlan.savings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Budget:</span>
                    <span className="font-medium">${onboardingData?.weeklyBudget || 50}</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-2 mt-2">
                    <div 
                      className="bg-loblaws-orange h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((generatedMealPlan.totalWeeklyCost / (onboardingData?.weeklyBudget || 50)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-black/60 text-center">
                    {generatedMealPlan.totalWeeklyCost <= (onboardingData?.weeklyBudget || 50) 
                      ? `Under budget by $${((onboardingData?.weeklyBudget || 50) - generatedMealPlan.totalWeeklyCost).toFixed(2)}`
                      : `Over budget by $${(generatedMealPlan.totalWeeklyCost - (onboardingData?.weeklyBudget || 50)).toFixed(2)}`
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {onboardingData && (
              <div className="pb-4 px-4">
                <h3 className="font-semibold mb-4">Your Profile</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Household:</span>
                    <span className="font-medium">{onboardingData.householdSize} {onboardingData.householdSize === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Budget:</span>
                    <span className="font-medium">${onboardingData.weeklyBudget}/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Cooking Level:</span>
                    <span className="font-medium capitalize">{onboardingData.cookingExperience}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className=" pb-4 px-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/plan"
                  className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors"
                >
                  Update Preferences
                </Link>
                <button className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors">
                  View Shopping List
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors">
                  Find Deals
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
