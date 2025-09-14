'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { OnboardingData } from '../setup/page';
import { ShoppingCart, User } from 'lucide-react';

interface WeeklyMeal {
  id: string;
  day: string;
  meal: string;
  isSet: boolean;
  ingredients?: string[];
  totalCost?: number;
  cookingInstructions?: string;
  flyerDeals?: string[];
  lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
}

interface GeneratedMealPlan {
  monday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
  tuesday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
  wednesday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
  thursday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
  friday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
  saturday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
  sunday: { 
    meal: string; 
    ingredients: string[]; 
    totalCost: number; 
    cookingInstructions: string;
    lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
    dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  };
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
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, -1 = previous week, 1 = next week
  const [lunchPreference, setLunchPreference] = useState<string>('');


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
        const storedPlanData = localStorage.getItem('demoPlanData');
        console.log('Checking for stored meal plan:', storedMealPlan);
        
        // Load lunch preference from plan data
        if (storedPlanData) {
          try {
            const planData = JSON.parse(storedPlanData);
            setLunchPreference(planData.lunchPreference || '');
          } catch (error) {
            console.error('Error parsing plan data:', error);
          }
        }
        
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
                  lunch: dayData.lunch,
                  dinner: dayData.dinner,
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

  // Helper function to get the selected week start date
  const getSelectedWeekStart = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    currentWeekStart.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const selectedWeekStart = new Date(currentWeekStart);
    selectedWeekStart.setDate(currentWeekStart.getDate() + (selectedWeekOffset * 7));
    
