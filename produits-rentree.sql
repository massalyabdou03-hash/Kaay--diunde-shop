-- ═══════════════════════════════════════════════════════════════════
-- Produits « rentrée » + créateur de contenu — Kaay Diunde
-- À coller dans l'éditeur SQL de Neon. Sans danger : n'écrase rien
-- (ON CONFLICT DO NOTHING), il ajoute seulement les produits absents.
--
-- ⚠ À ADAPTER AVANT D'EXÉCUTER :
--   • Les prix sont des estimations pour Dakar : ajuste-les selon ton prix d'achat.
--   • Le stock est mis à 10 partout : mets le vrai chiffre (0 = rupture, commande bloquée).
--   • Les photos sont un espace réservé : remplace-les depuis l'admin (Modifier le produit).
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO produits (id, name, description, price, old_price, category, image, featured, stock) VALUES

-- ── Créateur de contenu : lumière, trépieds, micros ─────────────────
('ring-light-26cm-tripode', 'Ring light LED 26 cm + trépied 2 m',
 'Anneau lumineux LED 26 cm, 3 teintes (blanche, chaude, neutre) et luminosité réglable. Trépied extensible jusqu''à 2 m et support téléphone inclus. Idéal pour TikTok, YouTube, visioconférence et maquillage.',
 12000, 15000, 'accessories', '/produit-photo-a-venir.svg', true, 10),
('ring-light-de-bureau-16cm', 'Ring light LED de bureau 16 cm',
 'Petit anneau lumineux LED avec mini trépied de table et pince téléphone. Léger, se range dans un sac. Parfait pour selfies, cours en ligne et appels vidéo.',
 5500, NULL, 'accessories', '/produit-photo-a-venir.svg', false, 10),
('tripode-telephone-1m60', 'Trépied téléphone 1,60 m + télécommande Bluetooth',
 'Trépied aluminium léger, hauteur réglable jusqu''à 1,60 m, rotule 360°, support téléphone universel et télécommande Bluetooth pour déclencher photo/vidéo à distance.',
 8500, 10000, 'accessories', '/produit-photo-a-venir.svg', true, 10),
('tripode-flexible-telephone', 'Trépied flexible pour téléphone (pieds articulés)',
 'Mini trépied à pattes flexibles : se pose sur une table ou s''enroule sur un support. Pince téléphone incluse. Compact et très pratique pour filmer en déplacement.',
 3500, NULL, 'accessories', '/produit-photo-a-venir.svg', false, 10),
('perche-selfie-bluetooth', 'Perche à selfie Bluetooth avec trépied',
 'Perche à selfie extensible avec bouton Bluetooth et pieds repliables qui servent de trépied. Compatible Android et iPhone.',
 4500, 5500, 'accessories', '/produit-photo-a-venir.svg', false, 10),
('micro-cravate-filaire', 'Micro-cravate filaire pour téléphone',
 'Micro-cravate à pince, prise jack 3,5 mm (adaptateur USB-C/Lightning selon le téléphone), câble 1,5 m. Son net pour vidéos, interviews et cours enregistrés.',
 4500, NULL, 'electronics', '/produit-photo-a-venir.svg', false, 10),
('micro-sans-fil-telephone', 'Micro-cravate sans fil (2 micros) pour téléphone',
 'Kit de deux micros sans fil avec récepteur USB-C ou Lightning, réduction de bruit, utilisable jusqu''à plusieurs mètres. Pour vidéos, lives et interviews.',
 14000, 17000, 'electronics', '/produit-photo-a-venir.svg', true, 10),
('support-telephone-bureau', 'Support téléphone / tablette de bureau réglable',
 'Support pliable en aluminium, angle réglable, compatible téléphone et tablette jusqu''à 10 pouces. Pour regarder ses cours, suivre une visio ou filmer à plat.',
 2500, NULL, 'accessories', '/produit-photo-a-venir.svg', false, 10),

