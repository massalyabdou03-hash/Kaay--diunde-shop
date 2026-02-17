import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../constants';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/.netlify/functions/get-product?id=${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Produit non trouvé</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary" style={{ marginTop: '1rem' }}>
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <button onClick={() => navigate('/shop')} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={20} />
        Retour à la boutique
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Image */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Détails */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f97316' }}>
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: '1.5rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  {formatCurrency(product.originalPrice)}
                </span>
                {product.discount && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '2rem',
                    fontWeight: 700
                  }}>
                    -{product.discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <div style={{
            background: product.stock > 0 ? '#dcfce7' : '#fee2e2',
            color: product.stock > 0 ? '#15803d' : '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontWeight: 600
          }}>
            {product.stock > 0 ? `✓ En stock (${product.stock} disponibles)` : '✗ Rupture de stock'}
          </div>

          <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#4b5563', marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Quantité */}
          {product.stock > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Quantité
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                  style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="quantity-btn"
                  style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Bouton Ajouter au panier */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`btn-add-cart ${added ? 'added' : ''}`}
            style={{ fontSize: '1.1rem', padding: '1rem' }}
          >
            {added ? (
              <>
                <Check size={24} />
                <span>Ajouté au panier !</span>
              </>
            ) : (
              <>
                <ShoppingCart size={24} />
                <span>{product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
