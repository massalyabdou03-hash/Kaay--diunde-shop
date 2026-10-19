import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Truck, Wallet } from 'lucide-react';
import { WHATSAPP_NUMBER, PHONE_NUMBER, SITE_NAME, formatPhone } from '../constants';

export default function Footer() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Bonjour, j\'ai une question sur votre boutique.'
  )}`;

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div>
          <h3 className="site-footer-title">{SITE_NAME}</h3>
          <p className="site-footer-text">
            Accessoires de téléphone, smartphones et bons plans, livrés partout au Sénégal.
          </p>
        </div>

        <div>
          <h3 className="site-footer-title">Nous contacter</h3>
          <ul className="site-footer-list">
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`tel:+${PHONE_NUMBER}`}>
                <Phone size={16} /> {formatPhone(PHONE_NUMBER)}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer-title">Livraison & paiement</h3>
          <ul className="site-footer-list">
            <li><Truck size={16} /> Livraison sous 24–48h</li>
            <li><Wallet size={16} /> Paiement à la livraison : Cash, Wave ou Orange Money</li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer-title">Navigation</h3>
          <ul className="site-footer-list">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/shop">Boutique</Link></li>
          </ul>
        </div>
      </div>

      <div className="container site-footer-bottom">
        © {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés.
      </div>
    </footer>
  );
}
