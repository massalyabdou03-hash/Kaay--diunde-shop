-- ========================================
-- SCHÉMA BASE DE DONNÉES NEON - KAAY DIUNDE SHOP
-- ========================================

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    old_price INTEGER,
    image TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_city VARCHAR(100) NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Insertion des produits de démonstration
INSERT INTO products (id, name, description, price, old_price, image, category, featured, stock) VALUES
('iphone-13', 'iPhone 13 Pro Max 256GB', 'Dernier iPhone avec écran Super Retina XDR, puce A15 Bionic, et système photo professionnel.', 425000, 550000, 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500', 'electronics', true, 15),
('samsung-s23', 'Samsung Galaxy S23 Ultra', 'Flagship Samsung avec stylet S Pen intégré, caméra 200MP, et écran Dynamic AMOLED 2X.', 380000, 480000, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', 'electronics', true, 20),
('airpods-pro', 'AirPods Pro 2ème génération', 'Écouteurs sans fil avec réduction active du bruit, audio spatial, et résistance à l''eau.', 95000, 125000, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500', 'electronics', false, 30),
('nike-air-max', 'Nike Air Max 270', 'Baskets confortables avec coussin d''air visible, design moderne et respirant.', 45000, 65000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'shoes', true, 50),
('adidas-ultraboost', 'Adidas Ultraboost 22', 'Chaussures de running avec technologie Boost pour un confort maximal.', 52000, null, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500', 'shoes', true, 40),
('smartwatch', 'Montre Connectée Sport', 'Suivi d''activité, fréquence cardiaque, notifications smartphone, étanche.', 28000, 45000, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500', 'electronics', false, 25),
('power-bank', 'Power Bank 20000mAh', 'Batterie externe haute capacité, charge rapide, compatible tous appareils.', 15000, null, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', 'electronics', false, 60),
('bluetooth-speaker', 'Enceinte Bluetooth JBL', 'Son puissant 360°, résistante à l''eau, autonomie 12h, basses profondes.', 35000, 48000, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'electronics', false, 35),
('puma-sneakers', 'Puma RS-X Classic', 'Sneakers rétro-futuriste, confort optimal, style urbain décontracté.', 38000, null, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500', 'shoes', false, 45),
('wireless-charger', 'Chargeur Sans Fil Rapide', 'Charge sans fil 15W, compatible iPhone/Samsung, design élégant.', 12000, 18000, 'https://images.unsplash.com/photo-1591290619762-6571229b2e3a?w=500', 'daily', true, 70),
('phone-holder', 'Support Téléphone Voiture', 'Fixation solide, rotation 360°, compatible tous smartphones.', 8000, null, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500', 'daily', false, 100),
('usb-cable-pack', 'Pack 3 Câbles USB-C', 'Câbles renforcés 1m/2m/3m, charge rapide, garantie 2 ans.', 10000, 15000, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', 'daily', false, 80);

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'KD' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || LPAD(NEXTVAL('orders_id_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;
