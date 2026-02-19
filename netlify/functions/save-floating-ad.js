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

// Validation URL côté serveur — accepte liens internes et externes
function isValidUrl(str) {
  if (!str || str.trim() === '') return true; // URL vide autorisée

  const trimmed = str.trim();

  // Bloquer les protocoles dangereux (XSS)
  const lower = trimmed.toLowerCase().replace(/\s/g, '');
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return false;
  }

  // Accepter les liens internes commençant par /
  if (trimmed.startsWith('/')) {
    // Vérifier qu'il n'y a pas de caractères dangereux dans le chemin
    return /^\/[a-zA-Z0-9\-_\/%.~+?#=&]*$/.test(trimmed);
  }

  // Accepter les liens externes http:// et https://
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

// Nettoyage des entrées pour éviter XSS
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const VALID_POSITIONS = ['bottom-right', 'bottom-left', 'bottom-center'];
const VALID_DURATIONS = ['12h', '24h', '7d'];

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

  let config;
  try {
    config = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Corps JSON invalide' })
    };
  }

  // Validation
  const showButton = config.show_button !== false;

  // Si le bouton est activé, texte et URL sont obligatoires
  if (showButton) {
    if (!config.button_text || config.button_text.trim() === '') {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Le texte du bouton est obligatoire quand le bouton est activé.' })
      };
    }
    if (!config.button_url || config.button_url.trim() === '') {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'L\'URL du bouton est obligatoire quand le bouton est activé.' })
      };
    }
  }

  if (config.button_url && !isValidUrl(config.button_url)) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'URL du bouton invalide. Utilisez un chemin interne (/promo) ou un lien complet (https://...)' })
    };
  }

  const position = VALID_POSITIONS.includes(config.position) ? config.position : 'bottom-right';
  const duration = VALID_DURATIONS.includes(config.display_duration) ? config.display_duration : '24h';

  // Validation couleur (format hex)
  const colorRegex = /^#[0-9a-fA-F]{6}$/;
  const buttonColor = colorRegex.test(config.button_color) ? config.button_color : '#f97316';

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

    const result = await pool.query(
      `INSERT INTO publicite_flottante (id, enabled, title, description, button_text, button_url, button_color, position, display_duration, show_button, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         enabled = $1,
         title = $2,
         description = $3,
         button_text = $4,
         button_url = $5,
         button_color = $6,
         position = $7,
         display_duration = $8,
         show_button = $9,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        Boolean(config.enabled),
        sanitize((config.title || '').substring(0, 255)),
        sanitize((config.description || '').substring(0, 2000)),
        sanitize((config.button_text || '').substring(0, 255)),
        (config.button_url || '').substring(0, 2000),
        buttonColor,
        position,
        duration,
        showButton
      ]
    );

    console.log('✅ Config publicité flottante sauvegardée');
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Erreur save-floating-ad:', error.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de sauvegarder la config', details: error.message })
    };
  }
};
