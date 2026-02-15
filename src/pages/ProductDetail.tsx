import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../lib/api';
import { WHATSAPP_NUMBER } from '../constants';
import { useCart } from '../hooks/useCart';
import { Product } from '../types';

// ========================================
// PRODUCT DETAIL PAGE
// ========================================

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setError('Produit non trouvé');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
        <button onClick={() => navigate('/shop')} className="text-orange-600 font-bold">Retour à la boutique</button>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const text = `Bonjour Kaay Diunde, je souhaite commander : ${product.name} (Qté: ${quantity}).`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const categoryName = product.category === 'electronics' ? 'Électronique' : 
                       product.category === 'shoes' ? 'Chaussures' : 'Quotidien';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover aspect-square" />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
            {categoryName}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-orange-600">{product.price.toLocaleString()} FCFA</span>
            {product.old_price && (
              <span className="text-xl text-gray-400 line-through">{product.old_price.toLocaleString()} FCFA</span>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          {product.stock > 0 ? (
            <>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-bold text-gray-700">Quantité:</label>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">({product.stock} en stock)</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleBuyNow}
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 active:scale-95 transition-all"
                  >
                    ACHETER MAINTENANT
                  </button>
                  <button 
                    onClick={handleWhatsAppOrder}
                    className="w-full border-2 border-green-500 text-green-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-50 active:scale-95 transition-all"
                  >
                    COMMANDER SUR WHATSAPP
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8">
              ⚠️ Produit actuellement en rupture de stock
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">✅</span>
              <span>Paiement sécurisé à la livraison</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">🚀</span>
              <span>Livraison en 24h à Dakar</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">🔄</span>
              <span>Satisfait ou remboursé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
