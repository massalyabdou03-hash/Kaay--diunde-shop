import { Handler } from '@netlify/functions';

// ========================================
// FONCTION: GET PRODUCTS
// Récupère tous les produits de la base de données
// ========================================

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Import Neon client
    const { neon } = await import('@neondatabase/serverless');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Create SQL client
    const sql = neon(databaseUrl);
    
    // Get category filter from query params
    const category = event.queryStringParameters?.category;
    
    let products;
    
    if (category) {
      // Filter by category
      products = await sql`
        SELECT * FROM products 
        WHERE category = ${category} 
        ORDER BY featured DESC, created_at DESC
      `;
    } else {
      // Get all products
      products = await sql`
        SELECT * FROM products 
        ORDER BY featured DESC, created_at DESC
      `;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products,
        count: products.length,
      }),
    };
    
  } catch (error) {
    console.error('Error fetching products:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
