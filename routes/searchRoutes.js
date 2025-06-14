const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route to handle search requests with optional sorting and category filtering
router.get('/', (req, res) => {
  const query = req.query.q || '';         // Search keyword from query params
  const shopsort = req.query.shopsort;     // Sorting option (e.g., ascending, descending)
  const category = req.query.category;     // Category filter option

  // If no search query provided, render empty results page
  if (!query) {
    return res.render('searchResult', { query: '', products: [], shopsort, category });
  }

  // SQL query to search products by name or category matching the query string
  const sql = `
    SELECT * FROM products
    WHERE name LIKE ? OR category LIKE ?
    LIMIT 20
  `;

  // Prepare wildcard search pattern for SQL LIKE operator
  const likeQuery = `%${query}%`;

  // Execute the SQL query with parameters to prevent SQL injection
  db.query(sql, [likeQuery, likeQuery], (err, results) => {
    if (err) {
      console.error('Error searching products:', err);
      return res.status(500).send('Error performing search.');
    }

    // Start with all products returned from the database
    let filteredProducts = results;

    // Filter products by category if a category filter is selected
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Apply sorting based on shopsort parameter
    if (shopsort === 'ascending') {
      filteredProducts.sort((a, b) => a.price - b.price);        // Sort by price low to high
    } else if (shopsort === 'descending') {
      filteredProducts.sort((a, b) => b.price - a.price);        // Sort by price high to low
    } else if (shopsort === 'newest') {
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));  // Newest first
    } else if (shopsort === 'oldest') {
      filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));  // Oldest first
    }
    // Note: You can add 'recommended' or other custom sorting logic here if needed

    // Render the search results page with the filtered and sorted products
    res.render('searchResult', {
      query,
      shopsort,
      category,
      products: filteredProducts
    });
  });
});

module.exports = router;
