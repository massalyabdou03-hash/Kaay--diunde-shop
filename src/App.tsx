import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, Shield, Store, X } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// ─── Logo ─────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link to="/" className="logo">
      <div className="logo-icon">🏪</div>
      <div className="logo-text">
        <span className="kaay">Kaay</span>
        <span className="diunde"> Diunde</span>
      </div>
    </Link>
  );
}

// ─── AppContent (accès au CartContext) ────────────────────────────────
function AppContent() {
  const { items, totalItems } = useCart();
  const [showCart, setShowCart]         = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword]   = useState('');
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem('isAdmin') === 'true'
  );

  const handleAdminLogin = () => {
    const expected =
      import.meta.env.VITE_ADMIN_PASSWORD ||
      import.meta.env.VITE_ADMIN_SECRET  ||
      'admin2024';

    if (adminPassword === expected) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
      window.location.href = '/admin';
    } else {
      alert('❌ Mot de passe incorrect');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app">
        {/* ── Header ── */}
        <header className="header">
          <div className="container header-content">
            <Logo />

            <nav className="nav">
              <Link to="/" className="nav-link">
                <Store size={18} />
                <span>Accueil</span>
              </Link>
              <Link to="/shop" className="nav-link">
                <ShoppingCart size={18} />
                <span>Boutique</span>
              </Link>

              {isAdmin ? (
                <>
                  <Link to="/admin" className="nav-link admin-link">
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                  <button onClick={handleAdminLogout} className="btn-logout">
                    Déconnexion
                  </button>
                </>
              ) : (
                <button onClick={() => setShowAdminLogin(true)} className="btn-admin">
                  <Shield size={16} />
                  Admin
                </button>
              )}

              <button className="cart-button" onClick={() => setShowCart(true)}>
                <ShoppingCart size={22} />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>
            </nav>
          </div>
        </header>

        {/* ── Routes ── */}
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/shop"       element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout"   element={<Checkout />} />
          <Route path="/admin"      element={<AdminDashboard />} />
        </Routes>

        {/* ── Cart modal ── */}
        {showCart && (
          <div className="modal-overlay" onClick={() => setShowCart(false)}>
            <div className="cart-modal" onClick={e => e.stopPropagation()}>
              <div className="cart-header">
                <h2>Panier ({totalItems} article{totalItems !== 1 ? 's' : ''})</h2>
                <button onClick={() => setShowCart(false)}><X size={20} /></button>
              </div>

              <div className="cart-items">
                {items.length === 0 ? (
                  <p className="empty-cart">Votre panier est vide 🛒</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>{(item.price * item.quantity).toLocaleString('fr-SN')} FCFA</p>
                      </div>
                      <span style={{ fontSize: '.8rem', color: '#94a3b8' }}>×{item.quantity}</span>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="cart-footer">
                  <Link
                    to="/checkout"
                    className="btn-checkout"
                    onClick={() => setShowCart(false)}
                  >
                    Confirmer la commande →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Admin login modal ── */}
        {showAdminLogin && (
          <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
            <div className="admin-login-modal" onClick={e => e.stopPropagation()}>
              <h2>🔐 Connexion Admin</h2>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  autoFocus
                />
              </div>
              <button onClick={handleAdminLogin} className="btn-login">
                Se connecter
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
