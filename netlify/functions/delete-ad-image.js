const { Pool } = require('pg');
const { requireAdmin } = require('./_shared/auth');
const { corsHeaders } = require('./_shared/http');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR CRITIQUE: DATABASE_URL est undefined.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const HEADERS = corsHeaders('POST, OPTIONS');

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

  // 🔒 Réservé à l'administrateur connecté
  const denied = requireAdmin(event, HEADERS);
  if (denied) return denied;

  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'DATABASE_URL manquante' })
    };
  }

  try {
    // Ajouter la colonne si elle n'existe pas encore
    await pool.query(`
      ALTER TABLE publicite_flottante ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT ''
    `);

    // Supprimer l'image
    await pool.query(
      `UPDATE publicite_flottante SET image_data = '', updated_at = CURRENT_TIMESTAMP WHERE id = 1`
    );

    console.log('✅ Image pub flottante supprimée');
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ success: true, message: 'Image supprimée avec succès' })
    };
  } catch (error) {
    console.error('❌ Erreur delete-ad-image:', error.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de supprimer l\'image' })
    };
  }
};
