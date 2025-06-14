const db = require("../config/db");

// Helper function: Retrieve detailed product info for items in the cart object
const getCartItemsFromCartObject = (cart) => {
  return new Promise((resolve, reject) => {
    const productIds = Object.keys(cart);
    if (productIds.length === 0) return resolve([]); // No products in cart

    // Prepare placeholders for SQL IN clause
    const placeholders = productIds.map(() => '?').join(',');
    const sql = `SELECT id, name, price, image FROM products WHERE id IN (${placeholders})`;

    db.query(sql, productIds, (err, products) => {
      if (err) return reject(err);

      // Map DB results to cart items with quantity from session cart
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
};

// Controller to display the cart page with all cart items and totals
exports.getCartPage = async (req, res) => {
  const sessionCart = req.session.cart || {};
  try {
    // Fetch full product details for items in the cart
    const cart = await getCartItemsFromCartObject(sessionCart);

    let totalPrice = 0;
    let totalItems = 0;

    // Calculate total price and total item count
    cart.forEach(item => {
      totalPrice += item.product_price * item.quantity;
      totalItems += item.quantity;
    });

    // Render the cart view with cart data and totals
    res.render('cart', {
      cart,
      totalPrice: totalPrice.toFixed(2), // Format price to 2 decimal places
      totalItems
    });
  } catch (err) {
    console.error("Error fetching cart products:", err);
    res.status(500).send("Error loading cart.");
  }
};

// Controller to add a product to the cart (stored in session)
exports.addToCart = (req, res) => {
  const productId = req.params.id;

  // Verify product exists in database before adding to cart
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err || results.length === 0) {
      req.flash('error_msg', 'Product not found!');
      return res.redirect('back'); // Redirect to previous page
    }

    // Initialize cart in session if not present
    if (!req.session.cart) req.session.cart = {};

    const prodIdKey = productId.toString();

    // Increment quantity if product already in cart, else add new entry with qty 1
    req.session.cart[prodIdKey] = (req.session.cart[prodIdKey] || 0) + 1;

    req.flash('success_msg', 'Product added to cart!');
    // Redirect back to referring page or home if no referrer
    res.redirect(req.get('Referer') || '/');
  });
};

// Controller to update the quantity of a cart item (increment or decrement)
exports.updateCartQuantity = (req, res) => {
  const { product_id, action } = req.body;

  if (!req.session.cart) req.session.cart = {};

  // If product not in cart, redirect to cart page
  if (!req.session.cart[product_id]) return res.redirect('/cart');

  if (action === 'increment') {
    req.session.cart[product_id]++;
  } else if (action === 'decrement' && req.session.cart[product_id] > 1) {
    // Only decrement if quantity > 1 to avoid negative or zero quantity
    req.session.cart[product_id]--;
  }

  // Redirect back to referring page or home
  res.redirect(req.get('Referer') || '/');
};

// Controller to remove a product from the cart entirely
exports.removeFromCart = (req, res) => {
  const productId = req.params.id;

  if (!req.session.cart) req.session.cart = {};

  // Delete the product key from cart object in session
  delete req.session.cart[productId];

  // Redirect back to referring page or home
  res.redirect(req.get('Referer') || '/');
};
