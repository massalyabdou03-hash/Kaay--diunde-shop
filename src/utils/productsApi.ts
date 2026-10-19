import { Product } from '../types';

// Chargement des produits partagé par toutes les pages : une seule requête
// (réutilisée pendant 60 s) au lieu de trois (accueil, boutique, recherche),
// et une réponse d'erreur du serveur n'est plus prise pour une liste de produits.

const TTL_MS = 60_000;

let cache: { at: number; data: Product[] } | null = null;
let inflight: Promise<Product[]> | null = null;

export function fetchProducts(force = false): Promise<Product[]> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) {
    return Promise.resolve(cache.data);
  }
  if (!force && inflight) return inflight;

  inflight = fetch('/.netlify/functions/get-products')
    .then(res => {
      if (!res.ok) throw new Error(`get-products ${res.status}`);
      return res.json();
    })
    .then((data: unknown) => {
      if (!Array.isArray(data)) throw new Error('get-products : réponse inattendue');
      cache = { at: Date.now(), data: data as Product[] };
      return cache.data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

// Renvoie null si le produit n'existe pas (ou si la réponse n'est pas un produit)
export async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`/.netlify/functions/get-product?id=${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`get-product ${res.status}`);

  const data: unknown = await res.json();
  const p = data as Partial<Product> | null;
  return p && typeof p.id === 'string' && typeof p.price === 'number' ? (p as Product) : null;
}
