# 🚀 GUIDE D'INSTALLATION RAPIDE - KAAY DIUNDE SHOP

## ⏱️ Installation en 15 minutes

### ÉTAPE 1: Créer la base de données (5 min)

1. Aller sur https://neon.tech
2. Créer un compte (gratuit)
3. Créer un projet "kaay-diunde-shop"
4. Copier l'URL de connexion
5. Aller dans SQL Editor
6. Copier-coller le contenu de `database-schema.sql`
7. Exécuter ✅

### ÉTAPE 2: Pusher sur GitHub (2 min)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/kaay-diunde-shop.git
git push -u origin main
```

### ÉTAPE 3: Déployer sur Netlify (3 min)

1. Aller sur https://app.netlify.com
2. "Add new site" > "Import an existing project"
3. Sélectionner GitHub > Choisir votre repo
4. Cliquer "Deploy" (les paramètres sont déjà configurés)

### ÉTAPE 4: Configurer les variables (5 min)

Dans Netlify > Site settings > Environment variables, ajouter :

**OBLIGATOIRE :**
```
DATABASE_URL = [votre URL Neon]
```

**OPTIONNEL (pour notifications) :**
```
DISCORD_WEBHOOK_URL = [votre webhook Discord]
WHATSAPP_API_URL = [votre API WhatsApp]
WHATSAPP_API_KEY = [votre clé API]
ADMIN_WHATSAPP_NUMBER = 221XXXXXXXXX
EMAIL_SERVICE_URL = https://api.sendgrid.com/v3/mail/send
EMAIL_API_KEY = [votre clé SendGrid]
ADMIN_EMAIL = admin@kaaydiunde.com
```

### ÉTAPE 5: Redéployer

- Netlify > Deploys > Trigger deploy > Deploy site

---

## ✅ C'EST FINI !

Votre site est en ligne : `https://VOTRE-SITE.netlify.app`

---

## 📝 PERSONNALISATION RAPIDE

### Changer le numéro WhatsApp

Éditer `src/constants.ts` :
```typescript
export const WHATSAPP_NUMBER = '221VOTRENUMERO';
```

Puis push :
```bash
git add .
git commit -m "Update WhatsApp number"
git push
```

Netlify déploiera automatiquement !

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Tester une commande
2. ✅ Vérifier que vous recevez les notifications
3. ✅ Personnaliser les produits dans Neon
4. ✅ Partager votre site ! 🎉

---

## 🆘 BESOIN D'AIDE ?

Voir le `README.md` complet pour plus de détails.
