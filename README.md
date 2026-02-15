# 🛍️ KAAY DIUNDE SHOP

Boutique e-commerce sénégalaise moderne avec backend Neon et notifications automatiques.

## 🚀 FONCTIONNALITÉS

✅ **Backend complet avec Neon PostgreSQL**  
✅ **Notifications automatiques** : WhatsApp + Email + Discord  
✅ **Gestion de stock** en temps réel  
✅ **Paiement** : Cash à la livraison + Wave/Orange Money  
✅ **Livraison** dans toutes les régions du Sénégal  
✅ **Interface** mobile-first et ultra-rapide  

---

## 📋 PRÉREQUIS

- Node.js 18+ installé
- Compte Netlify (gratuit)
- Compte Neon (gratuit)
- (Optionnel) Compte SendGrid/Twilio pour notifications

---

## 🔧 INSTALLATION LOCALE

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd kaay-diunde-shop
```

### 2. Installer les dépendances

```bash
# Dépendances principales
npm install

# Dépendances Netlify Functions
cd netlify/functions
npm install
cd ../..
```

### 3. Installer Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
```

### 4. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` avec vos vraies valeurs.

### 5. Lancer en local

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

---

## 🗄️ CONFIGURATION DE LA BASE DE DONNÉES NEON

### 1. Créer un compte Neon

- Aller sur https://neon.tech
- Créer un compte gratuit
- Créer un nouveau projet "kaay-diunde-shop"

### 2. Obtenir l'URL de connexion

- Dans votre projet Neon, aller dans "Connection Details"
- Copier l'URL de connexion (commence par `postgresql://`)

### 3. Exécuter le schéma SQL

- Dans Neon, aller dans l'onglet "SQL Editor"
- Copier-coller le contenu de `database-schema.sql`
- Exécuter le script

Votre base de données est maintenant prête avec :
- ✅ Table `products` (12 produits de démo)
- ✅ Table `orders`
- ✅ Table `order_items`

---

## 🚀 DÉPLOIEMENT SUR NETLIFY

### Méthode 1: Via l'interface Netlify (Recommandé)

1. **Push votre code sur GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/kaay-diunde-shop.git
git push -u origin main
```

2. **Connecter à Netlify**

- Aller sur https://app.netlify.com
- Cliquer "Add new site" > "Import an existing project"
- Sélectionner GitHub
- Choisir votre repo `kaay-diunde-shop`
- Build settings (déjà configurés dans netlify.toml) :
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Functions directory: `netlify/functions`

3. **Configurer les variables d'environnement**

Dans Netlify Dashboard > Site settings > Environment variables, ajouter :

```
DATABASE_URL=postgresql://...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
WHATSAPP_API_URL=https://graph.facebook.com/...
WHATSAPP_API_KEY=your_api_key
ADMIN_WHATSAPP_NUMBER=221XXXXXXXXX
EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_API_KEY=SG.your_key
ADMIN_EMAIL=admin@kaaydiunde.com
```

4. **Activer l'intégration Neon dans Netlify**

- Dans Netlify Dashboard, aller dans "Integrations"
- Rechercher "Neon"
- Cliquer "Connect"
- Sélectionner votre projet Neon

5. **Déployer**

- Netlify va automatiquement déployer votre site
- Votre site sera accessible sur `https://VOTRE-SITE.netlify.app`

### Méthode 2: Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser
netlify init

