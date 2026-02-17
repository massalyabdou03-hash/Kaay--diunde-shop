const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const product = JSON.parse(event.body);

    const result = await pool.query(
      `INSERT INTO produits (id, name, description, price, old_price, category, image, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.originalPrice || null,
        product.category,
        product.image,
        product.stock
      ]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(result.rows[0])
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
