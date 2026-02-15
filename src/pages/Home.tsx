import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useCart } from '../hooks/useCart';
import { Product } from '../types';

// ========================================
// HOME PAGE
// ========================================

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-600 font-bold text-lg">{product.price.toLocaleString()} FCFA</span>
            {product.old_price && (
              <span className="text-gray-400 text-xs line-through">{product.old_price.toLocaleString()} FCFA</span>
            )}
          </div>
          <button 
            onClick={handleBuyNow}
            className="w-full bg-orange-600 text-white py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-transform"
          >
            ACHETER MAINTENANT
          </button>
        </div>
      </Link>
    </div>
  );
};

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        const featured = products.filter(p => p.featured);
        setFeaturedProducts(featured);
      } catch (err) {
        setError('Impossible de charger les produits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
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
    <div>
      {/* Hero / Banner */}
      <section className="bg-blue-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Des prix imbattables au <span className="text-orange-400">Sénégal</span>
          </h1>
          <p className="text-blue-100 mb-8 text-lg">
            Téléphones, chaussures et gadgets livrés chez vous rapidement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-colors">
              Voir tous les produits
            </Link>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Paiement à la livraison
            </div>
          </div>
        </div>
      </section>

      {/* Categories Fast Link */}
      <section className="py-8 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 flex justify-between overflow-x-auto gap-4 no-scrollbar">
          <Link to="/shop?cat=electronics" className="flex flex-col items-center min-w-[100px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-200">
              📱
            </div>
            <span className="text-xs font-medium text-gray-700">Téléphones</span>
          </Link>
          <Link to="/shop?cat=shoes" className="flex flex-col items-center min-w-[100px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-200">
              👟
            </div>
            <span className="text-xs font-medium text-gray-700">Chaussures</span>
          </Link>
          <Link to="/shop?cat=daily" className="flex flex-col items-center min-w-[100px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-200">
              🧴
            </div>
            <span className="text-xs font-medium text-gray-700">Utiles</span>
          </Link>
          <Link to="/shop" className="flex flex-col items-center min-w-[100px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-200">
              🔥
            </div>
            <span className="text-xs font-medium text-gray-700">Promos</span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Offres du Jour</h2>
          <Link to="/shop" className="text-orange-600 text-sm font-bold flex items-center gap-1">
            Voir plus
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
            <div className="text-3xl">🚚</div>
            <div>
              <h4 className="font-bold text-gray-900">Livraison Partout</h4>
              <p className="text-sm text-gray-600">Dakar et toutes les régions</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-3xl">💵</div>
            <div>
              <h4 className="font-bold text-gray-900">Paiement Cash</h4>
              <p className="text-sm text-gray-600">Payez seulement à la livraison</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
            <div className="text-3xl">💬</div>
            <div>
              <h4 className="font-bold text-gray-900">Assistance 24/7</h4>
              <p className="text-sm text-gray-600">Commandez via WhatsApp</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
