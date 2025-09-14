'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LocationStep from './components/LocationStep';
import TransportStep from './components/TransportStep';
import MapStep from './components/MapStep';
import CuisineStep from './components/CuisineStep';
import LunchPreferencesStep from './components/LunchPreferencesStep';

export interface PlanData {
  postalCode: string;
  householdSize: number;
  hasCar: boolean;
  selectedStore: string | null;
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  budget: number;
  lunchPreference: string;
  cookLunchSeparately: boolean;
  specialRequests: string;
}

const STEPS = [
  { id: 'location', title: 'Location', component: LocationStep },
  { id: 'transport', title: 'Transport', component: TransportStep },
  { id: 'map', title: 'Store Selection', component: MapStep },
  { id: 'cuisine', title: 'Preferences', component: CuisineStep },
  { id: 'lunch', title: 'Lunch & Requests', component: LunchPreferencesStep },
];

export default function PlanPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [planData, setPlanData] = useState<PlanData>({
    postalCode: '',
    householdSize: 1,
    hasCar: false,
    selectedStore: null,
    cuisinePreferences: ['american'], // Default to American cuisine to prevent empty array
    dietaryRestrictions: [],
    budget: 50,
    lunchPreference: '',
    cookLunchSeparately: false,
    specialRequests: '',
  });

  const updateData = (updates: Partial<PlanData>) => {
    setPlanData(prev => ({ ...prev, ...updates }));
  };

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (status === 'loading') return; // Wait for session to load
      
      if (session?.user) {
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.preferences) {
              const preferences = data.preferences;
              setPlanData(prev => ({
                ...prev,
                householdSize: preferences.householdSize || prev.householdSize,
                dietaryRestrictions: preferences.dietaryRestrictions || [],
                budget: preferences.weeklyBudget || prev.budget,
              }));
            }
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      } else {
        // Check for demo data in localStorage
        const demoData = localStorage.getItem('demoOnboardingData');
        if (demoData) {
          try {
            const parsedData = JSON.parse(demoData);
            setPlanData(prev => ({
              ...prev,
              householdSize: parsedData.householdSize || prev.householdSize,
              dietaryRestrictions: parsedData.dietaryRestrictions || [],
              budget: parsedData.weeklyBudget || prev.budget,
            }));
          } catch (error) {
            console.error('Error parsing demo data:', error);
          }
        }
      }
      setIsLoadingPreferences(false);
    };

    loadUserPreferences();
  }, [session, status]);

  const smoothScrollToTop = () => {
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    const duration = 800;

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
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          setIsTransitioning(false);
          smoothScrollToTop();
        }, 50);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && !isTransitioning) {
      setAnimationDirection('prev');
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields before submitting
    if (!planData.cuisinePreferences || planData.cuisinePreferences.length === 0) {
      console.error('Cuisine preferences are required');
      alert('Please select at least one cuisine preference before creating your meal plan.');
      return;
    }

    if (!planData.selectedStore) {
      console.error('Store selection is required');
      alert('Please select a store before creating your meal plan.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get user's cooking experience from preferences
      let cookingExperience = 'beginner';
      if (session?.user) {
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.preferences) {
              cookingExperience = data.preferences.cookingExperience || 'beginner';
            }
          }
        } catch (error) {
          console.error('Error fetching cooking experience:', error);
        }
      } else {
        // Check localStorage for demo data
        const demoData = localStorage.getItem('demoOnboardingData');
        if (demoData) {
          try {
            const parsedData = JSON.parse(demoData);
            cookingExperience = parsedData.cookingExperience || 'beginner';
          } catch (error) {
            console.error('Error parsing demo data:', error);
          }
        }
      }

      // Debug: Log the plan data being sent
      console.log('Plan data being sent to API:', {
        store: planData.selectedStore,
        cuisinePreferences: planData.cuisinePreferences,
        dietaryRestrictions: planData.dietaryRestrictions,
        budget: planData.budget,
        householdSize: planData.householdSize,
        cookingExperience: cookingExperience,
        lunchPreference: planData.lunchPreference,
        cookLunchSeparately: planData.cookLunchSeparately,
        specialRequests: planData.specialRequests,
      });

      // Call meal planning API
      const mealPlanResponse = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: planData.selectedStore,
          cuisinePreferences: planData.cuisinePreferences,
          dietaryRestrictions: planData.dietaryRestrictions,
          budget: planData.budget,
          householdSize: planData.householdSize,
          cookingExperience: cookingExperience,
          lunchPreference: planData.lunchPreference,
          cookLunchSeparately: planData.cookLunchSeparately,
          specialRequests: planData.specialRequests,
        }),
      });

      if (!mealPlanResponse.ok) {
        const errorData = await mealPlanResponse.json();
        console.error('API Error:', errorData);
        throw new Error(`Failed to generate meal plan: ${errorData.error || 'Unknown error'}`);
      }

      const mealPlanData = await mealPlanResponse.json();
      
      if (!mealPlanData.success) {
        throw new Error(mealPlanData.error || 'Failed to generate meal plan');
      }

      // Store plan data and meal plan in localStorage
      localStorage.setItem('demoPlanData', JSON.stringify(planData));
      localStorage.setItem('generatedMealPlan', JSON.stringify(mealPlanData.mealPlan));
      
      // Redirect to meals page with plan data
      router.push('/meals');
      
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      // Create a fallback meal plan
      const fallbackMealPlan = {
        monday: {
          meal: "Pasta with Marinara Sauce",
          ingredients: ["Pasta", "Marinara sauce", "Parmesan cheese", "Garlic", "Olive oil"],
          totalCost: 8.50,
          cookingInstructions: "Boil pasta according to package directions. Heat marinara sauce in a pan. Mix together and serve with parmesan."
        },
        tuesday: {
          meal: "Grilled Chicken with Rice",
          ingredients: ["Chicken breast", "Rice", "Mixed vegetables", "Soy sauce", "Garlic"],
          totalCost: 12.00,
          cookingInstructions: "Season chicken and grill. Cook rice. Steam vegetables. Serve together with soy sauce."
        },
        wednesday: {
          meal: "Vegetable Stir Fry",
          ingredients: ["Mixed vegetables", "Tofu", "Soy sauce", "Ginger", "Rice"],
          totalCost: 9.75,
          cookingInstructions: "Cut vegetables and tofu. Stir fry in a hot pan with oil. Add soy sauce and ginger. Serve over rice."
        },
        thursday: {
          meal: "Fish and Potatoes",
          ingredients: ["White fish fillet", "Potatoes", "Lemon", "Herbs", "Butter"],
          totalCost: 14.25,
          cookingInstructions: "Season fish with herbs and lemon. Bake fish and roast potatoes in oven. Serve with lemon butter."
        },
        friday: {
          meal: "Tacos",
          ingredients: ["Ground beef", "Taco shells", "Lettuce", "Tomatoes", "Cheese", "Sour cream"],
          totalCost: 11.50,
          cookingInstructions: "Cook ground beef with taco seasoning. Warm taco shells. Assemble with toppings."
        },
        saturday: {
          meal: "Pizza Night",
          ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella cheese", "Pepperoni", "Vegetables"],
          totalCost: 13.00,
          cookingInstructions: "Roll out dough. Add sauce, cheese, and toppings. Bake at 450°F for 12-15 minutes."
        },
        sunday: {
          meal: "Roast Dinner",
          ingredients: ["Chicken", "Potatoes", "Carrots", "Onions", "Herbs", "Gravy"],
          totalCost: 16.75,
          cookingInstructions: "Season chicken with herbs. Roast with vegetables at 375°F for 1.5 hours. Make gravy from drippings."
        },
        totalWeeklyCost: 85.75,
        savings: 15.25
      };
      
      // Store plan data and fallback meal plan
      localStorage.setItem('demoPlanData', JSON.stringify(planData));
      localStorage.setItem('generatedMealPlan', JSON.stringify(fallbackMealPlan));
      
      // Redirect to meals page
      router.push('/meals');
    } finally {
      setIsGenerating(false);
    }
  };


  const CurrentStepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;

  // Show loading state while preferences are being loaded
  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Loading your preferences...</p>
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
          <div className="flex items-center gap-4">
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
              Plan your shopping trip
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
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                index <= currentStep 
                  ? 'bg-foreground text-background step-indicator-active' 
                  : 'bg-black/10 text-black/60 step-indicator'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-xs whitespace-nowrap step-indicator ${
                index <= currentStep ? 'text-foreground' : 'text-black/60'
              }`}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-2 flex-shrink-0 step-indicator ${
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
              data={planData}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
              isFirstStep={currentStep === 0}
              isLastStep={isLastStep}
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
                'Create my plan'
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
