// ─── Session admin côté navigateur ───────────────────────────────────────
// Le mot de passe n'est plus vérifié dans le navigateur : il est envoyé une seule
// fois à la fonction serveur « admin-login », qui renvoie un jeton signé.
// Ce jeton est ensuite exigé par chaque fonction d'écriture (en-tête Authorization).

const TOKEN_KEY = 'adminToken';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAdminToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* navigation privée stricte : la session ne sera pas conservée */
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('isAdmin'); // ancien drapeau, désormais inutile
  } catch {
    /* ignore */
  }
}

export async function adminLogin(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/.netlify/functions/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.token !== 'string') {
      return { ok: false, error: data.error || 'Connexion impossible.' };
    }
    setAdminToken(data.token);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Connexion impossible. Vérifiez votre réseau.' };
  }
}

// fetch() + jeton admin. Si le serveur répond 401 (jeton expiré ou invalide),
// on ferme la session et on renvoie vers l'accueil.
export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${getAdminToken() ?? ''}`,
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    alert('Session admin expirée. Veuillez vous reconnecter.');
    window.location.href = '/';
  }
  return res;
}
