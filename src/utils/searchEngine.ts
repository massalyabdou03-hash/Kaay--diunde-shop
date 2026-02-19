import { Product, ProductCategory } from '../types';

// ─── Dictionnaire de synonymes (français, e-commerce Sénégal) ──────
const SYNONYMES: Record<string, string[]> = {
  'telephone': ['téléphone', 'phone', 'portable', 'mobile', 'smartphone', 'gsm', 'cellulaire'],
  'téléphone': ['telephone', 'phone', 'portable', 'mobile', 'smartphone', 'gsm', 'cellulaire'],
  'chaussure': ['basket', 'sneaker', 'sneakers', 'soulier', 'tennis', 'chaussures'],
  'basket': ['chaussure', 'sneaker', 'sneakers', 'chaussure sport', 'tennis'],
  'ordinateur': ['pc', 'laptop', 'ordi', 'computer', 'portable'],
  'pc': ['ordinateur', 'laptop', 'ordi', 'computer'],
  'ecouteur': ['écouteur', 'écouteurs', 'ecouteurs', 'earphone', 'earbuds', 'casque', 'airpods', 'headphone'],
  'écouteur': ['ecouteur', 'ecouteurs', 'écouteurs', 'earphone', 'earbuds', 'casque', 'airpods'],
  'montre': ['watch', 'smartwatch', 'bracelet connecté'],
  'sac': ['sacoche', 'sac à dos', 'bag', 'backpack', 'valise'],
  'vetement': ['vêtement', 'vêtements', 'vetements', 'habit', 'habits', 'fringue', 'tenue'],
  'vêtement': ['vetement', 'vêtements', 'vetements', 'habit', 'habits', 'fringue', 'tenue'],
  'robe': ['dress', 'tenue', 'jupe'],
  'pantalon': ['jean', 'jeans', 'jogging', 'survêtement', 'pant'],
  'jean': ['pantalon', 'jeans', 'denim'],
  'samsung': ['galaxy'],
  'iphone': ['apple', 'ios'],
  'apple': ['iphone', 'macbook', 'airpods', 'ipad'],
  'rouge': ['red'],
  'bleu': ['blue'],
  'noir': ['black'],
  'blanc': ['white'],
  'vert': ['green'],
  'rose': ['pink'],
  'jaune': ['yellow'],
  'livre': ['livres', 'book', 'bouquin', 'roman', 'lecture'],
  'sport': ['sports', 'fitness', 'gym', 'musculation', 'exercice'],
  'maison': ['home', 'intérieur', 'décoration', 'deco', 'déco'],
  'mode': ['fashion', 'style', 'tendance'],
  'accessoire': ['accessoires', 'bijou', 'bijoux'],
  'electronique': ['électronique', 'tech', 'technologie', 'hightech', 'high-tech'],
  'électronique': ['electronique', 'tech', 'technologie', 'hightech', 'high-tech'],
  'promo': ['promotion', 'solde', 'réduction', 'discount', 'offre'],
  'promotion': ['promo', 'solde', 'réduction', 'discount', 'offre'],
  'pas cher': ['bon prix', 'abordable', 'économique', 'budget'],
  'cher': ['premium', 'luxe', 'haut de gamme'],
};

// ─── Corrections orthographiques courantes ────────────────────────
const CORRECTIONS: Record<string, string> = {
  'ipone': 'iphone',
  'iphon': 'iphone',
  'iphne': 'iphone',
  'ipohne': 'iphone',
  'samung': 'samsung',
  'samsun': 'samsung',
  'samsug': 'samsung',
  'sasmung': 'samsung',
  'smasung': 'samsung',
  'galxy': 'galaxy',
  'galaxi': 'galaxy',
  'galxay': 'galaxy',
  'telphone': 'téléphone',
  'telepone': 'téléphone',
  'telephon': 'téléphone',
  'teleohone': 'téléphone',
  'telephne': 'téléphone',
  'chausure': 'chaussure',
  'chausures': 'chaussure',
  'chaussures': 'chaussure',
  'ordinatuer': 'ordinateur',
  'ordinaeur': 'ordinateur',
  'ecouteurs': 'écouteur',
  'ecoutuer': 'écouteur',
  'montres': 'montre',
  'montr': 'montre',
  'accesoire': 'accessoire',
  'accesoires': 'accessoire',
  'electronque': 'electronique',
  'electronik': 'electronique',
  'aiprods': 'airpods',
  'airpod': 'airpods',
  'baskets': 'basket',
  'bascket': 'basket',
  'snakers': 'sneakers',
  'sneaker': 'sneakers',
  'pantalons': 'pantalon',
  'pantlon': 'pantalon',
  'macrbook': 'macbook',
  'macbok': 'macbook',
  'livres': 'livre',
  'livr': 'livre',
  'robs': 'robe',
  'robes': 'robe',
};

