'use client';

import { useState } from 'react';
import { OnboardingData } from '../page';

interface PantryStaplesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const pantryCategories = {
  'Grains & Starches': [
    'Rice (white/brown)', 'Pasta', 'Bread', 'Oats', 'Quinoa', 'Barley', 'Flour', 'Cornmeal'
  ],
  'Proteins': [
    'Canned beans', 'Lentils', 'Chickpeas', 'Canned tuna/salmon', 'Peanut butter', 'Nuts', 'Seeds'
  ],
  'Cooking Basics': [
    'Olive oil', 'Vegetable oil', 'Butter', 'Salt', 'Black pepper', 'Garlic', 'Onions', 'Vinegar'
  ],
  'Spices & Herbs': [
    'Cumin', 'Paprika', 'Oregano', 'Basil', 'Thyme', 'Cinnamon', 'Ginger', 'Chili powder'
  ],
  'Canned & Jarred': [
    'Tomato sauce', 'Coconut milk', 'Broth/stock', 'Pickles', 'Olives', 'Salsa', 'Jam/preserves'
  ],
  'Dairy & Eggs': [
    'Milk', 'Cheese', 'Yogurt', 'Eggs', 'Cream cheese', 'Parmesan', 'Sour cream'
  ]
};

export default function PantryStaplesStep({ data, updateData }: PantryStaplesStepProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleStapleToggle = (staple: string) => {
    const currentStaples = data.pantryStaples;
    const updatedStaples = currentStaples.includes(staple)
      ? currentStaples.filter(s => s !== staple)
      : [...currentStaples, staple];
    
    updateData({ pantryStaples: updatedStaples });
  };

  const filteredCategories = Object.entries(pantryCategories).map(([category, items]) => [
    category,
    items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ]).filter(([, items]) => (items as string[]).length > 0) as [string, string[]][];

  return (
    <div>
      <h2 className="text-lg font-medium mb-2">What pantry staples do you already have?</h2>
      <p className="text-sm text-black/60 mb-4">
        Select items you already have at home. This helps us avoid suggesting recipes that require ingredients you already own.
      </p>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search pantry items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredCategories.map(([category, items]) => (
          <div key={category}>
            <h3 className="font-medium text-sm mb-2 text-black/80">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleStapleToggle(item)}
                  className={`p-2 rounded text-left text-sm transition-colors ${
                    data.pantryStaples.includes(item)
                      ? 'bg-foreground text-background'
                      : 'bg-black/5 hover:bg-black/10 border border-black/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data.pantryStaples.length > 0 && (
        <div className="mt-4 p-3 bg-black/5 rounded-lg">
          <div className="text-sm font-medium mb-2">Selected items ({data.pantryStaples.length}):</div>
          <div className="flex flex-wrap gap-1">
            {data.pantryStaples.map((staple) => (
              <span
                key={staple}
                className="inline-flex items-center gap-1 px-2 py-1 bg-foreground text-background text-xs rounded"
              >
                {staple}
                <button
                  onClick={() => handleStapleToggle(staple)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
