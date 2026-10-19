import { useEffect } from 'react';
import { SITE_NAME, SITE_URL } from '../constants';

// Titre, description, URL canonique, partage (Open Graph) et données structurées
// propres à chaque page. Google exécute le JavaScript du site : ces balises sont
// donc prises en compte même si la page est construite côté navigateur.

export interface PageMeta {
  title: string;
  description?: string;
  /** Chemin canonique (ex. « /shop »). Par défaut : le chemin courant. */
  path?: string;
  /** Page à ne pas indexer (panier, admin, résultats de recherche…). */
  noindex?: boolean;
  image?: string;
  /** Données structurées schema.org (objet JSON-LD), ou null. */
  jsonLd?: Record<string, unknown> | null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ID = 'page-jsonld';

export function usePageMeta(meta: PageMeta) {
  const { title, description, path, noindex, image } = meta;
  const jsonLdString = meta.jsonLd ? JSON.stringify(meta.jsonLd) : '';

  useEffect(() => {
    const canonicalPath = path ?? window.location.pathname;
    const url = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;

    document.title = title;
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
    }
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', 'website');
    if (image) upsertMeta('property', 'og:image', image);
    upsertCanonical(url);

    // Données structurées
    document.getElementById(JSONLD_ID)?.remove();
    if (jsonLdString) {
      const script = document.createElement('script');
      script.id = JSONLD_ID;
      script.type = 'application/ld+json';
      script.text = jsonLdString;
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(JSONLD_ID)?.remove();
    };
  }, [title, description, path, noindex, image, jsonLdString]);
}
