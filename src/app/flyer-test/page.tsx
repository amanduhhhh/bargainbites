'use client';

import { useState } from 'react';

interface FlyerItem {
  product: string;
  price: string;
  description?: string;
  originalText: string;
}

interface OCRData {
  rawText: string;
  extractedItems: FlyerItem[];
  timestamp: string;
  source: string;
  method?: string;
  pagesProcessed?: number;
  totalProducts?: number;
}

export default function FlyerTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrapeFlyer = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape-sobeys');
      const result = await response.json();
      
      if (result.success) {
        setOcrData(result.data);
      } else {
        setError(result.error || 'Failed to scrape flyer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sobeys Flyer OCR Test</h1>
        
        <div className="mb-6">
          <button
            onClick={handleScrapeFlyer}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Scraping and Processing...' : 'Scrape Sobeys Flyer'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
            {error.includes('container is not running') && (
              <div className="mt-2 text-sm">
                <p>To fix this:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to <a href="https://trycua.com/signin" className="underline" target="_blank" rel="noopener noreferrer">trycua.com/signin</a></li>
                  <li>Navigate to Dashboard → Containers</li>
                  <li>Start your container if it's stopped</li>
                  <li>Wait for it to be fully running (status should be "Running")</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {ocrData && (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Extracted Items ({ocrData.extractedItems.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ocrData.extractedItems.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="font-medium text-green-600">{item.price}</div>
                    <div className="text-sm text-gray-800 font-medium">{item.product}</div>
                    {item.description && (
                      <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{item.originalText}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Raw OCR Text</h2>
              <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{ocrData.rawText}</pre>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Metadata</h2>
              <div className="bg-white p-4 rounded border">
                <p><strong>Source:</strong> {ocrData.source}</p>
                <p><strong>Method:</strong> {ocrData.method || 'screenshot'}</p>
                {ocrData.pagesProcessed && (
                  <p><strong>Pages Processed:</strong> {ocrData.pagesProcessed}</p>
                )}
                {ocrData.totalProducts && (
                  <p><strong>Total Products:</strong> {ocrData.totalProducts}</p>
                )}
                <p><strong>Timestamp:</strong> {new Date(ocrData.timestamp).toLocaleString()}</p>
                <p><strong>Items Found:</strong> {ocrData.extractedItems.length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <h3 className="font-semibold mb-2">Setup Required:</h3>
          <p className="text-sm">
            To use this feature, you need to:
          </p>
          <ul className="text-sm mt-2 list-disc list-inside">
            <li>Set up a CUA cloud container at <a href="https://trycua.com/signin" className="underline" target="_blank" rel="noopener noreferrer">trycua.com/signin</a></li>
            <li>Create a Medium Ubuntu 22 container</li>
            <li>Set the CUA_API_KEY environment variable with your API key</li>
            <li>Set the CUA_CONTAINER_NAME environment variable with your container name</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
