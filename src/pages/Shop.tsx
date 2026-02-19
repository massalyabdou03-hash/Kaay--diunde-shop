import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Check, ShoppingBag, RotateCcw, SearchX, Package, Truck, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, ProductCategory } from '../types';
import { smartSearch, getSimilarProducts } from '../utils/searchEngine';
import { WHATSAPP_NUMBER } from '../constants';

const CATEGORIES: Array<ProductCategory | 'all'> = ['all','electronics','fashion','accessories','home','sports','books'];
const LABELS: Record<ProductCategory | 'all', string> = {
  all: 'Tous', electronics: 'Électronique', fashion: 'Mode',
  accessories: 'Accessoires', home: 'Maison', sports: 'Sport', books: 'Livres'
};

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'newest';
const SORT_LABELS: Record<SortOption, string> = {
  default: 'Par défaut',
  price_asc: 'Prix croissant',
  price_desc: 'Prix décroissant',
  newest: 'Plus récents',
};

export default function Shop() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [category, setCategory]         = useState<ProductCategory | 'all'>('all');
  const [added, setAdded]               = useState<Set<string>>(new Set());
  const [sortBy, setSortBy]             = useState<SortOption>('default');
  const [priceMin, setPriceMin]         = useState('');
  const [priceMax, setPriceMax]         = useState('');
  const [inStockOnly, setInStockOnly]   = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [priceSlider, setPriceSlider]   = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lecture des paramètres de recherche depuis l'URL
  const searchQuery = searchParams.get('q') || '';
  const catFromUrl = searchParams.get('cat') || '';

  // Appliquer la catégorie depuis l'URL
  useEffect(() => {
    if (catFromUrl && CATEGORIES.includes(catFromUrl as ProductCategory)) {
      setCategory(catFromUrl as ProductCategory);
    }
  }, [catFromUrl]);

  // Calculer le prix max des produits pour le slider
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 500000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  useEffect(() => {
    fetch('/.netlify/functions/get-products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error('Erreur chargement produits:', err); setLoading(false); });
  }, []);

  const handleAdd = (product: Product) => {
    addToCart(product);
    setAdded(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAdded(prev => { const s = new Set(prev); s.delete(product.id); return s; });
    }, 2000);
  };

  const handleOrder = (product: Product) => {
    addToCart(product);
    navigate('/checkout');
  };

  const resetFilters = () => {
    setCategory('all');
    setSortBy('default');
    setPriceMin('');
    setPriceMax('');
    setInStockOnly(false);
    setFastDelivery(false);
    setPriceSlider(0);
  };

  // Recherche intelligente + filtrage combinés
  const { filtered, correctedQuery, matchedCategory } = useMemo(() => {
    let result: Product[];
    let correctedQuery: string | null = null;
    let matchedCategory: ProductCategory | null = null;

    if (searchQuery.trim()) {
      // Utiliser le moteur de recherche intelligent
      const searchResult = smartSearch(searchQuery, products, {
        inStockOnly,
        priceMin: priceMin ? Number(priceMin) : (priceSlider > 0 ? priceSlider : undefined),
        priceMax: priceMax ? Number(priceMax) : undefined,
        category: category !== 'all' ? category : undefined,
      });
      result = searchResult.results;
      correctedQuery = searchResult.correctedQuery;
      matchedCategory = searchResult.matchedCategory;
    } else {
      result = [...products];

      // Filtre par catégorie
      if (category !== 'all') {
        result = result.filter(p => p.category === category);
      }

      // Filtre en stock
      if (inStockOnly) {
        result = result.filter(p => p.stock > 0);
      }

      // Filtre par prix min
      if (priceMin) {
        const min = Number(priceMin);
        if (!isNaN(min)) result = result.filter(p => p.price >= min);
      } else if (priceSlider > 0) {
        result = result.filter(p => p.price >= priceSlider);
      }

      // Filtre par prix max
      if (priceMax) {
        const max = Number(priceMax);
        if (!isNaN(max)) result = result.filter(p => p.price <= max);
      }
    }

    // Tri
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        });
        break;
    }

    return { filtered: result, correctedQuery, matchedCategory };
  }, [products, searchQuery, category, priceMin, priceMax, priceSlider, sortBy, inStockOnly]);

  // Produits similaires en cas de résultat vide
  const similarProducts = useMemo(() => {
    if (filtered.length === 0 && searchQuery.trim() && products.length > 0) {
      return getSimilarProducts(searchQuery, products);
    }
    return [];
  }, [filtered.length, searchQuery, products]);

  const hasActiveFilters = category !== 'all' || sortBy !== 'default' || priceMin || priceMax || inStockOnly || fastDelivery || priceSlider > 0;

  // Appliquer la correction
  const applyCorrection = () => {
    if (correctedQuery) {
      const params = new URLSearchParams(searchParams);
      params.set('q', correctedQuery);
      setSearchParams(params, { replace: true });
    }
  };

  // Lien WhatsApp pour commander
  const whatsappSearchUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Bonjour, je cherche "${searchQuery}" sur votre boutique mais je n'ai pas trouvé. Pouvez-vous m'aider ?`
  )}`;

  if (loading) return <div className="container"><div className="loading">Chargement des produits…</div></div>;

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-header">
          <h1>Notre Boutique</h1>
          {searchQuery && (
            <p style={{ color: 'var(--gray-400)', marginTop: '4px', fontSize: '.9rem' }}>
              Résultats pour « {searchQuery} » — {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Barre de correction orthographique */}
        {correctedQuery && filtered.length > 0 && (
          <div className="search-correction-bar">
            <span>Résultats pour</span>
            <strong onClick={applyCorrection}>{correctedQuery}</strong>
            <span>au lieu de « {searchQuery} »</span>
          </div>
        )}

        {/* Filtres rapides après recherche */}
        {searchQuery && filtered.length > 0 && (
          <div className="search-filters-row">
            <button
              className={`search-filter-chip ${inStockOnly ? 'active' : ''}`}
              onClick={() => setInStockOnly(!inStockOnly)}
            >
              <Package size={14} />
              En stock
            </button>
            <button
              className={`search-filter-chip ${fastDelivery ? 'active' : ''}`}
              onClick={() => setFastDelivery(!fastDelivery)}
            >
              <Truck size={14} />
              Livraison rapide
            </button>
            {matchedCategory && category === 'all' && (
              <button
                className="search-filter-chip"
                onClick={() => setCategory(matchedCategory!)}
              >
                {LABELS[matchedCategory]}
              </button>
            )}
          </div>
        )}

        {/* Filtres par catégorie */}
        <div className="filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Filtres avancés : prix et tri */}
        <div className="shop-filters-bar">
          {/* Slider prix min */}
          <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Prix minimum</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="0"
                max={maxPrice}
                step={1000}
                value={priceSlider}
                onChange={e => { setPriceSlider(Number(e.target.value)); setPriceMin(''); }}
                style={{ flex: 1, minHeight: 'auto' }}
              />
              <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--orange)', whiteSpace: 'nowrap', minWidth: '80px', textAlign: 'right' }}>
                {priceSlider > 0 ? `${priceSlider.toLocaleString('fr-SN')} F` : 'Tout'}
              </span>
            </div>
          </div>

          <div className="filter-group">
            <label>Prix</label>
            <div className="filter-group-price">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={e => { setPriceMin(e.target.value); setPriceSlider(0); }}
                min="0"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Trier par</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
              {(Object.keys(SORT_LABELS) as SortOption[]).map(key => (
                <option key={key} value={key}>{SORT_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Disponibilité</label>
            <button
              className={`search-filter-chip ${inStockOnly ? 'active' : ''}`}
              onClick={() => setInStockOnly(!inStockOnly)}
              style={{ marginTop: '0' }}
            >
              <Package size={14} />
              En stock
            </button>
          </div>

          {hasActiveFilters && (
            <button className="btn-reset-filters" onClick={resetFilters}>
              <RotateCcw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Grille de produits */}
        {filtered.length > 0 && (
          <div className="products-grid">
            {filtered.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                </Link>

                {product.old_price && product.old_price > product.price && (
                  <span className="discount-badge">
                    -{Math.round((1 - product.price / product.old_price) * 100)}%
                  </span>
                )}

                {product.stock === 0 && (
                  <span className="discount-badge" style={{ background: 'var(--gray-600)', left: 'auto', right: '12px' }}>
                    Rupture
                  </span>
                )}

                <div className="product-info">
                  <Link to={`/product/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>

                  <div className="product-price">
                    <span className="price">{product.price.toLocaleString('fr-SN')} FCFA</span>
                    {product.old_price && product.old_price > product.price && (
                      <span className="original-price">{product.old_price.toLocaleString('fr-SN')} FCFA</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    className={`btn-add-cart ${added.has(product.id) ? 'added' : ''}`}
                    disabled={product.stock === 0}
                  >
                    {added.has(product.id) ? (
                      <><Check size={18} /><span>Ajouté !</span></>
                    ) : (
                      <><ShoppingCart size={18} /><span>{product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span></>
                    )}
                  </button>

                  <button
                    onClick={() => handleOrder(product)}
                    className="btn-order"
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag size={18} />
                    <span>Commander</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* État vide intelligent */}
        {filtered.length === 0 && !loading && (
          <div className="empty-results">
            <div className="empty-results-icon">
              <SearchX size={36} />
            </div>
            <h3>
              {searchQuery
                ? `Aucun résultat pour « ${searchQuery} »`
                : 'Aucun produit trouvé avec ces filtres'}
            </h3>

            {correctedQuery && (
              <p className="empty-results-correction">
                Essayez avec : <strong onClick={applyCorrection} style={{ cursor: 'pointer' }}>{correctedQuery}</strong>
              </p>
            )}

            <p>Voici quelques conseils :</p>
            <ul className="empty-results-tips">
              <li>Vérifiez l'orthographe de votre recherche</li>
              <li>Essayez des termes plus généraux</li>
              <li>Recherchez par catégorie ou marque</li>
              {hasActiveFilters && <li>Modifiez ou réinitialisez vos filtres</li>}
            </ul>

            {hasActiveFilters && (
              <button className="btn-reset-filters" onClick={resetFilters} style={{ marginBottom: '16px' }}>
                <RotateCcw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Réinitialiser les filtres
              </button>
            )}

            {/* Bouton WhatsApp */}
            {searchQuery && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href={whatsappSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-search"
                >
                  <MessageCircle size={18} />
                  Commander sur WhatsApp
                </a>
              </div>
            )}

            {/* Produits similaires */}
            {similarProducts.length > 0 && (
              <div className="similar-products-section">
                <h4>Produits qui pourraient vous intéresser</h4>
                <div className="similar-products-grid">
                  {similarProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <Link to={`/product/${product.id}`}>
                        <img src={product.image} alt={product.name} loading="lazy" />
                      </Link>
                      {product.old_price && product.old_price > product.price && (
                        <span className="discount-badge">
                          -{Math.round((1 - product.price / product.old_price) * 100)}%
                        </span>
                      )}
                      <div className="product-info">
                        <Link to={`/product/${product.id}`}>
                          <h3>{product.name}</h3>
                        </Link>
                        <div className="product-price">
                          <span className="price">{product.price.toLocaleString('fr-SN')} FCFA</span>
                          {product.old_price && product.old_price > product.price && (
                            <span className="original-price">{product.old_price.toLocaleString('fr-SN')} FCFA</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAdd(product)}
                          className={`btn-add-cart ${added.has(product.id) ? 'added' : ''}`}
                          disabled={product.stock === 0}
                        >
                          {added.has(product.id) ? (
                            <><Check size={18} /><span>Ajouté !</span></>
                          ) : (
                            <><ShoppingCart size={18} /><span>Ajouter au panier</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
