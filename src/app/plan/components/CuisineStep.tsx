'use client';

import { useState } from 'react';
import { PlanData } from '../page';

interface CuisineStepProps {
  data: PlanData;
  updateData: (updates: Partial<PlanData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const CUISINE_OPTIONS = [
  { id: 'italian', name: 'Italian', emoji: '🍝', description: 'Pasta, pizza, risotto' },
  { id: 'mexican', name: 'Mexican', emoji: '🌮', description: 'Tacos, burritos, enchiladas' },
  { id: 'asian', name: 'Asian', emoji: '🍜', description: 'Stir-fries, curries, noodles' },
  { id: 'mediterranean', name: 'Mediterranean', emoji: '🥗', description: 'Greek, Turkish, Middle Eastern' },
  { id: 'american', name: 'American', emoji: '🍔', description: 'Burgers, BBQ, comfort food' },
  { id: 'indian', name: 'Indian', emoji: '🍛', description: 'Curries, biryani, tandoori' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢', description: 'Dumplings, fried rice, noodles' },
  { id: 'thai', name: 'Thai', emoji: '🌶️', description: 'Pad thai, curries, soups' },
  { id: 'japanese', name: 'Japanese', emoji: '🍣', description: 'Sushi, ramen, teriyaki' },
  { id: 'french', name: 'French', emoji: '🥐', description: 'Coq au vin, ratatouille' },
  { id: 'korean', name: 'Korean', emoji: '🍲', description: 'Bibimbap, kimchi, bulgogi' },
  { id: 'vietnamese', name: 'Vietnamese', emoji: '🍜', description: 'Pho, banh mi, spring rolls' },
];

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', name: 'Vegetarian', emoji: '🥬' },
  { id: 'vegan', name: 'Vegan', emoji: '🌱' },
  { id: 'gluten-free', name: 'Gluten-Free', emoji: '🌾' },
  { id: 'dairy-free', name: 'Dairy-Free', emoji: '🥛' },
  { id: 'nut-free', name: 'Nut-Free', emoji: '🥜' },
  { id: 'keto', name: 'Keto', emoji: '🥑' },
  { id: 'paleo', name: 'Paleo', emoji: '🥩' },
  { id: 'low-carb', name: 'Low-Carb', emoji: '🥒' },
  { id: 'halal', name: 'Halal', emoji: '🕌' },
  { id: 'kosher', name: 'Kosher', emoji: '✡️' },
];

const BUDGET_OPTIONS = [
  { value: 30, label: '$30/week', description: 'Budget-friendly meals' },
  { value: 50, label: '$50/week', description: 'Balanced variety' },
  { value: 75, label: '$75/week', description: 'More premium options' },
  { value: 100, label: '$100/week', description: 'Full variety' },
];

export default function CuisineStep({ data, updateData }: CuisineStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<string | null>(null);

  const handleCuisineToggle = (cuisineId: string) => {
    const currentCuisines = data.cuisinePreferences;
    const newCuisines = currentCuisines.includes(cuisineId)
      ? currentCuisines.filter(id => id !== cuisineId)
      : [...currentCuisines, cuisineId];
    
    updateData({ cuisinePreferences: newCuisines });
    
    // Trigger blinking animation
    setBlinkingButton(`cuisine-${cuisineId}`);
    setTimeout(() => setBlinkingButton(null), 400);
  };

  const handleDietaryToggle = (dietId: string) => {
    const currentDiets = data.dietaryRestrictions;
    const newDiets = currentDiets.includes(dietId)
      ? currentDiets.filter(id => id !== dietId)
      : [...currentDiets, dietId];
    
    updateData({ dietaryRestrictions: newDiets });
    
    // Trigger blinking animation
    setBlinkingButton(`diet-${dietId}`);
    setTimeout(() => setBlinkingButton(null), 400);
  };

  const handleBudgetChange = (budget: number) => {
    updateData({ budget });
    
    // Trigger blinking animation
    setBlinkingButton(`budget-${budget}`);
    setTimeout(() => setBlinkingButton(null), 400);
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">What kind of cuisine do you enjoy?</h2>
      <p className="text-sm text-black/60 mb-6">
        Select your favorite cuisines and any dietary preferences. We&apos;ll customize your meal plan accordingly.
      </p>
      
      <div className="space-y-8">
        {/* Cuisine Preferences */}
        <div>
          <h3 className="text-base font-medium mb-3">Cuisine Preferences</h3>
          <p className="text-sm text-black/60 mb-4">Select all that apply (you can choose multiple)</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CUISINE_OPTIONS.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => handleCuisineToggle(cuisine.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  data.cuisinePreferences.includes(cuisine.id)
                    ? 'border-foreground bg-foreground/5'
                    : 'border-black/10 hover:border-black/20'
                } ${blinkingButton === `cuisine-${cuisine.id}` ? 'animate-blink' : ''}`}
              >
                <div className="text-2xl mb-1">{cuisine.emoji}</div>
                <div className="text-sm font-medium">{cuisine.name}</div>
                <div className="text-xs text-black/60 mt-1">{cuisine.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h3 className="text-base font-medium mb-3">Dietary Restrictions</h3>
          <p className="text-sm text-black/60 mb-4">Select any dietary restrictions or preferences</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIETARY_RESTRICTIONS.map((diet) => (
              <button
                key={diet.id}
                onClick={() => handleDietaryToggle(diet.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  data.dietaryRestrictions.includes(diet.id)
                    ? 'border-foreground bg-foreground/5'
                    : 'border-black/10 hover:border-black/20'
                } ${blinkingButton === `diet-${diet.id}` ? 'animate-blink' : ''}`}
              >
                <div className="text-xl mb-1">{diet.emoji}</div>
                <div className="text-xs font-medium">{diet.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 className="text-base font-medium mb-3">Weekly Grocery Budget</h3>
          <p className="text-sm text-black/60 mb-4">How much would you like to spend per week?</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBudgetChange(option.value)}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  data.budget === option.value
                    ? 'border-foreground bg-foreground/5'
                    : 'border-black/10 hover:border-black/20'
                } ${blinkingButton === `budget-${option.value}` ? 'animate-blink' : ''}`}
              >
                <div className="text-lg font-semibold">{option.label}</div>
                <div className="text-xs text-black/60 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
      
      </div>
    </div>
  );
}
