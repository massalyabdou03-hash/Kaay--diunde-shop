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

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Corps de requête JSON invalide' })
    };
  }

  const { id } = body;

  if (!id) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'L\'id du produit est obligatoire' })
    };
  }

  try {
    console.log(`🗑️ Suppression produit id="${id}"...`);

    const result = await pool.query(
      'DELETE FROM produits WHERE id = $1 RETURNING id, name',
      [id]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠️ Produit id="${id}" introuvable pour suppression`);
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Produit introuvable' })
      };
    }

    console.log(`✅ Produit "${result.rows[0].name}" supprimé`);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Produit supprimé avec succès', deleted: result.rows[0] })
    };
  } catch (error) {
    console.error('❌ Erreur DB delete-product:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de supprimer le produit', details: error.message })
    };
  }
};
