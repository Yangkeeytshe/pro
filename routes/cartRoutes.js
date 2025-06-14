// routes/cartRoutes.js
const express = require("express");
const router = express.Router();

// Import cart controller functions
const cart = require("../controllers/cart");

// Route to display the shopping cart page
router.get('/cart', cart.getCartPage);
// Route to add,update, remove a product to the cart by product ID
router.post('/cart/add/:id', cart.addToCart);

router.post('/update_quantity', cart.updateCartQuantity);
router.post('/cart/remove/:id', cart.removeFromCart);

module.exports = router;
