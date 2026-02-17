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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'DATABASE_URL manquante' })
    };
  }

  let product;
  try {
    product = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Corps de requête JSON invalide' })
    };
  }

  // ✅ Validation des champs obligatoires
  const required = ['id', 'name', 'description', 'price', 'category', 'image', 'stock'];
  const missing = required.filter(f => !product[f] && product[f] !== 0);
  if (missing.length > 0) {
    console.error('❌ Champs manquants:', missing);
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: `Champs obligatoires manquants: ${missing.join(', ')}` })
    };
  }

  try {
    console.log(`➕ Ajout produit id="${product.id}" name="${product.name}"...`);

    const result = await pool.query(
      `INSERT INTO produits (id, name, description, price, old_price, category, image, featured, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        product.id,
        product.name,
        product.description,
        parseInt(product.price),
        product.old_price ? parseInt(product.old_price) : null,
        product.category,
        product.image,
        product.featured || false,
        parseInt(product.stock)
      ]
    );

    console.log(`✅ Produit "${product.name}" ajouté avec succès`);
    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Erreur DB add-product:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible d\'ajouter le produit', details: error.message })
    };
  }
};
