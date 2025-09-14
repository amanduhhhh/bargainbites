import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface FlyerItem {
  name: string;
  price: number;
  measure: number;
  measure_unit: string;
  unit_type: string;
  price_per_unit: number;
  savings_amount: string | null;
  savings_percentage: number | null;
  estimated_shelf_life: string;
  multi_buy_required: boolean;
  multi_buy_amount: number | null;
  other_info: string;
}

interface MealPlanRequest {
  store: string;
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  budget: number;
  householdSize: number;
  cookingExperience: string;
}

interface MealPlanResponse {
  success: boolean;
  mealPlan?: {
    monday: { meal: string; ingredients: string[]; totalCost: number };
    tuesday: { meal: string; ingredients: string[]; totalCost: number };
    wednesday: { meal: string; ingredients: string[]; totalCost: number };
    thursday: { meal: string; ingredients: string[]; totalCost: number };
    friday: { meal: string; ingredients: string[]; totalCost: number };
    saturday: { meal: string; ingredients: string[]; totalCost: number };
    sunday: { meal: string; ingredients: string[]; totalCost: number };
    totalWeeklyCost: number;
    savings: number;
  };
  error?: string;
}

// Map store IDs to file names
const storeFileMap: { [key: string]: string } = {
  'zehrs-conestoga': 'zehrs.json',
  'zehrs': 'zehrs.json',
  'walmart-farmers-market': 'walmart.json',
  'walmart': 'walmart.json',
  'sobeys': 'sobeys.json',
  'belfiores-independent': 'independent.json',
  'independent': 'independent.json',
  'tnt-supermarket': 't&t.json',
  't&t': 't&t.json',
  'real-canadian-superstore': 'zehrs.json' // Using zehrs data as fallback
};

