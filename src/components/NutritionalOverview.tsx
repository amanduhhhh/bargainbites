'use client';

import { useMemo } from 'react';

interface NutritionalData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

interface WeeklyMeal {
  id: string;
  day: string;
  meal: string;
  isSet: boolean;
  ingredients?: string[];
  totalCost?: number;
  cookingInstructions?: string;
  lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
}

interface NutritionalOverviewProps {
  weeklyMeals: WeeklyMeal[];
  lunchPreference: string;
  householdSize: number;
}

// Recommended Daily Intake (RDI) for an average adult (2000 calorie diet)
const RDI = {
  calories: 2000,
  protein: 50, // grams
  carbs: 300, // grams
  fats: 65, // grams
  fiber: 25, // grams
};

// Basic nutrition estimation based on common ingredients
const nutritionDatabase: Record<string, NutritionalData> = {
  // Proteins
  'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'beef': { calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0 },
  'pork': { calories: 242, protein: 27, carbs: 0, fats: 14, fiber: 0 },
  'fish': { calories: 206, protein: 22, carbs: 0, fats: 12, fiber: 0 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0 },
  'turkey': { calories: 135, protein: 30, carbs: 0, fats: 1, fiber: 0 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fats: 4.8, fiber: 0.3 },
  'beans': { calories: 245, protein: 15, carbs: 45, fats: 1, fiber: 15 },
  'lentils': { calories: 230, protein: 18, carbs: 40, fats: 0.8, fiber: 15.6 },
  
  // Carbs
  'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 },
  'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
  'potato': { calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2 },
  'quinoa': { calories: 222, protein: 8, carbs: 39, fats: 3.6, fiber: 5.2 },
  'oats': { calories: 389, protein: 17, carbs: 66, fats: 7, fiber: 10.6 },
  
  // Vegetables
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2 },
  'carrots': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1, fiber: 1.7 },
  'bell pepper': { calories: 31, protein: 1, carbs: 7, fats: 0.3, fiber: 2.5 },
  'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, fiber: 1 },
  
  // Fruits
  'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4 },
  
  // Fats/Oils
  'olive oil': { calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81, fiber: 0 },
  'avocado': { calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 },
  'nuts': { calories: 607, protein: 20, carbs: 21, fats: 54, fiber: 8 },
  'cheese': { calories: 113, protein: 7, carbs: 1, fats: 9, fiber: 0 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1, fiber: 0 },
  
  // Default for unknown ingredients
  'default': { calories: 50, protein: 2, carbs: 8, fats: 1, fiber: 1 },
};