// ─── Labels des catégories ────────────────────────────────────────
const CATEGORY_LABELS: Record<ProductCategory, string[]> = {
  'electronics': ['électronique', 'electronique', 'tech', 'technologie', 'hightech', 'high-tech'],
  'fashion': ['mode', 'fashion', 'vêtement', 'vetement', 'habit', 'tenue', 'style'],
  'accessories': ['accessoire', 'accessoires', 'bijou', 'bijoux'],
  'home': ['maison', 'home', 'intérieur', 'décoration', 'deco', 'déco'],
  'sports': ['sport', 'sports', 'fitness', 'gym'],
  'books': ['livre', 'livres', 'book', 'bouquin', 'roman', 'lecture'],
};

const CATEGORY_DISPLAY: Record<ProductCategory, string> = {
  'electronics': 'Électronique',
  'fashion': 'Mode',
  'accessories': 'Accessoires',
  'home': 'Maison',
  'sports': 'Sport',
  'books': 'Livres',
};

// ─── Distance de Levenshtein pour la correction floue ────────────
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ─── Normaliser le texte (retirer accents, minuscules) ───────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// ─── Corriger l'orthographe d'un mot ────────────────────────────
function correctWord(word: string): string {
  const normalized = normalize(word);

  // Vérifier les corrections connues
  if (CORRECTIONS[normalized]) return CORRECTIONS[normalized];

  // Correction floue par distance de Levenshtein
  let bestMatch = word;
  let bestDist = 3; // seuil max

  // Chercher dans les clés de synonymes
  for (const key of Object.keys(SYNONYMES)) {
    const dist = levenshtein(normalized, normalize(key));
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      bestMatch = key;
    }
  }

  // Chercher dans les corrections
  for (const key of Object.keys(CORRECTIONS)) {
    const dist = levenshtein(normalized, key);
    if (dist < bestDist && dist <= 1) {
      bestDist = dist;
      bestMatch = CORRECTIONS[key];
    }
  }

  return bestMatch;
}

// ─── Corriger une requête complète ──────────────────────────────
export function correctQuery(query: string): string {
  const words = query.trim().split(/\s+/);
  const corrected = words.map(w => correctWord(w));
  const result = corrected.join(' ');
  return result !== query.toLowerCase() ? result : query;
}

// ─── Obtenir les synonymes d'un mot ─────────────────────────────
function getSynonyms(word: string): string[] {
  const normalized = normalize(word);
  const result: string[] = [normalized];

  for (const [key, values] of Object.entries(SYNONYMES)) {
    const nKey = normalize(key);
    if (nKey === normalized || values.some(v => normalize(v) === normalized)) {
      result.push(nKey);
      values.forEach(v => result.push(normalize(v)));
    }
  }

  return [...new Set(result)];
}

// ─── Type pour les résultats de suggestion ──────────────────────
export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  label: string;
  category?: ProductCategory;
  product?: Product;
  icon?: string;
}

