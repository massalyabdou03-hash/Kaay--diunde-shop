import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, DollarSign, AlertTriangle, Megaphone, Settings, Save, Eye, EyeOff } from 'lucide-react';
import { Product, ProductCategory } from '../types';

/* ─── Types pour la publicité flottante ─────────────── */
interface FloatingAdForm {
  enabled: boolean;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  button_color: string;
  position: string;
  display_duration: string;
}

interface ProductForm {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number;
  category: ProductCategory;
  image: string;
  featured: boolean;
  stock: number;
}

const EMPTY_FORM: ProductForm = {
  id: '', name: '', description: '', price: 0,
  old_price: 0, category: 'electronics', image: '', featured: false, stock: 0
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm]                 = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);

  /* ─── État publicité flottante ─────────────────────── */
  const [activeTab, setActiveTab]       = useState<'products' | 'floating-ad'>('products');
  const [adForm, setAdForm]             = useState<FloatingAdForm>({
    enabled: false, title: '', description: '', button_text: '',
    button_url: '', button_color: '#f97316', position: 'bottom-right', display_duration: '24h'
  });
  const [adLoading, setAdLoading]       = useState(false);
  const [adSaving, setAdSaving]         = useState(false);
  const [adMessage, setAdMessage]       = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') { navigate('/'); return; }
    loadProducts();
    loadFloatingAdConfig();
  }, [navigate]);

  /* ─── Charger la config publicité ──────────────────── */
  const loadFloatingAdConfig = () => {
    setAdLoading(true);
    fetch('/.netlify/functions/get-floating-ad')
      .then(r => r.json())
      .then(data => {
        setAdForm({
          enabled: data.enabled || false,
          title: data.title || '',
          description: data.description || '',
          button_text: data.button_text || '',
          button_url: data.button_url || '',
          button_color: data.button_color || '#f97316',
          position: data.position || 'bottom-right',
          display_duration: data.display_duration || '24h'
        });
        setAdLoading(false);
      })
      .catch(err => { console.error(err); setAdLoading(false); });
  };

  /* ─── Sauvegarder la config publicité ──────────────── */
  const handleSaveAd = async () => {
    // Validation URL côté client (accepte liens internes et externes)
    const urlValue = adForm.button_url.trim();
    if (urlValue !== '') {
      // Bloquer javascript: et autres protocoles dangereux
      const lower = urlValue.toLowerCase().replace(/\s/g, '');
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
        alert('URL non autorisée pour des raisons de sécurité.');
        return;
      }

      const isExternal = urlValue.startsWith('http://') || urlValue.startsWith('https://');
      const isInternal = urlValue.startsWith('/');

      if (!isExternal && !isInternal) {
        alert('URL invalide. Utilisez un chemin interne (/promo) ou un lien complet (https://...)');
        return;
      }

      if (isExternal) {
        try {
          new URL(urlValue);
        } catch {
          alert('URL externe invalide. Exemple : https://example.com');
          return;
        }
      }
    }

    setAdSaving(true);
    setAdMessage('');
    try {
      const res = await fetch('/.netlify/functions/save-floating-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
      setAdMessage('Configuration sauvegardée avec succès !');
      setTimeout(() => setAdMessage(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Erreur : ' + msg);
    } finally {
      setAdSaving(false);
    }
  };

  const loadProducts = () => {
    setLoading(true);
    fetch('/.netlify/functions/get-products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      id: p.id, name: p.name, description: p.description,
      price: p.price, old_price: p.old_price || 0,
      category: p.category, image: p.image,
      featured: p.featured || false, stock: p.stock
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.id || !form.price) {
      alert('Veuillez remplir tous les champs obligatoires (ID, Nom, Prix)');
      return;
    }
    setSaving(true);
    const url = editingProduct
      ? '/.netlify/functions/update-product'
      : '/.netlify/functions/add-product';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
      setShowModal(false);
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Erreur : ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    try {
      const res = await fetch('/.netlify/functions/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Erreur suppression');
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  const totalValue    = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < 5).length;

  if (loading) return <div className="container"><div className="loading">Chargement…</div></div>;

  return (
    <div className="admin-dashboard">
      <div className="container">

        <div className="admin-header">
          <h1>Tableau de bord</h1>
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'products' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={16} /> Produits
            </button>
            <button
              className={`admin-tab ${activeTab === 'floating-ad' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('floating-ad')}
            >
              <Megaphone size={16} /> Publicité flottante
            </button>
          </div>
        </div>

        {/* ═══════════ ONGLET PRODUITS ═══════════ */}
        {activeTab === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button onClick={openAdd} className="btn-add">
                <Plus size={18} /> Ajouter un produit
              </button>
            </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Package size={24} /></div>
            <div className="stat-info">
              <h3>Produits</h3>
              <p className="stat-value">{products.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><DollarSign size={24} /></div>
            <div className="stat-info">
              <h3>Valeur stock</h3>
              <p className="stat-value">{totalValue.toLocaleString('fr-SN')} FCFA</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h3>Stock faible</h3>
              <p className="stat-value" style={{ color: lowStockCount > 0 ? '#ef4444' : undefined }}>
                {lowStockCount}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Ancien prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image} alt={p.name} className="product-thumbnail" /></td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.price.toLocaleString('fr-SN')} FCFA</td>
                  <td>{p.old_price ? `${p.old_price.toLocaleString('fr-SN')} FCFA` : '—'}</td>
                  <td><span className={p.stock < 5 ? 'low-stock' : ''}>{p.stock}</span></td>
                  <td>{p.category}</td>
                  <td>{p.featured ? '⭐' : '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openEdit(p)} className="btn-edit" title="Modifier"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="btn-delete" title="Supprimer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="no-products">Aucun produit. Ajoutez-en un !</p>}
        </div>

        {/* Modal formulaire */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="product-modal" onClick={e => e.stopPropagation()}>
              <h2>{editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}</h2>

              <div className="form-group">
                <label>ID unique *</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="iphone-15-pro"
                  disabled={!!editingProduct}
                />
              </div>

              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="iPhone 15 Pro" />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description du produit…" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix (FCFA) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min={0} />
                </div>
                <div className="form-group">
                  <label>Ancien prix (FCFA)</label>
                  <input type="number" value={form.old_price} onChange={e => setForm({ ...form, old_price: Number(e.target.value) })} min={0} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ProductCategory })}>
                    <option value="electronics">Électronique</option>
                    <option value="fashion">Mode</option>
                    <option value="accessories">Accessoires</option>
                    <option value="home">Maison</option>
                    <option value="sports">Sport</option>
                    <option value="books">Livres</option>
                    <option value="ramadan">Ramadan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} min={0} />
                </div>
              </div>

              <div className="form-group">
                <label>URL de l'image *</label>
                <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={e => setForm({ ...form, featured: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="featured" style={{ marginBottom: 0, cursor: 'pointer' }}>Produit mis en avant (featured)</label>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="btn-cancel">Annuler</button>
                <button onClick={handleSave} className="btn-save" disabled={saving}>
                  {saving ? 'Sauvegarde…' : editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* ═══════════ ONGLET PUBLICITÉ FLOTTANTE ═══════════ */}
        {activeTab === 'floating-ad' && (
          <div className="floating-ad-admin">
            <div className="floating-ad-admin__header">
              <div className="floating-ad-admin__header-icon">
                <Megaphone size={24} />
              </div>
              <div>
                <h2>Paramètres — Publicité flottante</h2>
                <p>Configurez la publicité qui s'affiche sur votre site</p>
              </div>
            </div>

            {adLoading ? (
              <div className="loading">Chargement de la configuration…</div>
            ) : (
              <div className="floating-ad-admin__form">

                {/* Toggle activer/désactiver */}
                <div className="floating-ad-admin__toggle-row">
                  <div className="floating-ad-admin__toggle-info">
                    <Settings size={18} />
                    <div>
                      <strong>Activer la publicité</strong>
                      <span>{adForm.enabled ? 'La publicité est visible sur le site' : 'La publicité est masquée'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`floating-ad-admin__toggle ${adForm.enabled ? 'floating-ad-admin__toggle--on' : ''}`}
                    onClick={() => setAdForm({ ...adForm, enabled: !adForm.enabled })}
                    aria-label={adForm.enabled ? 'Désactiver' : 'Activer'}
                  >
                    <span className="floating-ad-admin__toggle-knob" />
                    {adForm.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>

                {/* Titre */}
                <div className="form-group">
                  <label>Titre</label>
                  <input
                    type="text"
                    value={adForm.title}
                    onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                    placeholder="Ex: Offre spéciale !"
                    maxLength={255}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={adForm.description}
                    onChange={e => setAdForm({ ...adForm, description: e.target.value })}
                    placeholder="Ex: Profitez de -20% sur tous les produits cette semaine…"
                    maxLength={2000}
                  />
                </div>

                {/* Texte du bouton + URL */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Texte du bouton</label>
                    <input
                      type="text"
                      value={adForm.button_text}
                      onChange={e => setAdForm({ ...adForm, button_text: e.target.value })}
                      placeholder="Ex: Voir l'offre"
                      maxLength={255}
                    />
                  </div>
                  <div className="form-group">
                    <label>Lien du bouton</label>
                    <input
                      type="text"
                      value={adForm.button_url}
                      onChange={e => setAdForm({ ...adForm, button_url: e.target.value })}
                      placeholder="/promo ou https://wa.me/..."
                    />
                    <small className="floating-ad-admin__url-hint">
                      Vous pouvez entrer un lien interne (/promo) ou un lien complet (https://...).
                    </small>
                  </div>
                </div>

                {/* Couleur + Position + Durée */}
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="form-group">
                    <label>Couleur du bouton</label>
                    <div className="floating-ad-admin__color-picker">
                      <input
                        type="color"
                        value={adForm.button_color}
                        onChange={e => setAdForm({ ...adForm, button_color: e.target.value })}
                      />
                      <span>{adForm.button_color}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <select
                      value={adForm.position}
                      onChange={e => setAdForm({ ...adForm, position: e.target.value })}
                    >
                      <option value="bottom-right">Bas droite</option>
                      <option value="bottom-left">Bas gauche</option>
                      <option value="bottom-center">Bas centre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Durée après fermeture</label>
                    <select
                      value={adForm.display_duration}
                      onChange={e => setAdForm({ ...adForm, display_duration: e.target.value })}
                    >
                      <option value="12h">12 heures</option>
                      <option value="24h">24 heures</option>
                      <option value="7d">7 jours</option>
                    </select>
                  </div>
                </div>

                {/* Aperçu */}
                <div className="floating-ad-admin__preview">
                  <h4>Aperçu</h4>
                  <div className="floating-ad-admin__preview-box">
                    <div className="floating-ad-admin__preview-card">
                      {adForm.title && <h3>{adForm.title}</h3>}
                      {adForm.description && <p>{adForm.description}</p>}
                      {adForm.button_text && (
                        <span
                          className="floating-ad-admin__preview-btn"
                          style={{ backgroundColor: adForm.button_color }}
                        >
                          {adForm.button_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message de succès */}
                {adMessage && (
                  <div className="floating-ad-admin__success">{adMessage}</div>
                )}

                {/* Bouton sauvegarder */}
                <button
                  onClick={handleSaveAd}
                  className="btn-save floating-ad-admin__save-btn"
                  disabled={adSaving}
                >
                  <Save size={18} />
                  {adSaving ? 'Sauvegarde en cours…' : 'Sauvegarder la configuration'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
