import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
// Unsplash imports removed - image generation now handled on-demand

// Initialize Gemini AI and Prisma
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const prisma = new PrismaClient();

// Helper function to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Recipe generation functions removed - now handled on-demand in recipe page

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
  lunchPreference: string;
  specialRequests: string;
}

interface MealData {
  meal: string;
  ingredients: string[];
  totalCost: number;
  cookingInstructions?: string;
  lunch?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
  dinner?: { meal: string; ingredients: string[]; totalCost: number; cookingInstructions: string };
}

// EnhancedMealData interface removed - recipe details now generated on-demand


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

// Helper function to save meal plan to database
async function saveMealPlanToDatabase(
  userEmail: string,
  mealPlan: {
    monday?: MealData;
    tuesday?: MealData;
    wednesday?: MealData;
    thursday?: MealData;
    friday?: MealData;
    saturday?: MealData;
    sunday?: MealData;
    totalWeeklyCost?: number;
    savings?: number;
  },
  store: string,
  lunchPreference: string
) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error('User not found for email:', userEmail);
      return null;
    }

    const weekStart = getWeekStart(new Date());

    // Save meal plan to database
    const savedMealPlan = await prisma.mealPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: user.id,
          weekStartDate: weekStart
        }
      },
      update: {
        store,
        totalWeeklyCost: mealPlan.totalWeeklyCost || 0,
        savings: mealPlan.savings || 0,
        lunchPreference,
        monday: JSON.parse(JSON.stringify(mealPlan.monday || {})),
        tuesday: JSON.parse(JSON.stringify(mealPlan.tuesday || {})),
        wednesday: JSON.parse(JSON.stringify(mealPlan.wednesday || {})),
        thursday: JSON.parse(JSON.stringify(mealPlan.thursday || {})),
        friday: JSON.parse(JSON.stringify(mealPlan.friday || {})),
        saturday: JSON.parse(JSON.stringify(mealPlan.saturday || {})),
        sunday: JSON.parse(JSON.stringify(mealPlan.sunday || {})),
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        weekStartDate: weekStart,
        store,
        totalWeeklyCost: mealPlan.totalWeeklyCost || 0,
        savings: mealPlan.savings || 0,
        lunchPreference,
        monday: JSON.parse(JSON.stringify(mealPlan.monday || {})),
        tuesday: JSON.parse(JSON.stringify(mealPlan.tuesday || {})),
        wednesday: JSON.parse(JSON.stringify(mealPlan.wednesday || {})),
        thursday: JSON.parse(JSON.stringify(mealPlan.thursday || {})),
        friday: JSON.parse(JSON.stringify(mealPlan.friday || {})),
        saturday: JSON.parse(JSON.stringify(mealPlan.saturday || {})),
        sunday: JSON.parse(JSON.stringify(mealPlan.sunday || {}))
      }
    });

    return savedMealPlan;
  } catch (error) {
    console.error('Error saving meal plan to database:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    // Parse request body once
    const body: MealPlanRequest = await request.json();
    const { store, dietaryRestrictions, budget, householdSize, cookingExperience, lunchPreference, specialRequests } = body;
    let { cuisinePreferences } = body;
    
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
        savings: 14.25 // Default savings calculation (100 - 85.75)
      };
      
      // Save fallback meal plan to database if user is authenticated
      if (session?.user?.email) {
        try {
          await saveMealPlanToDatabase(
            session.user.email,
            fallbackMealPlan,
            store || 'Unknown',
            lunchPreference || ''
          );
          console.log('Fallback meal plan saved to database for user:', session.user.email);
        } catch (dbError) {
          console.error('Failed to save fallback meal plan to database:', dbError);
        }
      }
      
      return NextResponse.json({
        success: true,
        mealPlan: fallbackMealPlan
      });
    }

    // Process meal plan request

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

    // Create prompt for Gemini - focused on grocery information and meal planning
    const isCookLunch = lunchPreference === 'cook-lunch';
    const prompt = `
You are a grocery shopping and meal planning expert. Create a weekly meal plan (Monday to Sunday) focused on grocery selection and cost optimization based on the following:

STORE: ${store}
CUISINE PREFERENCES: ${cuisinePreferences.join(', ')}
DIETARY RESTRICTIONS: ${dietaryRestrictions.join(', ') || 'None'}
BUDGET: $${budget} per week
HOUSEHOLD SIZE: ${householdSize} people
COOKING EXPERIENCE: ${cookingExperience}
LUNCH PREFERENCE: ${lunchPreference || 'Not specified'}
SPECIAL REQUESTS: ${specialRequests || 'None'}

AVAILABLE SALE ITEMS:
${saleItems.slice(0, 50).map(item => 
  `- ${item.name}: $${item.price} (${item.measure}${item.measure_unit}) - ${item.savings_percentage}% off - Unit: ${item.unit_type}`
).join('\n')}

YOUR TASK: Focus on grocery selection, cost optimization, and meal structure. Provide:
1. Meal names that are descriptive and appealing
2. Ingredient lists with precise measurements for ${householdSize} people
3. Cost calculations using sale items when available
4. Basic cooking approach (detailed recipes will be generated separately)

IMPORTANT FORMATTING RULES:
1. If ingredient is from sale items: "ingredient name [SALE:${storeDisplayNames[store] || store}] - $X.XX"
2. If not on sale: "ingredient name - $X.XX" (use realistic market prices)
3. Include exact prices from sale items when available
4. For non-sale items, estimate realistic grocery store prices
5. CONSIDER INGREDIENT REUSE: Plan meals that share common ingredients
6. PORTION SIZING: When an ingredient is used in multiple meals, only show price for first meal, then mark subsequent uses with "[REUSED]"
7. REALISTIC QUANTITIES: Consider that a family of ${householdSize} might not finish a whole package in one meal

REQUIREMENTS:
1. ${isCookLunch ? 'Create 7 different lunch AND dinner meals (14 total meals)' : 'Create 7 different meals (one for each day)'}
2. Prioritize sale items to maximize savings
3. Ensure meals fit cuisine preferences: ${cuisinePreferences.join(', ')}
4. Respect dietary restrictions: ${dietaryRestrictions.join(', ') || 'None'}
5. Stay within $${budget} weekly budget (aim for 5% below)
6. Scale portions for ${householdSize} people
7. Include variety (different proteins, vegetables, etc.)
8. Consider meal prep potential for busy days
9. LUNCH CONSIDERATION: ${lunchPreference === 'cook-lunch' ? 'Plan separate lunch and dinner - lunch should be lighter and quicker, dinner more substantial' : lunchPreference === 'leftovers' ? 'Design dinner portions to provide good leftovers for lunch' : lunchPreference === 'buy-lunch' ? 'Focus on dinner meals only' : 'Consider general meal planning'}
10. SPECIAL REQUESTS: ${specialRequests ? `Incorporate: ${specialRequests}` : 'No special requests'}

For each meal, provide:
- Descriptive meal name
- Ingredient list with quantities and costs
- Total cost for that meal
- Basic cooking approach (brief, high-level instructions)

${isCookLunch ? `Format as JSON:
{
  "monday": {
    "meal": "Combined Day Name",
    "ingredients": ["combined ingredients with costs"],
    "totalCost": 25.50,
    "cookingInstructions": "Basic cooking approach",
    "lunch": {
      "meal": "Lunch Meal Name",
      "ingredients": ["lunch ingredients with costs"],
      "totalCost": 8.25,
      "cookingInstructions": "Basic lunch approach"
    },
    "dinner": {
      "meal": "Dinner Meal Name", 
      "ingredients": ["dinner ingredients with costs"],
      "totalCost": 17.25,
      "cookingInstructions": "Basic dinner approach"
    }
  },
  "tuesday": { ... },
  "wednesday": { ... },
  "thursday": { ... },
  "friday": { ... },
  "saturday": { ... },
  "sunday": { ... },
  "totalWeeklyCost": 95.75,
  "savings": 0
}` : `Format as JSON:
{
  "monday": {
    "meal": "Meal Name",
    "ingredients": ["ingredient 1 [SALE:Store] - $X.XX", "ingredient 2 - $X.XX", ...],
    "totalCost": 15.50,
    "cookingInstructions": "Basic cooking approach"
  },
  "tuesday": {
    "meal": "Another Meal",
    "ingredients": ["ingredient 1 [REUSED]", "new ingredient - $X.XX", ...],
    "totalCost": 8.25,
    "cookingInstructions": "Basic cooking approach"
  },
  "wednesday": { ... },
  "thursday": { ... },
  "friday": { ... },
  "saturday": { ... },
  "sunday": { ... },
  "totalWeeklyCost": 95.75,
  "savings": 0
}`}

Focus on grocery selection and cost optimization. Detailed recipes will be generated separately.
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

    // Calculate proper savings: budget - totalCost (or show over budget)
    const totalCost = mealPlan.totalWeeklyCost || 0;
    const savings = budget - totalCost;
    
    // Update the meal plan with correct savings calculation
    mealPlan.savings = savings;

    // Skip recipe enhancement during meal plan generation for speed
    // Recipes will be generated on-demand when users click on them

    // Save to database if user is authenticated
    if (session?.user?.email) {
      try {
        const savedMealPlan = await saveMealPlanToDatabase(
          session.user.email,
          mealPlan,
          store,
          lunchPreference
        );
        
        if (savedMealPlan) {
          console.log('Meal plan saved to database for user:', session.user.email);
        } else {
          console.log('Failed to save meal plan to database, but returning generated plan');
        }
      } catch (dbError) {
        console.error('Database save error (continuing with response):', dbError);
      }
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
