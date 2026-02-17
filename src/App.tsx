import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, Shield, Home as HomeIcon, Store, X } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function AppContent() {
  const { items, totalItems } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('isAdmin') === 'true';
  });

  const handleAdminLogin = () => {
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 
                       import.meta.env.VITE_ADMIN_SECRET || 
                       'admin2024';
    
    if (adminPassword === envPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
      window.location.href = '/admin';
    } else {
      alert('Mot de passe incorrect');
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
        <header className="header">
          <div className="container header-content">
            <Link to="/" className="logo">
              <Store size={32} />
              <span>Kaay Diunde</span>
            </Link>

            <nav className="nav">
              <Link to="/" className="nav-link">
                <HomeIcon size={20} />
                <span>Accueil</span>
              </Link>
              <Link to="/shop" className="nav-link">
                <Store size={20} />
                <span>Boutique</span>
              </Link>
              
              {isAdmin ? (
                <>
                  <Link to="/admin" className="nav-link admin-link">
                    <Shield size={20} />
                    <span>Admin</span>
                  </Link>
                  <button onClick={handleAdminLogout} className="btn-logout">
                    Déconnexion
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAdminLogin(true)}
                  className="btn-admin"
                >
                  <Shield size={20} />
                </button>
              )}

              <button 
                className="cart-button"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </button>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {showCart && (
          <div className="modal-overlay" onClick={() => setShowCart(false)}>
            <div className="cart-modal" onClick={e => e.stopPropagation()}>
              <div className="cart-header">
                <h2>Panier ({totalItems} articles)</h2>
                <button onClick={() => setShowCart(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="cart-items">
                {items.length === 0 ? (
                  <p className="empty-cart">Votre panier est vide</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>{item.price.toLocaleString()} FCFA</p>
                      </div>
                      <div className="cart-item-actions">
                        <span>Qté: {item.quantity}</span>
                      </div>
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
                    Commander
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {showAdminLogin && (
          <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
            <div className="admin-login-modal" onClick={e => e.stopPropagation()}>
              <h2>Connexion Admin</h2>
              <input
                type="password"
                placeholder="Mot de passe"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAdminLogin()}
              />
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

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
