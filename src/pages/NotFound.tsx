import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { usePageMeta } from '../utils/usePageMeta';

export default function NotFound() {
  usePageMeta({
    title: 'Page introuvable | Kaay Diunde',
    description: 'Cette page n\'existe pas ou a été déplacée.',
    noindex: true,
  });

  return (
    <div className="container">
      <div className="empty-checkout">
        <SearchX size={40} />
        <h2>Page introuvable</h2>
        <p style={{ color: 'var(--gray-400)', margin: '8px 0 20px' }}>
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link to="/shop" className="btn-shop">Voir la boutique</Link>
      </div>
    </div>
  );
}
