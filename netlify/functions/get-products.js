const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR CRITIQUE: DATABASE_URL est undefined. Vérifiez vos variables Netlify.');
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
      body: JSON.stringify({ error: 'DATABASE_URL manquante dans les variables d\'environnement' })
    };
  }

  try {
    console.log('📦 Récupération de tous les produits...');

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
      ORDER BY created_at DESC`
    );

    console.log(`✅ ${result.rows.length} produit(s) récupéré(s)`);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error('❌ Erreur DB get-products:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de récupérer les produits', details: error.message })
    };
  }
};
