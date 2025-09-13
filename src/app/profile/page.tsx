'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface OnboardingData {
  householdSize: number;
  weeklyBudget: number;
  cookingExperience: string;
  equipment: string[];
  pantryStaples: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (session?.user) {
          // Fetch preferences from database for authenticated users
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.preferences) {
              setOnboardingData({
                householdSize: result.preferences.householdSize || 1,
                weeklyBudget: result.preferences.weeklyBudget || 50,
                cookingExperience: result.preferences.cookingExperience || 'beginner',
                equipment: result.preferences.equipment || [],
                pantryStaples: result.preferences.pantryStaples || [],
              });
            }
          }
        } else {
          // Check if we have demo data in localStorage for non-authenticated users
          const demoData = localStorage.getItem('demoOnboardingData');
          if (demoData) {
            try {
              setOnboardingData(JSON.parse(demoData));
            } catch (error) {
              console.error('Error parsing demo data:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Loading your profile...</p>
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
              href="/meals"
              className="text-sm text-black/60 hover:text-black/80 underline"
            >
              Meals
            </Link>
            <Link
              href="/plan"
              className="text-sm text-black/60 hover:text-black/80 underline"
            >
              Plan
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
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">Your Profile</h1>
            <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60">Manage your preferences and view your account details</p>
          </div>
          {session && (
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-2 border-orange-200"
                />
              )}
            </div>
          )}
        </div>

        {session ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Info Card */}
              <div className="py-4">
                <div className=" py-6 pr-6">
                  <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-black/60">Name</label>
                      <p className="font-medium">{session.user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black/60">Email</label>
                      <p className="font-medium">{session.user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black/60">Account Status</label>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-orange-500 text-white">
                          Active
                        </span>
                        <span className="text-sm text-black/60">Member since recently</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              {onboardingData && (
                <div className="p-4">
                  <div className=" p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-black/60">Household Size</label>
                        <p className="font-medium">{onboardingData.householdSize} {onboardingData.householdSize === 1 ? 'person' : 'people'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-black/60">Weekly Budget</label>
                        <p className="font-medium">${onboardingData.weeklyBudget}/week</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-black/60">Cooking Experience</label>
                        <p className="font-medium capitalize">{onboardingData.cookingExperience}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-black/60">Equipment</label>
                        <p className="font-medium">{onboardingData.equipment.length} items</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Card */}
              <div className="py-4">
                <div className=" py-6 pr-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-black/5">
                      <div>
                        <p className="text-sm font-medium">Meal planning session</p>
                        <p className="text-xs text-black/60">2 days ago</p>
                      </div>
                      <span className="text-xs text-black/40">Completed</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5">
                      <div>
                        <p className="text-sm font-medium">Profile setup</p>
                        <p className="text-xs text-black/60">1 week ago</p>
                      </div>
                      <span className="text-xs text-black/40">Completed</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Account created</p>
                        <p className="text-xs text-black/60">1 week ago</p>
                      </div>
                      <span className="text-xs text-black/40">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="p-4">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Meals Planned:</span>
                    <span className="font-medium">5 this week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Money Saved:</span>
                    <span className="font-medium">$23.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Deals Found:</span>
                    <span className="font-medium">12 this month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Shopping Trips:</span>
                    <span className="font-medium">3 this week</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/setup"
                    className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    Update Preferences
                  </Link>
                  <Link
                    href="/meals"
                    className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    View Meal Plans
                  </Link>
                  <Link
                    href="/plan"
                    className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    Plan New Week
                  </Link>
                  <button className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors">
                    Shopping History
                  </button>
                </div>
              </div>

              {/* Account Management */}
              <div className="p-4">
                <h3 className="font-semibold mb-4">Account</h3>
                <div className="space-y-2">
                  <button className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors">
                    Privacy Settings
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5 transition-colors">
                    Export Data
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Not signed in
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You need to sign in to view your profile. The middleware is protecting this page.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
