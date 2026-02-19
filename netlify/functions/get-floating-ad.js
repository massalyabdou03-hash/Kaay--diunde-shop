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

  try {
    // Créer la table si elle n'existe pas encore
    await pool.query(`
      CREATE TABLE IF NOT EXISTS publicite_flottante (
        id               INTEGER      PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        enabled          BOOLEAN      DEFAULT false,
        title            VARCHAR(255) DEFAULT '',
        description      TEXT         DEFAULT '',
        button_text      VARCHAR(255) DEFAULT '',
        button_url       TEXT         DEFAULT '',
        button_color     VARCHAR(20)  DEFAULT '#f97316',
        position         VARCHAR(20)  DEFAULT 'bottom-right',
        display_duration VARCHAR(10)  DEFAULT '24h',
        updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ajouter la colonne image_data si elle n'existe pas encore
    await pool.query(`
      ALTER TABLE publicite_flottante ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT ''
    `);

    // Ajouter la colonne show_button si elle n'existe pas encore
    await pool.query(`
      ALTER TABLE publicite_flottante ADD COLUMN IF NOT EXISTS show_button BOOLEAN DEFAULT true
    `);

    // Insérer la ligne par défaut si elle n'existe pas
    await pool.query(
      `INSERT INTO publicite_flottante (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
    );

    const result = await pool.query('SELECT * FROM publicite_flottante WHERE id = 1');
    const row = result.rows[0];

    // Construire la réponse sans inclure image_data (trop volumineux)
    // Retourner image_url qui pointe vers la fonction de service d'image
    const response = row ? {
      enabled: row.enabled,
      title: row.title,
      description: row.description,
      button_text: row.button_text,
      button_url: row.button_url,
      button_color: row.button_color,
      position: row.position,
      display_duration: row.display_duration,
      image_url: row.image_data ? '/.netlify/functions/get-ad-image' : '',
      show_button: row.show_button !== false
    } : {
      enabled: false,
      title: '',
      description: '',
      button_text: '',
      button_url: '',
      button_color: '#f97316',
      position: 'bottom-right',
      display_duration: '24h',
      image_url: '',
      show_button: true
    };

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('❌ Erreur get-floating-ad:', error.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de récupérer la config publicité', details: error.message })
    };
  }
};
