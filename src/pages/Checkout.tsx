import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DeliveryZone, OrderFormData } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryZone: DeliveryZone.DAKAR,
    notes: '',
  });

  const deliveryFees: Record<DeliveryZone, number> = {
    [DeliveryZone.DAKAR]: 2000,
    [DeliveryZone.PIKINE]: 2500,
    [DeliveryZone.RUFISQUE]: 3000,
    [DeliveryZone.THIES]: 4000,
    [DeliveryZone.OTHER]: 5000,
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryFees[formData.deliveryZone];
  const total = subtotal + deliveryFee;

  const handleWhatsAppOrder = () => {
    if (!formData.customerName || !formData.customerPhone || !formData.deliveryAddress) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const orderDetails = `
🛍️ *NOUVELLE COMMANDE - Kaay Diunde*

*Client:* ${formData.customerName}
*Téléphone:* ${formData.customerPhone}
*Adresse:* ${formData.deliveryAddress}
*Zone:* ${formData.deliveryZone}

*PRODUITS:*
${items.map(item => `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} FCFA`).join('\n')}

*Sous-total:* ${subtotal.toLocaleString()} FCFA
*Frais de livraison:* ${deliveryFee.toLocaleString()} FCFA
*TOTAL:* ${total.toLocaleString()} FCFA

${formData.notes ? `*Notes:* ${formData.notes}` : ''}
    `.trim();

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderDetails)}`;

    // Enregistrer la commande dans la base de données
    fetch('/.netlify/functions/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        items,
        subtotal,
        deliveryFee,
        total,
      }),
    })
      .then(() => {
        clearCart();
        window.open(whatsappUrl, '_blank');
        navigate('/');
      })
      .catch(err => {
        console.error('Error creating order:', err);
        // Ouvrir WhatsApp quand même
        window.open(whatsappUrl, '_blank');
        clearCart();
        navigate('/');
      });
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-checkout">
          <h2>Votre panier est vide</h2>
          <button onClick={() => navigate('/shop')} className="btn-shop">
            Continuer mes achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Finaliser la commande</h1>

        <div className="checkout-grid">
          <div className="checkout-items">
            <h2>Votre panier ({items.length} articles)</h2>
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price.toLocaleString()} FCFA</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} FCFA
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn-remove"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-form">
            <h2>Informations de livraison</h2>
            
            <div className="form-group">
              <label>Nom complet *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Votre nom"
                required
              />
            </div>

            <div className="form-group">
              <label>Téléphone *</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="77 123 45 67"
                required
              />
            </div>

            <div className="form-group">
              <label>Adresse de livraison *</label>
              <textarea
                value={formData.deliveryAddress}
                onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder="Adresse complète"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>Zone de livraison *</label>
              <select
                value={formData.deliveryZone}
                onChange={e => setFormData({ ...formData, deliveryZone: e.target.value as DeliveryZone })}
              >
                {Object.values(DeliveryZone).map(zone => (
                  <option key={zone} value={zone}>
                    {zone} - {deliveryFees[zone].toLocaleString()} FCFA
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Instructions spéciales..."
                rows={2}
              />
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Sous-total:</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="summary-row">
                <span>Livraison:</span>
                <span>{deliveryFee.toLocaleString()} FCFA</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button onClick={handleWhatsAppOrder} className="btn-whatsapp">
              <MessageCircle size={20} />
              Confirmer par WhatsApp
            </button>

            <p className="payment-info">
              💰 Paiement à la livraison (Cash, Wave, Orange Money)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
