const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR CRITIQUE: DATABASE_URL est undefined.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ─── Catalogue complet des produits Kaay Diunde ──────────────────────────
const PRODUCTS = [
  // ══════════════════════════════════════════════════════════
  // 📱 ÉLECTRONIQUE (8 produits)
  // ══════════════════════════════════════════════════════════
  {
    id: 'power-bank-10000',
    name: 'Power Bank 10 000mAh',
    description: 'Batterie externe 10 000mAh double USB, charge rapide. Compacte et légère, idéale pour garder votre téléphone chargé toute la journée. Compatible avec tous les smartphones.',
    price: 5500,
    old_price: 7500,
    category: 'electronics',
    // Image: batterie externe / power bank portable
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    featured: true,
    stock: 50
  },
  {
    id: 'ecouteurs-bluetooth',
    name: 'Écouteurs Bluetooth Sans Fil',
    description: 'Écouteurs Bluetooth 5.0 avec boîtier de charge. Son cristallin, réduction de bruit, autonomie 4h + 20h avec le boîtier. Parfaits pour la musique et les appels.',
    price: 4500,
    old_price: 6000,
    category: 'electronics',
    // Image: écouteurs sans fil type AirPods avec boîtier
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop',
    featured: true,
    stock: 40
  },
  {
    id: 'chargeur-rapide-type-c',
    name: 'Chargeur Rapide Type C',
    description: 'Chargeur mural USB-C 20W charge rapide. Compatible iPhone, Samsung, Huawei et tous les smartphones récents. Charge votre téléphone à 50% en 30 minutes.',
    price: 3000,
    old_price: 4500,
    category: 'electronics',
    // Image: chargeur USB-C / câble de charge
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
    featured: false,
    stock: 60
  },
  {
    id: 'support-telephone-voiture',
    name: 'Support Téléphone Voiture',
    description: 'Support magnétique universel pour tableau de bord ou grille de ventilation. Rotation 360°, fixation solide, compatible avec tous les smartphones. Indispensable pour la route.',
    price: 2500,
    old_price: 3500,
    category: 'electronics',
    // Image: téléphone dans un support de voiture / navigation GPS
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop',
    featured: false,
    stock: 35
  },
  {
    id: 'montre-connectee-basique',
    name: 'Montre Connectée Basique',
    description: 'Smartwatch avec suivi fitness, notifications, podomètre, rythme cardiaque. Étanche IP67, écran tactile couleur. Batterie longue durée 5-7 jours.',
    price: 8500,
    old_price: 12000,
    category: 'electronics',
    // Image: smartwatch / montre connectée au poignet
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
    featured: true,
    stock: 25
  },
  {
    id: 'ring-light-selfie',
    name: 'Ring Light Selfie',
    description: 'Anneau lumineux LED avec trépied et support téléphone. 3 modes d\'éclairage, 10 niveaux de luminosité. Parfait pour selfies, vidéos TikTok et appels visio.',
    price: 4000,
    old_price: 5500,
    category: 'electronics',
    // Image: ring light / anneau lumineux LED
    image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },
  {
    id: 'mini-ventilateur-usb',
    name: 'Mini Ventilateur USB',
    description: 'Ventilateur portable rechargeable USB, 3 vitesses. Silencieux et compact, idéal pour le bureau ou en déplacement. Autonomie 6-8h.',
    price: 2000,
    old_price: 3000,
    category: 'electronics',
    // Image: petit ventilateur de bureau / ventilateur USB
    image: 'https://images.unsplash.com/photo-1617952385804-7b326fa42491?w=400&h=400&fit=crop',
    featured: false,
    stock: 45
  },
  {
    id: 'multiprise-electrique',
    name: 'Multiprise Électrique',
    description: 'Multiprise 4 prises + 3 ports USB. Protection contre les surtensions, câble 2m. Sécurisée avec interrupteur. Idéale pour la maison ou le bureau.',
    price: 3500,
    old_price: 5000,
    category: 'electronics',
    // Image: multiprise / rallonge électrique avec ports USB
    image: 'https://images.unsplash.com/photo-1544428571-1233dbcc4ed4?w=400&h=400&fit=crop',
    featured: false,
    stock: 40
  },

  // ══════════════════════════════════════════════════════════
  // 👕 MODE (8 produits)
  // ══════════════════════════════════════════════════════════
  {
    id: 'survetement-homme',
    name: 'Survêtement Homme',
    description: 'Survêtement complet veste + pantalon, tissu respirant et confortable. Style sportif moderne. Disponible en plusieurs tailles. Idéal pour le sport ou le quotidien.',
    price: 12000,
    old_price: 15000,
    category: 'fashion',
    // Image: homme en tenue sportive / survêtement
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=400&fit=crop',
    featured: true,
    stock: 30
  },
  {
    id: 'baskets-tendance',
    name: 'Baskets Tendance',
    description: 'Sneakers légères et stylées, semelle confortable. Design moderne streetwear. Parfaites pour le quotidien, disponibles en plusieurs coloris et tailles.',
    price: 15000,
    old_price: 20000,
    category: 'fashion',
    // Image: sneakers Nike rouges - photo produit iconique
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    featured: true,
    stock: 25
  },
  {
    id: 'sandales-homme',
    name: 'Sandales Homme',
    description: 'Sandales confortables en cuir synthétique, semelle antidérapante. Style décontracté, parfaites pour le quotidien à Dakar. Légères et résistantes.',
    price: 5500,
    old_price: 7000,
    category: 'fashion',
    // Image: sandales homme en cuir
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop',
    featured: false,
    stock: 35
  },
  {
    id: 'sac-a-dos-style',
    name: 'Sac à Dos Stylé',
    description: 'Sac à dos urbain avec compartiment laptop, plusieurs poches. Design moderne et résistant à l\'eau. Idéal pour l\'école, le travail ou les déplacements.',
    price: 8000,
    old_price: 10000,
    category: 'fashion',
    // Image: sac à dos noir moderne / urbain
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },
  {
    id: 'lunettes-soleil',
    name: 'Lunettes de Soleil',
    description: 'Lunettes de soleil UV400 protection totale. Monture légère et résistante, verres polarisés. Style tendance, plusieurs modèles disponibles.',
    price: 3500,
    old_price: 5000,
    category: 'fashion',
    // Image: lunettes de soleil - photo produit classique
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    featured: false,
    stock: 45
  },
  {
    id: 'parfum-arabe-oud',
    name: 'Parfum Arabe Oud',
    description: 'Parfum oriental au bois de oud, senteur intense et longue durée. Notes de oud, ambre et musc. 50ml, flacon élégant. Très apprécié au Sénégal.',
    price: 6000,
    old_price: 8000,
    category: 'fashion',
    // Image: flacons de parfum luxueux
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    featured: true,
    stock: 40
  },
  {
    id: 'montre-homme-elegante',
    name: 'Montre Homme Élégante',
    description: 'Montre analogique classique avec bracelet en acier inoxydable. Cadran épuré, mouvement quartz précis. Étanche 30m. Le must pour un look soigné.',
    price: 7500,
    old_price: 10000,
    category: 'fashion',
    // Image: montre classique homme avec bracelet métal
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
    featured: false,
    stock: 20
  },
  {
    id: 'tshirt-oversize',
    name: 'T-shirt Oversize',
    description: 'T-shirt oversize 100% coton, coupe ample et tendance. Tissu doux et respirant, coutures renforcées. Style streetwear décontracté. Plusieurs couleurs.',
    price: 3500,
    old_price: 5000,
    category: 'fashion',
    // Image: t-shirt blanc plié / suspendu
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    featured: false,
    stock: 50
  },

  // ══════════════════════════════════════════════════════════
  // 🏠 MAISON (7 produits)
  // ══════════════════════════════════════════════════════════
  {
    id: 'thermos-cafe',
    name: 'Thermos Café',
    description: 'Thermos isotherme 500ml en acier inoxydable. Garde vos boissons chaudes 12h ou froides 24h. Design élégant, anti-fuite. Parfait pour le café Touba.',
    price: 4500,
    old_price: 6000,
    category: 'home',
    // Image: thermos / gourde isotherme en acier
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
    featured: false,
    stock: 35
  },
  {
    id: 'plateau-service',
    name: 'Plateau de Service',
    description: 'Plateau de service décoratif en bois et métal. Élégant pour servir le thé attaya ou accueillir vos invités. Finition soignée, résistant et facile à nettoyer.',
    price: 5000,
    old_price: 7000,
    category: 'home',
    // Image: plateau de service en bois avec thé
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    featured: false,
    stock: 25
  },
  {
    id: 'set-verres',
    name: 'Set de Verres',
    description: 'Coffret de 6 verres à thé marocain décorés. Verre épais résistant, motifs dorés traditionnels. Parfaits pour l\'attaya entre amis ou la famille.',
    price: 3500,
    old_price: 5000,
    category: 'home',
    // Image: verres à thé / verres décoratifs
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },
  {
    id: 'bouilloire-electrique',
    name: 'Bouilloire Électrique',
    description: 'Bouilloire électrique 1.7L, ébullition rapide en 3 min. Arrêt automatique, base pivotante 360°. Idéale pour le thé, café ou les préparations culinaires.',
    price: 7000,
    old_price: 9000,
    category: 'home',
    // Image: bouilloire électrique
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    featured: true,
    stock: 20
  },
  {
    id: 'mini-mixeur',
    name: 'Mini Mixeur',
    description: 'Mini blender portable rechargeable USB, 380ml. 6 lames en acier, parfait pour jus de fruits frais, smoothies, cocktails. Autonomie 15-20 utilisations.',
    price: 5500,
    old_price: 7500,
    category: 'home',
    // Image: blender / mixeur portable
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop',
    featured: false,
    stock: 25
  },
  {
    id: 'tapis-salon',
    name: 'Tapis Salon',
    description: 'Tapis de salon doux et moelleux, 120x160cm. Motifs modernes, facile à entretenir, antidérapant. Apporte chaleur et élégance à votre intérieur.',
    price: 12000,
    old_price: 16000,
    category: 'home',
    // Image: tapis de salon dans un intérieur moderne
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop',
    featured: false,
    stock: 15
  },
  {
    id: 'lampe-led-deco',
    name: 'Lampe LED Déco',
    description: 'Lampe de table LED design moderne. Lumière chaude réglable, économie d\'énergie. USB rechargeable, 3 niveaux de luminosité. Ambiance cosy garantie.',
    price: 4000,
    old_price: 5500,
    category: 'home',
    // Image: lampe de table LED design / déco
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },

  // ══════════════════════════════════════════════════════════
  // 🎁 ACCESSOIRES (6 produits)
  // ══════════════════════════════════════════════════════════
  {
    id: 'ceinture-homme',
    name: 'Ceinture Homme',
    description: 'Ceinture en cuir synthétique avec boucle métallique. Réversible noir/marron, ajustable. Finition premium, parfaite pour un look habillé ou décontracté.',
    price: 3000,
    old_price: 4500,
    category: 'accessories',
    // Image: ceinture en cuir homme avec boucle
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop',
    featured: false,
    stock: 40
  },
  {
    id: 'portefeuille-cuir',
    name: 'Portefeuille Cuir',
    description: 'Portefeuille homme en cuir PU premium. Compartiments billets, 6 emplacements cartes, poche monnaie. Design slim et élégant, protection RFID.',
    price: 3500,
    old_price: 5000,
    category: 'accessories',
    // Image: portefeuille en cuir ouvert
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    featured: false,
    stock: 35
  },
  {
    id: 'sac-femme',
    name: 'Sac Femme',
    description: 'Sac à main femme tendance, cuir PU de qualité. Bandoulière amovible, plusieurs compartiments. Parfait pour le quotidien, style chic et pratique.',
    price: 7500,
    old_price: 10000,
    category: 'accessories',
    // Image: sac à main femme élégant
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    featured: true,
    stock: 25
  },
  {
    id: 'casquette',
    name: 'Casquette',
    description: 'Casquette ajustable style baseball. Tissu respirant, visière courbée, fermeture réglable. Protection soleil, confort optimal. Plusieurs coloris.',
    price: 2500,
    old_price: 3500,
    category: 'accessories',
    // Image: casquette baseball
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop',
    featured: false,
    stock: 50
  },
  {
    id: 'bijoux-fantaisie',
    name: 'Bijoux Fantaisie',
    description: 'Set de bijoux fantaisie : collier + bracelet + boucles d\'oreilles. Plaqué or, style élégant. Ne noircit pas, anti-allergique. Coffret cadeau inclus.',
    price: 4000,
    old_price: 6000,
    category: 'accessories',
    // Image: bijoux dorés / collier et bracelet
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },
  {
    id: 'coques-iphone',
    name: 'Coques iPhone',
    description: 'Coque de protection iPhone anti-choc, silicone souple. Design épuré, bords surélevés pour protéger l\'écran et la caméra. Compatible iPhone 12/13/14/15.',
    price: 2000,
    old_price: 3000,
    category: 'accessories',
    // Image: coque de téléphone / iPhone avec coque
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
    featured: false,
    stock: 60
  },

  // ══════════════════════════════════════════════════════════
  // ⚽ SPORT (6 produits)
  // ══════════════════════════════════════════════════════════
  {
    id: 'gants-musculation',
    name: 'Gants Musculation',
    description: 'Gants de musculation avec support poignet. Paume antidérapante, tissu respirant. Protection maximale pour vos entraînements. Taille ajustable.',
    price: 3500,
    old_price: 5000,
    category: 'sports',
    // Image: gants de musculation / fitness
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },
  {
    id: 'corde-a-sauter',
    name: 'Corde à Sauter',
    description: 'Corde à sauter fitness avec compteur digital. Poignées ergonomiques, longueur ajustable 3m. Cardio efficace, perte de poids rapide. Idéale pour la boxe.',
    price: 2500,
    old_price: 3500,
    category: 'sports',
    // Image: corde à sauter fitness
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
    featured: false,
    stock: 35
  },
  {
    id: 'ballon-foot',
    name: 'Ballon de Foot',
    description: 'Ballon de football taille 5, cousu machine. Revêtement PU résistant, bonne tenue de balle. Parfait pour les matchs sur les terrains de Dakar.',
    price: 5000,
    old_price: 7000,
    category: 'sports',
    // Image: ballon de football sur terrain
    image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&h=400&fit=crop',
    featured: true,
    stock: 40
  },
  {
    id: 'tapis-fitness',
    name: 'Tapis Fitness',
    description: 'Tapis de yoga/fitness antidérapant, 6mm d\'épaisseur. Mousse NBR haute densité, confortable pour les exercices au sol. Avec sangle de transport.',
    price: 4500,
    old_price: 6500,
    category: 'sports',
    // Image: tapis de yoga / fitness enroulé
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
    featured: false,
    stock: 25
  },
  {
    id: 'bouteille-sport',
    name: 'Bouteille Sport',
    description: 'Bouteille d\'eau sport 750ml avec graduation. Sans BPA, anti-fuite, ouverture one-click. Gourde idéale pour la salle, le running ou le quotidien.',
    price: 2000,
    old_price: 3000,
    category: 'sports',
    // Image: bouteille d'eau sport / gourde
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop',
    featured: false,
    stock: 45
  },
  {
    id: 'sac-sport',
    name: 'Sac Sport',
    description: 'Sac de sport avec compartiment chaussures séparé. Tissu imperméable, bandoulière réglable. Grande capacité 35L, parfait pour la salle ou le weekend.',
    price: 6000,
    old_price: 8000,
    category: 'sports',
    // Image: sac de sport / duffel bag
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=400&fit=crop',
    featured: false,
    stock: 30
  },

  // ══════════════════════════════════════════════════════════
  // 🕌 RAMADAN (6 produits - catégorie spéciale)
  // ══════════════════════════════════════════════════════════
  {
    id: 'dattes-premium',
    name: 'Dattes Premium',
    description: 'Boîte de dattes Medjool premium 500g, importées directement. Moelleuses et sucrées naturellement. Incontournables pour l\'iftar du Ramadan.',
    price: 5000,
    old_price: 7000,
    category: 'ramadan',
    // Image: dattes Medjool dans un bol / plateau
    image: 'https://images.unsplash.com/photo-1596706487498-44585e42e498?w=400&h=400&fit=crop',
    featured: true,
    stock: 60
  },
  {
    id: 'ensemble-priere-homme',
    name: 'Ensemble Prière Homme',
    description: 'Ensemble de prière complet : djellaba + bonnet. Tissu léger et confortable, broderies élégantes. Tenues disponibles en blanc, beige et gris.',
    price: 8000,
    old_price: 10000,
    category: 'ramadan',
    // Image: homme en tenue de prière / djellaba blanche
    image: 'https://images.unsplash.com/photo-1591816793908-27bef2124206?w=400&h=400&fit=crop',
    featured: true,
    stock: 30
  },
  {
    id: 'hijab-tendance',
    name: 'Hijab Tendance',
    description: 'Hijab en mousseline premium, doux et fluide. Coupe large pour un drapé parfait. Disponible en 10 couleurs tendance. Finition bords ourlés.',
    price: 3000,
    old_price: 4500,
    category: 'ramadan',
    // Image: femme avec hijab élégant / tissu hijab coloré
    image: 'https://images.unsplash.com/photo-1590076083440-15e1b3d1eb43?w=400&h=400&fit=crop',
    featured: false,
    stock: 50
  },
  {
    id: 'lanterne-decorative',
    name: 'Lanterne Décorative',
    description: 'Lanterne orientale LED décorative, métal et verre. Ambiance chaleureuse pour le Ramadan. Piles incluses, lumière douce. Hauteur 25cm.',
    price: 4500,
    old_price: 6000,
    category: 'ramadan',
    // Image: lanterne orientale / fanous Ramadan
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=400&fit=crop',
    featured: false,
    stock: 35
  },
  {
    id: 'plateau-iftar',
    name: 'Plateau Iftar',
    description: 'Plateau tournant pour iftar avec compartiments. Bois verni et design oriental. Parfait pour servir dattes, fruits secs et boissons pendant le Ramadan.',
    price: 6000,
    old_price: 8500,
    category: 'ramadan',
    // Image: table iftar / plateau de nourriture Ramadan
    image: 'https://images.unsplash.com/photo-1567360425618-1594206637d2?w=400&h=400&fit=crop',
    featured: false,
    stock: 20
  },
  {
    id: 'parfum-oud-ramadan',
    name: 'Parfum Oud',
    description: 'Parfum concentré Oud luxueux 50ml. Fragrance boisée intense, longue tenue 8h+. Notes de oud, musc et ambre. Idéal pour les soirées du Ramadan.',
    price: 7000,
    old_price: 9500,
    category: 'ramadan',
    // Image: flacon de parfum oud luxueux
    image: 'https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?w=400&h=400&fit=crop',
    featured: true,
    stock: 25
  },
];

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Méthode non autorisée. Utilisez POST.' })
    };
  }

  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'DATABASE_URL manquante' })
    };
  }

  try {
    console.log(`🌱 Début du seed : ${PRODUCTS.length} produits à insérer...`);

    // Vérifier que la table existe, la créer si nécessaire
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        old_price INTEGER,
        category TEXT NOT NULL,
        image TEXT,
        featured BOOLEAN DEFAULT false,
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const product of PRODUCTS) {
      try {
        await pool.query(
          `INSERT INTO produits (id, name, description, price, old_price, category, image, featured, stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             old_price = EXCLUDED.old_price,
             category = EXCLUDED.category,
             image = EXCLUDED.image,
             featured = EXCLUDED.featured,
             stock = EXCLUDED.stock,
             updated_at = NOW()`,
          [
            product.id,
            product.name,
            product.description,
            product.price,
            product.old_price || null,
            product.category,
            product.image,
            product.featured || false,
            product.stock
          ]
        );
        inserted++;
        console.log(`  ✅ ${product.name} (${product.category})`);
      } catch (err) {
        skipped++;
        errors.push({ id: product.id, error: err.message });
        console.error(`  ❌ ${product.name}: ${err.message}`);
      }
    }

    console.log(`🌱 Seed terminé : ${inserted} insérés, ${skipped} erreurs`);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        message: `Seed terminé avec succès`,
        total: PRODUCTS.length,
        inserted,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      })
    };
  } catch (error) {
    console.error('❌ Erreur seed:', error.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Erreur lors du seed', details: error.message })
    };
  }
};
