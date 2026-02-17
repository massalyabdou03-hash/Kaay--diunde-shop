import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    fetch(`/.netlify/functions/get-product?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading product:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <p>Produit non trouvé</p>
        <Link to="/shop" className="btn-back">
          <ArrowLeft size={20} />
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/shop" className="btn-back">
          <ArrowLeft size={20} />
          Retour à la boutique
        </Link>

        <div className="product-detail">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
            {product.discount && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>

          <div className="product-content">
            <h1>{product.name}</h1>
            
            <div className="product-price-detail">
              <span className="price">{product.price.toLocaleString()} FCFA</span>
              {product.originalPrice && (
                <span className="original-price">
                  {product.originalPrice.toLocaleString()} FCFA
                </span>
              )}
            </div>

            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">En stock ({product.stock} disponibles)</span>
              ) : (
                <span className="out-of-stock">Rupture de stock</span>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            <button
              onClick={() => addToCart(product)}
              className="btn-add-to-cart"
              disabled={product.stock === 0}
            >
              <ShoppingCart size={20} />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
