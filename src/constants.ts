export const SITE_NAME = 'Kaay Diunde';
export const SITE_URL = 'https://kaay-diunde.site';
export const CURRENCY = 'FCFA';

// Numéro WhatsApp qui reçoit les commandes (format international, sans « + »).
export const WHATSAPP_NUMBER = '221770338030';

// Numéro du bouton d'appel et du pied de page (format international, sans « + »).
// ⚠️ Ce numéro est différent du numéro WhatsApp ci-dessus : vérifiez que c'est voulu.
export const PHONE_NUMBER = '221762548030';

// Témoignages de l'accueil : à activer SEULEMENT avec de vrais avis de clients
// (avec leur accord). Voir le tableau `testimonials` dans pages/Home.tsx.
export const SHOW_TESTIMONIALS = false;

// Affiche « 762 548 030 » à partir de « 221762548030 »
export function formatPhone(international: string): string {
  const n = international.replace(/^221/, '');
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`.trim();
}
