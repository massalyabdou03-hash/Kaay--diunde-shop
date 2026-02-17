const { Client } = require('pg');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query('BEGIN');

    const orderData = JSON.parse(event.body);

    // Insérer la commande
    const orderQuery = `
      INSERT INTO orders (
        customer_name, customer_phone, delivery_address, delivery_zone,
        subtotal, delivery_fee, total, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const orderValues = [
      orderData.customerName,
      orderData.customerPhone,
      orderData.deliveryAddress,
      orderData.deliveryZone,
      orderData.subtotal,
      orderData.deliveryFee,
      orderData.total,
      orderData.notes || null,
      'pending',
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    // Insérer les articles de la commande
    for (const item of orderData.items) {
      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(itemQuery, [
        orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.price,
      ]);
    }

    await client.query('COMMIT');

    // Envoyer les notifications (Discord, WhatsApp, Email)
    await sendNotifications(orderData, orderId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, orderId }),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create order', details: error.message }),
    };
  } finally {
    await client.end();
  }
};

async function sendNotifications(orderData, orderId) {
  const message = `
🛍️ **NOUVELLE COMMANDE #${orderId}**

👤 **Client:** ${orderData.customerName}
📱 **Téléphone:** ${orderData.customerPhone}
📍 **Adresse:** ${orderData.deliveryAddress}
🗺️ **Zone:** ${orderData.deliveryZone}

**PRODUITS:**
${orderData.items.map(item => `• ${item.productName} x${item.quantity} - ${item.price} FCFA`).join('\n')}

💰 **Total:** ${orderData.total} FCFA

${orderData.notes ? `📝 **Notes:** ${orderData.notes}` : ''}
  `.trim();

  // Discord Webhook
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    } catch (error) {
      console.error('Discord notification failed:', error);
    }
  }

  // WhatsApp API (optionnel)
  if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
    try {
      await fetch(process.env.WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: process.env.ADMIN_WHATSAPP_NUMBER,
          type: 'text',
          text: { body: message },
        }),
      });
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
    }
  }

  // Email (optionnel)
  if (process.env.EMAIL_SERVICE_URL && process.env.EMAIL_API_KEY) {
    try {
      await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: process.env.ADMIN_EMAIL }],
          }],
          from: { email: 'noreply@kaaydiunde.com' },
          subject: `Nouvelle commande #${orderId}`,
          content: [{
            type: 'text/plain',
            value: message,
          }],
        }),
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }
}
