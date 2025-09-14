import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/mongodb';

// Helper function to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Helper function to estimate ingredient prices when not provided
function estimateIngredientPrice(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Common price estimates based on typical grocery prices
  if (lowerIngredient.includes('apple') || lowerIngredient.includes('banana') || lowerIngredient.includes('orange')) {
    return '$3.99';
  } else if (lowerIngredient.includes('lettuce') || lowerIngredient.includes('spinach') || lowerIngredient.includes('salad')) {
    return '$2.99';
  } else if (lowerIngredient.includes('tomato') || lowerIngredient.includes('cucumber') || lowerIngredient.includes('onion')) {
    return '$2.49';
  } else if (lowerIngredient.includes('cheese') && !lowerIngredient.includes('mac')) {
    return '$4.99';
  } else if (lowerIngredient.includes('milk') || lowerIngredient.includes('yogurt')) {
    return '$4.29';
  } else if (lowerIngredient.includes('egg')) {
    return '$3.99';
  } else if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || lowerIngredient.includes('pork')) {
    return '$8.99';
  } else if (lowerIngredient.includes('fish') || lowerIngredient.includes('salmon')) {
    return '$12.99';
  } else if (lowerIngredient.includes('bread') || lowerIngredient.includes('pasta')) {
    return '$2.99';
  } else if (lowerIngredient.includes('rice') || lowerIngredient.includes('quinoa')) {
    return '$3.49';
  } else if (lowerIngredient.includes('oil') || lowerIngredient.includes('olive')) {
    return '$5.99';
  } else if (lowerIngredient.includes('butter') || lowerIngredient.includes('margarine')) {
    return '$4.49';
  } else if (lowerIngredient.includes('potato')) {
    return '$3.99';
  } else if (lowerIngredient.includes('peanut butter') || lowerIngredient.includes('kraft')) {
    return '$5.99';
  } else if (lowerIngredient.includes('mac') && lowerIngredient.includes('cheese')) {
    return '$2.00';
  } else {
    // Default price for unknown items
    return '$3.99';
  }
}