// Map store IDs to display names
const storeDisplayNames: { [key: string]: string } = {
  'zehrs-conestoga': 'Zehrs',
  'zehrs': 'Zehrs',
  'walmart-farmers-market': 'Walmart',
  'walmart': 'Walmart',
  'sobeys': 'Sobeys',
  'belfiores-independent': 'Independent',
  'independent': 'Independent',
  'tnt-supermarket': 'T&T',
  't&t': 'T&T',
  'real-canadian-superstore': 'Real Canadian Superstore'
};

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not configured, using fallback meal plan');
      // Return a fallback meal plan instead of error
      const fallbackMealPlan = {
        monday: {
          meal: "Pasta with Marinara Sauce",
          ingredients: ["Pasta", "Marinara sauce", "Parmesan cheese", "Garlic", "Olive oil"],
          totalCost: 8.50,
          cookingInstructions: "Boil pasta according to package directions. Heat marinara sauce in a pan. Mix together and serve with parmesan."
        },
        tuesday: {
          meal: "Grilled Chicken with Rice",
          ingredients: ["Chicken breast", "Rice", "Mixed vegetables", "Soy sauce", "Garlic"],
          totalCost: 12.00,
          cookingInstructions: "Season chicken and grill. Cook rice. Steam vegetables. Serve together with soy sauce."
        },
        wednesday: {
          meal: "Vegetable Stir Fry",
          ingredients: ["Mixed vegetables", "Tofu", "Soy sauce", "Ginger", "Rice"],
          totalCost: 9.75,
          cookingInstructions: "Cut vegetables and tofu. Stir fry in a hot pan with oil. Add soy sauce and ginger. Serve over rice."
        },
        thursday: {
          meal: "Fish and Potatoes",
          ingredients: ["White fish fillet", "Potatoes", "Lemon", "Herbs", "Butter"],
          totalCost: 14.25,
          cookingInstructions: "Season fish with herbs and lemon. Bake fish and roast potatoes in oven. Serve with lemon butter."
        },
        friday: {
          meal: "Tacos",
          ingredients: ["Ground beef", "Taco shells", "Lettuce", "Tomatoes", "Cheese", "Sour cream"],
          totalCost: 11.50,
          cookingInstructions: "Cook ground beef with taco seasoning. Warm taco shells. Assemble with toppings."
        },
        saturday: {
          meal: "Pizza Night",
          ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella cheese", "Pepperoni", "Vegetables"],
          totalCost: 13.00,
          cookingInstructions: "Roll out dough. Add sauce, cheese, and toppings. Bake at 450°F for 12-15 minutes."
        },
        sunday: {
          meal: "Roast Dinner",
          ingredients: ["Chicken", "Potatoes", "Carrots", "Onions", "Herbs", "Gravy"],
          totalCost: 16.75,
          cookingInstructions: "Season chicken with herbs. Roast with vegetables at 375°F for 1.5 hours. Make gravy from drippings."
        },
        totalWeeklyCost: 85.75,
        savings: 15.25
      };
      
      return NextResponse.json({
        success: true,
        mealPlan: fallbackMealPlan
      });
    }

    const body: MealPlanRequest = await request.json();
    let { store, cuisinePreferences, dietaryRestrictions, budget, householdSize, cookingExperience } = body;

    // Debug logging
    console.log('Received meal plan request:', {
      store,
      cuisinePreferences,
      dietaryRestrictions,
      budget,
      householdSize,
      cookingExperience
    });

    // Validate required fields
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store is required' },
        { status: 400 }
      );
    }
    if (!cuisinePreferences || cuisinePreferences.length === 0) {
      // Provide a default cuisine preference if none are selected
      cuisinePreferences = ['american'];
    }
    if (!budget || budget <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid budget is required' },
        { status: 400 }
      );
    }
    if (!householdSize || householdSize <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid household size is required' },
        { status: 400 }
      );
    }

    // Load flyer data for the selected store
    const fileName = storeFileMap[store.toLowerCase()];
    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Invalid store selected' },
        { status: 400 }
      );
    }

    let flyerData: FlyerItem[];
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'data', fileName);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      flyerData = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading flyer data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load store data' },
        { status: 500 }
      );
    }

    // Filter items on sale (with savings)
    const saleItems = flyerData.filter(item => 
      item.savings_percentage && item.savings_percentage > 0
    );

    // Create a map of sale items for easy lookup
    const saleItemMap = new Map();
    saleItems.forEach(item => {
      // Normalize item names for better matching
      const normalizedName = item.name.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      saleItemMap.set(normalizedName, item);
    });

    // Create prompt for Gemini
    const prompt = `
You are a meal planning expert. Create a weekly meal plan (Monday to Sunday) based on the following:

STORE: ${store}
CUISINE PREFERENCES: ${cuisinePreferences.join(', ')}
DIETARY RESTRICTIONS: ${dietaryRestrictions.join(', ') || 'None'}
BUDGET: $${budget} per week
HOUSEHOLD SIZE: ${householdSize} people
COOKING EXPERIENCE: ${cookingExperience}

AVAILABLE SALE ITEMS:
${saleItems.slice(0, 50).map(item => 
  `- ${item.name}: $${item.price} (${item.measure}${item.measure_unit}) - ${item.savings_percentage}% off - Unit: ${item.unit_type}`
).join('\n')}

IMPORTANT: When creating meals, prioritize using these sale items and consider ingredient reuse across the week:
1. If it's from the sale items above, format as: "ingredient name [SALE:${storeDisplayNames[store] || store}] - $X.XX"
2. If it's not on sale, format as: "ingredient name - $X.XX" (use reasonable market prices)
3. Always include the actual price for each ingredient
4. Use the exact prices from the sale items when available
5. For non-sale items, estimate realistic grocery store prices
6. CONSIDER INGREDIENT REUSE: Plan meals that share common ingredients (e.g., if you buy a whole chicken, use it for multiple meals)
7. PORTION SIZING: When an ingredient is used in multiple meals, only show the price for the first meal, then mark subsequent uses with "[REUSED]" marker
8. REALISTIC QUANTITIES: Consider that a family of ${householdSize} might not finish a whole package of an ingredient in one meal

REQUIREMENTS:
1. Create 7 different meals (one for each day)
2. Use items from the sale list when possible to maximize savings
3. Consider the cooking experience level (${cookingExperience})
4. Ensure meals fit the cuisine preferences: ${cuisinePreferences.join(', ')}
5. Respect dietary restrictions: ${dietaryRestrictions.join(', ') || 'None'}
6. Stay within the $${budget} weekly budget, try to aim for 5% below the budget
7. Scale portions for ${householdSize} people
8. Include variety in the week (different proteins, vegetables, etc.)
9. Consider meal prep potential for busy days

For each meal, provide:
- Meal name
- List of ingredients (with quantities for ${householdSize} people)
- Estimated cost for that meal
- Detailed cooking instructions appropriate for ${cookingExperience} level

Format the response as a JSON object with this structure:
{
  "monday": {
    "meal": "Meal Name",
    "ingredients": ["ingredient 1 [SALE:Store] - $X.XX", "ingredient 2 - $X.XX", ...],
    "totalCost": 15.50,
    "cookingInstructions": "Brief instructions"
  },
  "tuesday": {
    "meal": "Another Meal",
    "ingredients": ["ingredient 1 [REUSED]", "new ingredient - $X.XX", ...],
    "totalCost": 8.25,
    "cookingInstructions": "Brief instructions"
  },
  "wednesday": { ... },
  "thursday": { ... },
  "friday": { ... },
  "saturday": { ... },
  "sunday": { ... },
  "totalWeeklyCost": 95.75,
  "savings": 25.30
}

Focus on using the sale items to create delicious, budget-friendly meals that match the user's preferences and skill level.
`;

    // Generate meal plan using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let mealPlan;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      return NextResponse.json(
        { success: false, error: 'Failed to parse meal plan response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mealPlan
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
