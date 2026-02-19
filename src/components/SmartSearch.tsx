import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Tag, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { getSearchSuggestions, correctQuery, SearchSuggestion } from '../utils/searchEngine';

// ─── SmartSearch : barre de recherche intelligente avec auto-complétion ──
export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [corrected, setCorrected] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const location = useLocation();

  // Charger les produits au montage
  useEffect(() => {
    fetch('/.netlify/functions/get-products')
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(() => {});
  }, []);

  // Synchroniser avec l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setQuery(q);
  }, [location.pathname]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  const updateSuggestions = useCallback((value: string) => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setCorrected(null);
      setShowDropdown(false);
      return;
    }

    setLoading(true);

    // Correction orthographique
    const correctedQuery = correctQuery(value);
    if (correctedQuery.toLowerCase() !== value.toLowerCase()) {
      setCorrected(correctedQuery);
    } else {
      setCorrected(null);
    }

    // Obtenir les suggestions
    const results = getSearchSuggestions(value, products);
    setSuggestions(results);
    setShowDropdown(results.length > 0 || correctedQuery.toLowerCase() !== value.toLowerCase());
    setSelectedIndex(-1);
    setLoading(false);
  }, [products]);

  const handleInputChange = (value: string) => {
    setQuery(value);

    // Debounce de 150ms pour la performance
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSuggestions(value);
    }, 150);
  };

  // Exécuter la recherche complète
  const executeSearch = (searchQuery: string) => {
    const params = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    navigate(`/shop?${params.toString()}`, { replace: true });
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  // Gestion du clavier (flèches, entrée, échap)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        executeSearch(query);
      }
      return;
    }
  };

  // Clic sur une suggestion
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'product':
        if (suggestion.product) {
          navigate(`/product/${suggestion.product.id}`);
        }
        break;
      case 'category':
        if (suggestion.category) {
          navigate(`/shop?cat=${suggestion.category}`);
        }
        break;
      case 'brand':
        executeSearch(suggestion.label);
        break;
    }
    setShowDropdown(false);
    setQuery('');
  };

  // Appliquer la correction
  const handleCorrection = () => {
    if (corrected) {
      setQuery(corrected);
      executeSearch(corrected);
    }
  };

  // Effacer la recherche
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setCorrected(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Icône par type de suggestion
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'category': return <Tag size={16} />;
      case 'brand': return <ShoppingBag size={16} />;
      case 'product': return <Search size={16} />;
    }
  };

  // Label par type
  const getTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'category': return 'Catégorie';
      case 'brand': return 'Marque';
      case 'product': return 'Produit';
    }
  };

  return (
    <div className="smart-search-wrapper" ref={wrapperRef}>
      <div className="smart-search-bar">
        <Search size={18} className="smart-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="smart-search-input"
          placeholder="Rechercher un produit, une catégorie, une marque..."
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {loading && <Loader2 size={16} className="smart-search-loader" />}
        {query && !loading && (
          <button className="smart-search-clear" onClick={clearSearch} aria-label="Effacer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown des suggestions */}
      {showDropdown && (
        <div className="smart-search-dropdown" role="listbox">
          {/* Correction orthographique */}
          {corrected && (
            <button className="smart-search-correction" onClick={handleCorrection}>
              <span className="correction-label">Vouliez-vous dire :</span>
              <span className="correction-text">{corrected}</span>
              <ArrowRight size={14} />
            </button>
          )}

          {/* Liste des suggestions */}
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.label}-${index}`}
              className={`smart-search-suggestion ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
              <div className="suggestion-content">
                <span className="suggestion-label">{suggestion.label}</span>
                {suggestion.type === 'product' && suggestion.product && (
                  <span className="suggestion-price">
                    {suggestion.product.price.toLocaleString('fr-SN')} FCFA
                  </span>
                )}
              </div>
              <span className={`suggestion-type suggestion-type-${suggestion.type}`}>
                {getTypeLabel(suggestion.type)}
              </span>
            </button>
          ))}

          {/* Bouton "voir tous les résultats" */}
          {query.trim().length >= 2 && (
            <button
              className="smart-search-view-all"
              onClick={() => executeSearch(corrected || query)}
            >
              <Search size={14} />
              <span>Voir tous les résultats pour « {corrected || query} »</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
