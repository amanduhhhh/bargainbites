'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HouseholdSizeStep from './components/HouseholdSizeStep';
import CookingExperienceStep from './components/CookingExperienceStep';
import PantryStaplesStep from './components/PantryStaplesStep';
import BudgetStep from './components/BudgetStep';
import EquipmentStep from './components/EquipmentStep';
import DietaryRestrictionsStep from './components/DietaryRestrictionsStep';

export interface OnboardingData {
  householdSize: number;
  cookingExperience: 'beginner' | 'intermediate' | 'advanced';
  pantryStaples: string[];
  weeklyBudget: number;
  equipment: string[];
  dietaryRestrictions: string[];
}

const STEPS = [
  { id: 'household', title: 'Household', component: HouseholdSizeStep },
  { id: 'cooking', title: 'Cooking Level', component: CookingExperienceStep },
  { id: 'pantry', title: 'Pantry Staples', component: PantryStaplesStep },
  { id: 'budget', title: 'Budget', component: BudgetStep },
  { id: 'equipment', title: 'Equipment', component: EquipmentStep },
  { id: 'dietary', title: 'Dietary', component: DietaryRestrictionsStep },
];

export default function PlanPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    householdSize: 1,
    cookingExperience: 'beginner',
    pantryStaples: [],
    weeklyBudget: 50,
    equipment: [],
    dietaryRestrictions: [],
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  // Load user preferences when component mounts
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        if (isDemoMode) {
          // Load demo preferences from localStorage
          const demoData = localStorage.getItem('demoOnboardingData');
          if (demoData) {
            const parsedData = JSON.parse(demoData);
            setOnboardingData(parsedData);
          }
          setIsLoadingPreferences(false);
          return;
        }

        if (user && !isLoading) {
          // Fetch user preferences from database
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.preferences) {
              const preferences = result.preferences;
              setOnboardingData({
                householdSize: preferences.householdSize || 1,
                cookingExperience: preferences.cookingExperience || 'beginner',
                pantryStaples: preferences.pantryStaples || [],
                weeklyBudget: preferences.weeklyBudget || 50,
                equipment: preferences.equipment || [],
                dietaryRestrictions: preferences.dietaryRestrictions || [],
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadUserPreferences();
  }, [user, isLoading, isDemoMode]);

  const smoothScrollToTop = () => {
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    const duration = 800; // 800ms for a smoother, longer animation

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition * (1 - easedProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && !isTransitioning) {
      setAnimationDirection('next');
      setIsTransitioning(true);
      
      // Start exit animation
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        // Start enter animation after step change
        setTimeout(() => {
          setIsTransitioning(false);
          // Scroll to top smoothly after the new step is rendered
          smoothScrollToTop();
        }, 50);
      }, 300); // Match the exit animation duration
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && !isTransitioning) {
      setAnimationDirection('prev');
      setIsTransitioning(true);
      
      // Start exit animation
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        // Start enter animation after step change
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300); // Match the exit animation duration
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    
    try {
      if (isDemoMode) {
        // Store onboarding data in localStorage for demo mode
        localStorage.setItem('demoOnboardingData', JSON.stringify(onboardingData));
      } else {
        // Save to database for authenticated users
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            householdSize: onboardingData.householdSize,
            cookingExperience: onboardingData.cookingExperience,
            pantryStaples: onboardingData.pantryStaples,
            weeklyBudget: onboardingData.weeklyBudget,
            equipment: onboardingData.equipment,
            dietaryRestrictions: onboardingData.dietaryRestrictions,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save preferences');
        }

        const result = await response.json();
        console.log('Preferences saved successfully:', result);
      }
      
      // Add artificial load delay of 1000ms
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to meals page
      router.push('/meals');
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still redirect to meals page even if save fails
      router.push('/meals');
    } finally {
      setIsGenerating(false);
    }
  };

  const startDemoMode = () => {
    setIsDemoMode(true);
    setCurrentStep(0);
    // Load demo preferences from localStorage
    const demoData = localStorage.getItem('demoOnboardingData');
    if (demoData) {
      try {
        const parsedData = JSON.parse(demoData);
        setOnboardingData(parsedData);
      } catch (error) {
        console.error('Error parsing demo data:', error);
      }
    }
  };

  if (isLoading || isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">
            {isLoading ? 'Loading...' : 'Loading your preferences...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-semibold mb-4">Sign in to create your meal plan</h1>
          <p className="text-sm text-black/60 mb-6">
            We need to know your preferences to generate personalized meal plans and shopping lists.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 w-full"
            >
              Sign in to continue
            </button>
            <button
              onClick={startDemoMode}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-black/10 hover:bg-[#f2f2f2] hover:text-white dark:hover:bg-[#1a1a1a] text-sm font-medium w-full animate-blink"
            >
              Skip for now (demo mode)
            </button>
          </div>
          <p className="text-xs text-black/50 mt-4">
            Note: Your preferences won&apos;t be saved without signing in
          </p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;

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
            {isDemoMode && (
              <div className="flex items-center gap-2">
               
              </div>
            )}
            <div className="text-sm text-black/60">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold">
              {isDemoMode ? 'Demo: Create your meal plan' : 'Create your meal plan'}
            </h1>
            <span className="text-sm text-black/60">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-black/10 rounded-full h-1">
            <div 
              className="bg-foreground h-1 rounded-full progress-bar"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8 overflow-x-auto">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors duration-200 ${
                index <= currentStep 
                  ? 'bg-foreground text-background' 
                  : 'bg-black/10 text-black/60'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-xs whitespace-nowrap step-indicator ${
                index <= currentStep ? 'text-foreground' : 'text-black/60'
              }`}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-3 h-px mx-2 flex-shrink-0 step-indicator ${
                  index < currentStep ? 'bg-foreground' : 'bg-black/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current step content */}
        <div className="mb-8 relative overflow-hidden">
          <div className={`${
            isTransitioning 
              ? animationDirection === 'next' 
                ? 'step-exit-left' 
                : 'step-exit-right'
              : animationDirection === 'next' 
                ? 'step-enter-right' 
                : 'step-enter-left'
          }`}>
            <CurrentStepComponent 
              data={onboardingData}
              updateData={updateData}
            />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isTransitioning}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-black/10 hover:text-white hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Previous
          </button>
          
          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={isTransitioning || isGenerating}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate my plan'
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={isTransitioning}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
