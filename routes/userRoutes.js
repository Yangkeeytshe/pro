const express = require("express");
const db = require("../config/db");
const router = express.Router();
const { body } = require('express-validator');
const checkout = require('../controllers/checkout');
const bcrypt = require('bcrypt'); 


// Home Page - featured products
router.get('/', (req, res) => {
  const query = "SELECT * FROM products WHERE id BETWEEN 1 AND 10";
  db.query(query, (err, results) => {
    if (err) {
      console.error(" Error fetching featured products:", err);
      return res.status(500).send("Database error.");
    }
    res.render('index', { products: results });
  });
});

// Static Pages
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login', { error: null }));
router.get('/signin', (req, res) => res.render('signin'));

router.get('/articles', (req, res) => res.render('articles'));
router.get('/stores', (req, res) => res.render('stores'));
router.get('/p1', (req, res) => res.render('p1'));
router.get('/A1', (req, res) => res.render('A1'));
router.get('/A2', (req, res) => res.render('A2'));
router.get('/A3', (req, res) => res.render('A3'));
router.get('/privacyPolicy', (req, res) => {
  res.render('privacyPolicy'); // 
});
router.get('/terms', (req, res) => {
  res.render('terms'); 
});


// Logout
router.get('/logout', (req, res) => {
  console.log('🚪 Logout request received for user:', req.session.user?.name || 'Unknown');

  // Clear session data
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).render('error', {
        message: 'Error logging out. Please try again.',
        error: { status: 500, stack: '' }
      });
    }

    console.log('✅ User logged out successfully');

    // Clear session cookie
    res.clearCookie('connect.sid');

    // Redirect to home page with success message
    res.redirect('/?logout=success');
  });
});

// Helper to get cart items from session cart object (which stores productId -> quantity)
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



