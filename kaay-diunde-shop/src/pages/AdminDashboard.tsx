import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, DollarSign, TrendingUp, ShoppingBag, LogOut } from 'lucide-react';
import { formatCurrency, ProductCategory } from '../constants';
import type { Product } from '../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: ProductCategory.ELECTRONICS,
    image: '',
    stock: '',
    discount: '',
  });

  useEffect(() => {
    // Vérifier l'authentification
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/');
      return;
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      category: formData.category,
      image: formData.image,
      stock: parseInt(formData.stock),
      discount: formData.discount ? parseInt(formData.discount) : null,
    };

    try {
      const endpoint = editingProduct
        ? '/.netlify/functions/update-product'
        : '/.netlify/functions/add-product';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert(editingProduct ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
        setShowProductForm(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        alert('Erreur lors de l\'enregistrement du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement du produit');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      discount: product.discount?.toString() || '',
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });

      if (response.ok) {
        alert('Produit supprimé avec succès!');
        fetchProducts();
      } else {
        alert('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: ProductCategory.ELECTRONICS,
      image: '',
      stock: '',
      discount: '',
    });
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStock = products.filter(p => p.stock < 5).length;

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Tableau de bord Admin</h1>
          <p className="page-subtitle">Gérez vos produits et commandes</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4F46E5' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Produits</p>
            <p className="stat-value">{totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10B981' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Valeur Stock</p>
            <p className="stat-value">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#F59E0B' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Stock Faible</p>
            <p className="stat-value">{lowStock}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-actions">
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowProductForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Ajouter un produit
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showProductForm && (
        <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
          <div className="modal-content product-form" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={ProductCategory.ELECTRONICS}>Électronique</option>
                    <option value={ProductCategory.FASHION}>Mode</option>
                    <option value={ProductCategory.ACCESSORIES}>Accessoires</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix (FCFA) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prix original (FCFA)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Réduction (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    max="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>URL de l'image *</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des produits */}
      <div className="products-table">
        <h2>Produits en stock</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className="table-image" />
                  </td>
                  <td>{product.name}</td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span className={`stock-badge ${product.stock < 5 ? 'low' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn-icon edit"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn-icon delete"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
