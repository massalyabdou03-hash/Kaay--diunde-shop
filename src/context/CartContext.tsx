import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Le panier est conservé dans le navigateur : il survit à un rechargement de la page.
// Les prix affichés peuvent être anciens, mais le serveur les recalcule à la commande.
const STORAGE_KEY = 'kd_cart_v1';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        !!i &&
        typeof i.id === 'string' &&
        typeof i.name === 'string' &&
        Number.isFinite(i.price) &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0
    );
  } catch {
    return [];
  }
}

// Quantité maximale commandable : le stock connu (au moins 1 si le stock est inconnu)
function maxQuantity(item: { stock?: number }): number {
  return typeof item.stock === 'number' && item.stock > 0 ? item.stock : 1;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* stockage indisponible (navigation privée) : le panier reste en mémoire */
    }
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, ...product, quantity: Math.min(i.quantity + 1, maxQuantity(product)) }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: Math.min(quantity, maxQuantity(i)) } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
