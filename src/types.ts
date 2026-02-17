export type ProductCategory = 'electronics' | 'fashion' | 'accessories' | 'home' | 'sports' | 'books';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  image: string;
  stock: number;
  discount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum DeliveryZone {
  DAKAR = 'Dakar',
  PIKINE = 'Pikine-Guédiawaye',
  RUFISQUE = 'Rufisque',
  THIES = 'Thiès',
  OTHER = 'Autre région',
}

export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: DeliveryZone;
  notes?: string;
}

export interface Order extends OrderFormData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
