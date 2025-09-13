'use client';

import { useState } from 'react';
import { OnboardingData } from '../page';

interface CookingExperienceStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const experienceLevels = [
  {
    id: 'beginner' as const,
    title: 'Beginner',
    description: 'I can follow simple recipes and cook basic meals',
    examples: 'Pasta, scrambled eggs, simple salads',
    timeEstimate: '15-30 min per meal'
  },
  {
    id: 'intermediate' as const,
    title: 'Intermediate',
    description: 'I can cook most dishes and experiment with flavors',
    examples: 'Stir-fries, roasted vegetables, homemade sauces',
    timeEstimate: '30-45 min per meal'
  },
  {
    id: 'advanced' as const,
    title: 'Advanced',
    description: 'I enjoy complex recipes and cooking techniques',
    examples: 'Multi-step dishes, fermentation, knife skills',
    timeEstimate: '45+ min per meal'
  }
];

export default function CookingExperienceStep({ data, updateData }: CookingExperienceStepProps) {
  const [blinkingButton, setBlinkingButton] = useState<string | null>(null);

  const handleExperienceChange = (experience: 'beginner' | 'intermediate' | 'advanced') => {
    updateData({ cookingExperience: experience });
    
    // Trigger blinking animation
    setBlinkingButton(experience);
    
    // Reset blinking state after animation completes
    setTimeout(() => {
      setBlinkingButton(null);
    }, 400); // Match the animation duration from CSS
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">What&apos;s your cooking experience level?</h2>
      <p className="text-sm text-black/60 mb-6">
        This helps us suggest recipes that match your comfort level and available time.
      </p>
      
      <div className="space-y-3">
        {experienceLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => handleExperienceChange(level.id)}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              data.cookingExperience === level.id
                ? 'border-foreground bg-foreground/5'
                : 'border-black/10 hover:border-black/20'
            } ${blinkingButton === level.id ? 'animate-blink' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{level.title}</h3>
                <p className="text-sm text-black/60 mb-2">{level.description}</p>
                <div className="text-xs text-black/50">
                  <div className="mb-1">
                    <span className="font-medium">Examples:</span> {level.examples}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {level.timeEstimate}
                  </div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ml-4 mt-1 ${
                data.cookingExperience === level.id
                  ? 'border-foreground bg-foreground'
                  : 'border-black/20'
              }`}>
                {data.cookingExperience === level.id && (
                  <div className="w-2 h-2 bg-background rounded-full m-0.5" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
