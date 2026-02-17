import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Trash2, Edit, Package, Shield } from 'lucide-react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider, useCart } from './context/CartContext';
import './App.css';

function CartButton() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={() => navigate('/checkout')}
      className="cart-button"
      aria-label="Panier"
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="cart-badge">{itemCount}</span>
      )}
    </button>
  );
}

function AdminButton() {
  const navigate = useNavigate();
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminAccess = () => {
    // Mot de passe par défaut : admin2024
    // À changer dans les variables d'environnement en production
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin2024';
    
    if (password === adminPassword) {
      sessionStorage.setItem('adminAuth', 'true');
      navigate('/admin');
      setShowAdminPrompt(false);
      setPassword('');
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowAdminPrompt(true)}
        className="admin-button"
        title="Accès Admin"
      >
        <Shield size={20} />
        <span>Admin</span>
      </button>

      {showAdminPrompt && (
        <div className="modal-overlay" onClick={() => setShowAdminPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Accès Admin</h3>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
              className="admin-input"
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button onClick={handleAdminAccess} className="btn-primary">
                Se connecter
              </button>
              <button onClick={() => {
                setShowAdminPrompt(false);
                setPassword('');
                setError('');
              }} className="btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-kaay">Kaay</span>
          <span className="logo-diunde">Diunde</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/shop" className="nav-link">Boutique</Link>
          <AdminButton />
          <CartButton />
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© 2024 Kaay Diunde - Boutique en ligne au Sénégal 🇸🇳</p>
          <p>Paiement à la livraison • Livraison rapide dans tout le Sénégal</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;
