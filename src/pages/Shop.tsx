import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useCart } from '../hooks/useCart';
import { Product } from '../types';

// ========================================
// SHOP PAGE
// ========================================

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('cat');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProducts(categoryFilter || undefined);
        setProducts(data);
      } catch (err) {
        setError('Impossible de charger les produits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryFilter]);

  const handleBuyNow = (product: Product) => {
    addToCart(product, 1);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notre Boutique</h1>
      
      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setSearchParams({})}
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${!categoryFilter ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Tous
        </button>
        <button 
          onClick={() => setSearchParams({ cat: 'electronics' })}
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${categoryFilter === 'electronics' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Téléphones
        </button>
        <button 
          onClick={() => setSearchParams({ cat: 'shoes' })}
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${categoryFilter === 'shoes' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Chaussures
        </button>
        <button 
          onClick={() => setSearchParams({ cat: 'daily' })}
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${categoryFilter === 'daily' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Quotidien
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <Link to={`/product/${product.id}`} className="block relative">
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
              {product.old_price && (
                <span className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded">PROMO</span>
              )}
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              </Link>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-orange-600">{product.price.toLocaleString()} F</span>
                {product.old_price && <span className="text-gray-400 text-xs line-through">{product.old_price.toLocaleString()} F</span>}
              </div>
              <button 
                onClick={() => handleBuyNow(product)}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Acheter Maintenant
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
