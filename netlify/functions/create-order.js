const crypto = require('crypto');
const { Pool } = require('pg');
const { corsHeaders } = require('./_shared/http');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR CRITIQUE: DATABASE_URL est undefined.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const HEADERS = corsHeaders('POST, OPTIONS');

// ─── Règles métier appliquées CÔTÉ SERVEUR ───────────────────────────────
// Le navigateur n'envoie que « quel produit, quelle quantité » : les prix, les
// frais de livraison et le total sont recalculés ici, à partir de la base.
// ⚠️ Ces frais doivent rester identiques à ceux affichés dans src/pages/Checkout.tsx.
const DELIVERY_FEES = {
  'Dakar': 2000,
  'Pikine-Guédiawaye': 2500,
  'Rufisque': 3000,
  'Thiès': 4000,
  'Autre région': 5000
};

const PAYMENT_METHODS = [
  'Cash à la livraison',
  'Wave à la livraison',
  'Orange Money à la livraison',
  // anciens libellés (pages ouvertes avant la mise à jour)
  'Paiement à la livraison (Cash)',
  'Wave',
  'Orange Money'
];

const SENEGAL_PREFIXES = ['70', '75', '76', '77', '78'];
const MAX_DISTINCT_PRODUCTS = 50;
const MAX_QTY_PER_PRODUCT = 50;

// ─── Utilitaires ─────────────────────────────────────────────────────────
function reply(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

// Enlève les caractères de contrôle et les espaces multiples
function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

// Renvoie les 9 chiffres du numéro sénégalais, ou null s'il est invalide
function normalizePhone(value) {
  if (typeof value !== 'string') return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('221')) digits = digits.slice(3);
  if (digits.length !== 9) return null;
  return SENEGAL_PREFIXES.some(prefix => digits.startsWith(prefix)) ? digits : null;
}

// Fusionne les doublons et vérifie les quantités. Renvoie null si invalide.
function parseItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_DISTINCT_PRODUCTS) return null;

  const merged = new Map();
  for (const item of raw) {
    const id = item && typeof item.id === 'string' ? item.id.trim() : '';
    const quantity = Number(item && item.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1) return null;
    merged.set(id, (merged.get(id) || 0) + quantity);
  }

  const items = [];
  for (const [id, quantity] of merged) {
    if (quantity > MAX_QTY_PER_PRODUCT) return null;
    items.push({ id, quantity });
  }
  return items;
}

// Numéro de commande : KD-AAAAMMJJ-NNNNNN (6 chiffres tirés au hasard par le serveur)
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `KD-${dateStr}-${crypto.randomInt(100000, 1000000)}`;
}

// Table des lignes de commande (créée au premier appel si elle n'existe pas)
let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ordres_articles (
          id                  SERIAL PRIMARY KEY,
          numéro_de_commande  VARCHAR(30)  NOT NULL,
          produit_id          VARCHAR(100) NOT NULL,
          nom_produit         VARCHAR(255) NOT NULL,
          prix_unitaire       INTEGER      NOT NULL,
          quantite            INTEGER      NOT NULL,
          created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_ordres_articles_commande ON ordres_articles(numéro_de_commande)'
      );
    })().catch(err => {
      schemaReady = null; // on réessaiera à la prochaine commande
      throw err;
    });
  }
  return schemaReady;
}

