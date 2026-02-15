import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../lib/api';
import { DeliveryZone } from '../types';

// ========================================
// CHECKOUT PAGE
// ========================================

const Checkout: React.FC = () => {
  const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: DeliveryZone.DAKAR,
    address: '',
    paymentMethod: 'cod'
  });

  const deliveryFees: Record<string, number> = {
    [DeliveryZone.DAKAR]: 2000,
    [DeliveryZone.PIKINE]: 2500,
    [DeliveryZone.RUFISQUE]: 3000,
    [DeliveryZone.THIES]: 4000,
    [DeliveryZone.ST_LOUIS]: 5000,
    [DeliveryZone.ZIGUINCHOR]: 7000,
    [DeliveryZone.AUTRE]: 6000,
  };

  const currentFee = deliveryFees[formData.city] || 0;
  const finalTotal = totalPrice + currentFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Préparer les données de commande
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: totalPrice,
        deliveryFee: currentFee,
        total: finalTotal
      };

      // Envoyer la commande au backend
      await createOrder(orderData);

      // Vider le panier et rediriger
      clearCart();
      navigate('/confirmation');
      
    } catch (err) {
      console.error('Erreur lors de la commande:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <button onClick={() => navigate('/shop')} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold">
          Aller à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Finaliser la commande</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="order-last lg:order-first">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Résumé de la commande
            </h2>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <img src={item.image} className="w-16 h-16 object-cover rounded-lg" alt={item.name} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">Prix unit: {item.price.toLocaleString()} F</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-xs px-2 py-1 bg-gray-100 rounded">-</button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-xs px-2 py-1 bg-gray-100 rounded">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()} F</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 font-bold uppercase mt-2">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{totalPrice.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison ({formData.city})</span>
                <span>{currentFee.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Total à payer</span>
                <span className="text-orange-600">{finalTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Informations de Livraison
            </h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nom Complet</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  placeholder="Ex: Moussa Diop"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Téléphone (WhatsApp)</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  placeholder="Ex: 771234567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ville / Région</label>
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value as DeliveryZone})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                >
                  {Object.values(DeliveryZone).map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Adresse Précise</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  placeholder="Quartier, Rue, près de..."
                ></textarea>
              </div>
            </div>

            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Mode de Paiement
            </h2>

            <div className="grid grid-cols-1 gap-3 mb-8">
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-orange-600 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({...formData, paymentMethod: 'cod'})} className="hidden" />
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-bold text-sm">Paiement à la livraison</p>
                    <p className="text-[10px] text-gray-500">Payez en espèces à la réception</p>
                  </div>
                </div>
                {formData.paymentMethod === 'cod' && <div className="w-4 h-4 rounded-full bg-orange-600"></div>}
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'wave' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={formData.paymentMethod === 'wave'} onChange={() => setFormData({...formData, paymentMethod: 'wave'})} className="hidden" />
                  <span className="text-2xl">🌊</span>
                  <div>
                    <p className="font-bold text-sm text-blue-900">Wave / Orange Money</p>
                    <p className="text-[10px] text-gray-500">Simple et Rapide</p>
                  </div>
                </div>
                {formData.paymentMethod === 'wave' && <div className="w-4 h-4 rounded-full bg-blue-600"></div>}
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>CONFIRMER LA COMMANDE</>
              )}
            </button>
            <p className="text-center text-gray-400 text-[10px] mt-4 uppercase font-bold tracking-widest">
              Garantie Kaay Diunde • Retour Gratuit
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
