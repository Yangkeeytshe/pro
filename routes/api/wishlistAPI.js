// routes/api/wishlistAPI.js
const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Use the standardized database connection

// Middleware to ensure user is logged in
const ensureLoggedIn = (req, res, next) => {
  console.log('🔐 Session check:', {
    sessionID: req.sessionID,
    session: req.session,
    user: req.session?.user,
    cookies: req.headers.cookie
  });

  if (req.session.user) {
    console.log('✅ User is logged in:', req.session.user);
    return next();
  }

  console.log('❌ User not logged in, session:', req.session);
  res.status(401).json({
    success: false,
    message: 'Please log in to manage your wishlist'
  });
};

// Add product to wishlist
router.post('/wishlist/add/:productId', ensureLoggedIn, async (req, res) => {
  try {
    console.log('🔥 Wishlist add request received');
    console.log('User session:', req.session.user);
    console.log('Product ID:', req.params.productId);

    const userId = req.session.user.id;
    const productId = parseInt(req.params.productId);

    console.log('Parsed userId:', userId, 'productId:', productId);

    // Check if product exists and is active
    console.log('🔍 Checking if product exists...');
    const productQuery = 'SELECT id, name, price FROM products WHERE id = ? AND (is_active = TRUE OR is_active IS NULL)';
    db.query(productQuery, [productId], (err, productResults) => {
      if (err) {
        console.error('❌ Database error checking product:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      console.log('📦 Product query results:', productResults);

      if (productResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if item is already in wishlist
      const checkQuery = 'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?';
      db.query(checkQuery, [userId, productId], (err, existingResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (existingResults.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Product is already in your wishlist'
          });
        }

        // Add to wishlist
        const insertQuery = 'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)';
        db.query(insertQuery, [userId, productId], (err, insertResult) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              message: 'Failed to add to wishlist'
            });
          }

          res.json({
            success: true,
            message: 'Product added to wishlist successfully',
            product: productResults[0]
          });
        });
      });
    });

  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove product from wishlist
router.delete('/wishlist/remove/:productId', ensureLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = parseInt(req.params.productId);

    const deleteQuery = 'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?';
    db.query(deleteQuery, [userId, productId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in wishlist'
        });
      }

      res.json({
        success: true,
        message: 'Product removed from wishlist successfully'
      });
    });

  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's wishlist
router.get('/wishlist', ensureLoggedIn, async (req, res) => {
  try {
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
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        wishlist: results,
        count: results.length
      });
    });

  } catch (error) {
    console.error('Wishlist get error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get wishlist count for header display
router.get('/wishlist/count', ensureLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const query = 'SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        count: results[0].count
      });
    });

  } catch (error) {
    console.error('Wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check if product is in wishlist
router.get('/wishlist/check/:productId', ensureLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = parseInt(req.params.productId);

    const query = 'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?';
    db.query(query, [userId, productId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        inWishlist: results.length > 0
      });
    });

  } catch (error) {
    console.error('Wishlist check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Authentication status endpoint
router.get('/auth/status', (req, res) => {
  console.log('🔍 Auth status check:', {
    sessionID: req.sessionID,
    session: req.session,
    user: req.session?.user,
    cookies: req.headers.cookie
  });

  res.json({
    success: true,
    isLoggedIn: !!req.session.user,
    user: req.session.user || null
  });
});

module.exports = router;
