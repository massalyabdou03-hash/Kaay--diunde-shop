import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Package, MapPin, Phone, User, MessageCircle, Trash2 } from 'lucide-react';
import { WHATSAPP_NUMBER, formatCurrency, DeliveryZone } from '../constants';

const deliveryFees: Record<string, number> = {
  [DeliveryZone.DAKAR]: 2000,
  [DeliveryZone.PIKINE]: 2500,
  [DeliveryZone.GUEDIAWAYE]: 2500,
  [DeliveryZone.RUFISQUE]: 3000,
  [DeliveryZone.THIES]: 5000,
  [DeliveryZone.MBOUR]: 7000,
  [DeliveryZone.SAINT_LOUIS]: 10000,
  [DeliveryZone.KAOLACK]: 8000,
  [DeliveryZone.ZIGUINCHOR]: 15000,
  [DeliveryZone.OTHER]: 5000,
};

export default function Checkout() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    zone: DeliveryZone.DAKAR,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryFees[formData.zone] || 2000;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsAppOrder = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (cart.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    setIsSubmitting(true);

    // Créer le message WhatsApp
    const orderDetails = cart.map(item => 
      `• ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
    ).join('\n');

    const message = `🛍️ *NOUVELLE COMMANDE - KAAY DIUNDE*

👤 *Client:* ${formData.name}
📱 *Téléphone:* ${formData.phone}
📍 *Adresse:* ${formData.address}
🗺️ *Zone:* ${formData.zone}

*PRODUITS:*
${orderDetails}

💰 *Sous-total:* ${formatCurrency(subtotal)}
🚚 *Livraison:* ${formatCurrency(deliveryFee)}
💳 *TOTAL:* ${formatCurrency(total)}

${formData.notes ? `📝 *Notes:* ${formData.notes}` : ''}

_Paiement à la livraison_`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Envoyer aussi au backend pour enregistrement
    fetch('/.netlify/functions/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
        deliveryZone: formData.zone,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        deliveryFee,
        total,
        notes: formData.notes,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Commande enregistrée:', data);
        clearCart();
        setIsSubmitting(false);
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          navigate('/');
        }, 2000);
      })
      .catch(error => {
        console.error('Erreur lors de l\'enregistrement:', error);
        setIsSubmitting(false);
      });
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <Package size={64} className="empty-cart-icon" />
          <h2>Votre panier est vide</h2>
          <p>Découvrez nos produits et ajoutez-les à votre panier</p>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Voir la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Finaliser la commande</h1>

      <div className="checkout-grid">
        {/* Formulaire */}
        <div className="checkout-form">
          <div className="card">
            <h2 className="section-title">
              <User size={24} />
              Informations de livraison
            </h2>

            <div className="form-group">
              <label htmlFor="name">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Amadou Diallo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: 77 123 45 67"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Adresse complète *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ex: Sacré-Coeur 3, Villa 123"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="zone">Zone de livraison *</label>
              <select
                id="zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
              >
                <option value={DeliveryZone.DAKAR}>Dakar - {formatCurrency(2000)}</option>
                <option value={DeliveryZone.PIKINE}>Pikine - {formatCurrency(2500)}</option>
                <option value={DeliveryZone.GUEDIAWAYE}>Guédiawaye - {formatCurrency(2500)}</option>
                <option value={DeliveryZone.RUFISQUE}>Rufisque - {formatCurrency(3000)}</option>
                <option value={DeliveryZone.THIES}>Thiès - {formatCurrency(5000)}</option>
                <option value={DeliveryZone.MBOUR}>Mbour - {formatCurrency(7000)}</option>
                <option value={DeliveryZone.SAINT_LOUIS}>Saint-Louis - {formatCurrency(10000)}</option>
                <option value={DeliveryZone.KAOLACK}>Kaolack - {formatCurrency(8000)}</option>
                <option value={DeliveryZone.ZIGUINCHOR}>Ziguinchor - {formatCurrency(15000)}</option>
                <option value={DeliveryZone.OTHER}>Autre région - {formatCurrency(5000)}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (optionnel)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instructions spéciales pour la livraison..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Résumé de la commande */}
        <div className="checkout-summary">
          <div className="card">
            <h2 className="section-title">
              <Package size={24} />
              Votre commande
            </h2>

            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">{formatCurrency(item.price)}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    title="Retirer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Livraison ({formData.zone})</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="payment-info">
              <p>💳 Paiement à la livraison</p>
              <p>📱 Wave / Orange Money acceptés</p>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              disabled={isSubmitting}
              className="btn-whatsapp"
            >
              <MessageCircle size={20} />
              {isSubmitting ? 'Envoi en cours...' : 'Confirmer par WhatsApp'}
            </button>

            <p className="checkout-note">
              ✅ Votre commande sera envoyée via WhatsApp pour confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
