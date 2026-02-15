// ========================================
// API CLIENT
// Gère toutes les communications avec le backend
// ========================================

const API_BASE_URL = '/.netlify/functions';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  image: string;
  category: string;
  featured: boolean;
  stock: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CreateOrderData {
  name: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// ========================================
// PRODUCTS API
// ========================================

export const getProducts = async (category?: string): Promise<Product[]> => {
  try {
    const url = category 
      ? `${API_BASE_URL}/get-products?category=${category}`
      : `${API_BASE_URL}/get-products`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-product?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// ========================================
// ORDERS API
// ========================================

export const createOrder = async (orderData: CreateOrderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
