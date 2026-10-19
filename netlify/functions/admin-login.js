const { checkPassword, createToken, TOKEN_TTL_SECONDS } = require('./_shared/auth');
const { corsHeaders } = require('./_shared/http');

const HEADERS = corsHeaders('POST, OPTIONS');

// Frein simple contre les essais en rafale (par instance de fonction, en mémoire).
// Ce n'est pas une protection absolue en serverless, mais cela ralentit un robot.
const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000;
const failures = new Map(); // ip → { count, first }

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || h['client-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'inconnu';
}

function isBlocked(ip, now) {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (now - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function registerFailure(ip, now) {
  const entry = failures.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    failures.set(ip, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD n\'est pas défini dans les variables Netlify : connexion admin impossible.');
    return {
      statusCode: 503,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Connexion admin non configurée sur le serveur.' })
    };
  }

  const ip = clientIp(event);
  const now = Date.now();

  if (isBlocked(ip, now)) {
    return {
      statusCode: 429,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Corps JSON invalide' }) };
  }

  if (!checkPassword(body.password)) {
    registerFailure(ip, now);
    // Petit délai pour décourager les essais automatiques
    await new Promise(resolve => setTimeout(resolve, 600));
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Mot de passe incorrect' }) };
  }

  failures.delete(ip);
  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ token: createToken(), expiresIn: TOKEN_TTL_SECONDS })
  };
};
