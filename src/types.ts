export type ProductCategory = 'electronics' | 'fashion' | 'accessories' | 'home' | 'sports' | 'books';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price?: number;       // Correspond à old_price en DB
  category: ProductCategory;
  image: string;
  stock: number;
  featured?: boolean;
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
  paymentMethod?: string;
}

export interface Order extends OrderFormData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
