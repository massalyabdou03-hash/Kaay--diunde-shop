import { Handler } from '@netlify/functions';

// ========================================
// FONCTION: CREATE ORDER
// Crée une commande et envoie des notifications
// ========================================

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  name: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const orderData: OrderData = JSON.parse(event.body);

    // Validate required fields
    if (!orderData.name || !orderData.phone || !orderData.city || 
        !orderData.address || !orderData.items || orderData.items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Import Neon client
    const { neon } = await import('@neondatabase/serverless');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Create SQL client
    const sql = neon(databaseUrl);

    // Generate order number
    const orderNumber = `KD${Date.now()}`;

    // Insert order into database
    const orders = await sql`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_city, 
        customer_address, payment_method, subtotal, delivery_fee, total, status
      ) VALUES (
        ${orderNumber},
        ${orderData.name},
        ${orderData.phone},
        ${orderData.city},
        ${orderData.address},
        ${orderData.paymentMethod},
        ${orderData.subtotal},
        ${orderData.deliveryFee},
        ${orderData.total},
        'pending'
      )
      RETURNING *
    `;

    const order = orders[0];

    // Insert order items
    for (const item of orderData.items) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_price, quantity, subtotal
        ) VALUES (
          ${order.id},
          ${item.id},
          ${item.name},
          ${item.price},
          ${item.quantity},
          ${item.price * item.quantity}
        )
      `;
    }

    // ========================================
    // ENVOI DES NOTIFICATIONS
    // ========================================

    const notificationPromises = [];

    // 1. NOTIFICATION DISCORD
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      const discordPayload = {
        content: `🛍️ **NOUVELLE COMMANDE** 🛍️`,
        embeds: [{
          color: 16753920,
          title: `Commande #${orderNumber}`,
          fields: [
            { name: "👤 Client", value: orderData.name, inline: false },
            { name: "📱 Téléphone", value: orderData.phone, inline: false },
            { name: "📍 Ville", value: orderData.city, inline: true },
            { name: "💰 Total", value: `${orderData.total.toLocaleString()} FCFA`, inline: true },
            { name: "💳 Paiement", value: orderData.paymentMethod === 'cod' ? 'Espèces' : 'Wave', inline: true },
            { name: "📦 Adresse", value: orderData.address, inline: false },
            { 
              name: "🛒 Produits", 
              value: orderData.items.map(item => 
                `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} FCFA`
              ).join('\n'), 
              inline: false 
            }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      notificationPromises.push(
        fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload)
        })
      );
    }

    // 2. NOTIFICATION WHATSAPP (via API WhatsApp Business ou service tiers)
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiKey = process.env.WHATSAPP_API_KEY;
    const adminWhatsappNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    if (whatsappApiUrl && whatsappApiKey && adminWhatsappNumber) {
      const whatsappMessage = `🛍️ *NOUVELLE COMMANDE*

📋 Commande: #${orderNumber}
👤 Client: ${orderData.name}
📱 Téléphone: ${orderData.phone}
📍 Ville: ${orderData.city}
📦 Adresse: ${orderData.address}

*PRODUITS:*
${orderData.items.map(item => 
  `• ${item.name}\n  Qté: ${item.quantity} x ${item.price.toLocaleString()} FCFA = ${(item.price * item.quantity).toLocaleString()} FCFA`
).join('\n')}

💰 Sous-total: ${orderData.subtotal.toLocaleString()} FCFA
🚚 Livraison: ${orderData.deliveryFee.toLocaleString()} FCFA
💳 *TOTAL: ${orderData.total.toLocaleString()} FCFA*

💳 Paiement: ${orderData.paymentMethod === 'cod' ? 'Espèces à la livraison' : 'Wave/Orange Money'}

✅ Appeler le client pour confirmation!`;

      // Exemple avec l'API WhatsApp Business Cloud
      notificationPromises.push(
        fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminWhatsappNumber,
            type: 'text',
            text: { body: whatsappMessage }
          })
        })
      );
    }

    // 3. NOTIFICATION EMAIL (via service SMTP ou SendGrid/Mailgun)
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL;
    const emailApiKey = process.env.EMAIL_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (emailServiceUrl && emailApiKey && adminEmail) {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ea580c 0%, #1e3a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .product-item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
    .total { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ Nouvelle Commande Kaay Diunde</h1>
      <p style="margin: 0;">Commande #${orderNumber}</p>
    </div>
    
    <div class="content">
      <h2>Informations Client</h2>
      <div class="order-details">
        <p><strong>👤 Nom:</strong> ${orderData.name}</p>
        <p><strong>📱 Téléphone:</strong> ${orderData.phone}</p>
        <p><strong>📍 Ville:</strong> ${orderData.city}</p>
        <p><strong>📦 Adresse:</strong> ${orderData.address}</p>
        <p><strong>💳 Paiement:</strong> ${orderData.paymentMethod === 'cod' ? 'Espèces à la livraison' : 'Wave/Orange Money'}</p>
      </div>

      <h2>Produits Commandés</h2>
      ${orderData.items.map(item => `
        <div class="product-item">
          <strong>${item.name}</strong><br>
          Quantité: ${item.quantity} x ${item.price.toLocaleString()} FCFA = ${(item.price * item.quantity).toLocaleString()} FCFA
        </div>
      `).join('')}

      <div class="total">
        <p style="margin: 5px 0;">Sous-total: ${orderData.subtotal.toLocaleString()} FCFA</p>
        <p style="margin: 5px 0;">Livraison: ${orderData.deliveryFee.toLocaleString()} FCFA</p>
        <p style="margin: 5px 0; color: #ea580c;">TOTAL: ${orderData.total.toLocaleString()} FCFA</p>
      </div>

      <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        ✅ <strong>Action requise:</strong> Appeler le client pour confirmer la commande!
      </p>
    </div>
    
    <div class="footer">
      <p>Kaay Diunde Shop - Boutique en ligne sénégalaise</p>
      <p>Cette notification a été générée automatiquement</p>
    </div>
  </div>
</body>
</html>
      `;

      // Exemple avec SendGrid
      notificationPromises.push(
        fetch(emailServiceUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: adminEmail }],
              subject: `🛍️ Nouvelle Commande #${orderNumber} - Kaay Diunde`
            }],
            from: { email: 'noreply@kaaydiunde.com', name: 'Kaay Diunde Shop' },
            content: [{
              type: 'text/html',
              value: emailHtml
            }]
          })
        })
      );
    }

    // Attendre toutes les notifications (ne pas bloquer si elles échouent)
    await Promise.allSettled(notificationPromises);

    // Return success response
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Order created successfully',
        order: {
          id: order.id,
          orderNumber: order.order_number,
          total: order.total,
          status: order.status,
        },
      }),
    };
    
  } catch (error) {
    console.error('Error creating order:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
