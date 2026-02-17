#!/bin/bash

# Script de vérification du projet Kaay Diunde Shop
# Ce script vérifie que tous les fichiers nécessaires sont présents

echo "🔍 VÉRIFICATION DU PROJET KAAY DIUNDE SHOP"
echo "=========================================="
echo ""

ERRORS=0

# Fonction de vérification de fichier
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ MANQUANT: $1"
        ERRORS=$((ERRORS + 1))
    fi
}

# Fichiers racine
echo "📁 Fichiers racine:"
check_file "index.html"
check_file "package.json"
check_file "vite.config.ts"
check_file "tsconfig.json"
check_file "tsconfig.node.json"
check_file "netlify.toml"
check_file ".gitignore"
check_file ".env.example"
check_file "database-schema.sql"
check_file "README.md"
echo ""

# Dossier src/
echo "📁 Dossier src/:"
check_file "src/main.tsx"
check_file "src/App.tsx"
check_file "src/App.css"
check_file "src/types.ts"
check_file "src/constants.ts"
echo ""

# Pages
echo "📁 Pages:"
check_file "src/pages/Home.tsx"
check_file "src/pages/Shop.tsx"
check_file "src/pages/ProductDetail.tsx"
check_file "src/pages/Checkout.tsx"
check_file "src/pages/AdminDashboard.tsx"
echo ""

# Context
echo "📁 Context:"
check_file "src/context/CartContext.tsx"
echo ""

# Netlify Functions
echo "📁 Netlify Functions:"
check_file "netlify/functions/get-products.js"
check_file "netlify/functions/get-product.js"
check_file "netlify/functions/create-order.js"
check_file "netlify/functions/add-product.js"
check_file "netlify/functions/update-product.js"
check_file "netlify/functions/delete-product.js"
check_file "netlify/functions/package.json"
echo ""

# Vérification du contenu de package.json
echo "🔍 Vérification de package.json:"
if grep -q "vite build" package.json; then
    echo "✅ Script 'build' trouvé"
else
    echo "❌ Script 'build' manquant"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "react" package.json; then
    echo "✅ Dépendance 'react' trouvée"
else
    echo "❌ Dépendance 'react' manquante"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Vérification de netlify.toml
echo "🔍 Vérification de netlify.toml:"
if grep -q "npm run build" netlify.toml; then
    echo "✅ Build command trouvée"
else
    echo "❌ Build command manquante"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "dist" netlify.toml; then
    echo "✅ Publish directory trouvé"
else
    echo "❌ Publish directory manquant"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Résumé
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ SUCCÈS: Tous les fichiers sont présents!"
    echo ""
    echo "🚀 Prêt pour le déploiement!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. git add ."
    echo "2. git commit -m 'Initial commit'"
    echo "3. git push"
    echo "4. Configurer les variables d'environnement dans Netlify"
    exit 0
else
    echo "❌ ERREUR: $ERRORS fichier(s) manquant(s)"
    echo ""
    echo "⚠️  Veuillez créer les fichiers manquants avant de continuer."
    exit 1
fi