// GET - Fetch all grocery list items for the user and meal plan ingredients for the specified week
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const weekParam = url.searchParams.get('week');
    
    // Determine which week to fetch (default to current week)
    let weekStart: Date;
    if (weekParam) {
      weekStart = getWeekStart(new Date(weekParam));
    } else {
      weekStart = getWeekStart(new Date());
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        groceryListItems: {
          orderBy: { createdAt: 'desc' }
        },
        mealPlans: {
          where: {
            weekStartDate: weekStart
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract meal plan ingredients if available
    let mealPlanIngredients: Array<{
      name: string;
      price: string;
      isOnSale: boolean;
      store: string;
      category: string;
      day: string;
    }> = [];
    let mealPlanData: {
      store: string;
      totalWeeklyCost: number;
      savings: number;
      weekStartDate: Date;
    } | null = null;
    
    if (user.mealPlans.length > 0) {
      const mealPlan = user.mealPlans[0];
      mealPlanData = {
        store: mealPlan.store,
        totalWeeklyCost: mealPlan.totalWeeklyCost,
        savings: mealPlan.savings,
        weekStartDate: mealPlan.weekStartDate
      };

      // Extract ingredients from each day
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const categorizedIngredients: { [key: string]: Array<{
        name: string;
        price: string;
        isOnSale: boolean;
        store: string;
        category: string;
        day: string;
      }> } = {
        'Produce': [],
        'Dairy': [],
        'Meat': [],
        'Pantry': [],
        'Bakery': []
      };

      days.forEach(day => {
        const dayMeal = mealPlan[day as keyof typeof mealPlan] as Record<string, unknown>;
        if (dayMeal && typeof dayMeal === 'object') {
          let ingredients: string[] = [];
          
          // Handle both single meal and lunch/dinner structure
          // If there are separate lunch/dinner meals, use those instead of main meal ingredients
          const lunch = dayMeal.lunch as Record<string, unknown> | undefined;
          const dinner = dayMeal.dinner as Record<string, unknown> | undefined;
          
          if (lunch && dinner && Array.isArray(lunch.ingredients) && Array.isArray(dinner.ingredients)) {
            // Use lunch and dinner ingredients when both exist
            ingredients = [...(lunch.ingredients as string[]), ...(dinner.ingredients as string[])];
          } else if (Array.isArray(dayMeal.ingredients)) {
            // Use main meal ingredients when no separate lunch/dinner
            ingredients = dayMeal.ingredients as string[];
          }

          // Process ingredients and categorize them
          ingredients.forEach(ingredient => {
            if (typeof ingredient === 'string') {
              // Parse ingredient string to extract name, price, and sale info
              const cleanIngredient = ingredient.replace(/\[REUSED\]/, '').trim();
              
              // Improved price extraction - handle various formats
              // Examples: "item - $5.99", "item [SALE:Store] - $5.99", "item $5.99"
              const priceMatch = cleanIngredient.match(/\$(\d+\.?\d*)/);
              const saleMatch = cleanIngredient.match(/\[SALE:([^\]]+)\]/);
              const isOnSale = !!saleMatch;
              const store = saleMatch ? saleMatch[1] : '';
              
              // Extract the actual ingredient name - handle multiple formats
              let name = cleanIngredient;
              
              // Remove sale info first
              name = name.replace(/\[SALE:[^\]]+\]/, '').trim();
              
              // Remove price (handle both "- $X.XX" and just "$X.XX")
              name = name.replace(/\s*-?\s*\$\d+\.?\d*\s*$/, '').trim();
              
              // Get price or estimate one if missing
              let price = '';
              if (priceMatch) {
                price = `$${priceMatch[1]}`;
              } else {
                // Estimate price based on common grocery items
                price = estimateIngredientPrice(name.toLowerCase());
              }
              
              // Simple categorization based on common ingredients
              let category = 'Pantry'; // default
              const lowerName = name.toLowerCase();
              
              if (lowerName.includes('lettuce') || lowerName.includes('tomato') || lowerName.includes('onion') || 
                  lowerName.includes('carrot') || lowerName.includes('spinach') || lowerName.includes('potato') ||
                  lowerName.includes('banana') || lowerName.includes('apple') || lowerName.includes('orange') ||
                  lowerName.includes('cucumber') || lowerName.includes('bell pepper') || lowerName.includes('mushroom')) {
                category = 'Produce';
              } else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || 
                        lowerName.includes('butter') || lowerName.includes('cream') || lowerName.includes('egg')) {
                category = 'Dairy';
              } else if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || 
                        lowerName.includes('fish') || lowerName.includes('turkey') || lowerName.includes('salmon') ||
                        lowerName.includes('ground') || lowerName.includes('steak')) {
                category = 'Meat';
              } else if (lowerName.includes('bread') || lowerName.includes('bun') || lowerName.includes('bagel') ||
                        lowerName.includes('croissant') || lowerName.includes('muffin')) {
                category = 'Bakery';
              }

              // Skip if we already have this ingredient in the category
              const existingItem = categorizedIngredients[category].find(item => item.name === name);
              if (!existingItem && name) {
                categorizedIngredients[category].push({
                  name,
                  price,
                  isOnSale,
                  store,
                  category,
                  day
                });
              }
            }
          });
        }
      });

      // Flatten categorized ingredients
      Object.keys(categorizedIngredients).forEach(category => {
        mealPlanIngredients = [...mealPlanIngredients, ...categorizedIngredients[category]];
      });
    }

    return NextResponse.json({ 
      items: user.groceryListItems,
      mealPlanIngredients,
      mealPlanData
    });
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new grocery list item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, quantity, notes } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newItem = await prisma.groceryListItem.create({
      data: {
        name: name.trim(),
        quantity: quantity?.trim() || null,
        notes: notes?.trim() || null,
        userId: user.id
      }
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating grocery list item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
