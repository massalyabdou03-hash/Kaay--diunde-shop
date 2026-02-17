# 🚀 GUIDE DE DÉPLOIEMENT NETLIFY

Guide étape par étape pour déployer Kaay Diunde Shop sur Netlify.

## ✅ Checklist Pré-Déploiement

Avant de commencer, assurez-vous d'avoir :

- [ ] Un compte GitHub
- [ ] Un compte Netlify
- [ ] Un compte Neon (base de données)
- [ ] Git installé sur votre ordinateur
- [ ] Node.js installé (version 18+)

## 📦 ÉTAPE 1 : Préparer le Projet

```bash
# Vérifier que tous les fichiers sont présents
cd kaay-diunde-shop
ls -la

# Vous devriez voir :
# - index.html
# - package.json
# - vite.config.ts
# - netlify.toml
# - src/
# - netlify/functions/
```

## 🗄️ ÉTAPE 2 : Configurer la Base de Données

### 2.1 Créer un compte Neon

1. Aller sur https://neon.tech
2. Cliquer "Sign up"
3. Se connecter avec GitHub (recommandé)

### 2.2 Créer un projet

1. Cliquer "New Project"
2. Nom : `kaay-diunde-shop`
3. Région : Choisir la plus proche (ex: AWS eu-west-1)
4. Cliquer "Create Project"

### 2.3 Exécuter le schéma SQL

1. Dans le dashboard Neon, cliquer sur "SQL Editor"
2. Ouvrir le fichier `database-schema.sql`
3. Copier tout le contenu
4. Coller dans l'éditeur SQL
5. Cliquer "Run"
6. Vérifier que les tables sont créées (aucune erreur)

### 2.4 Obtenir l'URL de connexion

1. Dans Neon, aller dans "Connection Details"
2. Copier la chaîne complète (commence par `postgresql://`)
3. La garder en lieu sûr, vous en aurez besoin

Exemple :
```
postgresql://user:password@ep-xxx.eu-west-1.aws.neon.tech/kaaydiunde?sslmode=require
```

## 📤 ÉTAPE 3 : Pousser sur GitHub

### 3.1 Créer un repository GitHub

1. Aller sur https://github.com/new
2. Nom : `kaay-diunde-shop`
3. Public ou Private (au choix)
4. NE PAS initialiser avec README
5. Cliquer "Create repository"

### 3.2 Pousser le code

```bash
cd kaay-diunde-shop

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Kaay Diunde Shop"

# Lier au repository GitHub
git remote add origin https://github.com/VOTRE_USERNAME/kaay-diunde-shop.git

# Pousser
git branch -M main
git push -u origin main
```

## 🌐 ÉTAPE 4 : Déployer sur Netlify

### 4.1 Créer un site

1. Aller sur https://app.netlify.com
2. Cliquer "Add new site" → "Import an existing project"
3. Choisir "GitHub"
4. Autoriser Netlify à accéder à vos repos
5. Sélectionner `kaay-diunde-shop`

### 4.2 Configuration du build

Netlify détecte automatiquement `netlify.toml`, mais vérifiez :

