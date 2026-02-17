# 🛍️ KAAY DIUNDE SHOP - VERSION AMÉLIORÉE

Boutique e-commerce sénégalaise moderne avec backend Neon, notifications automatiques et interface admin complète.

## 🎯 NOUVELLES FONCTIONNALITÉS

✅ **Bouton "Ajouter au panier"** sous chaque produit  
✅ **Interface Admin** complète pour gérer les produits  
✅ **Confirmation uniquement par WhatsApp** (bouton orange supprimé)  
✅ **Gestion de stock** en temps réel  
✅ **Notifications automatiques** : WhatsApp + Email + Discord  
✅ **Paiement à la livraison** : Cash / Wave / Orange Money  

---

## 📦 STRUCTURE DU PROJET

```
kaay-diunde-shop/
├── src/
│   ├── App.tsx                    # App principale avec bouton admin
│   ├── App.css                    # Styles complets
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Shop.tsx               # Boutique avec boutons "Ajouter au panier"
│   │   ├── ProductDetail.tsx
│   │   ├── Checkout.tsx           # Confirmation WhatsApp uniquement
│   │   └── AdminDashboard.tsx     # Interface admin
│   ├── context/
│   │   └── CartContext.tsx
│   ├── constants.ts
│   └── types.ts
├── netlify/
│   └── functions/
│       ├── get-products.js
│       ├── get-product.js
│       ├── create-order.js
│       ├── add-product.js         # ✨ Nouveau
│       ├── update-product.js      # ✨ Nouveau
│       └── delete-product.js      # ✨ Nouveau
├── database-schema.sql
├── netlify.toml
└── package.json
```

---

## 🚀 DÉPLOIEMENT SUR NETLIFY

### ÉTAPE 1 : Préparer le code

```bash
# Créer un nouveau dossier
mkdir kaay-diunde-shop
cd kaay-diunde-shop

# Copier tous les fichiers fournis dans ce dossier

# Initialiser Git
git init
git add .
git commit -m "Initial commit - Kaay Diunde Shop"
```

### ÉTAPE 2 : Créer le repo GitHub

```bash
# Aller sur https://github.com/new
# Créer un nouveau repository "kaay-diunde-shop"

# Lier le repo local
git remote add origin https://github.com/VOTRE_USERNAME/kaay-diunde-shop.git
git branch -M main
git push -u origin main
```

### ÉTAPE 3 : Configurer Neon Database

1. **Créer un compte Neon**
   - Aller sur https://neon.tech
   - Créer un compte gratuit
   - Créer un nouveau projet "kaay-diunde-shop"

2. **Exécuter le schéma SQL**
   - Dans Neon, aller dans "SQL Editor"
   - Copier le contenu de `database-schema.sql`
   - Exécuter le script

3. **Obtenir l'URL de connexion**
   - Dans "Connection Details"
   - Copier l'URL complète (commence par `postgresql://`)

### ÉTAPE 4 : Déployer sur Netlify

1. **Connecter GitHub**
   - Aller sur https://app.netlify.com
   - Cliquer "Add new site" > "Import an existing project"
   - Sélectionner GitHub
   - Choisir `kaay-diunde-shop`

2. **Configuration automatique**
   - Netlify détecte automatiquement `netlify.toml`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Variables d'environnement**

Dans Netlify Dashboard > Site settings > Environment variables :

```env
# BASE DE DONNÉES (OBLIGATOIRE)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# ADMIN (OBLIGATOIRE)
VITE_ADMIN_PASSWORD=votre_mot_de_passe_admin

# NOTIFICATIONS DISCORD (OPTIONNEL)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# NOTIFICATIONS WHATSAPP (OPTIONNEL)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/PHONE_ID/messages
WHATSAPP_API_KEY=votre_access_token
ADMIN_WHATSAPP_NUMBER=221XXXXXXXXX

# NOTIFICATIONS EMAIL (OPTIONNEL)
EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_API_KEY=SG.votre_api_key
ADMIN_EMAIL=admin@kaaydiunde.com
```

4. **Déployer**
   - Cliquer "Deploy site"
   - Attendre la fin du déploiement (3-5 minutes)
   - Votre site sera sur `https://VOTRE-SITE.netlify.app`

---

## 🎨 UTILISATION

### Pour les clients

1. **Parcourir la boutique**
   - Cliquer sur "Boutique"
   - Filtrer par catégorie
   - Voir les produits en promotion

2. **Ajouter au panier**
   - Cliquer sur "Ajouter au panier" sous chaque produit
   - Badge rouge affiche le nombre d'articles
   - Animation de confirmation

3. **Commander**
   - Cliquer sur l'icône panier
   - Remplir les informations de livraison
   - Cliquer "Confirmer par WhatsApp"
   - Message pré-rempli envoyé via WhatsApp

### Pour les admins

1. **Se connecter**
   - Cliquer sur le bouton "Admin" (icône bouclier)
   - Entrer le mot de passe configuré
   - Accès au tableau de bord

2. **Ajouter un produit**
   - Cliquer "Ajouter un produit"
   - Remplir le formulaire
   - Cliquer "Ajouter"

3. **Modifier un produit**
   - Cliquer sur l'icône crayon
   - Modifier les informations
   - Cliquer "Modifier"

4. **Supprimer un produit**
   - Cliquer sur l'icône poubelle
   - Confirmer la suppression

---

## 📱 CONFIGURATION DES NOTIFICATIONS

### Discord Webhook