// Shop page with pagination and sorting
router.get('/shop', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const productsPerPage = 9;
  const offset = (page - 1) * productsPerPage;
  const { shopsort, category } = req.query;

  let baseQuery = "FROM products";
  let whereClause = "";
  let orderClause = "";
  const params = [];

  if (category) {
    whereClause = " WHERE category = ?";
    params.push(category);
  }

  switch (shopsort) {
    case "newest": orderClause = " ORDER BY date_uploaded DESC"; break;
    case "oldest": orderClause = " ORDER BY date_uploaded ASC"; break;
    case "recommended": orderClause = " ORDER BY rating DESC"; break;
    case "ascending": orderClause = " ORDER BY price ASC"; break;
    case "descending": orderClause = " ORDER BY price DESC"; break;
    default: orderClause = ""; break;
  }

  const countQuery = `SELECT COUNT(*) AS count ${baseQuery} ${whereClause}`;
  db.query(countQuery, params, (err, countResult) => {
    if (err) return res.status(500).send("Database error.");

    const totalProducts = countResult[0].count;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const paginatedQuery = `SELECT * ${baseQuery} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const productParams = [...params, productsPerPage, offset];

    db.query(paginatedQuery, productParams, (err, products) => {
      if (err) return res.status(500).send("Error loading products.");
      res.render('shop', { products, currentPage: page, totalPages, shopsort, category });
    });
  });
  
});


// Newsletter subscription
router.post('/subscribe', (req, res) => {
  const email = req.body.email;

  if (!email) return res.status(400).send("Email is required.");

  db.query("INSERT INTO newsletter (email) VALUES (?)", [email], (err) => {
    if (err) {
      console.error('Newsletter subscription error:', err);
      return res.status(500).send("Error saving email.");
    }
    res.redirect('back');
  });
});
router.get('/checkout', async (req, res) => {
  const sessionCart = req.session.cart || {};

  try {
    const cart = await getCartItemsFromCartObject(sessionCart);

    let totalPrice = 0;
    let totalItems = 0;

    cart.forEach(item => {
      totalPrice += item.product_price * item.quantity;
      totalItems += item.quantity;
    });

    if (totalItems === 0) {
      return res.redirect('/cart'); // no items in cart to checkout
    }

    res.render('checkout', {
      cart,
      totalPrice: totalPrice.toFixed(2),
      totalItems
    });

  } catch (err) {
    console.error('Error fetching checkout products:', err);
    res.status(500).send("Error loading checkout page.");
  }
});

router.post('/checkout', [
  body('user_id').isInt().withMessage('User ID required'),
  body('first_name').notEmpty().withMessage('First name required'),
  body('last_name').notEmpty().withMessage('Last name required'),
  body('delivery_address').notEmpty().withMessage('Delivery address required'),
  body('mobile_number').notEmpty().withMessage('Mobile number required'),
  body('card_name').notEmpty().withMessage('Card name required'),
  body('card_number').isCreditCard().withMessage('Invalid card number'),
  body('expiry_date').notEmpty().withMessage('Expiry date required'),
  body('cvv').isLength({ min: 3, max: 4 }).withMessage('CVV must be 3 or 4 digits'),
  body('order_items').isArray({ min: 1 }).withMessage('Order items required')
], checkout.postCheckout);

// POST /checkout route

router.post('/order/checkout', checkout.postCheckout);

router.get('/order/loading', (req, res) => {
  res.render('loading'); 
});

router.get('/order/success', (req, res) => {
  const { order_id, total_amount } = req.query;

  res.render('success', {
    order_id,
    total_amount
  });
});

router.get('/forgot-password', (req, res) => res.render('forgot-password'));
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.render('forgot-password', { error: 'Email is required.' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.render('forgot-password', { error: 'Something went wrong.' });
    }

    if (results.length === 0) {
      return res.render('forgot-password', { error: 'No account found with that email.' });
    }

    // Generate a simple reset token
    const token = Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Save token in database
    db.query('UPDATE users SET reset_token = ? WHERE email = ?', [token, email], (err) => {
      if (err) {
        console.error('Error saving reset token:', err);
        return res.render('forgot-password', { error: 'Error generating reset link.' });
      }

      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the link below to reset your password:\n\n${resetLink}`
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Email error:', err);
          return res.render('forgot-password', { error: 'Failed to send email. Try again later.' });
        }

        return res.render('forgot-password', { message: 'Password reset link sent to your email.' });
      });
    });
  });
});

router.get('/reset-password', (req, res) => {
  const { token } = req.query;  // Get the token from the query string
  if (!token) {
    return res.status(400).render('reset-password', { error: 'Invalid or expired token.' });
  }

  // Find the user with this reset token in the database
  db.query('SELECT * FROM users WHERE reset_token = ?', [token], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).render('reset-password', { error: 'Something went wrong.' });
    }

    if (results.length === 0) {
      return res.status(400).render('reset-password', { error: 'Invalid or expired token.' });
    }

    // Token is valid, render the reset-password form
    res.render('reset-password', { token });  // Pass token to the view for use in the form
  });
});

router.post('/reset-password', (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.render('reset-password', { error: 'Both password fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.render('reset-password', { error: 'Passwords do not match.' });
  }

  db.query('SELECT * FROM users WHERE reset_token = ?', [token], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).render('reset-password', { error: 'Something went wrong.' });
    }

    if (results.length === 0) {
      return res.status(400).render('reset-password', { error: 'Invalid or expired token.' });
    }

    const user = results[0];

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10); // 🔐 hash the new password

      db.query('UPDATE users SET password = ?, reset_token = NULL WHERE id = ?', [hashedPassword, user.id], (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).render('reset-password', { error: 'Something went wrong.' });
        }

        res.redirect('/login');
      });

    } catch (hashErr) {
      console.error('Error hashing password:', hashErr);
      res.status(500).render('reset-password', { error: 'Error securing password.' });
    }
  });
});

module.exports = router;