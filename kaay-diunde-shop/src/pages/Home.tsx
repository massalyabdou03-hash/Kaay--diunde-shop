import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, CreditCard, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: 'white',
        padding: '6rem 1rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>
            Bienvenue chez Kaay Diunde
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            Votre boutique en ligne de confiance au Sénégal
          </p>
          <Link to="/shop" className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            <ShoppingBag size={24} />
            Découvrir nos produits
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1rem', background: 'white' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Truck size={40} color="#f97316" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Livraison rapide</h3>
              <p style={{ color: '#6b7280' }}>Livraison dans tout le Sénégal sous 24-48h</p>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <CreditCard size={40} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Paiement à la livraison</h3>
              <p style={{ color: '#6b7280' }}>Cash, Wave ou Orange Money acceptés</p>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Shield size={40} color="#1e40af" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Produits garantis</h3>
              <p style={{ color: '#6b7280' }}>Tous nos produits sont neufs et garantis</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1rem',
        background: '#f9fafb',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Prêt à commander ?
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
            Découvrez notre sélection de produits aux meilleurs prix
          </p>
          <Link to="/shop" className="btn-primary" style={{ fontSize: '1.1rem' }}>
            Voir la boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
