const db = require("../config/db");
const { validationResult } = require('express-validator');

// Middleware to ensure user is logged in before accessing routes
exports.ensureLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// Helper function: fetch detailed cart items info from cart object stored in session
function getCartItemsFromCartObject(cart) {
  return new Promise((resolve, reject) => {
    const productIds = Object.keys(cart);
    if (productIds.length === 0) return resolve([]);

    const placeholders = productIds.map(() => '?').join(',');
    const sql = `SELECT id, name, price, image FROM products WHERE id IN (${placeholders})`;

    db.query(sql, productIds, (err, products) => {
      if (err) return reject(err);
      const items = products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        product_price: p.price,
        image: p.image,
        quantity: cart[p.id]
      }));
      resolve(items);
    });
  });
}

// Controller to render the logged-in user account page with address and cart info
exports.getLoginedPage = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Fetch user's saved address from database
    const addressResults = await new Promise((resolve, reject) => {
      db.query('SELECT street, city, state, zip, country FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (addressResults.length === 0) return res.status(404).send("User not found.");
    
    const address = addressResults[0];

    // Check if any address field is missing to conditionally show the address form
    const isAddressMissing = !address.street || !address.city || !address.state || !address.zip || !address.country;

    // Get user's cart from session and fetch detailed product info
    const sessionCart = req.session.cart || {};
    const cart = await getCartItemsFromCartObject(sessionCart);

    // Merge user session info with address fields for rendering
    const userWithAddress = {
      ...req.session.user,
      ...address
    };

    res.render('logined', {
      user: userWithAddress,
      showForm: isAddressMissing,
      cart
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send("Server error");
  }
};

// Controller to update the user's address in the database and session
exports.updateAddress = (req, res) => {
  const { street, city, state, zip, country } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE users SET street = ?, city = ?, state = ?, zip = ?, country = ? WHERE id = ?';
  db.query(sql, [street, city, state, zip, country, userId], (err) => {
    if (err) {
      console.error("Update error:", err);
      // On error, re-render the page with an error message and keep the form visible
      return res.render('logined', {
        user: req.session.user,
        showForm: true,
        error: 'Failed to update address'
      });
    }

    // Update session data with new address info
    Object.assign(req.session.user, { street, city, state, zip, country });
    res.redirect('/logined');
  });
};

// Controller to update the quantity of items in the user's cart stored in session
exports.updateCart = (req, res) => {
  const { product_id, action } = req.body;

  if (!product_id || !action) {
    return res.status(400).json({ success: false, error: "Invalid request" });
  }

  if (!req.session.cart) {
    req.session.cart = {};
  }

  const currentQty = Number(req.session.cart[product_id]) || 0;

  if (action === 'increment') {
    req.session.cart[product_id] = currentQty + 1;
  } else if (action === 'decrement') {
    if (currentQty > 1) {
      req.session.cart[product_id] = currentQty - 1;
    } else {
      // Remove item if quantity goes below 1
      delete req.session.cart[product_id];
    }
  } else {
    return res.status(400).json({ success: false, error: "Invalid action" });
  }

  // Fetch the current product price from database to calculate total price
  db.query('SELECT price FROM products WHERE id = ?', [product_id], (err, results) => {
    if (err) {
      console.error("DB error fetching product price:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (!results.length) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const productPrice = results[0].price;
    const newQuantity = req.session.cart[product_id] || 0;
    const totalPrice = newQuantity * productPrice;

    res.json({
      success: true,
      product_id,
      quantity: newQuantity,
      product_price: productPrice,
      total_price: totalPrice
    });
  });
};

// Controller to handle checkout process: validate, insert order and order_items, commit transaction
exports.postCheckout = async (req, res) => {
  const {
    user_id,
    first_name,
    last_name,
    business_name = null,
    delivery_address,
    mobile_number,
    card_name,
    card_number,
    expiry_date,
    cvv,
    order_items
  } = req.body;

  // Parse order_items from JSON string or array
  let items = [];
  try {
    items = typeof order_items === 'string' ? JSON.parse(order_items) : order_items;
  } catch {
    return res.status(400).json({ error: 'Invalid order_items format' });
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'No items in the order' });
  }

  // Helper to run DB queries as promises
  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  try {
    await query('START TRANSACTION');

    // Calculate subtotal and validate each order item
    let subtotal = 0;
    for (const item of items) {
      if (!item.product_price || !item.quantity || !item.product_id || !item.product_name) {
        await query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid order item details' });
      }
      subtotal += item.product_price * item.quantity;
    }

    const shipping_cost = 0;
    const gst = subtotal * 0.1;  // 10% GST
    const total_amount = subtotal + shipping_cost + gst;

    // Insert order record
    const orderResult = await query(
      `INSERT INTO orders 
      (user_id, first_name, last_name, business_name, delivery_address, mobile_number, card_name, card_number, expiry_date, cvv, subtotal, shipping_cost, gst, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, first_name, last_name, business_name, delivery_address, mobile_number,
        card_name, card_number, expiry_date, cvv, subtotal, shipping_cost, gst, total_amount]
    );

    const order_id = orderResult.insertId;

    // Insert order items linked to the order
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, product_price, total_price, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [order_id, item.product_id, item.product_name, item.quantity,
          item.product_price, item.product_price * item.quantity]
      );
    }

    await query('COMMIT');

    // Render success page with order details
    return res.render('success', { order_id, total_amount });

  } catch (error) {
    await query('ROLLBACK');
    console.error("Checkout error:", error);
    res.status(500).json({ error: 'Checkout failed' });
  }
};
