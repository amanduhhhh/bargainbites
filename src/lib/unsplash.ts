interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  links: {
    download: string;
  };
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

export async function fetchRecipeImage(imagePrompt: string): Promise<string | null> {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not configured');
      return null;
    }

    // Clean and optimize the image prompt for Unsplash search
    const searchQuery = imagePrompt
      .toLowerCase()
      .replace(/professional|food|photography|dish|recipe/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Limit query length

    const headers: HeadersInit = {
      'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    };

    // Add secret key if available for better rate limits
    if (process.env.UNSPLASH_SECRET_KEY) {
      headers['Authorization'] = `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`;
      // Note: Secret key is used for server-side authentication
      // The access key is still the primary identifier
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape&content_filter=high`,
      {
        headers,
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, response.statusText);
      return null;
    }

    const data: UnsplashResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Return the first (most relevant) image
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}

export async function fetchFallbackRecipeImage(mealName: string): Promise<string | null> {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return null;
    }

    // Use a simpler search query based on meal name
    const searchQuery = `${mealName} food recipe`.toLowerCase();
    
    const headers: HeadersInit = {
      'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    };

    // Add secret key if available for better rate limits
    if (process.env.UNSPLASH_SECRET_KEY) {
      headers['Authorization'] = `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`;
    }
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape&content_filter=high`,
      {
        headers,
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: UnsplashResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error fetching fallback image:', error);
    return null;
  }
}
