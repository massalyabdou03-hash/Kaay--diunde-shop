import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Product, ProductCategory } from '../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'electronics' as ProductCategory,
    image: '',
    stock: 0,
    discount: 0,
  });

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadProducts();
  }, [navigate]);

  const loadProducts = () => {
    fetch('/.netlify/functions/get-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: 'electronics',
      image: '',
      stock: 0,
      discount: 0,
    });
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      image: product.image,
      stock: product.stock,
      discount: product.discount || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const endpoint = editingProduct 
      ? '/.netlify/functions/update-product'
      : '/.netlify/functions/add-product';

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowModal(false);
      loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await fetch('/.netlify/functions/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Tableau de bord Admin</h1>
          <button onClick={handleAddProduct} className="btn-add">
            <Plus size={20} />
            Ajouter un produit
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={32} />
            </div>
            <div className="stat-info">
              <h3>Total Produits</h3>
              <p className="stat-value">{totalProducts}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-info">
              <h3>Valeur Stock</h3>
              <p className="stat-value">{totalValue.toLocaleString()} FCFA</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={32} />
            </div>
            <div className="stat-info">
              <h3>Stock Faible</h3>
              <p className="stat-value">{lowStockProducts}</p>
            </div>
          </div>
        </div>

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className="product-thumbnail" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.price.toLocaleString()} FCFA</td>
                  <td>
                    <span className={product.stock < 5 ? 'low-stock' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn-edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn-delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="product-modal" onClick={e => e.stopPropagation()}>
              <h2>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h2>

              <div className="form-group">
                <label>ID du produit *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  placeholder="iphone-13"
                  disabled={!!editingProduct}
                />
              </div>

              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 13 128GB"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du produit..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Prix original</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Catégorie *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                >
                  <option value="electronics">Électronique</option>
                  <option value="fashion">Mode</option>
                  <option value="accessories">Accessoires</option>
                  <option value="home">Maison</option>
                  <option value="sports">Sport</option>
                  <option value="books">Livres</option>
                </select>
              </div>

              <div className="form-group">
                <label>URL de l'image *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Réduction (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="btn-cancel">
                  Annuler
                </button>
                <button onClick={handleSubmit} className="btn-save">
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
