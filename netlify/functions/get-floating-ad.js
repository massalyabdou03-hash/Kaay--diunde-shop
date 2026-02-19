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

    // Insérer la ligne par défaut si elle n'existe pas
    await pool.query(
      `INSERT INTO publicite_flottante (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
    );

    const result = await pool.query('SELECT * FROM publicite_flottante WHERE id = 1');

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.rows[0] || {
        enabled: false,
        title: '',
        description: '',
        button_text: '',
        button_url: '',
        button_color: '#f97316',
        position: 'bottom-right',
        display_duration: '24h'
      })
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
