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

  // ✅ Validation de l'ID obligatoire
  if (!product.id) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'L\'id du produit est obligatoire pour la mise à jour' })
    };
  }

  try {
    console.log(`✏️ Mise à jour produit id="${product.id}"...`);

    const result = await pool.query(
      `UPDATE produits
       SET
         name        = $1,
         description = $2,
         price       = $3,
         old_price   = $4,
         category    = $5,
         image       = $6,
         featured    = $7,
         stock       = $8,
         updated_at  = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        product.name,
        product.description,
        parseInt(product.price),
        product.old_price ? parseInt(product.old_price) : null,
        product.category,
        product.image,
        product.featured || false,
        parseInt(product.stock),
        product.id
      ]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠️ Produit id="${product.id}" introuvable pour la mise à jour`);
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Produit introuvable' })
      };
    }

    console.log(`✅ Produit "${result.rows[0].name}" mis à jour`);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Erreur DB update-product:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de mettre à jour le produit', details: error.message })
    };
  }
};
