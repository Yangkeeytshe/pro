const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { ensureLoggedIn } = require("../middleware/auth");

// GET product details (with cached recommendations & reviews)
router.get('/product/:id', async (req, res) => {
  console.log("Route hit for product:", req.params.id);
  const productId = req.params.id;

  try {
    const product = await getProductById(productId);
    if (!product) return res.status(404).send("Product not found");

    // Handle session-based recommendations
    if (!req.session.recommendations) {
      req.session.recommendations = {};
    }

    let recommendations;
    if (req.session.recommendations[productId]) {
      recommendations = req.session.recommendations[productId];
      console.log("Using cached recommendations from session");
    } else {
      recommendations = await getRecommendedProducts(productId);
      req.session.recommendations[productId] = recommendations;
      console.log("Fetched new recommendations and saved to session");
    }

    // Get reviews
    const reviews = await getReviewsByProductId(productId);

    res.render('product-detail', {
      product,
      recommendations: Array.isArray(recommendations) ? recommendations : [],
      reviews,
      calculateWeekly: Math.round(product.price / 4),
      calculateAfterpay: Math.round(product.price / 4)
    });
  } catch (err) {
    console.error("Error loading product page:", err);
    res.status(500).send("Internal server error");
  }
});

// POST a review
router.post('/product/:id/review', ensureLoggedIn, async (req, res) => {
  const productId = req.params.id;

  if (!req.session.user || !req.session.user.id) {
    return res.status(401).send('User not logged in');
  }
  const userId = req.session.user.id;
  const { star_rating, review_text } = req.body;

  if (!star_rating || !review_text) {
    return res.status(400).send('Star rating and review text are required');
  }

  try {
    const query = `
      INSERT INTO reviews (user_id, product_id, star_rating, review_text)
      VALUES (?, ?, ?, ?)
    `;
    const values = [userId, productId, star_rating, review_text];

    await new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.redirect(`/product/${productId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to submit review');
  }
});

// --- Helper functions ---

function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function getRecommendedProducts(excludeId) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM products WHERE id != ? ORDER BY RAND() LIMIT 3',
      [excludeId],
      (err, results) => {
        if (err) return reject(err);
        console.log("SQL Results:", results);
        resolve(results);
      }
    );
  });
}
function getReviewsByProductId(productId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT r.review_id, r.star_rating, r.review_text, r.created_at,
             r.upvotes, r.downvotes,
             u.name AS reviewer_name,
             u.profilePic AS reviewer_profilePic
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `;
    db.query(query, [productId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
router.post('/reviews/:reviewId/vote', ensureLoggedIn, (req, res) => {
  const reviewId = req.params.reviewId;
  const { voteType } = req.body;

  console.log('Vote request:', { reviewId, voteType, userId: req.session.user?.id });

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  const getVotesQuery = 'SELECT upvotes, downvotes FROM reviews WHERE review_id = ?';
  db.query(getVotesQuery, [reviewId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = results[0];
    let newUpvotes = review.upvotes || 0;
    let newDownvotes = review.downvotes || 0;

    if (voteType === 'upvote') newUpvotes++;
    else newDownvotes++;

    const updateVotesQuery = 'UPDATE reviews SET upvotes = ?, downvotes = ? WHERE review_id = ?';
    db.query(updateVotesQuery, [newUpvotes, newDownvotes, reviewId], (err) => {
      if (err) {
        console.error('DB error on update:', err);
        return res.status(500).json({ error: 'Failed to update votes' });
      }

      res.json({ upvotes: newUpvotes, downvotes: newDownvotes });
    });
  });
});
router.post('/reviews/:reviewId/vote', ensureLoggedIn, (req, res) => {
  const reviewId = req.params.reviewId;
  const userId = req.session.user.id;
  const { voteType } = req.body;

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  // Step 1: Check if user already voted on this review
  const checkVoteQuery = 'SELECT vote_type FROM review_votes WHERE review_id = ? AND user_id = ?';
  db.query(checkVoteQuery, [reviewId, userId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // User already voted
      return res.status(400).json({ error: 'You have already voted on this review' });
    }

    // Step 2: Insert new vote record
    const insertVoteQuery = 'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)';
    db.query(insertVoteQuery, [reviewId, userId, voteType], (err) => {
      if (err) {
        console.error('DB error on insert:', err);
        return res.status(500).json({ error: 'Failed to record vote' });
      }

      // Step 3: Update reviews table upvotes/downvotes count
      const updateVotesQuery = voteType === 'upvote'
        ? 'UPDATE reviews SET upvotes = upvotes + 1 WHERE review_id = ?'
        : 'UPDATE reviews SET downvotes = downvotes + 1 WHERE review_id = ?';

      db.query(updateVotesQuery, [reviewId], (err) => {
        if (err) {
          console.error('DB error on update:', err);
          return res.status(500).json({ error: 'Failed to update vote counts' });
        }

        res.json({ message: 'Vote recorded' });
      });
    });
  });
});
router.delete('/reviews/:reviewId', ensureLoggedIn, (req, res) => {
  const reviewId = req.params.reviewId;
  const userId = req.session.user.id;

  // Optional: verify if the user owns the review or is admin before deleting
  const checkOwnerQuery = 'SELECT user_id FROM reviews WHERE review_id = ?';
  db.query(checkOwnerQuery, [reviewId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (results[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Delete review
    const deleteQuery = 'DELETE FROM reviews WHERE review_id = ?';
    db.query(deleteQuery, [reviewId], (err) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Failed to delete review' });
      }

      res.json({ message: 'Review deleted' });
    });
  });
});

module.exports = router;
