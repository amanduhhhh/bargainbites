'use client';

import { useState } from 'react';
import { PlanData } from '../page';

interface TransportStepProps {
  data: PlanData;
  updateData: (updates: Partial<PlanData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function TransportStep({ data, updateData }: TransportStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<string | null>(null);

  const handleHouseholdSizeChange = (size: number) => {
    updateData({ householdSize: size });
    
    // Trigger blinking animation
    setBlinkingButton(`household-${size}`);
    
    // Reset blinking state after animation completes
    setTimeout(() => {
      setBlinkingButton(null);
    }, 400);
  };

  const handleCarAccessChange = (hasCar: boolean) => {
    updateData({ hasCar });
    
    // Trigger blinking animation
    setBlinkingButton(`car-${hasCar}`);
    
    // Reset blinking state after animation completes
    setTimeout(() => {
      setBlinkingButton(null);
    }, 400);
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">Tell us about your shopping situation</h2>
      <p className="text-sm text-black/60 mb-6">
        This helps us recommend the best stores and suggest realistic shopping quantities.
      </p>
      
      <div className="space-y-8">
        {/* Household Size */}
        <div>
          <h3 className="text-base font-medium mb-3">How many people are buying groceries with you?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
              <button
                key={size}
                onClick={() => handleHouseholdSizeChange(size)}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  data.householdSize === size
                    ? 'border-foreground bg-foreground/5'
                    : 'border-black/10 hover:border-black/20'
                } ${blinkingButton === `household-${size}` ? 'animate-blink' : ''}`}
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
                onChange={(e) => handleHouseholdSizeChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          )}
        </div>

        {/* Car Access */}
        <div>
          <h3 className="text-base font-medium mb-3">Do you have access to a car?</h3>
          <p className="text-sm text-black/60 mb-4">
            This helps us determine if it&apos;s worth traveling to stores that are further away for better deals.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleCarAccessChange(true)}
              className={`p-6 rounded-lg border text-center transition-colors ${
                data.hasCar === true
                  ? 'border-foreground bg-foreground/5'
                  : 'border-black/10 hover:border-black/20'
              } ${blinkingButton === 'car-true' ? 'animate-blink' : ''}`}
            >
              <div className="text-3xl mb-2">🚗</div>
              <div className="font-medium">Yes, I have a car</div>
              <div className="text-sm text-black/60 mt-1">
                I can travel to stores within 15-20km
              </div>
            </button>
            
            <button
              onClick={() => handleCarAccessChange(false)}
              className={`p-6 rounded-lg border text-center transition-colors ${
                data.hasCar === false
                  ? 'border-foreground bg-foreground/5'
                  : 'border-black/10 hover:border-black/20'
              } ${blinkingButton === 'car-false' ? 'animate-blink' : ''}`}
            >
              <div className="text-3xl mb-2">🚶‍♀️</div>
              <div className="font-medium">No car access</div>
              <div className="text-sm text-black/60 mt-1">
                Walking, transit, or rideshare only
              </div>
            </button>
          </div>
        </div>

        {/* Transport Tips */}
       
      </div>
    </div>
  );
}
