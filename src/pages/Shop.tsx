import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, ProductCategory } from '../types';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/.netlify/functions/get-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories: Array<ProductCategory | 'all'> = [
    'all',
    'electronics',
    'fashion',
    'accessories',
    'home',
    'sports',
    'books'
  ];

  const categoryLabels: Record<ProductCategory | 'all', string> = {
    all: 'Tous',
    electronics: 'Électronique',
    fashion: 'Mode',
    accessories: 'Accessoires',
    home: 'Maison',
    sports: 'Sport',
    books: 'Livres'
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="container">
        <h1>Notre Boutique</h1>
        
        <div className="filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              
              {product.discount && (
                <span className="discount-badge">-{product.discount}%</span>
              )}

              <div className="product-info">
                <Link to={`/product/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                
                <div className="product-price">
                  <span className="price">{product.price.toLocaleString()} FCFA</span>
                  {product.originalPrice && (
                    <span className="original-price">
                      {product.originalPrice.toLocaleString()} FCFA
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className={`btn-add-cart ${addedProducts.has(product.id) ? 'added' : ''}`}
                  disabled={product.stock === 0}
                >
                  {addedProducts.has(product.id) ? (
                    <>
                      <Check size={20} />
                      <span>Ajouté !</span>
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
          <p className="no-products">Aucun produit trouvé dans cette catégorie.</p>
        )}
      </div>
    </div>
  );
}
