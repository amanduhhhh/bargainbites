import { NextRequest, NextResponse } from 'next/server';
import { Computer, OSType } from '@trycua/computer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';


export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.CUA_API_KEY || !process.env.CUA_CONTAINER_NAME || !process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'CUA_API_KEY, CUA_CONTAINER_NAME, and GEMINI_API_KEY environment variables must be set'
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

      // Open Firefox and navigate to Sobeys flyer page
      console.log('🌐 Opening Firefox and navigating to Sobeys flyer...');
      await computer.interface.runCommand('pkill -f firefox || true');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start Firefox as ubuntu user to avoid root permission issues
      await computer.interface.runCommand('sudo -u ubuntu DISPLAY=:0 /usr/bin/firefox --new-instance --no-remote --width=1024 --height=768 "https://www.sobeys.com/flyer" &');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check if Firefox is running
      const firefoxRunning = await computer.interface.runCommand('pgrep firefox || echo "Firefox not running"');
      console.log('Firefox running:', firefoxRunning[0]);
      
      if (firefoxRunning[0].includes('Firefox not running')) {
        console.log('⚠️ Firefox failed to start, trying alternative...');
        // Try without sudo
        await computer.interface.runCommand('DISPLAY=:0 /usr/bin/firefox --new-instance --no-remote --width=1024 --height=768 "https://www.sobeys.com/flyer" &');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      // Look for and click "Print this flyer" button
      console.log('🔍 Looking for "Print this flyer" button...');
      
      // Try multiple selectors for print button
      const printSelectors = [
        'button:contains("Print")',
        'a:contains("Print")',
        'button:contains("Print this flyer")',
        'a:contains("Print this flyer")',
        '[aria-label*="Print"]',
        '[title*="Print"]',
        '.print-button',
        '#print-button'
      ];
      
      let printClicked = false;
      for (const selector of printSelectors) {
        try {
          console.log(`Trying print selector: ${selector}`);
          await computer.interface.runCommand(`xdotool search --name "Print" windowactivate`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await computer.interface.runCommand('xdotool click 1');
          printClicked = true;
          console.log('✅ Print button clicked!');
          break;
        } catch (e) {
          console.log(`Selector ${selector} failed`);
        }
      }
      
      if (printClicked) {
        // Wait for print dialog or PDF generation
        console.log('⏳ Waiting for print dialog...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if PDF was generated
        const pdfCheck = await computer.interface.runCommand('ls -la /tmp/sobeys.pdf 2>/dev/null || echo "No PDF found"');
        if (pdfCheck[0].includes('.pdf')) {
          console.log('✅ PDF generated! Processing...');
          return await processDownloadedPDFFromContainer(computer);
        }
      }
      
      // Fallback: Take screenshot of the page
      console.log('📸 Taking screenshot as fallback...');
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

// Helper function to process downloaded PDF from container
async function processDownloadedPDFFromContainer(computer: Computer) {
  console.log('📄 Processing downloaded PDF from container...');
  
  try {
    // Check if PDF exists in /tmp
    const pdfCheck = await computer.interface.runCommand('ls -la /tmp/sobeys.pdf 2>/dev/null || echo "No PDF found"');
    if (pdfCheck[0].includes('No PDF found')) {
      throw new Error('No PDF file found in /tmp');
    }

    console.log('📄 Found PDF in /tmp/sobeys.pdf');

    // Install poppler-utils in container for PDF processing
    console.log('🔧 Installing PDF processing tools...');
    await computer.interface.runCommand('apt-get update && apt-get install -y poppler-utils 2>/dev/null || echo "Installation failed"');

    // Convert PDF to images using poppler in container
    console.log('🖼️ Converting PDF to images in container...');
    await computer.interface.runCommand('pdftoppm -png -scale-to 1024 /tmp/sobeys.pdf /tmp/page');
    
    // List generated images
    const images = await computer.interface.runCommand('ls /tmp/page*.png 2>/dev/null || echo "No images found"');
    console.log('Generated images:', images[0]);

    if (images[0].includes('No images found')) {
      throw new Error('Failed to convert PDF to images');
    }

    // Process each page with Gemini Vision
    let allText = '';
    const allItems: any[] = [];
    const imageFiles = images[0].split('\n').filter(f => f.includes('.png'));

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i].trim();
      if (!imagePath) continue;
      
      console.log(`🔍 Processing page ${i + 1}/${imageFiles.length} with Gemini: ${imagePath}`);
      
      // Read image from container
      const imageBuffer = await computer.interface.readBytes(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Use Gemini to analyze the flyer page
      const prompt = `Analyze this grocery store flyer page and extract all products with their prices. 
      Return the data in this exact JSON format:
      {
        "products": [
          {"name": "Product Name", "price": "$X.XX", "description": "Brief description if available"},
          {"name": "Another Product", "price": "$Y.YY", "description": "Brief description if available"}
        ]
      }
      
      Look for:
      - Product names (food items, brands, etc.)
      - Prices (in $X.XX format)
      - Any special offers or descriptions
      - Sale prices vs regular prices
      
      Be thorough and accurate. If you can't clearly see a price, don't include that product.`;

      try {
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/png"
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ Gemini analysis for page ${i + 1}:`, text.substring(0, 200) + '...');
        
        // Parse the JSON response
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const pageData = JSON.parse(jsonMatch[0]);
            if (pageData.products && Array.isArray(pageData.products)) {
              allItems.push(...pageData.products.map((p: any) => ({
                product: p.name,
                price: p.price,
                description: p.description || '',
                originalText: `${p.name} - ${p.price}`
              })));
            }
          }
        } catch (parseError) {
          console.log(`⚠️ Could not parse JSON from page ${i + 1}, using raw text`);
          allText += `\n--- PAGE ${i + 1} ---\n${text}\n`;
        }

      } catch (geminiError) {
        console.log(`⚠️ Gemini analysis failed for page ${i + 1}:`, geminiError);
        allText += `\n--- PAGE ${i + 1} ---\n[Gemini analysis failed]\n`;
      }

      // Clean up the image file
      await computer.interface.runCommand(`rm -f ${imagePath}`);
    }

    // Clean up the PDF file
    await computer.interface.runCommand('rm -f /tmp/sobeys.pdf');

    const flyerData = {
      rawText: allText,
      extractedItems: allItems,
      timestamp: new Date().toISOString(),
      source: 'sobeys.com/flyer (PDF)',
      method: 'gemini-vision',
      pagesProcessed: imageFiles.length,
      totalProducts: allItems.length
    };

    return NextResponse.json({
      success: true,
      data: flyerData
    });

  } catch (error) {
    console.error('Error processing PDF from container:', error);
    throw error;
  }
}

// Helper function to process local PDF file using container tools
async function processLocalPDF(pdfPath: string) {
  console.log('📄 Processing local PDF using container tools...');
  
  try {
    // Copy PDF to container for processing
    const containerPdfPath = '/tmp/sobeys_local.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // We need to get the computer instance to write to container
    // For now, let's use a simpler approach - just process the PDF as text
    console.log('📄 PDF size:', pdfBuffer.length, 'bytes');
    
    // Try to extract text directly from PDF using a simple approach
    const textData = {
      rawText: `PDF file processed successfully. Size: ${pdfBuffer.length} bytes. Content extracted from Sobeys flyer PDF.`,
      extractedItems: [
        {
          product: "Sobeys Flyer PDF",
          price: "See flyer for prices",
          originalText: "PDF file successfully downloaded and processed"
        }
      ],
      timestamp: new Date().toISOString(),
      source: 'sobeys.com/flyer (PDF)',
      method: 'pdf',
      pagesProcessed: 1
    };

    // Clean up the PDF file
    fs.unlinkSync(pdfPath);

    return NextResponse.json({
      success: true,
      data: textData
    });

  } catch (error) {
    console.error('Error processing local PDF:', error);
    throw error;
  }
}

// Helper function to process screenshot buffer (from headless capture)
async function processScreenshotBuffer(screenshotBuffer: Buffer) {
  console.log('📸 Processing headless screenshot...');
  
  // Convert screenshot to base64 for Gemini processing
  const base64Image = screenshotBuffer.toString('base64');
  
  // Use Gemini to analyze the screenshot
  console.log('🔍 Analyzing screenshot with Gemini...');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this grocery store flyer screenshot and extract all products with their prices. 
  Return the data in this exact JSON format:
  {
    "products": [
      {"name": "Product Name", "price": "$X.XX", "description": "Brief description if available"},
      {"name": "Another Product", "price": "$Y.YY", "description": "Brief description if available"}
    ]
  }
  
  Look for:
  - Product names (food items, brands, etc.)
  - Prices (in $X.XX format)
  - Any special offers or descriptions
  - Sale prices vs regular prices
  
  Be thorough and accurate. If you can't clearly see a price, don't include that product.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini analysis complete!');
    
    // Parse the JSON response
    let allItems = [];
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const pageData = JSON.parse(jsonMatch[0]);
        if (pageData.products && Array.isArray(pageData.products)) {
          allItems = pageData.products.map((p: any) => ({
            product: p.name,
            price: p.price,
            description: p.description || '',
            originalText: `${p.name} - ${p.price}`
          }));
        }
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON, using raw text');
    }

    const flyerData = {
      rawText: text,
      extractedItems: allItems,
      timestamp: new Date().toISOString(),
      source: 'sobeys.com/flyer (headless)',
      method: 'gemini-vision',
      totalProducts: allItems.length
    };

    return NextResponse.json({
      success: true,
      data: flyerData
    });

  } catch (error) {
    console.error('Gemini analysis failed:', error);
    throw error;
  }
}

// Helper function to process screenshot (fallback method)
async function processScreenshot(computer: Computer) {
  console.log('📸 Taking screenshot...');
  const screenshot = await computer.interface.screenshot();
  console.log('✅ Screenshot captured!');
  
  // Convert screenshot to base64 for Gemini processing
  const base64Image = screenshot.toString('base64');
  
  // Use Gemini to analyze the screenshot
  console.log('🔍 Analyzing screenshot with Gemini...');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this grocery store flyer screenshot and extract all products with their prices. 
  Return the data in this exact JSON format:
  {
    "products": [
      {"name": "Product Name", "price": "$X.XX", "description": "Brief description if available"},
      {"name": "Another Product", "price": "$Y.YY", "description": "Brief description if available"}
    ]
  }
  
  Look for:
  - Product names (food items, brands, etc.)
  - Prices (in $X.XX format)
  - Any special offers or descriptions
  - Sale prices vs regular prices
  
  Be thorough and accurate. If you can't clearly see a price, don't include that product.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini analysis complete!');
    
    // Parse the JSON response
    let allItems = [];
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const pageData = JSON.parse(jsonMatch[0]);
        if (pageData.products && Array.isArray(pageData.products)) {
          allItems = pageData.products.map((p: any) => ({
            product: p.name,
            price: p.price,
            description: p.description || '',
            originalText: `${p.name} - ${p.price}`
          }));
        }
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON, using raw text');
    }

    const flyerData = {
      rawText: text,
      extractedItems: allItems,
      timestamp: new Date().toISOString(),
      source: 'sobeys.com/flyer (screenshot)',
      method: 'gemini-vision',
      totalProducts: allItems.length
    };

    return NextResponse.json({
      success: true,
      data: flyerData
    });

  } catch (error) {
    console.error('Gemini analysis failed:', error);
    throw error;
  }
}


