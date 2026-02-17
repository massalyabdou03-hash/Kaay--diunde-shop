# ⚡ DÉMARRAGE RAPIDE

Guide ultra-rapide pour déployer en 10 minutes.

## 🚀 EN 5 ÉTAPES

### 1️⃣ Base de données (2 minutes)

1. Aller sur https://neon.tech → Sign up
2. New Project → `kaay-diunde-shop`
3. SQL Editor → Copier/coller le contenu de `database-schema.sql` → Run
4. Connection Details → Copier l'URL complète

### 2️⃣ GitHub (2 minutes)

```bash
cd kaay-diunde-shop
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/kaay-diunde-shop.git
git push -u origin main
```

### 3️⃣ Netlify (3 minutes)

1. https://app.netlify.com → Add new site → Import from Git
2. Choisir GitHub → Sélectionner `kaay-diunde-shop`
3. Configuration auto-détectée → **NE PAS cliquer Deploy encore!**

### 4️⃣ Variables d'environnement (2 minutes)

Dans Netlify → Site settings → Environment variables → Add:

```env
DATABASE_URL=postgresql://...  (votre URL Neon)
VITE_ADMIN_PASSWORD=admin2024  (choisissez un mot de passe)
```

### 5️⃣ Déployer ! (1 minute)

Retour dans Deploys → Deploy site → Attendre 3-5 minutes → ✅ TERMINÉ !

## ✅ VÉRIFICATION RAPIDE

Votre site est sur `https://xxx.netlify.app`

Tests rapides :
- ✅ Page d'accueil s'affiche
- ✅ Boutique affiche 8 produits
- ✅ Cliquer "Admin" → Se connecter
- ✅ Ajouter un produit de test

## 🎯 PERSONNALISATION EXPRESS

### Changer le numéro WhatsApp

Éditez `src/constants.ts` :
```typescript
export const WHATSAPP_NUMBER = '221VOTRENUMERO';
```

```bash
git add src/constants.ts
git commit -m "Update WhatsApp"
git push
```

Netlify redéploie automatiquement ! 🎉

## 📱 NOTIFICATIONS (Optionnel)

### Discord (30 secondes)
1. Serveur Discord → Webhooks → Copier l'URL
2. Netlify → Environment variables → `DISCORD_WEBHOOK_URL`
3. Redeploy

### WhatsApp Business API
Voir `DEPLOY.md` pour les détails.

## 🐛 PROBLÈME ?

### Les produits ne s'affichent pas
- Vérifier que `database-schema.sql` a été exécuté dans Neon
- Vérifier `DATABASE_URL` dans Netlify

### Admin ne fonctionne pas
- Vérifier `VITE_ADMIN_PASSWORD` dans Netlify
- Netlify → Deploys → Clear cache and deploy

### Build échoue
```bash
npm run build
```
Corriger les erreurs, puis push.

## 📚 DOCUMENTATION COMPLÈTE

- `README.md` - Documentation complète
- `DEPLOY.md` - Guide de déploiement détaillé
- `CHECKLIST.md` - Checklist de vérification

## 🎉 C'EST TOUT !

Votre boutique e-commerce est en ligne ! 🚀

**Prochaines étapes :**
1. Supprimer les produits de démo
2. Ajouter vos vrais produits
3. Partager le lien !

---

**Besoin d'aide ?** Consultez `DEPLOY.md` pour plus de détails.
