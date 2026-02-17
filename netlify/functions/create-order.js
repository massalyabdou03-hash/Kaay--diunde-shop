const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const order = JSON.parse(event.body);

    // Insert order
    const orderResult = await pool.query(
      `INSERT INTO orders (customer_name, customer_phone, delivery_address, delivery_zone, 
                          subtotal, delivery_fee, total, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        order.customerName,
        order.customerPhone,
        order.deliveryAddress,
        order.deliveryZone,
        order.subtotal,
        order.deliveryFee,
        order.total,
        order.notes || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of order.items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id, item.name, item.quantity, item.price]
      );

      // Update product stock
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }

    // Send notifications (Discord, WhatsApp, Email) if configured
    // Add notification logic here if needed

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ orderId, message: 'Order created successfully' })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create order' })
    };
  }
};
