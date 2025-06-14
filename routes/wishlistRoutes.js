// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to ensure user is logged in
const ensureLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// Wishlist page
router.get('/wishlist', ensureLoggedIn, (req, res) => {
  const userId = req.session.user.id;

  const query = `
    SELECT 
      w.id as wishlist_id,
      w.created_at as added_date,
      p.id,
      p.name,
      p.price,
      p.image,
      p.category,
      COALESCE(p.is_active, 1) as is_active
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }

    res.render('wishlist', {
      user: req.session.user,
      wishlistItems: results,
      wishlistCount: results.length,
      title: 'My Wishlist - Mom\'s Art'
    });
  });
});

// Share wishlist page
router.get('/wishlist/share/:shareId?', (req, res) => {
  // For now, redirect to login if not authenticated
  // In a full implementation, you'd create shareable links
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.redirect('/wishlist');
});
router.post('/wishlist/toggle', async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    // ✅ Check if product exists (no is_active check)
    const [product] = await db.query(
      'SELECT id, name, price FROM products WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // ✅ Check if the product is already in the wishlist
    const [exists] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (exists.length > 0) {
      // ✅ Remove from wishlist
      await db.query(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return res.json({ status: 'removed' });
    } else {
      // ✅ Add to wishlist
      await db.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      return res.json({ status: 'added' });
    }
  } catch (err) {
    console.error('❌ Wishlist error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