export default function NutritionalOverview({ weeklyMeals, lunchPreference, householdSize }: NutritionalOverviewProps) {
  
  const weeklyNutrition = useMemo(() => {
    const totalNutrition: NutritionalData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    };

    weeklyMeals.forEach((meal) => {
      if (!meal.isSet) return;

      const processMealIngredients = (ingredients: string[]) => {
        const mealNutrition: NutritionalData = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
        };

        ingredients.forEach((ingredient) => {
          // Clean ingredient name and match with nutrition database
          const cleanIngredient = ingredient
            .replace(/\s*\[SALE:[^\]]+\]\s*/g, '') // Remove [SALE:Store] marker
            .replace(/\s*-\s*\$\d+\.?\d*\s*$/g, '') // Remove price
            .replace(/\s*\[REUSED\]\s*/g, '') // Remove [REUSED] marker
            .toLowerCase()
            .trim();

          // Find matching nutrition data
          let nutritionData = nutritionDatabase['default'];
          
          for (const [key, data] of Object.entries(nutritionDatabase)) {
            if (cleanIngredient.includes(key) || key.includes(cleanIngredient)) {
              nutritionData = data;
              break;
            }
          }

          // Scale nutrition per serving (assuming ingredient serves household size)
          const servingFactor = 1 / householdSize;
          mealNutrition.calories += nutritionData.calories * servingFactor;
          mealNutrition.protein += nutritionData.protein * servingFactor;
          mealNutrition.carbs += nutritionData.carbs * servingFactor;
          mealNutrition.fats += nutritionData.fats * servingFactor;
          mealNutrition.fiber += nutritionData.fiber * servingFactor;
        });

        return mealNutrition;
      };

      // Process ingredients based on lunch preference
      if (lunchPreference === 'cook-lunch' && meal.lunch && meal.dinner) {
        const lunchNutrition = processMealIngredients(meal.lunch.ingredients);
        const dinnerNutrition = processMealIngredients(meal.dinner.ingredients);
        
        totalNutrition.calories += lunchNutrition.calories + dinnerNutrition.calories;
        totalNutrition.protein += lunchNutrition.protein + dinnerNutrition.protein;
        totalNutrition.carbs += lunchNutrition.carbs + dinnerNutrition.carbs;
        totalNutrition.fats += lunchNutrition.fats + dinnerNutrition.fats;
        totalNutrition.fiber += lunchNutrition.fiber + dinnerNutrition.fiber;
      } else if (meal.ingredients) {
        const mealNutrition = processMealIngredients(meal.ingredients);
        totalNutrition.calories += mealNutrition.calories;
        totalNutrition.protein += mealNutrition.protein;
        totalNutrition.carbs += mealNutrition.carbs;
        totalNutrition.fats += mealNutrition.fats;
        totalNutrition.fiber += mealNutrition.fiber;
      }
    });

    return totalNutrition;
  }, [weeklyMeals, lunchPreference, householdSize]);

  // Calculate weekly RDI (7 days)
  const weeklyRDI = {
    calories: RDI.calories * 7,
    protein: RDI.protein * 7,
    carbs: RDI.carbs * 7,
    fats: RDI.fats * 7,
    fiber: RDI.fiber * 7,
  };

  // Calculate percentages
  const percentages = {
    calories: (weeklyNutrition.calories / weeklyRDI.calories) * 100,
    protein: (weeklyNutrition.protein / weeklyRDI.protein) * 100,
    carbs: (weeklyNutrition.carbs / weeklyRDI.carbs) * 100,
    fats: (weeklyNutrition.fats / weeklyRDI.fats) * 100,
    fiber: (weeklyNutrition.fiber / weeklyRDI.fiber) * 100,
  };

  // Determine balance status
  const getBalanceStatus = () => {
    const { protein, carbs, fats, fiber } = percentages;
    
    if (protein < 70) return { status: 'Low Protein', color: 'text-orange-600' };
    if (fiber < 60) return { status: 'Low Fiber', color: 'text-orange-600' };
    if (carbs < 60) return { status: 'Low Carbs', color: 'text-orange-600' };
    if (fats < 60) return { status: 'Low Fats', color: 'text-orange-600' };
    if (protein > 130 || carbs > 130 || fats > 130) return { status: 'High Intake', color: 'text-red-600' };
    
    return { status: 'Balanced', color: 'text-green-600' };
  };

  const balance = getBalanceStatus();

  const ProgressBar = ({ label, value, percentage, unit, rdi }: { 
    label: string; 
    value: number; 
    percentage: number; 
    unit: string;
    rdi: number;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-black/60">{label}</span>
        <span className="font-medium">{value.toFixed(1)}{unit} / {rdi.toFixed(0)}{unit}</span>
      </div>
      <div className="w-full bg-black/10 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            percentage >= 100 ? 'bg-loblaws-orange' : 
            percentage >= 70 ? 'bg-loblaws-orange' : 
            'bg-loblaws-orange'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-black/50 text-right">
        {percentage.toFixed(0)}% of RDI
      </div>
    </div>
  );

  // Only show if there are set meals
  const setMealsCount = weeklyMeals.filter(meal => meal.isSet).length;
  if (setMealsCount === 0) return null;

  return (
    <div className=" pr-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Nutritional Overview</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-sm bg-loblaws-orange text-white
        }`}>
          {balance.status}
        </span>
      </div>

      <div className="text-xs text-black/60 mb-3">
        Weekly totals for {setMealsCount} planned meal{setMealsCount !== 1 ? 's' : ''}
      </div>

      <div className="space-y-3">
        <ProgressBar 
          label="Calories" 
          value={weeklyNutrition.calories} 
          percentage={percentages.calories}
          unit=""
          rdi={weeklyRDI.calories}
        />
        <ProgressBar 
          label="Protein" 
          value={weeklyNutrition.protein} 
          percentage={percentages.protein}
          unit="g"
          rdi={weeklyRDI.protein}
        />
        <ProgressBar 
          label="Carbs" 
          value={weeklyNutrition.carbs} 
          percentage={percentages.carbs}
          unit="g"
          rdi={weeklyRDI.carbs}
        />
        <ProgressBar 
          label="Fats" 
          value={weeklyNutrition.fats} 
          percentage={percentages.fats}
          unit="g"
          rdi={weeklyRDI.fats}
        />
        <ProgressBar 
          label="Fiber" 
          value={weeklyNutrition.fiber} 
          percentage={percentages.fiber}
          unit="g"
          rdi={weeklyRDI.fiber}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-black/10">
        <div className="text-xs text-black/60">
          Based on estimated nutrition data and household size of {householdSize}
        </div>
      </div>
    </div>
  );
}