# Déployer
netlify deploy --prod
```

---

## 📧 CONFIGURATION DES NOTIFICATIONS

### Discord Webhook

1. Ouvrir votre serveur Discord
2. Paramètres serveur > Intégrations > Webhooks
3. Créer un webhook
4. Copier l'URL
5. Ajouter dans Netlify: `DISCORD_WEBHOOK_URL`

### WhatsApp Business API

#### Option A: WhatsApp Business Cloud API (Gratuit)

1. Aller sur https://developers.facebook.com/apps
2. Créer une app
3. Ajouter "WhatsApp" à votre app
4. Suivre le guide de configuration
5. Obtenir votre `Phone Number ID` et `Access Token`
6. Configurer dans Netlify :
   ```
   WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages
   WHATSAPP_API_KEY=your_access_token
   ADMIN_WHATSAPP_NUMBER=221XXXXXXXXX
   ```

#### Option B: Service tiers (Twilio)

1. Créer un compte sur https://www.twilio.com
2. Obtenir vos credentials
3. Configurer dans Netlify

### Email (SendGrid)

1. Créer un compte sur https://sendgrid.com (gratuit)
2. Créer une API Key
3. Vérifier votre domaine d'envoi
4. Configurer dans Netlify :
   ```
   EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
   EMAIL_API_KEY=SG.your_api_key
   ADMIN_EMAIL=admin@kaaydiunde.com
   ```

---

## 🛠️ PERSONNALISATION

### Changer le numéro WhatsApp

Éditer `src/constants.ts` :

```typescript
export const WHATSAPP_NUMBER = '221VOTRENUMERO';
```

### Ajouter/Modifier des produits

Deux options :

1. **Via la base de données** (Recommandé pour production) :
   - Aller dans Neon SQL Editor
   - Insérer/Modifier les produits

2. **Via le code** (Pour test local) :
   - Les produits de démo sont dans `database-schema.sql`

### Changer les frais de livraison

Éditer `src/pages/Checkout.tsx` :

```typescript
const deliveryFees: Record<string, number> = {
  [DeliveryZone.DAKAR]: 2000,
  [DeliveryZone.PIKINE]: 2500,
  // ...
};
```

---

## 📱 API ENDPOINTS

Votre site expose automatiquement ces APIs :

- `GET /.netlify/functions/get-products` - Liste tous les produits
- `GET /.netlify/functions/get-products?category=electronics` - Produits par catégorie
- `GET /.netlify/functions/get-product?id=iphone-13` - Un produit spécifique
- `POST /.netlify/functions/create-order` - Créer une commande

---

## 🧪 TESTER LES NOTIFICATIONS

### Test Discord

```bash
curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test notification from Kaay Diunde!"}'
```

### Test WhatsApp (Cloud API)

```bash
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "221XXXXXXXXX",
    "type": "text",
    "text": { "body": "Test from Kaay Diunde!" }
  }'
```

### Test Email (SendGrid)

```bash
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "admin@kaaydiunde.com"}]}],
    "from": {"email": "noreply@kaaydiunde.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test email"}]
  }'
```

---

## 📊 MONITORING

### Voir les logs Netlify

```bash
netlify logs:function create-order
```

### Voir les commandes dans Neon

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

---

## 🔒 SÉCURITÉ

✅ **Variables d'environnement** : Jamais dans le code  
✅ **HTTPS** : Automatique avec Netlify  
✅ **CORS** : Configuré dans les fonctions  
✅ **Validation** : Toutes les entrées sont validées  

---

## 🐛 DÉPANNAGE

### Problème : "DATABASE_URL not configured"

**Solution** : Vérifier que la variable `DATABASE_URL` est bien définie dans Netlify

### Problème : Les produits ne s'affichent pas

**Solution** : 
1. Vérifier que le script SQL a bien été exécuté dans Neon
2. Vérifier les logs : `netlify logs:function get-products`

### Problème : Notifications ne fonctionnent pas

**Solution** :
1. Vérifier que toutes les variables d'environnement sont configurées
2. Tester les webhooks manuellement (voir section Tests)
3. Vérifier les logs de la fonction `create-order`

---

## 📞 SUPPORT

Pour toute question :
- GitHub Issues
- Email: support@kaaydiunde.com

---

## 📄 LICENCE

MIT License - Libre d'utilisation

---

## 🎉 FÉLICITATIONS !

Votre boutique e-commerce sénégalaise est maintenant en ligne ! 🇸🇳

**Site** : https://VOTRE-SITE.netlify.app  
**Admin** : Vous recevrez les commandes par WhatsApp, Email et Discord

---

Made with ❤️ in Senegal
