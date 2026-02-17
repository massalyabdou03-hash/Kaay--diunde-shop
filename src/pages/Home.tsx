import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">🇸🇳 La boutique de confiance au Sénégal</div>
          <h1>Commerce en ligne<br /><span>simple & rapide</span></h1>
          <p className="hero-description">
            Des produits de qualité, livrés rapidement partout au Sénégal.
            Paiement à la livraison — Cash, Wave ou Orange Money.
          </p>
          <Link to="/shop" className="btn-hero">
            <ShoppingBag size={20} />
            Découvrir la boutique
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Pourquoi choisir Kaay Diunde ?</h2>
            <p>Tout ce qu'il faut pour acheter en confiance</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Truck size={26} /></div>
              <h3>Livraison rapide</h3>
              <p>Livraison dans tout le Sénégal sous 24–48h. Frais calculés selon votre zone.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Shield size={26} /></div>
              <h3>Paiement à la livraison</h3>
              <p>Payez seulement quand vous recevez votre colis. Cash, Wave ou Orange Money.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><MessageCircle size={26} /></div>
              <h3>Support WhatsApp</h3>
              <p>Une question ? Notre équipe répond rapidement via WhatsApp, 7j/7.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Prêt à commander ?</h2>
          <p>Plus de 8 produits disponibles, livrés partout au Sénégal</p>
          <Link to="/shop" className="btn-cta">Voir la boutique →</Link>
        </div>
      </section>
    </div>
  );
}