// ─── Fonction principale ─────────────────────────────────────────────────
exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return reply(405, { error: 'Méthode non autorisée' });
  }

  if (!process.env.DATABASE_URL) {
    return reply(500, { error: 'Service momentanément indisponible' });
  }

  let order;
  try {
    order = JSON.parse(event.body || '{}');
  } catch {
    return reply(400, { error: 'Corps de requête JSON invalide' });
  }

  // ── Validation des informations client ──
  const customerName = cleanText(order.customerName, 100);
  const deliveryAddress = cleanText(order.deliveryAddress, 500);
  const phone = normalizePhone(order.customerPhone);
  const deliveryZone = order.deliveryZone;
  const paymentMethod = PAYMENT_METHODS.includes(order.paymentMethod)
    ? order.paymentMethod
    : 'Cash à la livraison';

  if (customerName.length < 2) {
    return reply(400, { error: 'Veuillez indiquer votre nom complet.' });
  }
  if (!phone) {
    return reply(400, { error: 'Numéro de téléphone invalide (ex. 77 123 45 67).' });
  }
  if (!Object.prototype.hasOwnProperty.call(DELIVERY_FEES, deliveryZone)) {
    return reply(400, { error: 'Zone de livraison invalide.' });
  }
  if (deliveryAddress.length < 5) {
    return reply(400, { error: 'Veuillez indiquer votre adresse complète.' });
  }

  const requested = parseItems(order.items);
  if (!requested) {
    return reply(400, { error: 'Panier invalide. Vérifiez les articles et les quantités.' });
  }

  const deliveryFee = DELIVERY_FEES[deliveryZone];

  let client;
  try {
    await ensureSchema().catch(err => {
      // Sans la table des lignes, la commande reste enregistrée (voir plus bas)
      console.error('⚠️ Table ordres_articles indisponible:', err.message);
    });

    client = await pool.connect();
    await client.query('BEGIN');

    // Verrouille les produits commandés pour éviter que deux clients prennent le dernier article
    const ids = requested.map(i => i.id);
    const { rows: products } = await client.query(
      'SELECT id, name, price, stock FROM produits WHERE id = ANY($1::text[]) FOR UPDATE',
      [ids]
    );
    const byId = new Map(products.map(p => [p.id, p]));

    // ── Vérification stock / existence ──
    const problems = [];
    const lines = [];
    for (const { id, quantity } of requested) {
      const product = byId.get(id);
      if (!product) {
        problems.push('un article de votre panier n\'est plus disponible');
        continue;
      }
      if (product.stock < quantity) {
        problems.push(
          product.stock > 0
            ? `« ${product.name} » : il ne reste que ${product.stock} en stock`
            : `« ${product.name} » est en rupture de stock`
        );
        continue;
      }
      lines.push({ id: product.id, name: product.name, unitPrice: product.price, quantity });
    }

    if (problems.length > 0) {
      await client.query('ROLLBACK');
      return reply(409, {
        error: `Commande impossible : ${problems.join(' ; ')}. Modifiez votre panier puis réessayez.`
      });
    }

    // ── Totaux calculés par le serveur ──
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const total = subtotal + deliveryFee;

    // ── Enregistrement de la commande (nouveau numéro en cas de collision) ──
    let numeroCommande = null;
    let ordreNumero = null;
    for (let attempt = 0; attempt < 5 && ordreNumero === null; attempt++) {
      const candidate = generateOrderNumber();
      await client.query('SAVEPOINT insert_order');
      try {
        const inserted = await client.query(
          `INSERT INTO ordres (
            numéro_de_commande, nom_du_client, numéro_de_téléphone_du_client,
            ville_client, texte_de_l_adresse_du_client, méthode_de_paiement,
            sous_total, frais_de_livraison, total, statut
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING numéro`,
          [candidate, customerName, phone, deliveryZone, deliveryAddress, paymentMethod,
            subtotal, deliveryFee, total, 'en_attente']
        );
        await client.query('RELEASE SAVEPOINT insert_order');
        numeroCommande = candidate;
        ordreNumero = inserted.rows[0]['numéro'];
      } catch (err) {
        await client.query('ROLLBACK TO SAVEPOINT insert_order');
        if (err.code !== '23505') throw err; // seule la collision de numéro est rejouée
      }
    }
    if (ordreNumero === null) {
      throw new Error('Impossible de générer un numéro de commande unique');
    }

    // ── Lignes de commande (ne bloquent pas la commande si la table manque) ──
    await client.query('SAVEPOINT insert_items');
    try {
      for (const line of lines) {
        await client.query(
          `INSERT INTO ordres_articles (numéro_de_commande, produit_id, nom_produit, prix_unitaire, quantite)
           VALUES ($1, $2, $3, $4, $5)`,
          [numeroCommande, line.id, line.name, line.unitPrice, line.quantity]
        );
      }
      await client.query('RELEASE SAVEPOINT insert_items');
    } catch (err) {
      await client.query('ROLLBACK TO SAVEPOINT insert_items');
      console.error(`⚠️ Lignes de la commande ${numeroCommande} non enregistrées:`, err.message);
    }

    // ── Décrément du stock (produits verrouillés et vérifiés plus haut) ──
    for (const line of lines) {
      await client.query(
        'UPDATE produits SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [line.quantity, line.id]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Commande ${numeroCommande} créée (${lines.length} article(s), ${total} FCFA)`);

    // ── Notification Discord (facultative, n'affecte jamais la commande) ──
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(4000),
          body: JSON.stringify({
            allowed_mentions: { parse: [] }, // un client ne peut pas déclencher @everyone
            embeds: [{
              title: `🛍️ Nouvelle commande ${numeroCommande}`,
              color: 0xf97316,
              fields: [
                { name: '👤 Client', value: customerName, inline: true },
                { name: '📞 Téléphone', value: phone, inline: true },
                { name: '📍 Zone', value: deliveryZone, inline: true },
                { name: '🏠 Adresse', value: deliveryAddress.slice(0, 1000) },
                { name: '💳 Paiement', value: paymentMethod, inline: true },
                { name: '💰 Total', value: `${total.toLocaleString('fr-SN')} FCFA`, inline: true },
                {
                  name: '🧾 Articles',
                  value: lines.map(l => `${l.name} ×${l.quantity}`).join('\n').slice(0, 1000)
                }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (discordErr) {
        console.error('⚠️ Erreur notification Discord:', discordErr.message);
      }
    }

    return reply(201, {
      success: true,
      numeroCommande,
      ordreNumero,
      subtotal,
      deliveryFee,
      total,
      items: lines.map(l => ({ id: l.id, name: l.name, quantity: l.quantity, unitPrice: l.unitPrice })),
      message: 'Commande créée avec succès'
    });
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch { /* connexion déjà fermée */ }
    }
    console.error('❌ Erreur DB create-order:', error.message);
    return reply(500, { error: 'Impossible de créer la commande pour le moment.' });
  } finally {
    if (client) client.release();
  }
};
