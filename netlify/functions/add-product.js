const { Client } = require('pg');

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const product = JSON.parse(event.body);

    const query = `
      INSERT INTO products (
        id, name, description, price, original_price, 
        category, image, stock, discount, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `;

    const values = [
      product.id,
      product.name,
      product.description,
      product.price,
      product.originalPrice,
      product.category,
      product.image,
      product.stock,
      product.discount,
    ];

    const result = await client.query(query, values);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to add product', details: error.message }),
    };
  } finally {
    await client.end();
  }
};
