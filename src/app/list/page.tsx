'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface GroceryListItem {
  id: string;
  name: string;
  quantity?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  isUserAdded?: boolean;
  price?: string;
}

interface MealPlanIngredient {
  name: string;
  price: string;
  isOnSale: boolean;
  store: string;
  category: string;
  day: string;
}

interface MealPlanData {
  store: string;
  totalWeeklyCost: number;
  savings: number;
  weekStartDate: string;
}

// Utility functions for week calculations
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const getWeekEnd = (weekStart: Date): Date => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

const formatWeekRange = (weekStart: Date): string => {
  const weekEnd = getWeekEnd(weekStart);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric' 
  };
  return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}, ${weekStart.getFullYear()}`;
};

const isCurrentWeek = (weekStart: Date): boolean => {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  return weekStart.getTime() === currentWeekStart.getTime();
};

const isPastWeek = (weekStart: Date): boolean => {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  return weekStart < currentWeekStart;
};

const isFutureWeek = (weekStart: Date): boolean => {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  return weekStart > currentWeekStart;
};

// Map store IDs to display names
const storeDisplayNames: { [key: string]: string } = {
  'zehrs-conestoga': 'Zehrs',
  'zehrs': 'Zehrs',
  'walmart-farmers-market': 'Walmart',
  'walmart': 'Walmart',
  'sobeys': 'Sobeys',
  'belfiores-independent': 'Independent',
  'independent': 'Independent',
  'tnt-supermarket': 'T&T',
  't&t': 'T&T',
  'real-canadian-superstore': 'Real Canadian Superstore'
};

const getStoreDisplayName = (storeId: string | undefined): string => {
  if (!storeId) return 'Store';
  return storeDisplayNames[storeId] || storeId;
};

export default function GroceryListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<GroceryListItem[]>([]);
  const [mealPlanIngredients, setMealPlanIngredients] = useState<MealPlanIngredient[]>([]);
  const [mealPlanData, setMealPlanData] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', notes: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  const fetchItems = useCallback(async () => {
    try {
      // Format the week parameter as ISO string for the API
      const weekParam = currentWeekStart.toISOString().split('T')[0];
      const response = await fetch(`/api/grocery-list?week=${weekParam}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        setMealPlanIngredients(data.mealPlanIngredients || []);
        setMealPlanData(data.mealPlanData);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchItems();
    }
  }, [session, status, router, currentWeekStart, fetchItems]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch('/api/grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, isUserAdded: true })
      });

      if (response.ok) {
        const data = await response.json();
        setItems([{ ...data.item, isUserAdded: true }, ...items]);
        setNewItem({ name: '', quantity: '', notes: '' });
      }
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
  };


  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/grocery-list/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Week navigation functions
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Loading your grocery list...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
              href="/profile"
              className="w-6 h-6 rounded-full bg-loblaws-orange flex items-center justify-center hover:bg-loblaws-orange/80 transition-colors"
            >
              <User className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">Grocery Receipt</h1>
            <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60">Your meal plan items + personal additions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Receipt Section - Takes up 2/3 of the space */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Receipt Header */}
                <div className="bg-gradient-to-r from-loblaws-orange to-orange-600 text-white p-6">
                  <div className="text-center mb-6">
                    <div className="font-mono text-lg sm:text-xl uppercase tracking-[0.3em] font-bold mb-2">
                      BARGAIN BITES
                    </div>
                    <div className="text-sm opacity-90">
                      GROCERY RECEIPT • {getStoreDisplayName(mealPlanData?.store)}
                    </div>
                  </div>
                  
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPreviousWeek}
                      className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
                      title="Previous week"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="text-center flex-1 mx-4">
                      <div className="text-sm font-medium mb-2">
                        {formatWeekRange(currentWeekStart)}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        {isCurrentWeek(currentWeekStart) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                            Current Week
                          </span>
                        )}
                        {isPastWeek(currentWeekStart) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-white shadow-sm">
                            Archived
                          </span>
                        )}
                        {isFutureWeek(currentWeekStart) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white shadow-sm backdrop-blur-sm">
                            Planned
                          </span>
                        )}
                        {!isCurrentWeek(currentWeekStart) && (
                          <button
                            onClick={goToCurrentWeek}
                            className="text-xs text-white/80 hover:text-white underline transition-colors"
                          >
                            Go to current
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={goToNextWeek}
                      className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
                      title="Next week"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Receipt Items */}
                <div className="p-6">
                  <div className="font-mono text-sm space-y-1">
                    {/* Meal plan ingredients grouped by category */}
                    {['Produce', 'Dairy', 'Meat', 'Pantry', 'Bakery'].map(category => {
                      const categoryItems = mealPlanIngredients.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4">
                          <div className="font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-1">
                            {category.toUpperCase()}
                          </div>
                          {categoryItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {item.isOnSale && <span className="text-green-600 text-xs">🏷️</span>}
                                  <span className="text-gray-800">{item.name}</span>
                                </div>
                              </div>
                              <div className="font-semibold text-gray-800">{item.price}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {/* Show message if no meal plan data */}
                    {mealPlanIngredients.length === 0 && !loading && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-2">No meal plan found for this week</p>
                        <p className="text-sm">Create a meal plan to see ingredients here</p>
                        <Link href="/plan" className="inline-block mt-3 px-4 py-2 bg-loblaws-orange text-white rounded hover:bg-loblaws-orange/80 transition-colors">
                          Create Meal Plan
                        </Link>
                      </div>
                    )}

                    {/* Show loading state */}
                    {loading && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p>Loading meal plan...</p>
                      </div>
                    )}

                    {/* User added items */}
                    {items.filter(item => item.isUserAdded).length > 0 && (
                      <div className="mb-4">
                        <div className="font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-1">
                          YOUR ADDITIONS
                        </div>
                        {items.filter(item => item.isUserAdded).map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-600">★</span>
                              <span className="text-gray-800">{item.name}</span>
                              {item.quantity && <span className="text-gray-500 text-xs">({item.quantity})</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">$--.--</span>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Receipt Footer */}
                    <div className="border-t border-gray-300 pt-4 mt-6">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>TOTAL ESTIMATED</span>
                        <span>${mealPlanData?.totalWeeklyCost?.toFixed(2) || '0.00'}</span>
                      </div>
                      {mealPlanData?.savings && (
                        <div className="flex justify-between items-center text-sm text-green-600 mt-1">
                          <span>SAVINGS</span>
                          <span>${mealPlanData.savings > 0 ? '+' : ''}${mealPlanData.savings.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        *Prices are estimates and may vary by store
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Addition Section - Takes up 1/3 of the space */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-yellow-600">★</span>
                  Add Your Items
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add personal items to your grocery list. They&apos;ll appear with a star on your receipt.
                </p>
                
                <form onSubmit={addItem} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Coffee, Snacks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-loblaws-orange focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="e.g., 1 bag, 2 boxes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-loblaws-orange focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      id="notes"
                      value={newItem.notes}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      placeholder="e.g., Brand preference"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-loblaws-orange focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isAdding || !newItem.name.trim()}
                    className="w-full inline-flex items-center justify-center h-10 px-4 rounded-md bg-loblaws-orange text-white text-sm font-medium hover:bg-loblaws-orange/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAdding ? 'Adding...' : 'Add to Receipt'}
                  </button>
                </form>

                {/* Quick add buttons */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Add:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Coffee', 'Snacks', 'Toilet Paper', 'Shampoo'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setNewItem({ ...newItem, name: item })}
                        className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
