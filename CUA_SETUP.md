# CUA Flyer Scraping Setup

This project now includes CUA integration for scraping the Sobeys flyer with OCR processing.

## Setup Instructions

### 1. CUA Cloud Container Setup

1. Go to [trycua.com/signin](https://trycua.com/signin)
2. Navigate to **Dashboard > Containers > Create Instance**
3. Create a **Medium, Ubuntu 22** container
4. Note your container name and API key

### 2. Environment Variables

Create a `.env.local` file in the project root with:

```env
CUA_API_KEY=your-cua-api-key-here
CUA_CONTAINER_NAME=your-container-name-here
```

### 3. Container Name

The container name is now automatically loaded from the `CUA_CONTAINER_NAME` environment variable. No code changes needed!

### 4. Test the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/flyer-test` in your browser
3. Click "Scrape Sobeys Flyer" to test the functionality

## How It Works

1. **Intelligent Navigation**: Uses CUA to open a browser and navigate to the Sobeys flyer page
2. **Adaptive Download Detection**: Intelligently searches for download buttons using multiple strategies
3. **Multi-Method Processing**: 
   - **Primary**: Downloads the complete PDF flyer and processes all pages
   - **Fallback**: Takes screenshots if PDF download fails
4. **OCR Processing**: Uses Tesseract.js to extract text from images/PDFs
5. **Data Extraction**: Parses the OCR text to find product names and prices
6. **Display**: Shows the extracted data in a user-friendly format

## Features

- **Real-time Scraping**: Directly scrapes the live Sobeys flyer
- **OCR Processing**: Extracts text from images using Tesseract.js
- **Price Extraction**: Automatically identifies products and their prices
- **Raw Text Display**: Shows the complete OCR output for debugging
- **Error Handling**: Comprehensive error handling and user feedback

## API Endpoint

The scraping functionality is available at `/api/scrape-sobeys` and returns:

```json
{
  "success": true,
  "data": {
    "rawText": "Complete OCR text...",
    "extractedItems": [
      {
        "product": "Product Name",
        "price": "$1.99",
        "originalText": "Original line from OCR"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "source": "sobeys.com/flyer"
  }
}
```

## Dependencies Added

- `@trycua/computer`: CUA computer interface for web automation
- `tesseract.js`: OCR library for text extraction from images
