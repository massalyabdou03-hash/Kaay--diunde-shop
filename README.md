# 🛍️ Kaay Diunde Shop

Boutique e-commerce moderne pour le Sénégal avec interface admin, paiement à la livraison et notifications automatiques.

## ✨ Fonctionnalités

- 🛒 Panier d'achat avec gestion des quantités
- 📱 Confirmation de commande via WhatsApp
- 🔐 Interface admin sécurisée
- 📦 Gestion complète des produits (CRUD)
- 🚚 Zones de livraison avec tarifs personnalisés
- 💰 Paiement à la livraison (Cash, Wave, Orange Money)
- 🔔 Notifications automatiques (Discord, WhatsApp, Email)
- 📊 Tableau de bord avec statistiques
- 🎨 Design responsive et moderne

## 🚀 Déploiement Rapide

### 1. Prérequis

- Compte [Netlify](https://www.netlify.com)
- Compte [Neon](https://neon.tech) (base de données PostgreSQL gratuite)
- Compte GitHub

### 2. Créer la base de données

1. Créer un compte sur [Neon.tech](https://neon.tech)
2. Créer un nouveau projet "kaay-diunde-shop"
3. Dans le SQL Editor, exécuter le contenu de `database-schema.sql`
4. Copier l'URL de connexion (Connection String)

### 3. Déployer sur Netlify

#### Option A : Via GitHub (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/votre-username/kaay-diunde-shop.git
cd kaay-diunde-shop

# Pousser sur votre repo
git remote set-url origin https://github.com/VOTRE-USERNAME/kaay-diunde-shop.git
git push -u origin main
```

Dans Netlify :
1. New site from Git → GitHub
2. Sélectionner votre repo
3. Configuration détectée automatiquement via `netlify.toml`
4. Ajouter les variables d'environnement (voir ci-dessous)
5. Deploy

#### Option B : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

### 4. Variables d'environnement

Dans Netlify Dashboard → Site settings → Environment variables :

```env
# OBLIGATOIRE
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
VITE_ADMIN_PASSWORD=votre_mot_de_passe_admin

# OPTIONNEL (Notifications)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/PHONE_ID/messages
WHATSAPP_API_KEY=votre_access_token
ADMIN_WHATSAPP_NUMBER=221XXXXXXXXX
EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_API_KEY=SG.votre_api_key
ADMIN_EMAIL=admin@kaaydiunde.com
```

## 💻 Développement Local

```bash
# Installer les dépendances
npm install

# Installer les dépendances des functions
cd netlify/functions && npm install && cd ../..

# Copier .env.example
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env

# Lancer le serveur de développement
npm run dev
```

Le site sera disponible sur `http://localhost:5173`

### Tester les Functions localement

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Lancer avec les functions
netlify dev
```

## 📁 Structure du Projet

```
kaay-diunde-shop/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── netlify.toml
├── database-schema.sql
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── types.ts
│   ├── constants.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Checkout.tsx
│   │   └── AdminDashboard.tsx
│   └── context/
│       └── CartContext.tsx
└── netlify/
    └── functions/
        ├── get-products.js
        ├── get-product.js
        ├── create-order.js
        ├── add-product.js
        ├── update-product.js
        ├── delete-product.js
        └── package.json
```

## 🎯 Utilisation

### Pour les clients

1. Parcourir la boutique
2. Ajouter des produits au panier
3. Remplir le formulaire de livraison
4. Confirmer par WhatsApp

### Pour les admins

1. Cliquer sur le bouton "Admin" (icône bouclier)
2. Se connecter avec le mot de passe
3. Gérer les produits (ajouter, modifier, supprimer)
4. Voir les statistiques

## 🔧 Configuration

### Modifier le numéro WhatsApp

Dans `src/constants.ts` :

```typescript
export const WHATSAPP_NUMBER = '221VOTRENUMERO';
```

### Modifier les frais de livraison

Dans `src/pages/Checkout.tsx` :

```typescript
const deliveryFees: Record<string, number> = {
  [DeliveryZone.DAKAR]: 2000,
  [DeliveryZone.PIKINE]: 2500,
  // ...
};
```

## 📱 Notifications

### Discord Webhook

1. Serveur Discord → Paramètres → Intégrations → Webhooks
2. Créer un webhook et copier l'URL
3. Ajouter `DISCORD_WEBHOOK_URL` dans Netlify

### WhatsApp Business API

Utiliser [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp) (gratuit)

### SendGrid Email

1. Créer un compte sur [SendGrid](https://sendgrid.com)
2. Créer une API Key
3. Ajouter `EMAIL_SERVICE_URL` et `EMAIL_API_KEY`

## 🐛 Dépannage

### Les produits ne s'affichent pas

```bash
# Vérifier les logs
netlify logs:function get-products

# Vérifier la variable DATABASE_URL
netlify env:list
```

### Le bouton admin ne fonctionne pas

- Vérifier que `VITE_ADMIN_PASSWORD` est défini
- Redéployer après modification des variables
- Vider le cache du navigateur

### Erreur "Cannot find module 'pg'"

```bash
cd netlify/functions
npm install
```

## 📝 API Endpoints

```bash
# Produits
GET  /.netlify/functions/get-products
GET  /.netlify/functions/get-product?id=xxx
POST /.netlify/functions/add-product
POST /.netlify/functions/update-product
POST /.netlify/functions/delete-product

# Commandes
POST /.netlify/functions/create-order
```

## 🔒 Sécurité

- Authentification admin par mot de passe
- Session stockée dans `sessionStorage` (pas de cookies persistants)
- Base de données avec SSL
- Variables d'environnement pour les secrets

## 📄 Licence

MIT License - Libre d'utilisation

## 🇸🇳 Made in Senegal

Développé avec ❤️ pour les entrepreneurs sénégalais

## 🤝 Support

Pour toute question :
- Ouvrir une issue sur GitHub
- Documentation Netlify : https://docs.netlify.com
- Documentation Neon : https://neon.tech/docs

---

**Bon commerce ! 🚀**
