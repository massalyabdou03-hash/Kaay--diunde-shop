const { Client } = require('pg');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

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
      UPDATE products 
      SET name = $2,
          description = $3,
          price = $4,
          original_price = $5,
          category = $6,
          image = $7,
          stock = $8,
          discount = $9,
          updated_at = NOW()
      WHERE id = $1
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

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update product', details: error.message }),
    };
  } finally {
    await client.end();
  }
};
