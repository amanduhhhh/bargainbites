'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface PlaceholderItem {
  name: string;
  quantity: string;
  price: string;
  category: string;
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

export default function GroceryListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<GroceryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', notes: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  // Placeholder grocery data for receipt
  const placeholderItems: PlaceholderItem[] = [
    { name: 'Organic Bananas', quantity: '2 lbs', price: '$3.98', category: 'Produce' },
    { name: 'Whole Milk 2%', quantity: '1 gallon', price: '$4.29', category: 'Dairy' },
    { name: 'Whole Wheat Bread', quantity: '1 loaf', price: '$2.99', category: 'Bakery' },
    { name: 'Free Range Eggs', quantity: '1 dozen', price: '$4.99', category: 'Dairy' },
    { name: 'Ground Turkey', quantity: '1 lb', price: '$6.99', category: 'Meat' },
    { name: 'Brown Rice', quantity: '2 lbs', price: '$3.49', category: 'Pantry' },
    { name: 'Fresh Spinach', quantity: '1 bag', price: '$2.99', category: 'Produce' },
    { name: 'Greek Yogurt', quantity: '32 oz', price: '$5.99', category: 'Dairy' },
    { name: 'Olive Oil', quantity: '16 oz', price: '$7.99', category: 'Pantry' },
    { name: 'Chicken Breast', quantity: '2 lbs', price: '$9.98', category: 'Meat' },
    { name: 'Sweet Potatoes', quantity: '3 lbs', price: '$4.47', category: 'Produce' },
    { name: 'Cheddar Cheese', quantity: '8 oz', price: '$3.99', category: 'Dairy' }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchItems();
    }
  }, [session, status, router]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/grocery-list');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/grocery-list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });

      if (response.ok) {
        setItems(items.map(item => 
          item.id === id ? { ...item, completed } : item
        ));
      }
    } catch (error) {
      console.error('Error updating item:', error);
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

  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);

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
                <div className="bg-loblaws-orange text-white p-6">
                  <div className="text-center">
                    <div className="font-mono text-md sm:text-sm uppercase tracking-[0.2em] ">BARGAIN BITES</div>
                    <div className="font-mono text-xs mt-1">GROCERY RECEIPT - Walmart</div>
                  </div>
                  
                  {/* Week Navigation */}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={goToPreviousWeek}
                      className="flex items-center gap-1 px-3 py-1 bg-white text-black hover:bg-gray-100 rounded text-xs font-mono transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="text-center">
                      <div className="mb-2 font-mono text-xs">
                        {formatWeekRange(currentWeekStart)}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {isCurrentWeek(currentWeekStart) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white">
                            Current
                          </span>
                        )}
                        {isPastWeek(currentWeekStart) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black text-white">
                            Archived
                          </span>
                        )}
                        {isFutureWeek(currentWeekStart) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-black">
                            Planned
                          </span>
                        )}
                        {!isCurrentWeek(currentWeekStart) && (
                          <button
                            onClick={goToCurrentWeek}
                            className="text-xs text-black hover:text-white underline"
                          >
                            Go to current
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={goToNextWeek}
                      className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-100  text-black rounded text-xs font-mono transition-colors"
                    >
                      Next
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Receipt Items */}
                <div className="p-6">
                  <div className="font-mono text-sm space-y-1">
                    {/* Placeholder items grouped by category */}
                    {['Produce', 'Dairy', 'Meat', 'Pantry', 'Bakery'].map(category => {
                      const categoryItems = placeholderItems.filter(item => item.category === category);
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
                                  <span className="text-gray-800">{item.name}</span>
                                  <span className="text-gray-500 text-xs">({item.quantity})</span>
                                </div>
                              </div>
                              <div className="font-semibold text-gray-800">{item.price}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}

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
                        <span>$65.13</span>
                      </div>
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
