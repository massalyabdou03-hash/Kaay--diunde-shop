// ─── Authentification admin (côté serveur) ───────────────────────────────
//
// Le mot de passe admin n'est JAMAIS envoyé au navigateur. Il vit uniquement
// dans la variable d'environnement Netlify ADMIN_PASSWORD (sans préfixe VITE_).
//
// Flux :
//   1. POST /admin-login { password }  → renvoie un jeton signé (valable 12 h)
//   2. Chaque fonction d'écriture exige l'en-tête  Authorization: Bearer <jeton>
//
// Variables d'environnement :
//   ADMIN_PASSWORD      (obligatoire) mot de passe de connexion
//   ADMIN_TOKEN_SECRET  (recommandée) secret de signature des jetons, long et aléatoire.
//                       À défaut, ADMIN_PASSWORD sert de secret de signature.
//
// Si ADMIN_PASSWORD n'est pas défini, personne ne peut se connecter (échec sécurisé).

const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 12 * 60 * 60; // 12 heures

function getSigningSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payloadB64, secret) {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

// Comparaison en temps constant (passe par un hash pour égaliser les longueurs)
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== 'string' || candidate.length === 0) return false;
  return safeEqual(candidate, expected);
}

function createToken(nowMs = Date.now()) {
  const secret = getSigningSecret();
  if (!secret) throw new Error('ADMIN_PASSWORD non configuré');
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Math.floor(nowMs / 1000) + TOKEN_TTL_SECONDS })
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token, nowMs = Date.now()) {
  const secret = getSigningSecret();
  if (!secret || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  if (!safeEqual(signature, sign(payload, secret))) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && typeof data.exp === 'number' && data.exp > Math.floor(nowMs / 1000);
  } catch {
    return false;
  }
}

// À appeler au début de chaque fonction d'écriture.
// Renvoie null si l'appelant est autorisé, sinon la réponse 401 à retourner telle quelle.
function requireAdmin(event, headers) {
  const h = (event && event.headers) || {};
  const raw = h.authorization || h.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(raw);

  if (!match || !verifyToken(match[1])) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Session expirée ou non autorisée. Reconnectez-vous.' })
    };
  }
  return null;
}

module.exports = { checkPassword, createToken, verifyToken, requireAdmin, TOKEN_TTL_SECONDS };
