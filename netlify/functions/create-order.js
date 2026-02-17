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

// Génère un numéro de commande unique : KD-20250217-XXXX
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KD-${dateStr}-${rand}`;
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'DATABASE_URL manquante' })
    };
  }

  let order;
  try {
    order = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Corps de requête JSON invalide' })
    };
  }

  // ✅ Validation des champs obligatoires
  const required = ['customerName', 'customerPhone', 'deliveryAddress', 'deliveryZone', 'items', 'subtotal', 'deliveryFee', 'total'];
  const missing = required.filter(f => !order[f] && order[f] !== 0);
  if (missing.length > 0) {
    console.error('❌ Champs de commande manquants:', missing);
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: `Champs obligatoires manquants: ${missing.join(', ')}` })
    };
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'La commande doit contenir au moins un article' })
    };
  }

  const numeroCommande = generateOrderNumber();
  console.log(`🛒 Création commande ${numeroCommande} pour "${order.customerName}"...`);

  try {
    // ✅ INSERT dans la table ordres avec les colonnes exactes
    const orderResult = await pool.query(
      `INSERT INTO ordres (
        numéro_de_commande,
        nom_du_client,
        numéro_de_téléphone_du_client,
        ville_client,
        texte_de_l_adresse_du_client,
        méthode_de_paiement,
        sous_total,
        frais_de_livraison,
        total,
        statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING numéro`,
      [
        numeroCommande,
        order.customerName,
        order.customerPhone,
        order.deliveryZone,                          // ville / zone
        order.deliveryAddress,                        // adresse texte
        order.paymentMethod || 'Paiement à la livraison',
        parseInt(order.subtotal),
        parseInt(order.deliveryFee),
        parseInt(order.total),
        'en_attente'
      ]
    );

    const ordreNumero = orderResult.rows[0].numéro;
    console.log(`✅ Commande ${numeroCommande} créée (numéro DB: ${ordreNumero})`);

    // ✅ Mise à jour du stock dans la table produits
    for (const item of order.items) {
      try {
        await pool.query(
          'UPDATE produits SET stock = GREATEST(stock - $1, 0), updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [parseInt(item.quantity), item.id]
        );
        console.log(`📦 Stock mis à jour: produit "${item.id}" -${item.quantity}`);
      } catch (stockErr) {
        // Ne pas bloquer la commande si la mise à jour du stock échoue
        console.error(`⚠️ Erreur MAJ stock produit "${item.id}":`, stockErr.message);
      }
    }

    // ✅ Notification Discord (optionnelle)
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        const discordMsg = {
          embeds: [{
            title: `🛍️ Nouvelle commande ${numeroCommande}`,
            color: 0xf97316,
            fields: [
              { name: '👤 Client', value: order.customerName, inline: true },
              { name: '📞 Téléphone', value: order.customerPhone, inline: true },
              { name: '📍 Zone', value: order.deliveryZone, inline: true },
              { name: '💰 Total', value: `${parseInt(order.total).toLocaleString('fr-SN')} FCFA`, inline: true },
              { name: '🧾 Articles', value: order.items.map(i => `${i.name} ×${i.quantity}`).join('\n') }
            ],
            timestamp: new Date().toISOString()
          }]
        };

        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMsg)
        });
        console.log('📨 Notification Discord envoyée');
      } catch (discordErr) {
        console.error('⚠️ Erreur notification Discord:', discordErr.message);
      }
    }

    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        numeroCommande,
        ordreNumero,
        message: 'Commande créée avec succès'
      })
    };
  } catch (error) {
    console.error('❌ Erreur DB create-order:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Impossible de créer la commande', details: error.message })
    };
  }
};
