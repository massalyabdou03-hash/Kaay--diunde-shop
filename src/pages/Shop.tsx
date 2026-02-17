import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, ProductCategory } from '../types';

const CATEGORIES: Array<ProductCategory | 'all'> = ['all','electronics','fashion','accessories','home','sports','books'];
const LABELS: Record<ProductCategory | 'all', string> = {
  all: 'Tous', electronics: 'Électronique', fashion: 'Mode',
  accessories: 'Accessoires', home: 'Maison', sports: 'Sport', books: 'Livres'
};

export default function Shop() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [category, setCategory]         = useState<ProductCategory | 'all'>('all');
  const [added, setAdded]               = useState<Set<string>>(new Set());
  const { addToCart } = useCart();

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

  const filtered = category === 'all' ? products : products.filter(p => p.category === category);

  if (loading) return <div className="container"><div className="loading">Chargement des produits…</div></div>;

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-header">
          <h1>Notre Boutique</h1>
        </div>

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
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <p className="no-products">Aucun produit dans cette catégorie.</p>
        )}
      </div>
    </div>
  );
}