```bash
# 1. Créer un webhook
# Serveur Discord > Paramètres > Intégrations > Webhooks > Nouveau webhook

# 2. Copier l'URL
# Exemple: https://discord.com/api/webhooks/123456789/abcdef

# 3. Ajouter dans Netlify
DISCORD_WEBHOOK_URL=votre_webhook_url
```

### WhatsApp Business API

```bash
# Option A: WhatsApp Business Cloud API (Gratuit)
# 1. Aller sur https://developers.facebook.com/apps
# 2. Créer une app
# 3. Ajouter "WhatsApp" à votre app
# 4. Obtenir Phone Number ID et Access Token

WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages
WHATSAPP_API_KEY=your_access_token
ADMIN_WHATSAPP_NUMBER=221XXXXXXXXX

# Option B: Twilio (Payant mais simple)
# Suivre la documentation Twilio pour WhatsApp
```

### SendGrid Email

```bash
# 1. Créer un compte sur https://sendgrid.com (gratuit)
# 2. Créer une API Key
# 3. Vérifier votre domaine d'envoi

EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_API_KEY=SG.votre_api_key
ADMIN_EMAIL=admin@kaaydiunde.com
```

---

## 🔒 SÉCURITÉ

### Mot de passe admin

**Par défaut** : `admin2024`

**Changer le mot de passe** :

1. Dans Netlify > Environment variables
2. Ajouter `VITE_ADMIN_PASSWORD=votre_nouveau_mot_de_passe`
3. Redéployer le site

### Protection de la base de données

- ✅ URL de connexion dans les variables d'environnement
- ✅ SSL activé par défaut avec Neon
- ✅ Pas de credentials dans le code

### Session admin

- ✅ Stockage dans `sessionStorage` (réinitialisation à la fermeture)
- ✅ Pas de cookies persistants
- ✅ Déconnexion manuelle disponible

---

## 🛠️ DÉVELOPPEMENT LOCAL

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/kaay-diunde-shop.git
cd kaay-diunde-shop

# 2. Installer les dépendances
npm install

# 3. Configurer .env
cp .env.example .env
# Éditer .env avec vos vraies valeurs

# 4. Lancer en local
npm run dev

# Le site sera sur http://localhost:5173
# Les functions Netlify sur http://localhost:8888/.netlify/functions/
```

### Tester les functions localement

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Lancer avec les functions
netlify dev
```

---

## 📊 API ENDPOINTS

### Produits

```bash
# Obtenir tous les produits
GET /.netlify/functions/get-products

# Obtenir un produit spécifique
GET /.netlify/functions/get-product?id=iphone-13

# Ajouter un produit (Admin)
POST /.netlify/functions/add-product
Body: { id, name, description, price, category, image, stock, ... }

# Modifier un produit (Admin)
POST /.netlify/functions/update-product
Body: { id, name, description, price, ... }

# Supprimer un produit (Admin)
POST /.netlify/functions/delete-product
Body: { id: "product-id" }
```

### Commandes

```bash
# Créer une commande
POST /.netlify/functions/create-order
Body: {
  customerName, customerPhone, deliveryAddress,
  deliveryZone, items, subtotal, deliveryFee, total
}
```

---

## 🎨 PERSONNALISATION

### Changer le numéro WhatsApp

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
  // Modifier ici...
};
```

### Changer les couleurs

Dans `src/App.css`, modifier les variables :

```css
/* Orange principal */
background: #f97316; /* Changer cette couleur */

/* Bleu principal */
background: #1e40af; /* Changer cette couleur */
```

---

## 🐛 DÉPANNAGE

### Les produits ne s'affichent pas

```bash
# 1. Vérifier la variable DATABASE_URL dans Netlify
# 2. Vérifier que le schéma SQL a été exécuté
# 3. Voir les logs
netlify logs:function get-products
```

### Le bouton admin ne fonctionne pas

```bash
# 1. Vérifier VITE_ADMIN_PASSWORD dans Netlify
# 2. Redéployer après changement de variable
# 3. Vider le cache du navigateur
```

### Les notifications ne marchent pas

```bash
# 1. Tester les webhooks manuellement (voir README original)
# 2. Vérifier les variables d'environnement
# 3. Voir les logs de la function create-order
```

### Erreur "Cannot find module 'pg'"

```bash
# Dans netlify/functions/
npm install pg
```

---

## 📝 COMMANDES NETLIFY CLI

```bash
# Voir les logs d'une function
netlify logs:function FUNCTION_NAME

# Redéployer
netlify deploy --prod

# Voir le statut
netlify status

# Lister les functions
netlify functions:list
```

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE

Chaque `git push` sur la branche `main` déclenche automatiquement :

1. ✅ Build du projet
2. ✅ Test des functions
3. ✅ Déploiement en production
4. ✅ Notification de succès/échec

---

## 📞 SUPPORT

Pour toute question sur le déploiement :

1. **Documentation Netlify** : https://docs.netlify.com
2. **Documentation Neon** : https://neon.tech/docs
3. **Issues GitHub** : Créer une issue sur votre repo

---

## 🎉 FÉLICITATIONS !

Votre boutique e-commerce est maintenant :

✅ Déployée en production  
✅ Connectée à une base de données  
✅ Avec une interface admin fonctionnelle  
✅ Avec notifications automatiques  
✅ Avec panier et checkout WhatsApp  

**URL de votre site** : https://VOTRE-SITE.netlify.app

---

## 📄 LICENCE

MIT License - Libre d'utilisation

---

Made with ❤️ in Senegal 🇸🇳
