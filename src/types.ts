// ========================================
// TYPES TYPESCRIPT
// ========================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  oldPrice?: number; // Alias pour compatibilité
  image: string;
  category: 'electronics' | 'shoes' | 'daily';
  featured: boolean;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum DeliveryZone {
  DAKAR = 'Dakar',
  PIKINE = 'Pikine',
  RUFISQUE = 'Rufisque',
  THIES = 'Thiès',
  ST_LOUIS = 'Saint-Louis',
  ZIGUINCHOR = 'Ziguinchor',
  AUTRE = 'Autre région',
}
