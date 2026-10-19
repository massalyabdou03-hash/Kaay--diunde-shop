import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Minus, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DeliveryZone, OrderFormData } from '../types';
import { WHATSAPP_NUMBER } from '../constants';
import { usePageMeta } from '../utils/usePageMeta';

const DELIVERY_FEES: Record<DeliveryZone, number> = {
  [DeliveryZone.DAKAR]:   2000,
  [DeliveryZone.PIKINE]:  2500,
  [DeliveryZone.RUFISQUE]:3000,
  [DeliveryZone.THIES]:   4000,
  [DeliveryZone.OTHER]:   5000,
};

const PAYMENT_METHODS = ['Cash à la livraison', 'Wave à la livraison', 'Orange Money à la livraison'];

// Préfixes valides pour les numéros sénégalais
const SENEGAL_PREFIXES = ['77', '76', '78', '75', '70'];

// Vérifie si un numéro sénégalais est valide (9 chiffres, bon préfixe)
function isValidSenegalPhone(phone: string): boolean {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('221')) digits = digits.slice(3);
  if (digits.length !== 9) return false;
  return SENEGAL_PREFIXES.some(prefix => digits.startsWith(prefix));
}

// Numéro de secours, utilisé UNIQUEMENT si le serveur est injoignable.
// En temps normal, le numéro de commande est celui généré par le serveur.
function generateFallbackOrderId() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `KD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

interface ServerOrderItem { id: string; name: string; quantity: number; unitPrice: number; }
interface ServerOrderResponse {
  numeroCommande: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: ServerOrderItem[];
}

// Type pour les erreurs de champs
interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  deliveryZone?: string;
  deliveryAddress?: string;
}

export default function Checkout() {
  usePageMeta({ title: 'Finaliser la commande | Kaay Diunde', noindex: true });
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
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

  // Supprime l'erreur d'un champ quand l'utilisateur le corrige
  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Mise à jour du formulaire avec suppression automatique des erreurs
  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      clearError(field as keyof FormErrors);
    }
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.customerName.trim()) {
      newErrors.customerName = 'Veuillez renseigner votre nom pour continuer \u{1F642}';
    }

    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = 'Votre numéro est nécessaire pour confirmer la commande.';
    } else if (!isValidSenegalPhone(form.customerPhone)) {
      newErrors.customerPhone = 'Veuillez entrer un numéro sénégalais valide (77, 76, 78, 75, 70...).';
    }

    if (!form.deliveryZone) {
      newErrors.deliveryZone = 'Merci de choisir votre zone de livraison.';
    }

    if (!form.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Indiquez votre adresse complète pour faciliter la livraison.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Étape 1 : Valider les champs puis afficher la modale de confirmation
  const handleValidateOrder = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  // Étape 2 : enregistrer la commande sur le serveur, puis ouvrir WhatsApp
  const handleWhatsApp = async () => {
    setShowConfirmModal(false);
    setOrderError('');
    setSubmitting(true);

    // La fenêtre WhatsApp est ouverte tout de suite, pendant le clic du client :
    // les navigateurs bloquent les fenêtres ouvertes après une attente réseau.
    const popup = window.open('', '_blank');
    const closePopup = () => { if (popup && !popup.closed) popup.close(); };

    let orderId = '';
    let finalSubtotal = subtotal;
    let finalDeliveryFee = deliveryFee;
    let finalTotal = total;
    let lines = items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price }));

    try {
      // Le serveur ne reçoit que les produits et quantités : prix, livraison et total
      // sont recalculés côté serveur à partir de la base de données.
      const res = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:    form.customerName,
          customerPhone:   form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          deliveryZone:    form.deliveryZone,
          paymentMethod:   form.paymentMethod,
          items:           items.map(i => ({ id: i.id, quantity: i.quantity })),
        }),
      });

      if (res.ok) {
        const data: ServerOrderResponse = await res.json();
        orderId          = data.numeroCommande;
        finalSubtotal    = data.subtotal;
        finalDeliveryFee = data.deliveryFee;
        finalTotal       = data.total;
        if (Array.isArray(data.items) && data.items.length > 0) lines = data.items;
      } else if (res.status >= 400 && res.status < 500) {
        // Commande refusée (stock insuffisant, champ invalide…) : on l'explique au client
        const data = await res.json().catch(() => ({}));
        setOrderError(data.error || 'Votre commande n\'a pas pu être validée. Vérifiez votre panier.');
        closePopup();
        setSubmitting(false);
        return;
      } else {
        throw new Error(`create-order ${res.status}`);
      }
    } catch (err) {
      // Serveur ou réseau indisponible : la commande reste possible par WhatsApp
      console.error('Erreur enregistrement commande:', err);
      orderId = generateFallbackOrderId();
    }

    const now = new Date();
    const date = now.toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' });
    const sep = '━━━━━━━━━━━━━━━━━━━━━━';

    const orderItems = lines.map(l =>
      `  - ${l.name} x${l.quantity} = ${(l.unitPrice * l.quantity).toLocaleString('fr-SN')} FCFA`
    ).join('\n');

    const message = [
      sep,
      '🛒 *KAAY DIUNDE - NOUVELLE COMMANDE*',
      sep,
      '',
      `🆔 Numero de commande : ${orderId}`,
      `📅 Date : ${date}`,
      `⏰ Heure : ${time}`,
      '',
      sep,
      '👤 *INFORMATIONS CLIENT*',
      '',
      `  • Nom : ${form.customerName}`,
      `  • Telephone : ${form.customerPhone}`,
      `  • Zone : ${form.deliveryZone}`,
      `  • Adresse : ${form.deliveryAddress}`,
      `  • Paiement : ${form.paymentMethod}`,
      '',
      sep,
      '📦 *ARTICLES COMMANDES*',
      orderItems,
      '',
      sep,
      '💰 *RECAPITULATIF*',
      '',
      `  Sous-total : ${finalSubtotal.toLocaleString('fr-SN')} FCFA`,
      `  Livraison : ${finalDeliveryFee.toLocaleString('fr-SN')} FCFA`,
      sep,
      `💵 *TOTAL A PAYER : ${finalTotal.toLocaleString('fr-SN')} FCFA*`,
      sep,
      '',
      '✅ Merci pour votre confiance.',
      '📞 Notre equipe vous contactera rapidement.',
    ].join('\n');

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Événement Google Analytics
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'click_whatsapp', {
        event_category: 'conversion',
        event_label: 'Commande WhatsApp',
        value: finalTotal,
      });
    }

    clearCart();
    setSubmitting(false);

    if (popup && !popup.closed) {
      popup.location.href = waUrl;
      navigate('/');
    } else {
      // Fenêtre bloquée : on utilise l'onglet courant (une navigation n'est jamais bloquée)
      window.location.href = waUrl;
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

          <div className="checkout-form">
            <h2>Informations de livraison</h2>

            <div className={`form-group ${errors.customerName ? 'form-group-error' : ''}`}>
              <label>Nom complet *</label>
              <input type="text" value={form.customerName}
                onChange={e => updateField('customerName', e.target.value)}
                placeholder="Prénom Nom" />
              {errors.customerName && (
                <span className="field-error">{errors.customerName}</span>
              )}
            </div>

            <div className={`form-group ${errors.customerPhone ? 'form-group-error' : ''}`}>
              <label>Téléphone *</label>
              <input type="tel" value={form.customerPhone}
                onChange={e => updateField('customerPhone', e.target.value)}
                placeholder="77 123 45 67" />
              {errors.customerPhone && (
                <span className="field-error">{errors.customerPhone}</span>
              )}
            </div>

            <div className={`form-group ${errors.deliveryZone ? 'form-group-error' : ''}`}>
              <label>Zone de livraison *</label>
              <select value={form.deliveryZone}
                onChange={e => updateField('deliveryZone', e.target.value)}>
                {Object.values(DeliveryZone).map(zone => (
                  <option key={zone} value={zone}>
                    {zone} — {DELIVERY_FEES[zone].toLocaleString('fr-SN')} FCFA
                  </option>
                ))}
              </select>
              {errors.deliveryZone && (
                <span className="field-error">{errors.deliveryZone}</span>
              )}
            </div>

            <div className={`form-group ${errors.deliveryAddress ? 'form-group-error' : ''}`}>
              <label>Adresse complète *</label>
              <textarea rows={3} value={form.deliveryAddress}
                onChange={e => updateField('deliveryAddress', e.target.value)}
                placeholder="Quartier, rue, point de repère…" />
              {errors.deliveryAddress && (
                <span className="field-error">{errors.deliveryAddress}</span>
              )}
            </div>

            <div className="form-group">
              <label>Mode de paiement</label>
              <select value={form.paymentMethod}
                onChange={e => updateField('paymentMethod', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="order-summary">
              <div className="summary-row"><span>Sous-total</span><span>{subtotal.toLocaleString('fr-SN')} FCFA</span></div>
              <div className="summary-row"><span>Livraison</span><span>{deliveryFee.toLocaleString('fr-SN')} FCFA</span></div>
              <div className="summary-row total"><span>Total</span><span>{total.toLocaleString('fr-SN')} FCFA</span></div>
            </div>

            {orderError && (
              <p className="field-error" role="alert" style={{ marginBottom: 12 }}>{orderError}</p>
            )}

            <button
              onClick={handleValidateOrder}
              className="btn-whatsapp"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="spin-icon" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  Valider la commande
                </>
              )}
            </button>

            <p className="payment-info">💰 Paiement à la livraison · Cash, Wave, Orange Money</p>
          </div>
        </div>
      </div>

      {/* ── Modale de confirmation avant redirection WhatsApp ── */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <button className="confirm-modal-close" onClick={() => setShowConfirmModal(false)}>
              <X size={20} />
            </button>
            <div className="confirm-modal-icon">
              <MessageCircle size={36} />
            </div>
            <h2>Confirmation</h2>
            <p className="confirm-modal-text">
              Vous allez être redirigé vers WhatsApp pour confirmer votre commande.
              <br />
              Veuillez vérifier les informations puis cliquer sur Envoyer.
            </p>
            <div className="confirm-modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="btn-cancel">
                Annuler
              </button>
              <button onClick={handleWhatsApp} className="btn-confirm-whatsapp">
                <MessageCircle size={18} />
                Continuer vers WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
