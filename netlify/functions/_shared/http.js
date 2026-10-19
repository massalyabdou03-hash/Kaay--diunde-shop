// ─── En-têtes HTTP communs aux fonctions d'écriture ──────────────────────
//
// Le site appelle ses fonctions depuis le même domaine : le CORS n'est donc pas
// nécessaire pour lui. On n'autorise que l'origine du site (et non plus « * »)
// pour qu'aucun autre site ne puisse appeler ces fonctions depuis un navigateur.
//
// SITE_ORIGIN (variable Netlify, optionnelle) : ex. https://kaay-diunde.site

function corsHeaders(methods) {
  return {
    'Access-Control-Allow-Origin': process.env.SITE_ORIGIN || 'https://kaay-diunde.site',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': methods,
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

module.exports = { corsHeaders };
