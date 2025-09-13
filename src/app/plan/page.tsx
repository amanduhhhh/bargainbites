'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import HouseholdSizeStep from './components/HouseholdSizeStep';
import CookingExperienceStep from './components/CookingExperienceStep';
import PantryStaplesStep from './components/PantryStaplesStep';
import BudgetStep from './components/BudgetStep';
import EquipmentStep from './components/EquipmentStep';

export interface OnboardingData {
  householdSize: number;
  cookingExperience: 'beginner' | 'intermediate' | 'advanced';
  pantryStaples: string[];
  weeklyBudget: number;
  equipment: string[];
}

const STEPS = [
  { id: 'household', title: 'Household', component: HouseholdSizeStep },
  { id: 'cooking', title: 'Cooking Level', component: CookingExperienceStep },
  { id: 'pantry', title: 'Pantry Staples', component: PantryStaplesStep },
  { id: 'budget', title: 'Budget', component: BudgetStep },
  { id: 'equipment', title: 'Equipment', component: EquipmentStep },
];

export default function PlanPage() {
  const { user, isLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    householdSize: 1,
    cookingExperience: 'beginner',
    pantryStaples: [],
    weeklyBudget: 50,
    equipment: [],
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // TODO: Submit onboarding data to backend
    console.log('Onboarding data:', onboardingData);
    
    // Demo mode - show success message
    alert(`Demo mode: Your meal plan preferences have been collected!\n\nHousehold: ${onboardingData.householdSize} people\nCooking Level: ${onboardingData.cookingExperience}\nBudget: $${onboardingData.weeklyBudget}/week\nPantry Items: ${onboardingData.pantryStaples.length} selected\nEquipment: ${onboardingData.equipment.length} items\n\nIn the full version, this would generate your personalized meal plan!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-semibold mb-4">Sign in to create your meal plan</h1>
          <p className="text-sm text-black/60 mb-6">
            We need to know your preferences to generate personalized meal plans and shopping lists.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 w-full"
            >
              Sign in to continue
            </Link>
            <button
              onClick={() => setCurrentStep(0)}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-black/10 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] text-sm font-medium w-full"
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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] hover:underline underline-offset-4"
          >
            Bargain Bites
          </Link>
          <div className="text-sm text-black/60">
            Step {currentStep + 1} of {STEPS.length}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold">Create your meal plan</h1>
            <span className="text-sm text-black/60">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-black/10 rounded-full h-1">
            <div 
              className="bg-foreground h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= currentStep 
                  ? 'bg-foreground text-background' 
                  : 'bg-black/10 text-black/60'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-xs ${
                index <= currentStep ? 'text-foreground' : 'text-black/60'
              }`}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-2 ${
                  index < currentStep ? 'bg-foreground' : 'bg-black/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current step content */}
        <div className="mb-8">
          <CurrentStepComponent 
            data={onboardingData}
            updateData={updateData}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-black/10 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {isLastStep ? (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90"
            >
              Generate my plan
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
