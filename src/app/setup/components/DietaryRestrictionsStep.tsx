'use client';

import { useState } from 'react';
import { OnboardingData } from '../page';

interface DietaryRestrictionsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

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

export default function DietaryRestrictionsStep({ data, updateData }: DietaryRestrictionsStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<string | null>(null);

  const handleDietaryToggle = (dietId: string) => {
    const currentDiets = data.dietaryRestrictions || [];
    const newDiets = currentDiets.includes(dietId)
      ? currentDiets.filter(id => id !== dietId)
      : [...currentDiets, dietId];
    
    updateData({ dietaryRestrictions: newDiets });
    
    // Trigger blinking animation
    setBlinkingButton(`diet-${dietId}`);
    setTimeout(() => setBlinkingButton(null), 400);
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">Dietary Restrictions</h2>
      <p className="text-sm text-black/60 mb-6">
        Select any dietary restrictions or preferences. We&apos;ll customize your meal plan accordingly.
      </p>
      
      <div className="space-y-6">
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
                  (data.dietaryRestrictions || []).includes(diet.id)
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

        {/* Summary */}
    
      </div>
    </div>
  );
}
