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
}

interface EditorPick {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  store: string;
}

export default function MealsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([
    { id: '1', day: 'Monday', meal: '', isSet: false },
    { id: '2', day: 'Tuesday', meal: '', isSet: false },
    { id: '3', day: 'Wednesday', meal: '', isSet: false },
    { id: '4', day: 'Thursday', meal: '', isSet: false },
    { id: '5', day: 'Friday', meal: '', isSet: false },
    { id: '6', day: 'Saturday', meal: '', isSet: false },
    { id: '7', day: 'Sunday', meal: '', isSet: false },
  ]);

  const [editorPicks] = useState<EditorPick[]>([
    {
      id: '1',
      title: 'Fresh Atlantic Salmon',
      description: 'Perfect for grilling or baking',
      price: '$8.99/lb',
      image: '/background/groceries.png',
      store: 'Loblaws'
    },
    {
      id: '2',
      title: 'Organic Spinach',
      description: 'Great for salads and smoothies',
      price: '$2.49/bag',
      image: '/background/groceries.png',
      store: 'Metro'
    },
    {
      id: '3',
      title: 'Whole Grain Bread',
      description: 'Fresh baked daily',
      price: '$3.99/loaf',
      image: '/background/groceries.png',
      store: 'Sobeys'
    },
    {
      id: '4',
      title: 'Chicken Breast',
      description: 'Boneless, skinless premium quality',
      price: '$6.99/lb',
      image: '/background/groceries.png',
      store: 'No Frills'
    },
    {
      id: '5',
      title: 'Avocados',
      description: 'Hass variety, perfect ripeness',
      price: '$1.99 each',
      image: '/background/groceries.png',
      store: 'FreshCo'
    },
    {
      id: '6',
      title: 'Greek Yogurt',
      description: 'High protein, plain variety',
      price: '$4.99/container',
      image: '/background/groceries.png',
      store: 'Food Basics'
    },
    {
      id: '7',
      title: 'Ground Beef',
      description: 'Lean ground beef, perfect for burgers',
      price: '$5.99/lb',
      image: '/background/groceries.png',
      store: 'Walmart'
    },
    {
      id: '8',
      title: 'Bell Peppers',
      description: 'Mixed colors, fresh and crisp',
      price: '$2.99/lb',
      image: '/background/groceries.png',
      store: 'Costco'
    }
  ]);

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

  const handleMealEdit = (id: string, newMeal: string) => {
    setWeeklyMeals(meals => 
      meals.map(meal => 
        meal.id === id 
          ? { ...meal, meal: newMeal, isSet: newMeal.trim() !== '' }
          : meal
      )
    );
  };

  const handlePlanWeek = () => {
    // Navigate to plan page or trigger meal planning
    window.location.href = '/plan';
  };

  // Check if all meals are set
  const allMealsSet = weeklyMeals.every(meal => meal.isSet);

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
            href="/"
            className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] hover:underline underline-offset-4"
          >
            Bargain Bites
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/setup"
              className="text-sm text-black/60 hover:text-black/80 underline"
            >
              Set up
            </Link>
            <Link
              href="/profile"
              className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors"
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
      : 'bg-orange-600 shadow-md shadow-orange-700/60 animate-[pulse_2s_ease-in-out_infinite]'
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {weeklyMeals.map((meal) => (
                  <div key={meal.id} className="rounded-lg border border-black/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{meal.day}</h3>
                      {meal.isSet ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-orange-500 text-white">
                          Set
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-gray-500 text-white">
                          Not set
                        </span>
                      )}
                    </div>
                    {meal.isSet ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">{meal.meal}</span>
                        <button
                          onClick={() => handleMealEdit(meal.id, '')}
                          className="text-xs text-black/40 hover:text-black/60 underline"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="w-full text-sm border-none outline-none bg-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleMealEdit(meal.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
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
                            ? 'bg-orange-500 text-white' 
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

            {/* Quick Stats */}
            {onboardingData && (
              <div className=" pb-4 px-4">
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

        {/* Editor's Picks Carousel - Full Width */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">This Week&apos;s Best Choices</h2>
          <div className="editor-picks-marquee editor-picks-fade py-2">
            <div className="editor-picks-track">
              {editorPicks.map((pick) => (
                <div key={pick.id} className="flex-shrink-0 w-64 rounded-lg  p-4 bg-white">
                  <div className="aspect-video bg-black/5 rounded-lg mb-3">
                  </div>
                  <h3 className="font-medium text-sm mb-1">{pick.title}</h3>
                  <p className="text-xs text-black/60 mb-2">{pick.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{pick.price}</span>
                    <span className="text-xs text-black/40">{pick.store}</span>
                  </div>
                </div>
              ))}
              
              {/* Duplicate for seamless scroll */}
              {editorPicks.map((pick) => (
                <div key={`duplicate-${pick.id}`} className="flex-shrink-0 w-64 rounded-lg p-4 bg-white">
                  <div className="aspect-video bg-black/5 rounded-lg mb-3">
                  </div>
                  <h3 className="font-medium text-sm mb-1">{pick.title}</h3>
                  <p className="text-xs text-black/60 mb-2">{pick.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{pick.price}</span>
                    <span className="text-xs text-black/40">{pick.store}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
