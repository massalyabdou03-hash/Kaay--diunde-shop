import { Handler } from '@netlify/functions';

// ========================================
// FONCTION: GET PRODUCT BY ID
// Récupère un produit spécifique par son ID
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
    // Get product ID from query params
    const productId = event.queryStringParameters?.id;
    
    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Product ID is required',
        }),
      };
    }

    // Import Neon client
    const { neon } = await import('@neondatabase/serverless');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Create SQL client
    const sql = neon(databaseUrl);
    
    // Get product by ID
    const products = await sql`
      SELECT * FROM products 
      WHERE id = ${productId}
      LIMIT 1
    `;

    if (products.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Product not found',
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        product: products[0],
      }),
    };
    
  } catch (error) {
    console.error('Error fetching product:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
