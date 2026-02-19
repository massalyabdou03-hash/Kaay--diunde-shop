import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface FloatingAdConfig {
  enabled: boolean;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  button_color: string;
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  display_duration: '12h' | '24h' | '7d';
}

/* ─── Constantes ────────────────────────────────────── */
const STORAGE_KEY = 'floatingAdClosed';

// Durées en millisecondes
const DURATION_MS: Record<string, number> = {
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d':  7 * 24 * 60 * 60 * 1000,
};

/* ─── Sécurité : échapper le texte pour éviter XSS ── */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ─── Validation URL (interne + externe) ─────────────── */
function isValidUrl(str: string): boolean {
  if (!str || str.trim() === '') return false;
  const trimmed = str.trim();

  // Bloquer les protocoles dangereux
  const lower = trimmed.toLowerCase().replace(/\s/g, '');
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return false;
  }

  // Accepter les liens internes commençant par /
  if (trimmed.startsWith('/')) return true;

  // Accepter les liens externes http/https
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/* ─── Détecte si une URL est externe ────────────────── */
function isExternalUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://');
}

/* ─── Composant FloatingAd ──────────────────────────── */
export default function FloatingAd() {
  const location = useLocation();
  const [config, setConfig] = useState<FloatingAdConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Vérifier si on est sur la page d'accueil
  const isHomePage = location.pathname === '/';

  // Charger la configuration depuis le serveur (uniquement sur la page d'accueil)
  useEffect(() => {
    // Ne pas charger la publicité si on n'est pas sur la page d'accueil
    if (!isHomePage) {
      setConfig(null);
      setVisible(false);
      return;
    }

    fetch('/.netlify/functions/get-floating-ad')
      .then(r => r.json())
      .then((data: FloatingAdConfig) => {
        if (!data.enabled) return;

        // Vérifier si l'utilisateur a fermé la pub récemment
        const closedAt = localStorage.getItem(STORAGE_KEY);
        if (closedAt) {
          const closedTime = parseInt(closedAt, 10);
          const duration = DURATION_MS[data.display_duration] || DURATION_MS['24h'];
          if (Date.now() - closedTime < duration) return;
        }

        setConfig(data);
        // Petit délai pour l'animation d'entrée
        setTimeout(() => setVisible(true), 300);
      })
      .catch(err => console.error('Erreur chargement publicité:', err));
  }, [isHomePage]);

  // Fermer la publicité
  const handleClose = () => {
    setClosing(true);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setTimeout(() => {
      setVisible(false);
      setConfig(null);
    }, 400);
  };

  // Ne rien afficher si on n'est pas sur la page d'accueil ou si pas de config
  if (!isHomePage || !config || !config.enabled) return null;

  // Déterminer la classe de position
  const positionClass = `floating-ad--${config.position}`;

  // Préparer l'URL du bouton (sécurisée)
  const safeUrl = isValidUrl(config.button_url) ? config.button_url : '#';

  return (
    <div
      className={`floating-ad ${positionClass} ${visible && !closing ? 'floating-ad--visible' : ''} ${closing ? 'floating-ad--closing' : ''}`}
      role="dialog"
      aria-label="Publicité"
    >
      {/* Bouton fermer */}
      <button
        className="floating-ad__close"
        onClick={handleClose}
        aria-label="Fermer la publicité"
        type="button"
      >
        <X size={16} />
      </button>

      {/* Contenu */}
      {config.title && (
        <h3 className="floating-ad__title">
          {escapeHtml(config.title)}
        </h3>
      )}

      {config.description && (
        <p className="floating-ad__description">
          {escapeHtml(config.description)}
        </p>
      )}

      {config.button_text && safeUrl !== '#' && (
        isExternalUrl(safeUrl) ? (
          <a
            href={safeUrl}
            className="floating-ad__button"
            style={{ backgroundColor: config.button_color || '#f97316' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {escapeHtml(config.button_text)}
          </a>
        ) : (
          <Link
            to={safeUrl}
            className="floating-ad__button"
            style={{ backgroundColor: config.button_color || '#f97316' }}
          >
            {escapeHtml(config.button_text)}
          </Link>
        )
      )}
    </div>
  );
}
