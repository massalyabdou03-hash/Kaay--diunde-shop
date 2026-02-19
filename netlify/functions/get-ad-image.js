const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR CRITIQUE: DATABASE_URL est undefined.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'DATABASE_URL manquante' })
    };
  }

  try {
    // Ajouter la colonne si elle n'existe pas encore
    await pool.query(`
      ALTER TABLE publicite_flottante ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT ''
    `);

    const result = await pool.query('SELECT image_data FROM publicite_flottante WHERE id = 1');
    const imageData = result.rows[0]?.image_data;

    if (!imageData) {
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Aucune image configurée' })
      };
    }

    // Parser le data URL : data:image/jpeg;base64,/9j/4AAQ...
    const match = imageData.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Format image invalide en base de données' })
      };
    }

    const mimeType = match[1];
    const base64 = match[2];

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('❌ Erreur get-ad-image:', error.message);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Impossible de récupérer l\'image', details: error.message })
    };
  }
};
