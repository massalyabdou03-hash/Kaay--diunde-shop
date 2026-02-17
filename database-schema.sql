-- Kaay Diunde Shop - Database Schema
-- PostgreSQL / Neon Database

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

-- Create products table
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category VARCHAR(50) NOT NULL,
    image TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    discount INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_zone VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Insert sample products
INSERT INTO products (id, name, description, price, original_price, category, image, stock, discount) VALUES
('iphone-13', 'iPhone 13 128GB', 'iPhone 13 neuf, débloqué tous opérateurs. Garantie 1 an. Livraison gratuite à Dakar.', 450000, 500000, 'electronics', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800', 15, 10),
('samsung-s23', 'Samsung Galaxy S23', 'Samsung S23 5G neuf, écran AMOLED 120Hz. Garantie constructeur 1 an.', 380000, 420000, 'electronics', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 20, 10),
('macbook-air-m2', 'MacBook Air M2', 'MacBook Air M2 2023, 8GB RAM, 256GB SSD. Neuf en boîte scellée.', 850000, 950000, 'electronics', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 8, 11),
('airpods-pro', 'AirPods Pro 2', 'AirPods Pro 2ème génération avec réduction de bruit active. Garantie Apple.', 145000, 165000, 'electronics', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800', 30, 12),
('nike-air-max', 'Nike Air Max 90', 'Baskets Nike Air Max 90 authentiques. Toutes tailles disponibles. Livraison rapide.', 65000, 75000, 'fashion', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 25, 13),
('adidas-originals', 'Adidas Originals Superstar', 'Baskets Adidas Superstar classiques. Cuir véritable. Tailles 38-46.', 55000, 65000, 'fashion', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', 18, 15),
('montre-casio', 'Montre Casio G-Shock', 'Montre Casio G-Shock résistante à l''eau. Garantie 2 ans.', 45000, 55000, 'accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 12, 18),
('sac-cuir', 'Sac à main en cuir', 'Sac à main élégant en cuir véritable. Plusieurs compartiments. Livraison offerte.', 35000, 45000, 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 10, 22);

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
