# Meal Planning Setup

## AI API Configuration

To enable the AI-powered meal planning and recipe generation features, you need to set up the following API keys:

### 1. Gemini API (for grocery information and meal planning)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your environment variables

### 2. Cohere API (for detailed recipe generation)

1. Go to [Cohere Dashboard](https://dashboard.cohere.ai/)
2. Create a new API key
3. Add the API key to your environment variables

### 3. Unsplash API (for recipe images)

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key and Secret Key
4. Add both keys to your environment variables (secret key provides higher rate limits)

### Environment Variables

Create a `.env.local` file in the root directory:
```
# Database
MONGODB_URI=mongodb://localhost:27017/bargainbites

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# AI APIs
GEMINI_API_KEY=your_gemini_api_key_here
COHERE_API_KEY=your_cohere_production_api_key_here

# Image API
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
UNSPLASH_SECRET_KEY=your_unsplash_secret_key_here
```

### System Environment Variables (Alternative)
```bash
export GEMINI_API_KEY=your_gemini_api_key_here
export COHERE_API_KEY=your_cohere_production_api_key_here
export UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
export UNSPLASH_SECRET_KEY=your_unsplash_secret_key_here
```

## How It Works

1. **User completes the plan flow** - selects store, cuisine preferences, dietary restrictions, budget, and household size
2. **System loads flyer data** - reads the selected store's JSON file from `public/data/`
3. **Gemini AI analyzes** - processes the sale items and user preferences to create a personalized meal plan focused on grocery selection and cost optimization
4. **Cohere AI enhances** - generates detailed recipes with step-by-step instructions, nutrition info, and cooking tips based on the meal ingredients and user's pantry items
5. **Images fetched** - retrieves high-quality food photography from Unsplash based on the recipe details
6. **Enhanced meal plan generated** - returns 7 days of meals with detailed recipes, costs, nutrition, and images
7. **Results displayed** - shows the complete meal plan with enhanced recipe details, cost breakdown, and savings

## Features

- **Smart meal planning** based on current sales and user preferences
- **Budget optimization** using sale items to maximize savings
- **Detailed recipe generation** with step-by-step instructions and cooking tips
- **Nutrition information** including calories, protein, carbs, fat, and fiber per serving
- **High-quality food photography** automatically fetched for each recipe
- **Pantry integration** - considers ingredients users already have at home
- **Cooking skill adaptation** - adjusts complexity based on user's experience level
- **Dietary restriction compliance** - respects user's dietary needs
- **Cost tracking** - shows individual meal costs and total weekly budget
- **Interactive details** - click to view enhanced recipe details with images
- **Timing information** - prep time, cook time, and total time for each recipe
- **Recipe tags** - cuisine type, cooking method, and dietary tags for easy categorization

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
