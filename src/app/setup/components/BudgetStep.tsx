'use client';

import { useState } from 'react';
import { OnboardingData } from '../page';

interface BudgetStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const budgetPresets = [
  { amount: 30, label: '$30', description: 'Very tight budget' },
  { amount: 50, label: '$50', description: 'Moderate budget' },
  { amount: 75, label: '$75', description: 'Comfortable budget' },
  { amount: 100, label: '$100', description: 'Flexible budget' },
  { amount: 150, label: '$150', description: 'Generous budget' }
];

export default function BudgetStep({ data, updateData }: BudgetStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<number | null>(null);

  const handleBudgetChange = (amount: number) => {
    updateData({ weeklyBudget: amount });
    
    // Trigger blinking animation
    setBlinkingButton(amount);
    
    // Reset blinking state after animation completes
    setTimeout(() => {
      setBlinkingButton(null);
    }, 400); // Match the animation duration from CSS
  };

  const handleCustomBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    handleBudgetChange(value);
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">What&apos;s your weekly grocery budget?</h2>
      <p className="text-sm text-black/60 mb-6">
        This helps us create meal plans that fit your budget while maximizing savings from flyer deals.
      </p>
      
      <div className="space-y-3 mb-6">
        {budgetPresets.map((preset) => (
          <button
            key={preset.amount}
            onClick={() => handleBudgetChange(preset.amount)}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              data.weeklyBudget === preset.amount
                ? 'border-foreground bg-foreground/5'
                : 'border-black/10 hover:border-black/20'
            } ${blinkingButton === preset.amount ? 'animate-blink' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-lg">{preset.label}</div>
                <div className="text-sm text-black/60">{preset.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                data.weeklyBudget === preset.amount
                  ? 'border-foreground bg-foreground'
                  : 'border-black/20'
              }`}>
                {data.weeklyBudget === preset.amount && (
                  <div className="w-2 h-2 bg-background rounded-full m-0.5" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-black/10 pt-4">
        <label className="block text-sm font-medium mb-2">
          Or enter a custom amount
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg">$</span>
          <input
            type="number"
            min="10"
            max="500"
            step="5"
            value={data.weeklyBudget}
            onChange={handleCustomBudget}
            className="flex-1 px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Enter amount"
          />
          <span className="text-sm text-black/60">per week</span>
        </div>
      </div>

      {data.weeklyBudget > 0 && (
        <div className="mt-4 p-3 bg-black/5 rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-1">Budget breakdown estimate:</div>
            <div className="text-black/60">
              • About ${Math.round(data.weeklyBudget / 7).toFixed(0)} per day<br/>
              • ${Math.round(data.weeklyBudget / (data.householdSize * 7)).toFixed(0)} per person per day
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
