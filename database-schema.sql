-- ═══════════════════════════════════════════════════════
-- Kaay Diunde Shop — Schéma PostgreSQL (Neon)
-- Tables : produits | ordres
-- ═══════════════════════════════════════════════════════

-- Nettoyage
DROP TABLE IF EXISTS ordres CASCADE;
DROP TABLE IF EXISTS produits CASCADE;

-- ──────────────────────────────────────────────────────
-- TABLE : produits
-- ──────────────────────────────────────────────────────
CREATE TABLE produits (
    id          VARCHAR(100) PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    description TEXT          NOT NULL,
    price       INTEGER       NOT NULL,          -- prix en FCFA (entier)
    old_price   INTEGER,                          -- ancien prix pour afficher la réduction
    image       TEXT          NOT NULL,
    category    VARCHAR(50)   NOT NULL,
    featured    BOOLEAN       DEFAULT false,
    stock       INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────
-- TABLE : ordres
-- ──────────────────────────────────────────────────────
CREATE TABLE ordres (
    numéro                          SERIAL PRIMARY KEY,
    numéro_de_commande              VARCHAR(30)  NOT NULL UNIQUE,  -- ex: KD-20250217-4823
    nom_du_client                   VARCHAR(255) NOT NULL,
    numéro_de_téléphone_du_client   VARCHAR(50)  NOT NULL,
    ville_client                    VARCHAR(100) NOT NULL,
    texte_de_l_adresse_du_client    TEXT         NOT NULL,
    méthode_de_paiement             VARCHAR(50)  NOT NULL DEFAULT 'Paiement à la livraison (Cash)',
    sous_total                      INTEGER      NOT NULL,
    frais_de_livraison              INTEGER      NOT NULL,
    total                           INTEGER      NOT NULL,
    statut                          VARCHAR(30)  NOT NULL DEFAULT 'en_attente',
    created_at                      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at                      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────
-- Index de performance
-- ──────────────────────────────────────────────────────
CREATE INDEX idx_produits_category ON produits(category);
CREATE INDEX idx_produits_featured ON produits(featured);
CREATE INDEX idx_ordres_statut     ON ordres(statut);
CREATE INDEX idx_ordres_created    ON ordres(created_at);

-- ──────────────────────────────────────────────────────
-- Données de démo (8 produits)
-- ──────────────────────────────────────────────────────
INSERT INTO produits (id, name, description, price, old_price, category, image, featured, stock) VALUES
('iphone-13',       'iPhone 13 128GB',            'iPhone 13 neuf, débloqué tous opérateurs. Garantie 1 an. Livraison gratuite à Dakar.',   450000, 500000, 'electronics', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800', true,  15),
('samsung-s23',     'Samsung Galaxy S23',          'Samsung S23 5G neuf, écran AMOLED 120Hz. Garantie constructeur 1 an.',                  380000, 420000, 'electronics', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', true,  20),
('macbook-air-m2',  'MacBook Air M2',              'MacBook Air M2 2023, 8GB RAM, 256GB SSD. Neuf en boîte scellée.',                       850000, 950000, 'electronics', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', false,  8),
('airpods-pro',     'AirPods Pro 2',               'AirPods Pro 2ème génération avec réduction de bruit active. Garantie Apple.',           145000, 165000, 'electronics', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800', false, 30),
('nike-air-max',    'Nike Air Max 90',             'Baskets Nike Air Max 90 authentiques. Toutes tailles disponibles.',                      65000,  75000, 'fashion',     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', false, 25),
('adidas-originals','Adidas Originals Superstar',  'Baskets Adidas Superstar classiques. Cuir véritable. Tailles 38-46.',                    55000,  65000, 'fashion',     'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', false, 18),
('montre-casio',    'Montre Casio G-Shock',        'Montre Casio G-Shock résistante à l''eau. Garantie 2 ans.',                              45000,  55000, 'accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', false, 12),
('sac-cuir',        'Sac à main en cuir',          'Sac à main élégant en cuir véritable. Plusieurs compartiments. Livraison offerte.',      35000,  45000, 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', false, 10);

-- ──────────────────────────────────────────────────────
-- TABLE : publicite_flottante (configuration unique)
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publicite_flottante (
    id               INTEGER      PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled          BOOLEAN      DEFAULT false,
    title            VARCHAR(255) DEFAULT '',
    description      TEXT         DEFAULT '',
    button_text      VARCHAR(255) DEFAULT '',
    button_url       TEXT         DEFAULT '',
    button_color     VARCHAR(20)  DEFAULT '#f97316',
    position         VARCHAR(20)  DEFAULT 'bottom-right',
    display_duration VARCHAR(10)  DEFAULT '24h',
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Insérer la ligne par défaut (désactivée)
INSERT INTO publicite_flottante (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────
-- Vérification rapide
-- ──────────────────────────────────────────────────────
-- SELECT * FROM produits;
-- SELECT * FROM ordres;
-- SELECT * FROM publicite_flottante;
