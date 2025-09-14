'use client';

import { useState } from 'react';
import { PlanData } from '../page';

interface MealTypesStepProps {
  data: PlanData;
  updateData: (updates: Partial<PlanData>) => void;
}

const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅', description: 'Start your day right' },
  { id: 'lunch', label: 'Lunch', emoji: '🥪', description: 'Midday fuel' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️', description: 'Evening meal' },
  { id: 'snacks', label: 'Snacks', emoji: '🍎', description: 'Between meals' },
];

export default function MealTypesStep({ data, updateData }: MealTypesStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<string | null>(null);

  const handleMealToggle = (mealId: string) => {
    const currentMeals = data.mealTypes;
    const newMeals = currentMeals.includes(mealId)
      ? currentMeals.filter(id => id !== mealId)
      : [...currentMeals, mealId];
    
    updateData({ mealTypes: newMeals });
    
    // Trigger blinking animation
    setBlinkingButton(`meal-${mealId}`);
    setTimeout(() => setBlinkingButton(null), 400);
  };

  const handleNotesChange = (value: string) => {
    if (value.length <= 100) {
      updateData({ additionalNotes: value });
    }
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">What meals do you want planned?</h2>
      <p className="text-sm text-black/60 mb-6">
        Select which meals you&apos;d like us to plan for you. You can choose multiple options.
      </p>
      
      <div className="space-y-8">
        {/* Meal Type Selection */}
        <div>
          <h3 className="text-base font-medium mb-3">Meal Types</h3>
          <p className="text-sm text-black/60 mb-4">Select all that apply (you can choose multiple)</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MEAL_OPTIONS.map((meal) => (
              <button
                key={meal.id}
                onClick={() => handleMealToggle(meal.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  data.mealTypes.includes(meal.id)
                    ? 'border-foreground bg-foreground/5'
                    : 'border-black/10 hover:border-black/20'
                } ${blinkingButton === `meal-${meal.id}` ? 'animate-blink' : ''}`}
              >
                <div className="text-2xl mb-1">{meal.emoji}</div>
                <div className="text-sm font-medium">{meal.label}</div>
                <div className="text-xs text-black/60 mt-1">{meal.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <h3 className="text-base font-medium mb-3">Additional Notes (Optional)</h3>
          <p className="text-sm text-black/60 mb-4">Any specific requests, ingredients to use, or additional preferences</p>
          
          <div className="relative">
            <textarea
              value={data.additionalNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g., 'Use lots of vegetables', 'Include meal prep options', 'Avoid spicy foods'..."
              className="w-full p-3 border border-black/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
              rows={3}
              maxLength={100}
            />
            <div className="absolute bottom-2 right-2 text-xs text-black/40">
              {data.additionalNotes.length}/100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
