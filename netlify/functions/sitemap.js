const { Pool } = require('pg');

// Sitemap généré à chaque visite de /sitemap.xml (voir netlify.toml) :
// accueil, boutique et UNE URL PAR PRODUIT. Les nouveaux produits ajoutés dans
// l'admin apparaissent donc automatiquement, sans toucher au code.

const SITE_URL = process.env.SITE_ORIGIN || 'https://kaay-diunde.site';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toDate(value) {
  const d = value ? new Date(value) : new Date();
  return (isNaN(d.getTime()) ? new Date() : d).toISOString().slice(0, 10);
}

function urlEntry(path, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(SITE_URL + path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n');
}

function buildXml(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

const RESPONSE_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600'
};

exports.handler = async function () {
  const today = toDate();

  try {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquante');

    const { rows } = await pool.query(
      'SELECT id, updated_at FROM produits ORDER BY updated_at DESC NULLS LAST LIMIT 5000'
    );

    const newest = rows.length > 0 ? toDate(rows[0].updated_at) : today;
    const entries = [
      urlEntry('/', newest, 'daily', '1.0'),
      urlEntry('/shop', newest, 'daily', '0.9'),
      ...rows.map(r => urlEntry(`/product/${encodeURIComponent(r.id)}`, toDate(r.updated_at), 'weekly', '0.8'))
    ];

    return { statusCode: 200, headers: RESPONSE_HEADERS, body: buildXml(entries) };
  } catch (error) {
    // Base indisponible : on renvoie quand même un sitemap valide (pages principales)
    console.error('⚠️ sitemap: produits indisponibles:', error.message);
    const entries = [
      urlEntry('/', today, 'daily', '1.0'),
      urlEntry('/shop', today, 'daily', '0.9')
    ];
    return {
      statusCode: 200,
      headers: { ...RESPONSE_HEADERS, 'Cache-Control': 'public, max-age=300' },
      body: buildXml(entries)
    };
  }
};
