# Kaay Diunde — boutique en ligne

Boutique React + Vite (front) avec fonctions Netlify (back) et base PostgreSQL Neon.

## Variables d'environnement (Netlify → Site configuration → Environment variables)

| Variable | Obligatoire | Rôle |
|---|---|---|
| `DATABASE_URL` | oui | Connexion PostgreSQL (Neon) |
| `ADMIN_PASSWORD` | **oui** | Mot de passe de connexion à l'admin. Vérifié par le serveur ; sans lui, personne ne peut se connecter. |
| `ADMIN_TOKEN_SECRET` | recommandée | Longue chaîne aléatoire qui signe les sessions admin (à défaut, `ADMIN_PASSWORD` est utilisé). |
| `DISCORD_WEBHOOK_URL` | non | Notification Discord à chaque commande |
| `SITE_ORIGIN` | non | Origine autorisée pour les appels (défaut `https://kaay-diunde.site`) |

⚠️ Les anciennes variables `VITE_ADMIN_PASSWORD` et `VITE_ADMIN_SECRET` ne sont plus utilisées :
les variables `VITE_*` sont intégrées au code public du site. **Supprimez-les de Netlify**, et
choisissez un nouveau mot de passe (l'ancien mot de passe par défaut figurait dans le code public).

## Sécurité du back-office

- `admin-login` vérifie le mot de passe côté serveur et renvoie un jeton signé (12 h).
- Toutes les fonctions qui modifient des données (`add-product`, `update-product`, `delete-product`,
  `save-floating-ad`, `upload-ad-image`, `delete-ad-image`) exigent ce jeton (`Authorization: Bearer …`).
- `create-order` recalcule prix, livraison, total et stock à partir de la base : le navigateur n'envoie
  que les produits et les quantités. Les articles sont enregistrés dans `ordres_articles`.

## Référencement

- `/sitemap.xml` est généré par la fonction `sitemap` (accueil, boutique et chaque produit).
- Chaque page définit son titre, sa description et son URL canonique (`src/utils/usePageMeta.ts`).
- Les pages `/admin`, `/checkout` et les résultats de recherche ne sont pas indexés.

## Développement

```bash
npm install
npm run dev      # site sur http://localhost:5173
npm run build    # vérification TypeScript + build de production
```

Les fonctions Netlify s'exécutent avec `netlify dev` (CLI Netlify).
