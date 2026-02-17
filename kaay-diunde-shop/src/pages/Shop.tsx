import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, ProductCategory } from '../constants';
import type { Product } from '../types';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    // Animation de confirmation
    setAddedToCart({ ...addedToCart, [product.id]: true });
    setTimeout(() => {
      setAddedToCart({ ...addedToCart, [product.id]: false });
    }, 2000);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Tous les produits' },
    { id: ProductCategory.ELECTRONICS, label: 'Électronique' },
    { id: ProductCategory.FASHION, label: 'Mode' },
    { id: ProductCategory.ACCESSORIES, label: 'Accessoires' },
  ];

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container shop-page">
      <div className="shop-header">
        <h1 className="page-title">Notre Boutique</h1>
        <p className="page-subtitle">Découvrez nos produits aux meilleurs prix</p>
      </div>

      {/* Filtres de catégories */}
      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`category-filter ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grille de produits */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-link">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              {product.discount && (
                <span className="discount-badge">-{product.discount}%</span>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="stock-badge">Plus que {product.stock} en stock</span>
              )}
              {product.stock === 0 && (
                <span className="out-of-stock-badge">Rupture de stock</span>
              )}
            </Link>

            <div className="product-info">
              <Link to={`/product/${product.id}`}>
                <h3 className="product-name">{product.name}</h3>
              </Link>
              
              <div className="product-pricing">
                <span className="product-price">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="product-original-price">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className={`btn-add-cart ${addedToCart[product.id] ? 'added' : ''}`}
              >
                {addedToCart[product.id] ? (
                  <>
                    <Check size={20} />
                    <span>Ajouté au panier</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>{product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-results">
          <p>Aucun produit trouvé dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}
