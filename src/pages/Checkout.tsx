import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DeliveryZone, OrderFormData } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

const DELIVERY_FEES: Record<DeliveryZone, number> = {
  [DeliveryZone.DAKAR]:   2000,
  [DeliveryZone.PIKINE]:  2500,
  [DeliveryZone.RUFISQUE]:3000,
  [DeliveryZone.THIES]:   4000,
  [DeliveryZone.OTHER]:   5000,
};

const PAYMENT_METHODS = ['Paiement à la livraison (Cash)', 'Wave', 'Orange Money'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<OrderFormData & { paymentMethod: string }>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryZone: DeliveryZone.DAKAR,
    paymentMethod: PAYMENT_METHODS[0],
  });

  const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = DELIVERY_FEES[form.deliveryZone];
  const total       = subtotal + deliveryFee;

  const handleWhatsApp = async () => {
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    const message = [
      '🛍️ *NOUVELLE COMMANDE — Kaay Diunde*',
      '',
      `👤 *Client :* ${form.customerName}`,
      `📞 *Téléphone :* ${form.customerPhone}`,
      `📍 *Zone :* ${form.deliveryZone}`,
      `🏠 *Adresse :* ${form.deliveryAddress}`,
      `💳 *Paiement :* ${form.paymentMethod}`,
      '',
      '*ARTICLES :*',
      ...items.map(i => `• ${i.name} ×${i.quantity} = ${(i.price * i.quantity).toLocaleString('fr-SN')} FCFA`),
      '',
      `Sous-total : ${subtotal.toLocaleString('fr-SN')} FCFA`,
      `Livraison  : ${deliveryFee.toLocaleString('fr-SN')} FCFA`,
      `*TOTAL     : ${total.toLocaleString('fr-SN')} FCFA*`,
    ].join('\n');

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    setSubmitting(true);
    try {
      // Enregistrer la commande en base
      await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:    form.customerName,
          customerPhone:   form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          deliveryZone:    form.deliveryZone,
          paymentMethod:   form.paymentMethod,
          items,
          subtotal,
          deliveryFee,
          total,
        }),
      });
    } catch (err) {
      console.error('Erreur enregistrement commande:', err);
      // On continue quand même vers WhatsApp
    } finally {
      setSubmitting(false);
      clearCart();
      window.open(waUrl, '_blank');
      navigate('/');
    }
  };

  if (items.length === 0) return (
    <div className="container">
      <div className="empty-checkout">
        <h2>Votre panier est vide 🛒</h2>
        <button onClick={() => navigate('/shop')} className="btn-shop">
          Continuer mes achats
        </button>
      </div>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Finaliser la commande</h1>

        <div className="checkout-grid">
          {/* Articles */}
          <div className="checkout-items">
            <h2>Votre panier ({items.length} article{items.length > 1 ? 's' : ''})</h2>
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price.toLocaleString('fr-SN')} FCFA / unité</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                </div>
                <div className="item-total">{(item.price * item.quantity).toLocaleString('fr-SN')} FCFA</div>
                <button onClick={() => removeFromCart(item.id)} className="btn-remove"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div className="checkout-form">
            <h2>Informations de livraison</h2>

            <div className="form-group">
              <label>Nom complet *</label>
              <input type="text" value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                placeholder="Prénom Nom" />
            </div>

            <div className="form-group">
              <label>Téléphone *</label>
              <input type="tel" value={form.customerPhone}
                onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="77 123 45 67" />
            </div>

            <div className="form-group">
              <label>Zone de livraison *</label>
              <select value={form.deliveryZone}
                onChange={e => setForm({ ...form, deliveryZone: e.target.value as DeliveryZone })}>
                {Object.values(DeliveryZone).map(zone => (
                  <option key={zone} value={zone}>
                    {zone} — {DELIVERY_FEES[zone].toLocaleString('fr-SN')} FCFA
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Adresse complète *</label>
              <textarea rows={3} value={form.deliveryAddress}
                onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="Quartier, rue, point de repère…" />
            </div>

            <div className="form-group">
              <label>Mode de paiement</label>
              <select value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Récapitulatif */}
            <div className="order-summary">
              <div className="summary-row"><span>Sous-total</span><span>{subtotal.toLocaleString('fr-SN')} FCFA</span></div>
              <div className="summary-row"><span>Livraison</span><span>{deliveryFee.toLocaleString('fr-SN')} FCFA</span></div>
              <div className="summary-row total"><span>Total</span><span>{total.toLocaleString('fr-SN')} FCFA</span></div>
            </div>

            <button onClick={handleWhatsApp} className="btn-whatsapp" disabled={submitting}>
              <MessageCircle size={20} />
              {submitting ? 'Envoi en cours…' : 'Confirmer par WhatsApp'}
            </button>

            <p className="payment-info">💰 Paiement à la livraison · Cash, Wave, Orange Money</p>
          </div>
        </div>
      </div>
    </div>
  );
}
