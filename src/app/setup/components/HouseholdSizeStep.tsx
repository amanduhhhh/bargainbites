'use client';

import { useState } from 'react';
import { OnboardingData } from '../page';

interface HouseholdSizeStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export default function HouseholdSizeStep({ data, updateData }: HouseholdSizeStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<number | null>(null);

  const handleSizeChange = (size: number) => {
    updateData({ householdSize: size });
    
    // Trigger blinking animation
    setBlinkingButton(size);
    
    // Reset blinking state after animation completes
    setTimeout(() => {
      setBlinkingButton(null);
    }, 400); // Match the animation duration from CSS
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">How many people are in your household?</h2>
      <p className="text-sm text-black/60 mb-6">
        This helps us calculate the right portion sizes and quantities for your meal plan.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
          <button
            key={size}
            onClick={() => handleSizeChange(size)}
            className={`p-4 rounded-lg border text-center transition-colors ${
              data.householdSize === size
                ? 'border-foreground bg-foreground/5'
                : 'border-black/10 hover:border-black/20'
            } ${blinkingButton === size ? 'animate-blink' : ''}`}
          >
            <div className="text-2xl font-semibold">{size}</div>
            <div className="text-xs text-black/60 mt-1">
              {size === 1 ? 'person' : 'people'}
            </div>
          </button>
        ))}
      </div>
      
      {data.householdSize > 8 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Custom number (8+ people)
          </label>
          <input
            type="number"
            min="9"
            max="20"
            value={data.householdSize}
            onChange={(e) => handleSizeChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      )}
    </div>
  );
}
