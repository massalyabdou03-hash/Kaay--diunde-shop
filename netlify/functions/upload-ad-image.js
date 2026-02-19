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

// Types MIME autorisés
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Taille max : 1 Mo
const MAX_SIZE_BYTES = 1 * 1024 * 1024;

// Vérifier les magic bytes pour détecter le type MIME réel
function detectMimeType(base64Data) {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length < 4) return null;

    // JPEG : FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg';
    }

    // PNG : 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    }

    // WebP : 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
    if (buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'image/webp';
    }

    return null;
  } catch {
    return null;
  }
}

// Nettoyer le nom du fichier
function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'image';
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Garder uniquement les caractères sûrs
    .replace(/\.{2,}/g, '.')             // Empêcher les traversées de répertoire
    .replace(/^\.+/, '')                 // Pas de fichier caché
    .substring(0, 100)                   // Limiter la longueur
    || 'image';
}

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
  } catch {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Corps JSON invalide' })
    };
  }

  const { image, filename } = body;

  // Vérifier que l'image est fournie
  if (!image || typeof image !== 'string') {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Image manquante' })
    };
  }

  // Vérifier le format data URL
  const dataUrlMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!dataUrlMatch) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Format image invalide. Utilisez un format data URL base64.' })
    };
  }

  const declaredMime = dataUrlMatch[1].toLowerCase();
  const base64Data = dataUrlMatch[2];

  // Vérifier le type MIME déclaré
  if (!ALLOWED_MIME_TYPES.includes(declaredMime)) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP.' })
    };
  }

  // Vérifier la taille (base64 → taille réelle ≈ base64.length * 3/4)
  const estimatedSize = Math.ceil(base64Data.length * 3 / 4);
  if (estimatedSize > MAX_SIZE_BYTES) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Image trop volumineuse. Taille maximum : 1 Mo.' })
    };
  }

  // Vérifier le type MIME réel via les magic bytes
  const realMime = detectMimeType(base64Data);
  if (!realMime) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de vérifier le type réel du fichier. Fichier corrompu ou non supporté.' })
    };
  }

  // Comparer le type déclaré et le type réel
  const normalizedDeclared = declaredMime === 'image/jpg' ? 'image/jpeg' : declaredMime;
  if (normalizedDeclared !== realMime) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Le type MIME déclaré ne correspond pas au contenu réel du fichier.' })
    };
  }

  // Nettoyer le nom du fichier
  const safeName = sanitizeFilename(filename);

  // Vérifier que le contenu base64 ne contient pas de scripts
  try {
    const decoded = Buffer.from(base64Data, 'base64').toString('utf8').toLowerCase();
    if (decoded.includes('<script') || decoded.includes('javascript:') || decoded.includes('onerror=')) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Contenu suspect détecté dans le fichier.' })
      };
    }
  } catch {
    // Si on ne peut pas décoder en UTF-8, c'est probablement un vrai binaire image → OK
  }

  try {
    // Ajouter la colonne si elle n'existe pas encore
    await pool.query(`
      ALTER TABLE publicite_flottante ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT ''
    `);

    // Sauvegarder l'image (data URL complet)
    await pool.query(
      `UPDATE publicite_flottante SET image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [image]
    );

    console.log(`✅ Image pub flottante uploadée : ${safeName} (${realMime}, ~${Math.round(estimatedSize / 1024)} Ko)`);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Image uploadée avec succès',
        filename: safeName,
        mime: realMime,
        size: estimatedSize
      })
    };
  } catch (error) {
    console.error('❌ Erreur upload-ad-image:', error.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de sauvegarder l\'image', details: error.message })
    };
  }
};
