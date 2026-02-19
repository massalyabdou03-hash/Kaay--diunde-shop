import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Check, Truck, Shield, MessageCircle, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import SuggestionForm from '../components/SuggestionForm';

/* Données des témoignages clients */
const testimonials = [
  {
    name: 'Aminata Diallo',
    city: 'Dakar',
    text: 'Livraison rapide et produit conforme. Je recommande.',
    avatar: `https://ui-avatars.com/api/?name=Aminata+Diallo&background=f97316&color=fff&size=136&font-size=0.4&bold=true`,
  },
  {
    name: 'Moussa Ndiaye',
    city: 'Ziguinchor',
    text: 'Très satisfait, service sérieux et professionnel.',
    avatar: `https://ui-avatars.com/api/?name=Moussa+Ndiaye&background=1d4ed8&color=fff&size=136&font-size=0.4&bold=true`,
  },
  {
    name: 'Fatou Sow',
    city: 'Thiès',
    text: 'Produit de qualité, paiement à la livraison sans problème.',
    avatar: `https://ui-avatars.com/api/?name=Fatou+Sow&background=10b981&color=fff&size=136&font-size=0.4&bold=true`,
  },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [added, setAdded]       = useState<Set<string>>(new Set());
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/.netlify/functions/get-products')
      .then(r => r.json())
      .then((data: Product[]) => {
        setFeatured(data.filter(p => p.featured));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Animation fade-in au scroll pour les cartes témoignages */
  useEffect(() => {
    const node = testimonialsRef.current;
    if (!node) return;
    const cards = node.querySelectorAll('.testimonial-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((card, i) => {
      (card as HTMLElement).style.transitionDelay = `${i * 150}ms`;
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  const handleAdd = (product: Product) => {
    addToCart(product);
    setAdded(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAdded(prev => { const s = new Set(prev); s.delete(product.id); return s; });
    }, 2000);
  };

  const handleOrder = (product: Product) => {
    addToCart(product);
    navigate('/checkout');
  };

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

      {/* Section produits mis en avant */}
      {!loading && featured.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <div className="featured-title">
                <Star size={24} className="featured-star" />
                <h2>Produits en vedette</h2>
              </div>
              <p>Notre sélection de produits phares</p>
            </div>
            <div className="products-grid">
              {featured.map(product => (
                <div key={product.id} className="product-card featured-card">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </Link>

                  {product.old_price && product.old_price > product.price && (
                    <span className="discount-badge">
                      -{Math.round((1 - product.price / product.old_price) * 100)}%
                    </span>
                  )}

                  <span className="featured-badge"><Star size={12} /> En vedette</span>

                  <div className="product-info">
                    <Link to={`/product/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>

                    <div className="product-price">
                      <span className="price">{product.price.toLocaleString('fr-SN')} FCFA</span>
                      {product.old_price && product.old_price > product.price && (
                        <span className="original-price">{product.old_price.toLocaleString('fr-SN')} FCFA</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAdd(product)}
                      className={`btn-add-cart ${added.has(product.id) ? 'added' : ''}`}
                      disabled={product.stock === 0}
                    >
                      {added.has(product.id) ? (
                        <><Check size={18} /><span>Ajouté !</span></>
                      ) : (
                        <><ShoppingCart size={18} /><span>{product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span></>
                      )}
                    </button>

                    <button
                      onClick={() => handleOrder(product)}
                      className="btn-order"
                      disabled={product.stock === 0}
                    >
                      <ShoppingBag size={18} />
                      <span>Commander</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="featured-cta">
              <Link to="/shop" className="btn-see-all">Voir tous les produits →</Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Section témoignages clients */}
      <section className="testimonials-section" ref={testimonialsRef}>
        <div className="container">
          <div className="section-header">
            <h2>Ce que nos clients disent</h2>
            <p>Ils nous ont fait confiance</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="testimonial-avatar"
                  loading="lazy"
                />
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-city">{t.city}</div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={18} />
                  ))}
                </div>
                <p className="testimonial-text">« {t.text} »</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section formulaire de suggestions */}
      <SuggestionForm />

      <section className="cta">
        <div className="container">
          <h2>Prêt à commander ?</h2>
          <Link to="/shop" className="btn-cta">Voir la boutique →</Link>
        </div>
      </section>
    </div>
  );
}
