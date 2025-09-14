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
}

export default function GroceryListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<GroceryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', notes: '' });
  const [isAdding, setIsAdding] = useState(false);

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
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const data = await response.json();
        setItems([data.item, ...items]);
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

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">Your Grocery List</h1>
              <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60">Add items to your grocery list anytime. Perfect for remembering what to buy on your next shopping trip.</p>
            </div>
          </div>

          {/* Add new item form */}
          <div className="py-4">
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
              <form onSubmit={addItem} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-black/60 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Milk, Bread, Apples"
                    className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-loblaws-orange"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm text-black/60 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="e.g., 2 lbs, 1 dozen"
                      className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-loblaws-orange"
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm text-black/60 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      id="notes"
                      value={newItem.notes}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      placeholder="e.g., Organic, Red variety"
                      className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-loblaws-orange"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAdding || !newItem.name.trim()}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-loblaws-orange text-white text-sm font-medium hover:bg-loblaws-orange/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? 'Adding...' : 'Add to List'}
                </button>
              </form>
            </div>
          </div>

          {/* Pending items */}
          {pendingItems.length > 0 && (
            <div className="py-4">
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4">
                  To Buy ({pendingItems.length})
                </h2>
                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-black/5 hover:bg-black/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleComplete(item.id, true)}
                          className="w-5 h-5 border-2 border-black/30 rounded hover:border-loblaws-orange transition-colors flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.name}</div>
                          {(item.quantity || item.notes) && (
                            <p className="text-xs text-black/60">
                              {item.quantity && <span>{item.quantity}</span>}
                              {item.quantity && item.notes && <span> • </span>}
                              {item.notes && <span>{item.notes}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Completed items */}
          {completedItems.length > 0 && (
            <div className="py-4">
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4">
                  Completed ({completedItems.length})
                </h2>
                <div className="space-y-3">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-black/5"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleComplete(item.id, false)}
                          className="w-5 h-5 bg-loblaws-orange rounded flex items-center justify-center hover:bg-loblaws-orange/80 transition-colors flex-shrink-0"
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-black/60 line-through">{item.name}</div>
                          {(item.quantity || item.notes) && (
                            <p className="text-xs text-black/40">
                              {item.quantity && <span>{item.quantity}</span>}
                              {item.quantity && item.notes && <span> • </span>}
                              {item.notes && <span>{item.notes}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="py-4">
              <div className="py-6">
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-loblaws-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-loblaws-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold mb-2">Your grocery list is empty</h3>
                  <p className="text-xs text-black/60">
                    Start adding items to your grocery list above. You can add items anytime throughout the day!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
