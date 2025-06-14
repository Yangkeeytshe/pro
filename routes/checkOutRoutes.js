const express = require("express");
const db = require("../config/db");
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
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
router.post('/checkout', checkoutController.processCheckout);
module.exports = router;