```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

**Ne cliquez PAS encore sur "Deploy" !**

### 4.3 Ajouter les variables d'environnement

1. Dans Netlify, aller dans "Site settings" → "Environment variables"
2. Cliquer "Add a variable"

**Variables OBLIGATOIRES :**

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```
(Collez l'URL complète de Neon)

```env
VITE_ADMIN_PASSWORD=VotreMotDePasseSecure123!
```
(Choisissez un mot de passe fort pour l'admin)

**Variables OPTIONNELLES (Notifications) :**

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```
(Si vous voulez recevoir des notifications Discord)

```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/PHONE_ID/messages
WHATSAPP_API_KEY=votre_access_token
ADMIN_WHATSAPP_NUMBER=221XXXXXXXXX
```
(Pour notifications WhatsApp Business API)

```env
EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_API_KEY=SG.votre_api_key
ADMIN_EMAIL=admin@kaaydiunde.com
```
(Pour notifications email via SendGrid)

### 4.4 Déployer

1. Retourner dans "Deploys"
2. Cliquer "Deploy site"
3. Attendre 3-5 minutes

### 4.5 Vérifier le déploiement

Une fois terminé :

1. Cliquer sur l'URL du site (ex: `https://xxx.netlify.app`)
2. Vérifier que la page d'accueil s'affiche
3. Aller sur "Boutique" → les produits doivent s'afficher
4. Tester le bouton "Admin" avec votre mot de passe

## ✅ ÉTAPE 5 : Tests Post-Déploiement

### 5.1 Tester la boutique

- [ ] La page d'accueil s'affiche correctement
- [ ] La boutique affiche les 8 produits de démonstration
- [ ] Cliquer sur un produit affiche ses détails
- [ ] Le bouton "Ajouter au panier" fonctionne
- [ ] Le badge du panier se met à jour
- [ ] Le filtre par catégorie fonctionne

### 5.2 Tester le panier et checkout

- [ ] Ajouter plusieurs produits au panier
- [ ] Cliquer sur l'icône panier
- [ ] Modifier les quantités
- [ ] Supprimer un article
- [ ] Remplir le formulaire de livraison
- [ ] Sélectionner une zone de livraison
- [ ] Vérifier que le total est correct
- [ ] Cliquer "Confirmer par WhatsApp"
- [ ] WhatsApp s'ouvre avec le message pré-rempli

### 5.3 Tester l'interface admin

- [ ] Cliquer sur "Admin" dans le header
- [ ] Entrer le mot de passe
- [ ] Le tableau de bord s'affiche
- [ ] Les statistiques sont correctes
- [ ] Cliquer "Ajouter un produit"
- [ ] Remplir le formulaire
- [ ] Le produit apparaît dans la liste
- [ ] Modifier un produit
- [ ] Supprimer un produit
- [ ] Se déconnecter

## 🔧 ÉTAPE 6 : Personnalisation

### 6.1 Changer le numéro WhatsApp

1. Ouvrir `src/constants.ts`
2. Modifier `WHATSAPP_NUMBER`
3. Commit et push

```bash
git add src/constants.ts
git commit -m "Update WhatsApp number"
git push
```

Netlify redéploiera automatiquement.

### 6.2 Modifier les frais de livraison

1. Ouvrir `src/pages/Checkout.tsx`
2. Modifier `deliveryFees`
3. Commit et push

### 6.3 Changer le nom de domaine

1. Dans Netlify, aller dans "Site settings" → "Domain management"
2. Cliquer "Add custom domain"
3. Suivre les instructions pour configurer votre DNS

## 📱 ÉTAPE 7 : Configurer les Notifications (Optionnel)

### 7.1 Discord Webhook

1. Ouvrir votre serveur Discord
2. Paramètres du serveur → Intégrations → Webhooks
3. "Nouveau webhook"
4. Copier l'URL du webhook
5. Dans Netlify, ajouter `DISCORD_WEBHOOK_URL`
6. Redéployer

### 7.2 WhatsApp Business API

**Option A : Meta Business (Gratuit)**

1. Aller sur https://developers.facebook.com
2. Créer une app
3. Ajouter le produit "WhatsApp"
4. Obtenir Phone Number ID et Access Token
5. Ajouter les variables dans Netlify
6. Redéployer

**Option B : Twilio (Payant mais simple)**

1. Créer un compte sur https://twilio.com
2. Activer WhatsApp Business
3. Suivre leur documentation
4. Adapter le code dans `create-order.js`

### 7.3 SendGrid Email

1. Créer un compte sur https://sendgrid.com (gratuit)
2. Vérifier votre domaine d'envoi
3. Créer une API Key
4. Ajouter `EMAIL_SERVICE_URL` et `EMAIL_API_KEY`
5. Redéployer

## 🐛 Dépannage

### Les produits ne s'affichent pas

```bash
# Vérifier les logs de la function
netlify logs:function get-products

# Problèmes possibles :
# 1. DATABASE_URL incorrecte
# 2. Le schéma SQL n'a pas été exécuté
# 3. Problème de connexion SSL
```

**Solution :**
1. Vérifier que `DATABASE_URL` est correcte dans Netlify
2. Vérifier que la base de données Neon est active
3. Re-exécuter `database-schema.sql` dans Neon

### Le bouton admin ne fonctionne pas

**Solution :**
1. Vérifier que `VITE_ADMIN_PASSWORD` est défini dans Netlify
2. Les variables avec `VITE_` nécessitent un redéploiement complet
3. Dans Netlify : Deploys → Trigger deploy → Clear cache and deploy

### Erreur de build

```
Error: Cannot find module 'pg'
```

**Solution :**
```bash
cd netlify/functions
npm install
git add package-lock.json
git commit -m "Add pg dependency"
git push
```

### WhatsApp ne s'ouvre pas

**Solution :**
1. Vérifier `WHATSAPP_NUMBER` dans `src/constants.ts`
2. Format correct : `221XXXXXXXXX` (avec indicatif pays)
3. Tester manuellement : `https://wa.me/221XXXXXXXXX`

## 📊 Monitoring

### Voir les logs en temps réel

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Lier le site
netlify link

# Voir les logs
netlify logs --live
```

### Voir les logs d'une function spécifique

```bash
netlify logs:function get-products
netlify logs:function create-order
```

## 🔐 Sécurité

### Changer le mot de passe admin

1. Dans Netlify → Environment variables
2. Modifier `VITE_ADMIN_PASSWORD`
3. Redéployer (Clear cache and deploy)

### Sécuriser l'accès admin

Le système actuel utilise `sessionStorage` :
- Connexion expire à la fermeture du navigateur
- Pas de cookies persistants
- Pas de JWT (par simplicité)

Pour une sécurité renforcée, considérez :
- Ajouter un système de JWT
- Rate limiting sur les tentatives de connexion
- Logs des accès admin

## 📈 Évolutions Futures

Améliorations possibles :

- [ ] Ajouter un système de recherche
- [ ] Filtres avancés (prix, disponibilité)
- [ ] Système de favoris
- [ ] Historique des commandes
- [ ] Dashboard client
- [ ] Paiement en ligne (Wave API, Orange Money API)
- [ ] Système de promo codes
- [ ] Analytics avancés

## 🎉 Félicitations !

Votre boutique e-commerce est maintenant en ligne ! 🚀

**URL de votre site :** https://votre-site.netlify.app

**Prochaines étapes :**
1. Ajouter vos vrais produits dans l'admin
2. Configurer les notifications
3. Personnaliser le design
4. Partager le lien avec vos clients

---

**Besoin d'aide ?**

- Documentation Netlify : https://docs.netlify.com
- Documentation Neon : https://neon.tech/docs
- Issues GitHub : Créez une issue sur votre repo

**Bon commerce ! 🇸🇳**