    return selectedWeekStart;
  };

  // Helper function to check if Plan the Week button should be disabled
  const isPlanWeekDisabled = () => {
    return selectedWeekOffset !== 0; // Only allow planning for current week
  };

  // Helper function to check if navigation arrows should be disabled
  const isPreviousWeekDisabled = () => {
    // Allow going back to previous weeks for archive purposes
    return false;
  };

  const isNextWeekDisabled = () => {
    // Allow going forward to future weeks for archive purposes
    return false;
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

  // Function to clean ingredient name (remove [SALE:Store] marker, price, and [REUSED] marker for display)
  const cleanIngredientName = (ingredient: string) => {
    return ingredient
      .replace(/\s*\[SALE:[^\]]+\]\s*/g, '') // Remove [SALE:Store] marker
      .replace(/\s*-\s*\$\d+\.?\d*\s*$/g, '') // Remove price at the end
      .replace(/\s*\[REUSED\]\s*/g, '') // Remove [REUSED] marker
      .trim();
  };

  // Function to extract price from ingredient string
  const getPriceFromIngredient = (ingredient: string) => {
    const match = ingredient.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Function to check if ingredient was reused from previous days
  const isReusedIngredient = (ingredient: string) => {
    return ingredient.includes('[REUSED]');
  };

  // Function to get unique stores from a meal's ingredients
  const getStoresFromMeal = (ingredients: string[]) => {
    const stores = ingredients
      .filter(ingredient => isFlyerDeal(ingredient))
      .map(ingredient => getStoreFromSaleMarker(ingredient))
      .filter((store, index, arr) => arr.indexOf(store) === index); // Remove duplicates
    return stores;
  };

  // Function to calculate total weekly cost from individual meal costs
  const calculateTotalWeeklyCost = () => {
    if (!weeklyMeals || weeklyMeals.length === 0) return 0;
    
    return weeklyMeals.reduce((total, meal) => {
      if (!meal.isSet) return total;
      
      // If cook-lunch preference is selected and meal has separate lunch/dinner
      if (lunchPreference === 'cook-lunch' && meal.lunch && meal.dinner) {
        return total + (meal.lunch.totalCost || 0) + (meal.dinner.totalCost || 0);
      }
      
      // Otherwise use the main meal cost
      return total + (meal.totalCost || 0);
    }, 0);
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

      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-12">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">Meal Dashboard</h1>
            <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60">Plan your week, discover deals, and save money</p>
          </div>
          <button
            onClick={handlePlanWeek}
            disabled={isPlanWeekDisabled()}
            className={`inline-flex items-center justify-center h-11 px-5 rounded-full text-background text-sm font-medium transition-all duration-300 ${
              isPlanWeekDisabled() 
                ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                : 'bg-loblaws-orange hover:opacity-90'
            }`}
          >
            Plan the Week
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Meals */}
            <div className=" py-4 pr-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">This Week&apos;s Meals</h2>
                  <div className="text-sm text-black/60">
                    {weeklyMeals.filter(meal => meal.isSet).length} of 7 planned
                  </div>
                </div>
                

                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {weeklyMeals.map((meal) => (
                    <Link 
                      key={meal.id} 
                      href={meal.isSet ? `/recipe/${meal.id}` : '#'}
                      className={`block rounded-lg border border-black/10 p-4 transition-all duration-200 ${
                        meal.isSet 
                          ? 'hover:border-loblaws-orange/50 hover:shadow-md hover:bg-loblaws-orange/5 cursor-pointer' 
                          : 'cursor-default'
                      }`}
                    >
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
                              {lunchPreference === 'cook-lunch' && meal.lunch && meal.dinner ? 'Lunch & Dinner' : 'Set'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-black text-white">
                              Not set
                            </span>
                          )}
                        </div>
                      </div>
                      {meal.isSet ? (
                        <div className="space-y-2">
                          {lunchPreference === 'cook-lunch' && meal.lunch && meal.dinner ? (
                            // Show separate lunch and dinner when cook-lunch is selected
                            <div className="space-y-3">
                              {/* Lunch */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs text-black/60 font-medium uppercase tracking-wide">Lunch</div>
                                  <span className="text-sm text-black/80 font-medium">{meal.lunch.meal}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-accent-muted-dark font-medium">
                                    ${meal.lunch.totalCost.toFixed(2)}
                                  </span>
                                  <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                              {/* Dinner */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs text-black/60 font-medium uppercase tracking-wide">Dinner</div>
                                  <span className="text-sm text-black/80 font-medium">{meal.dinner.meal}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-accent-muted-dark font-medium">
                                    ${meal.dinner.totalCost.toFixed(2)}
                                  </span>
                                  <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Show single meal for other preferences
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-black/80 font-medium">{meal.meal}</span>
                              {meal.isSet && (
                                <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-black/40 italic">
                          No meal planned
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Calendar</h3>
                <div className="text-xs text-black/60">
                  {(() => {
                    const selectedWeekStart = getSelectedWeekStart();
                    const selectedWeekEnd = new Date(selectedWeekStart);
                    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
                    
                    const formatDate = (date: Date) => {
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    };
                    
                    return `${formatDate(selectedWeekStart)} - ${formatDate(selectedWeekEnd)}`;
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedWeekOffset(prev => prev - 1)}
                    disabled={isPreviousWeekDisabled()}
                    className={`p-1 rounded hover:bg-black/5 transition-colors ${
                      isPreviousWeekDisabled() ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedWeekOffset(prev => prev + 1)}
                    disabled={isNextWeekDisabled()}
                    className={`p-1 rounded hover:bg-black/5 transition-colors ${
                      isNextWeekDisabled() ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-xs text-black/60 py-1">{day}</div>
                ))}
                {(() => {
                  // Get the selected week dates
                  const selectedWeekStart = getSelectedWeekStart();
                  const selectedWeekEnd = new Date(selectedWeekStart);
                  selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
                  
                  // Determine which month to display based on the selected week
                  // If the week spans multiple months, show the month that contains the most days
                  const selectedWeekMonth = selectedWeekStart.getMonth();
                  const selectedWeekYear = selectedWeekStart.getFullYear();
                  
                  // Get first day of the selected month and calculate starting point for calendar
                  const firstDayOfMonth = new Date(selectedWeekYear, selectedWeekMonth, 1);
                  const startDate = new Date(firstDayOfMonth);
                  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Start from Sunday of first week
                  
                  return Array.from({ length: 35 }, (_, i) => {
                    const cellDate = new Date(startDate);
                    cellDate.setDate(startDate.getDate() + i);
                    cellDate.setHours(0, 0, 0, 0); // Normalize to start of day
                    const day = cellDate.getDate();
                    const isCurrentMonth = cellDate.getMonth() === selectedWeekMonth;
                    
                    // Check if this day is in the selected week
                    // Normalize dates to compare only the date part (ignore time)
                    const cellDateNormalized = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                    const weekStartNormalized = new Date(selectedWeekStart.getFullYear(), selectedWeekStart.getMonth(), selectedWeekStart.getDate());
                    const weekEndNormalized = new Date(selectedWeekEnd.getFullYear(), selectedWeekEnd.getMonth(), selectedWeekEnd.getDate());
                    
                    const isInSelectedWeek = cellDateNormalized >= weekStartNormalized && cellDateNormalized <= weekEndNormalized;
                    
                    return (
                      <div
                        key={i}
                        className={`text-xs py-1 rounded ${
                          isCurrentMonth 
                            ? isInSelectedWeek
                              ? 'bg-loblaws-orange text-white' 
                              : 'hover:bg-black/5'
                            : 'text-black/20'
                        }`}
                      >
                        {isCurrentMonth ? day : ''}
                      </div>
                    );
                  });
                })()}
              </div>
              {selectedWeekOffset !== 0 && (
                <div className="mt-2 text-xs text-black/60 text-center">
                  {selectedWeekOffset < 0 ? 'Previous week' : 'Future week'} - Archive view only
                </div>
              )}
            </div>

            {/* Meal Plan Summary */}
            {generatedMealPlan && (
              <div className="pb-4 px-4">
                <h3 className="font-semibold mb-4">This Week&apos;s Plan</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Total Cost:</span>
                    <span className="font-medium text-loblaws-orange">${calculateTotalWeeklyCost().toFixed(2)}</span>
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
                        width: `${Math.min((calculateTotalWeeklyCost() / (onboardingData?.weeklyBudget || 50)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-black/60 text-center">
                    {calculateTotalWeeklyCost() <= (onboardingData?.weeklyBudget || 50) 
                      ? `Under budget by $${((onboardingData?.weeklyBudget || 50) - calculateTotalWeeklyCost()).toFixed(2)}`
                      : `Over budget by $${(calculateTotalWeeklyCost() - (onboardingData?.weeklyBudget || 50)).toFixed(2)}`
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