// ─── Obtenir les suggestions d'auto-complétion ──────────────────
export function getSearchSuggestions(query: string, products: Product[]): SearchSuggestion[] {
  if (!query.trim() || query.trim().length < 2) return [];

  const corrected = correctQuery(query);
  const searchTerms = corrected.toLowerCase().split(/\s+/);
  const allTerms = searchTerms.flatMap(t => getSynonyms(t));
  const normalizedTerms = allTerms.map(t => normalize(t));

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  // 1. Suggestions de catégories
  for (const [cat, labels] of Object.entries(CATEGORY_LABELS)) {
    const catKey = cat as ProductCategory;
    const allLabels = [CATEGORY_DISPLAY[catKey], ...labels];
    const matches = normalizedTerms.some(term =>
      allLabels.some(label => normalize(label).includes(term) || term.includes(normalize(label)))
    );
    if (matches && !seen.has(catKey)) {
      seen.add(catKey);
      suggestions.push({
        type: 'category',
        label: CATEGORY_DISPLAY[catKey],
        category: catKey,
      });
    }
  }

  // 2. Suggestions de marques (extraites des noms de produits)
  const brands = new Set<string>();
  const commonBrands = ['samsung', 'apple', 'iphone', 'xiaomi', 'huawei', 'nike', 'adidas', 'puma', 'hp', 'dell', 'lenovo', 'asus', 'sony', 'jbl', 'lg'];
  products.forEach(p => {
    const words = p.name.split(/\s+/);
    words.forEach(w => {
      if (commonBrands.includes(w.toLowerCase())) {
        brands.add(w);
      }
    });
  });

  brands.forEach(brand => {
    const normBrand = normalize(brand);
    if (normalizedTerms.some(t => normBrand.includes(t) || t.includes(normBrand))) {
      const key = `brand-${normBrand}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          type: 'brand',
          label: brand,
        });
      }
    }
  });

  // 3. Suggestions de produits
  const scoredProducts = products.map(product => {
    let score = 0;
    const name = normalize(product.name);
    const description = normalize(product.description);
    const cat = normalize(CATEGORY_DISPLAY[product.category] || '');

    for (const term of normalizedTerms) {
      // Match exact dans le nom = score élevé
      if (name.includes(term)) score += 10;
      // Match début de mot dans le nom
      if (name.split(/\s+/).some(w => w.startsWith(term))) score += 5;
      // Match dans la description
      if (description.includes(term)) score += 3;
      // Match dans la catégorie
      if (cat.includes(term)) score += 2;
    }

    // Bonus pour produits en stock
    if (product.stock > 0) score += 1;
    // Bonus pour produits en promo
    if (product.old_price && product.old_price > product.price) score += 1;

    return { product, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 6);

  scoredProducts.forEach(({ product }) => {
    const key = `product-${product.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push({
        type: 'product',
        label: product.name,
        product,
        category: product.category,
      });
    }
  });

  return suggestions.slice(0, 8);
}

// ─── Recherche intelligente de produits ─────────────────────────
export interface SmartSearchOptions {
  inStockOnly?: boolean;
  fastDelivery?: boolean;
  priceMin?: number;
  priceMax?: number;
  category?: ProductCategory | 'all';
}

export function smartSearch(
  query: string,
  products: Product[],
  options: SmartSearchOptions = {}
): { results: Product[]; correctedQuery: string | null; matchedCategory: ProductCategory | null } {
  let correctedQuery: string | null = null;
  let matchedCategory: ProductCategory | null = null;

  // Étape 1 : Correction orthographique
  const corrected = correctQuery(query);
  if (normalize(corrected) !== normalize(query)) {
    correctedQuery = corrected;
  }

  const searchTerms = corrected.toLowerCase().split(/\s+/).filter(Boolean);
  const allTerms = searchTerms.flatMap(t => getSynonyms(t));
  const normalizedTerms = [...new Set(allTerms.map(t => normalize(t)))];

  // Détection de catégorie dans la requête
  for (const [cat, labels] of Object.entries(CATEGORY_LABELS)) {
    if (normalizedTerms.some(term =>
      labels.some(l => normalize(l) === term || normalize(l).includes(term))
    )) {
      matchedCategory = cat as ProductCategory;
      break;
    }
  }

  // Étape 2 : Scoring des produits
  let results = products.map(product => {
    let score = 0;
    const name = normalize(product.name);
    const description = normalize(product.description);
    const cat = normalize(CATEGORY_DISPLAY[product.category] || '');

    for (const term of normalizedTerms) {
      // Match exact dans le nom
      if (name.includes(term)) score += 10;
      // Match début de mot
      if (name.split(/\s+/).some(w => w.startsWith(term))) score += 5;
      // Match flou dans le nom (distance <= 2)
      if (name.split(/\s+/).some(w => levenshtein(w, term) <= 2 && term.length > 3)) score += 3;
      // Match dans la description
      if (description.includes(term)) score += 3;
      // Match dans la catégorie
      if (cat.includes(term)) score += 2;
    }

    return { product, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.product);

  // Étape 3 : Appliquer les filtres
  if (options.category && options.category !== 'all') {
    results = results.filter(p => p.category === options.category);
  }

  if (options.inStockOnly) {
    results = results.filter(p => p.stock > 0);
  }

  if (options.priceMin !== undefined && options.priceMin > 0) {
    results = results.filter(p => p.price >= options.priceMin!);
  }

  if (options.priceMax !== undefined && options.priceMax > 0) {
    results = results.filter(p => p.price <= options.priceMax!);
  }

  return { results, correctedQuery, matchedCategory };
}

// ─── Obtenir des produits similaires (pour le cas "aucun résultat") ─
export function getSimilarProducts(query: string, products: Product[]): Product[] {
  const corrected = correctQuery(query);
  const searchTerms = corrected.toLowerCase().split(/\s+/).filter(Boolean);
  const allTerms = searchTerms.flatMap(t => getSynonyms(t));
  const normalizedTerms = [...new Set(allTerms.map(t => normalize(t)))];

  // Trouver la catégorie la plus probable
  let bestCategory: ProductCategory | null = null;
  for (const [cat, labels] of Object.entries(CATEGORY_LABELS)) {
    if (normalizedTerms.some(term =>
      labels.some(l => normalize(l).includes(term) || term.includes(normalize(l)))
    )) {
      bestCategory = cat as ProductCategory;
      break;
    }
  }

  // Si on a trouvé une catégorie, retourner des produits de cette catégorie
  if (bestCategory) {
    return products
      .filter(p => p.category === bestCategory && p.stock > 0)
      .sort((a, b) => {
        // Prioriser les produits en vedette et les promos
        const aScore = (a.featured ? 2 : 0) + (a.old_price && a.old_price > a.price ? 1 : 0);
        const bScore = (b.featured ? 2 : 0) + (b.old_price && b.old_price > b.price ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 4);
  }

  // Sinon retourner les produits populaires / en vedette
  return products
    .filter(p => p.stock > 0)
    .sort((a, b) => {
      const aScore = (a.featured ? 3 : 0) + (a.old_price && a.old_price > a.price ? 1 : 0);
      const bScore = (b.featured ? 3 : 0) + (b.old_price && b.old_price > b.price ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 4);
}
