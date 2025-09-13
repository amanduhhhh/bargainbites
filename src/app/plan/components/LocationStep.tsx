'use client';

import { useState } from 'react';
import { PlanData } from '../page';

interface LocationStepProps {
  data: PlanData;
  updateData: (updates: Partial<PlanData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function LocationStep({ data, updateData }: LocationStepProps) {
  const [postalCode, setPostalCode] = useState(data.postalCode);
  const [isValid, setIsValid] = useState(false);

  const validatePostalCode = (code: string) => {
    // Canadian postal code validation (A1A 1A1 format)
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
    return canadianPostalRegex.test(code);
  };

  const handlePostalCodeChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/\s/g, '');
    let displayValue = value.toUpperCase();
    
    // Auto-format as user types
    if (formatted.length >= 3 && !displayValue.includes(' ')) {
      displayValue = formatted.slice(0, 3) + ' ' + formatted.slice(3);
    }
    
    setPostalCode(displayValue);
    const valid = validatePostalCode(displayValue);
    setIsValid(valid);
    
    if (valid) {
      updateData({ postalCode: displayValue });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      updateData({ postalCode });
    }
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">Where are you cooking?</h2>
      <p className="text-sm text-black/60 mb-6">
        Enter your postal code so we can find the best grocery stores near you and show you local deals.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
            Postal Code
          </label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            placeholder="A1A 1A1"
            maxLength={7}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              isValid 
                ? 'border-green-500 focus:ring-green-500/20' 
                : postalCode.length > 0 
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-black/10 focus:ring-foreground/20'
            }`}
          />
          {postalCode.length > 0 && !isValid && (
            <p className="text-sm text-red-600 mt-1">
              Please enter a valid Canadian postal code (e.g., A1A 1A1)
            </p>
          )}
          {isValid && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Valid postal code
            </p>
          )}
        </div>

       
      </form>
    </div>
  );
}
