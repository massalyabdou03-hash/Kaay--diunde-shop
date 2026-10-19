const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR CRITIQUE: DATABASE_URL est undefined.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'DATABASE_URL manquante' })
    };
  }

  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Paramètre "id" obligatoire' })
    };
  }

  try {
    console.log(`🔍 Recherche du produit id="${id}"...`);

    const result = await pool.query(
      `SELECT 
        id,
        name,
        description,
        price,
        old_price,
        image,
        category,
        featured,
        stock,
        created_at,
        updated_at
      FROM produits
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠️ Produit id="${id}" introuvable`);
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Produit introuvable' })
      };
    }

    console.log(`✅ Produit "${result.rows[0].name}" trouvé`);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Erreur DB get-product:', error.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de récupérer le produit' })
    };
  }
};
