'use client';

import { useState } from 'react';
import { PlanData } from '../page';

interface LunchPreferencesStepProps {
  data: PlanData;
  updateData: (updates: Partial<PlanData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const LUNCH_OPTIONS = [
  { 
    id: 'cook-lunch', 
    name: 'Cook lunch at home', 
    emoji: '🍳', 
    description: 'I\'ll prepare fresh lunches daily or use leftovers' 
  },
  { 
    id: 'leftovers', 
    name: 'Eat leftovers', 
    emoji: '🍽️', 
    description: 'I\'m happy to eat dinner leftovers for lunch' 
  },
  { 
    id: 'buy-lunch', 
    name: 'Buy lunch externally', 
    emoji: '🥪', 
    description: 'I prefer to buy lunch from restaurants or cafes' 
  },
];

export default function LunchPreferencesStep({ data, updateData }: LunchPreferencesStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState(data.specialRequests || '');
  const [cookLunchSeparately, setCookLunchSeparately] = useState(data.cookLunchSeparately || false);

  const handleLunchToggle = (lunchId: string) => {
    updateData({ lunchPreference: lunchId });
    
    // Trigger blinking animation
    setBlinkingButton(`lunch-${lunchId}`);
    setTimeout(() => setBlinkingButton(null), 400);
  };

  const handleSpecialRequestsChange = (value: string) => {
    if (value.length <= 100) {
      setSpecialRequests(value);
      updateData({ specialRequests: value });
    }
  };

  const handleCookLunchToggle = (value: boolean) => {
    setCookLunchSeparately(value);
    updateData({ cookLunchSeparately: value });
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">What about lunch?</h2>
      <p className="text-sm text-black/60 mb-6">
        Let us know your lunch preferences so we can plan your meals accordingly.
      </p>
      
      <div className="space-y-8">
        {/* Lunch Preferences */}
        <div>
          <h3 className="text-base font-medium mb-3">Lunch Preference</h3>
          <p className="text-sm text-black/60 mb-4">How do you typically handle lunch?</p>
          
          <div className="space-y-3">
            {LUNCH_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleLunchToggle(option.id)}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  data.lunchPreference === option.id
                    ? 'border-foreground bg-foreground/5'
                    : 'border-black/10 hover:border-black/20'
                } ${blinkingButton === `lunch-${option.id}` ? 'animate-blink' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{option.emoji}</div>
                  <div>
                    <div className="text-sm font-medium">{option.name}</div>
                    <div className="text-xs text-black/60 mt-1">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cook Lunch Separately Toggle - Only show when "Cook lunch at home" is selected */}
        

        {/* Special Requests */}
        <div>
          <h3 className="text-base font-medium mb-3">Special Requests</h3>
          <p className="text-sm text-black/60 mb-4">
            Any specific ingredients, cooking methods, or meal preferences? (Optional)
          </p>
          
          <div>
            <textarea
              value={specialRequests}
              onChange={(e) => handleSpecialRequestsChange(e.target.value)}
              placeholder="e.g., I love spicy food, prefer oven-baked meals, avoid mushrooms..."
              maxLength={100}
              rows={3}
              className="w-full px-4 py-3 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-black/60">
                Let us know about any specific preferences or requirements
              </p>
              <span className="text-xs text-black/40">
                {specialRequests.length}/100
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
