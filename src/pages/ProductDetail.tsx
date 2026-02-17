import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded]     = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    fetch(`/.netlify/functions/get-product?id=${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return <div className="container"><div className="loading">Chargement…</div></div>;
  if (!product) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <Link to="/shop" className="btn-back"><ArrowLeft size={18} /> Retour</Link>
      <p style={{ color: '#94a3b8', marginTop: 24 }}>Produit introuvable.</p>
    </div>
  );

  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.old_price!) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/shop" className="btn-back"><ArrowLeft size={18} /> Retour à la boutique</Link>

        <div className="product-detail">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
            {hasDiscount && (
              <span className="discount-badge">-{discountPct}%</span>
            )}
          </div>

          <div className="product-content">
            <h1>{product.name}</h1>

            <div className="product-price-detail">
              <span className="price">{product.price.toLocaleString('fr-SN')} FCFA</span>
              {hasDiscount && (
                <span className="original-price">{product.old_price!.toLocaleString('fr-SN')} FCFA</span>
              )}
            </div>

            <div className="product-stock">
              {product.stock > 0
                ? <span className="in-stock">✅ En stock ({product.stock} disponibles)</span>
                : <span className="out-of-stock">❌ Rupture de stock</span>
              }
            </div>

            <p className="product-description">{product.description}</p>

            <button
              onClick={handleAdd}
              className="btn-add-to-cart"
              disabled={product.stock === 0}
              style={added ? { background: '#10b981' } : undefined}
            >
              {added ? <><Check size={20} /> Ajouté au panier !</> : <><ShoppingCart size={20} /> Ajouter au panier</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
