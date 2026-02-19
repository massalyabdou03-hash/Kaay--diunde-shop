import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Check, ShoppingBag, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, ProductCategory } from '../types';

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
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lecture du paramètre de recherche depuis l'URL
  const searchQuery = searchParams.get('q') || '';

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
  };

  // Filtrage et tri combinés
  const filtered = useMemo(() => {
    let result = [...products];

    // Filtre par recherche texte
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Filtre par catégorie
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Filtre par prix min
    if (priceMin) {
      const min = Number(priceMin);
      if (!isNaN(min)) result = result.filter(p => p.price >= min);
    }

    // Filtre par prix max
    if (priceMax) {
      const max = Number(priceMax);
      if (!isNaN(max)) result = result.filter(p => p.price <= max);
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

    return result;
  }, [products, searchQuery, category, priceMin, priceMax, sortBy]);

  const hasActiveFilters = category !== 'all' || sortBy !== 'default' || priceMin || priceMax;

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
          <div className="filter-group">
            <label>Prix</label>
            <div className="filter-group-price">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
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

          {hasActiveFilters && (
            <button className="btn-reset-filters" onClick={resetFilters}>
              <RotateCcw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Réinitialiser
            </button>
          )}
        </div>

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

        {filtered.length === 0 && !loading && (
          <p className="no-products">Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
}
