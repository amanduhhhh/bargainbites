'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OnboardingData } from '../plan/page';

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
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postalCode, setPostalCode] = useState('');
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([
    { id: '1', day: 'Monday', meal: 'Pasta with Tomato Sauce', isSet: true },
    { id: '2', day: 'Tuesday', meal: 'Chicken Stir-fry', isSet: true },
    { id: '3', day: 'Wednesday', meal: 'Bean and Rice Bowl', isSet: true },
    { id: '4', day: 'Thursday', meal: 'Vegetable Soup', isSet: false },
    { id: '5', day: 'Friday', meal: 'Fish Tacos', isSet: false },
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
    // Check if we have demo data in localStorage
    const demoData = localStorage.getItem('demoOnboardingData');
    if (demoData) {
      try {
        setOnboardingData(JSON.parse(demoData));
      } catch (error) {
        console.error('Error parsing demo data:', error);
      }
    }
    setIsLoading(false);
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Loading your meal plan...</p>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="px-3 py-1 text-sm border border-black/10 rounded-full focus:outline-none focus:ring-2 focus:ring-black/20"
                maxLength={7}
              />
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Demo Mode
            </span>
            <Link
              href="/plan"
              className="text-sm text-black/60 hover:text-black/80 underline"
            >
              Back to setup
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Meal Dashboard</h1>
            <p className="text-black/60">Plan your week, discover deals, and save money</p>
          </div>
          <button
            onClick={handlePlanWeek}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Plan the Week
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Meals */}
            <div className="bg-white border border-black/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">This Week's Meals</h2>
                <div className="text-sm text-black/60">
                  {weeklyMeals.filter(meal => meal.isSet).length} of 7 planned
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {weeklyMeals.map((meal) => (
                  <div key={meal.id} className="border border-black/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{meal.day}</h3>
                      {meal.isSet ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Set
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
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
                        placeholder="Add a meal..."
                        className="w-full text-sm border-none outline-none bg-transparent placeholder:text-black/40"
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

            {/* Editor's Picks Carousel */}
            <div className="bg-white border border-black/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">This Week's Best Choices</h2>
              <div className="editor-picks-marquee editor-picks-fade py-2">
                <div className="editor-picks-track">
                  {editorPicks.map((pick) => (
                    <div key={pick.id} className="flex-shrink-0 w-64 border border-black/10 rounded-lg p-4 bg-white">
                      <div className="aspect-video bg-black/5 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-xs text-black/40">Image</span>
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
                    <div key={`duplicate-${pick.id}`} className="flex-shrink-0 w-64 border border-black/10 rounded-lg p-4 bg-white">
                      <div className="aspect-video bg-black/5 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-xs text-black/40">Image</span>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white border border-black/10 rounded-lg p-6">
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
                            ? 'bg-foreground text-background' 
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
              <div className="bg-white border border-black/10 rounded-lg p-6">
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
            <div className="bg-white border border-black/10 rounded-lg p-6">
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
