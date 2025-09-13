'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocationStep from './components/LocationStep';
import TransportStep from './components/TransportStep';
import MapStep from './components/MapStep';
import CuisineStep from './components/CuisineStep';

export interface PlanData {
  postalCode: string;
  householdSize: number;
  hasCar: boolean;
  selectedStore: string | null;
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  budget: number;
}

const STEPS = [
  { id: 'location', title: 'Location', component: LocationStep },
  { id: 'transport', title: 'Transport', component: TransportStep },
  { id: 'map', title: 'Store Selection', component: MapStep },
  { id: 'cuisine', title: 'Preferences', component: CuisineStep },
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
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
  const [planData, setPlanData] = useState<PlanData>({
    postalCode: '',
    householdSize: 1,
    hasCar: false,
    selectedStore: null,
    cuisinePreferences: [],
    dietaryRestrictions: [],
    budget: 50,
  });

  const updateData = (updates: Partial<PlanData>) => {
    setPlanData(prev => ({ ...prev, ...updates }));
  };

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
    setIsGenerating(true);
    
    // TODO: Submit plan data to backend
    console.log('Plan data:', planData);
    
    // Store plan data in localStorage for demo mode
    if (isDemoMode) {
      localStorage.setItem('demoPlanData', JSON.stringify(planData));
    }
    
    // Add artificial load delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to meals page with plan data
    router.push('/meals');
  };

  const startDemoMode = () => {
    setIsDemoMode(true);
    setCurrentStep(0);
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

  if (!user && !isDemoMode) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-semibold mb-4">Create your shopping plan</h1>
          <p className="text-sm text-black/60 mb-6">
            We&apos;ll help you find the best deals and plan your grocery shopping trip.
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
            Note: Your plan won&apos;t be saved without signing in
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
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Demo Mode
                </span>
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
              {isDemoMode ? 'Demo: Plan your shopping trip' : 'Plan your shopping trip'}
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
