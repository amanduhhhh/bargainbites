# Meal Planning Setup

## Gemini API Configuration

To enable the AI-powered meal planning feature, you need to set up a Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your environment variables:

### Option 1: Environment File
Create a `.env.local` file in the root directory:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### Option 2: System Environment Variable
Set the environment variable in your system:
```bash
export GEMINI_API_KEY=your_actual_api_key_here
```

## How It Works

1. **User completes the plan flow** - selects store, cuisine preferences, dietary restrictions, budget, and household size
2. **System loads flyer data** - reads the selected store's JSON file from `public/data/`
3. **Gemini AI analyzes** - processes the sale items and user preferences to create a personalized meal plan
4. **Meal plan generated** - returns 7 days of meals with ingredients, costs, and cooking instructions
5. **Results displayed** - shows the complete meal plan with cost breakdown and savings

## Features

- **Smart meal planning** based on current sales and user preferences
- **Budget optimization** using sale items to maximize savings
- **Cooking skill adaptation** - adjusts complexity based on user's experience level
- **Dietary restriction compliance** - respects user's dietary needs
- **Cost tracking** - shows individual meal costs and total weekly budget
- **Interactive details** - click to view ingredients and cooking instructions

## Supported Stores

- Zehrs
- Walmart  
- Sobeys
- Independent
- T&T Supermarket

## Data Structure

The flyer data is stored in `public/data/` as JSON files with the following structure:
```json
{
  "name": "Product Name",
  "price": 5.99,
  "measure": 1,
  "measure_unit": "kg",
  "unit_type": "each",
  "price_per_unit": 5.99,
  "savings_amount": "2.00",
  "savings_percentage": 25,
  "estimated_shelf_life": "Perishable",
  "multi_buy_required": false,
  "multi_buy_amount": 1,
  "other_info": "Additional product information"
}
```
