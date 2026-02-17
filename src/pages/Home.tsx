import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <h1>Bienvenue chez Kaay Diunde</h1>
          <p className="hero-subtitle">
            Votre boutique en ligne de confiance au Sénégal
          </p>
          <p className="hero-description">
            Des produits de qualité, livrés rapidement dans tout le Sénégal. 
            Paiement à la livraison pour votre tranquillité d'esprit.
          </p>
          <Link to="/shop" className="btn-hero">
            <ShoppingBag size={20} />
            Découvrir la boutique
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Pourquoi choisir Kaay Diunde ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Truck size={40} />
              </div>
              <h3>Livraison rapide</h3>
              <p>Livraison dans tout le Sénégal sous 24-48h</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={40} />
              </div>
              <h3>Paiement sécurisé</h3>
              <p>Paiement à la livraison (Cash, Wave, Orange Money)</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MessageCircle size={40} />
              </div>
              <h3>Service client</h3>
              <p>Support via WhatsApp 7j/7</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-content">
          <h2>Prêt à commander ?</h2>
          <p>Découvrez notre sélection de produits</p>
          <Link to="/shop" className="btn-cta">
            Voir la boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
