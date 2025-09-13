import { NextRequest, NextResponse } from 'next/server';
import { Computer, OSType } from '@trycua/computer';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

// Type declaration for pdf-poppler
interface ConvertOptions {
  format: string;
  out_dir: string;
  out_prefix: string;
  page: number | null;
}

const pdf = require('pdf-poppler') as {
  convert: (pdfPath: string, options: ConvertOptions) => Promise<string[]>;
};

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.CUA_API_KEY || !process.env.CUA_CONTAINER_NAME) {
      return NextResponse.json({
        success: false,
        error: 'CUA_API_KEY and CUA_CONTAINER_NAME environment variables must be set'
      }, { status: 400 });
    }

    // Initialize CUA Computer
    const computer = new Computer({
      osType: OSType.LINUX,
      name: process.env.CUA_CONTAINER_NAME,
      apiKey: process.env.CUA_API_KEY
    });

    try {
      console.log('Connecting to CUA container...');
      await computer.run();
      console.log('✅ Connected to CUA container successfully!');

      // For now, let's use a simpler approach - just take a screenshot
      // In a real implementation, you'd need to use browser automation
      console.log('📸 Taking screenshot of Sobeys flyer...');
      return await processScreenshot(computer);

    } finally {
      try {
        await computer.stop();
      } catch (closeError) {
        console.warn('Error closing computer connection:', closeError);
      }
    }

  } catch (error) {
    console.error('Error scraping Sobeys flyer:', error);
    
    // Check for specific CUA connection errors
    if (error instanceof Error) {
      if (error.message.includes('521') || error.message.includes('WebSocket')) {
        return NextResponse.json({
          success: false,
          error: 'CUA container is not running. Please start your container at https://trycua.com/signin',
          details: error.message
        }, { status: 503 });
      }
      
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid CUA API key or container name. Please check your environment variables.',
          details: error.message
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Helper function to process screenshot (fallback method)
async function processScreenshot(computer: Computer) {
  console.log('📸 Taking screenshot...');
  const screenshot = await computer.interface.screenshot();
  console.log('✅ Screenshot captured!');
  
  // Convert screenshot to base64 for OCR processing
  const base64Image = screenshot.toString('base64');
  
  // Perform OCR on the screenshot
  console.log('🔍 Performing OCR on screenshot...');
  const { data: { text } } = await Tesseract.recognize(
    `data:image/png;base64,${base64Image}`,
    'eng',
    {
      logger: m => console.log(`OCR: ${m.status} - ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`)
    }
  );
  console.log('✅ OCR processing complete!');

  // Extract structured data from OCR text
  const ocrData = {
    rawText: text,
    extractedItems: extractFlyerItems(text),
    timestamp: new Date().toISOString(),
    source: 'sobeys.com/flyer (screenshot)',
    method: 'screenshot'
  };

  return NextResponse.json({
    success: true,
    data: ocrData
  });
}

// Helper function to process downloaded PDF
async function processDownloadedPDF(computer: Computer) {
  console.log('📄 Processing downloaded PDF...');
  
  try {
    // Get the Downloads directory path
    const downloadsPath = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }

    // Look for the most recent PDF file in downloads
    const files = fs.readdirSync(downloadsPath)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: path.join(downloadsPath, file),
        stats: fs.statSync(path.join(downloadsPath, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    if (files.length === 0) {
      throw new Error('No PDF file found in downloads');
    }

    const pdfFile = files[0];
    console.log(`📄 Found PDF: ${pdfFile.name}`);

    // Convert PDF to images
    console.log('🖼️ Converting PDF to images...');
    const options = {
      format: 'png',
      out_dir: downloadsPath,
      out_prefix: 'page',
      page: null // Convert all pages
    };

    const images = await pdf.convert(pdfFile.path, options);
    console.log(`✅ Converted PDF to ${images.length} images`);

    // Process each page with OCR
    let allText = '';
    const allItems: any[] = [];

    for (let i = 0; i < images.length; i++) {
      console.log(`🔍 Processing page ${i + 1}/${images.length}...`);
      
      const imagePath = images[i];
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const { data: { text } } = await Tesseract.recognize(
        `data:image/png;base64,${base64Image}`,
        'eng',
        {
          logger: m => console.log(`Page ${i + 1} OCR: ${m.status} - ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`)
        }
      );

      allText += `\n--- PAGE ${i + 1} ---\n${text}\n`;
      allItems.push(...extractFlyerItems(text));

      // Clean up the image file
      fs.unlinkSync(imagePath);
    }

    // Clean up the PDF file
    fs.unlinkSync(pdfFile.path);

    const ocrData = {
      rawText: allText,
      extractedItems: allItems,
      timestamp: new Date().toISOString(),
      source: 'sobeys.com/flyer (PDF)',
      method: 'pdf',
      pagesProcessed: images.length
    };

    return NextResponse.json({
      success: true,
      data: ocrData
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

function extractFlyerItems(text: string) {
  const items = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for price patterns (e.g., $1.99, $2.50, etc.)
    const priceMatch = line.match(/\$(\d+\.?\d*)/);
    if (priceMatch) {
      const price = priceMatch[1];
      const productName = line.replace(priceMatch[0], '').trim();
      
      if (productName.length > 2) { // Filter out very short product names
        items.push({
          product: productName,
          price: `$${price}`,
          originalText: line
        });
      }
    }
  }
  
  return items;
}