-- ── Rentrée des classes / étudiants ─────────────────────────────────
('sac-a-dos-ordinateur-15', 'Sac à dos scolaire et ordinateur 15,6"',
 'Sac à dos résistant à l''eau avec compartiment matelassé pour ordinateur portable jusqu''à 15,6", plusieurs poches et port de recharge USB. Pour le lycée, l''université et le travail.',
 11000, 14000, 'school', '/produit-photo-a-venir.svg', true, 10),
('calculatrice-scientifique', 'Calculatrice scientifique 240 fonctions',
 'Calculatrice scientifique à écran lisible, fonctions trigonométriques, statistiques, fractions et équations. Convient au collège, au lycée et à l''université.',
 6500, NULL, 'school', '/produit-photo-a-venir.svg', false, 10),
('cle-usb-32go', 'Clé USB 32 Go',
 'Clé USB 3.0 de 32 Go pour garder cours, exposés et documents. Compacte, avec capuchon de protection.',
 3000, NULL, 'school', '/produit-photo-a-venir.svg', false, 10),
('cle-usb-64go', 'Clé USB 64 Go',
 'Clé USB 3.0 de 64 Go, transfert rapide. Idéale pour les étudiants et les projets de groupe.',
 4500, 5500, 'school', '/produit-photo-a-venir.svg', false, 10),
('lampe-bureau-led-rechargeable', 'Lampe de bureau LED rechargeable',
 'Lampe LED pliable avec 3 niveaux de luminosité, batterie rechargeable par USB et pince ou pied. Très utile pour réviser quand le courant coupe.',
 5500, 7000, 'school', '/produit-photo-a-venir.svg', true, 10),
('support-ordinateur-portable-pliable', 'Support ordinateur portable pliable',
 'Support aluminium léger et pliable, hauteur réglable, jusqu''à 17". Améliore la posture et refroidit l''ordinateur. Se glisse dans le sac.',
 6500, NULL, 'school', '/produit-photo-a-venir.svg', false, 10),
('souris-sans-fil', 'Souris sans fil 2,4 GHz',
 'Souris sans fil silencieuse avec récepteur USB nano, 3 niveaux de vitesse. Piles incluses.',
 3500, NULL, 'electronics', '/produit-photo-a-venir.svg', false, 10),
('powerbank-10000mah', 'Batterie externe 10 000 mAh',
 'Powerbank 10 000 mAh avec deux sorties USB et indicateur de charge. Recharge un téléphone 2 à 3 fois. Indispensable pour les journées de cours.',
 8500, 10500, 'electronics', '/produit-photo-a-venir.svg', true, 10),
('ecouteurs-bluetooth', 'Écouteurs Bluetooth sans fil avec étui de charge',
 'Écouteurs sans fil Bluetooth 5.0 avec étui chargeur, micro intégré pour les appels et les cours en ligne. Autonomie jusqu''à 4 h par charge.',
 7000, 9000, 'electronics', '/produit-photo-a-venir.svg', false, 10),
('enceinte-bluetooth-mini', 'Mini enceinte Bluetooth portable',
 'Enceinte Bluetooth compacte, son puissant, rechargeable par USB, lecture carte mémoire. Pour la musique, les révisions en groupe ou les sorties.',
 7500, NULL, 'electronics', '/produit-photo-a-venir.svg', false, 10)

ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Ramadan : la catégorie a été retirée du site. Les anciens produits
-- « ramadan » restent visibles dans « Tous » mais n'ont plus de filtre.
-- Choisis UNE des deux options ci-dessous (elles sont commentées) :
--
-- a) Les supprimer :
--    DELETE FROM produits WHERE category = 'ramadan';
--
-- b) Les garder en les rangeant ailleurs :
--    UPDATE produits SET category = 'accessories' WHERE category = 'ramadan';
-- ═══════════════════════════════════════════════════════════════════
