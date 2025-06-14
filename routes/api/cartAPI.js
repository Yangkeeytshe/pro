const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

/**
 * Cart API Routes
 * Handles AJAX cart operations for real-time cart updates
 */

// Add item to cart
router.post('/cart', (req, res) => {
    try {
        const { action, productId, quantity = 1 } = req.body;
        
        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = {};
        }

        switch (action) {
            case 'add':
                if (req.session.cart[productId]) {
                    req.session.cart[productId] += parseInt(quantity);
                } else {
                    req.session.cart[productId] = parseInt(quantity);
                }
                break;

            case 'remove':
                delete req.session.cart[productId];
                break;

            case 'update':
                if (parseInt(quantity) > 0) {
                    req.session.cart[productId] = parseInt(quantity);
                } else {
                    delete req.session.cart[productId];
                }
                break;

            case 'clear':
                req.session.cart = {};
                break;

            default:
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid action' 
                });
        }

        // Calculate cart totals
        const cartCount = Object.values(req.session.cart).reduce((total, qty) => total + qty, 0);
        
        res.json({
            success: true,
            cart: req.session.cart,
            cartCount: cartCount,
            message: `Cart ${action} successful`
        });

    } catch (error) {
        console.error('Cart API error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get cart contents
router.get('/cart', (req, res) => {
    try {
        const cart = req.session.cart || {};
        const cartCount = Object.values(cart).reduce((total, qty) => total + qty, 0);
        
        res.json({
            success: true,
            cart: cart,
            cartCount: cartCount
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get cart with product details
router.get('/cart/details', async (req, res) => {
    try {
        const cart = req.session.cart || {};
        
        if (Object.keys(cart).length === 0) {
            return res.json({
                success: true,
                cart: [],
                cartCount: 0,
                cartTotal: 0
            });
        }

        // Get product details for cart items
        const productIds = Object.keys(cart);
        const placeholders = productIds.map(() => '?').join(',');
        
        const query = `
            SELECT id, name, price, image
            FROM products
            WHERE id IN (${placeholders}) AND is_active = 1
        `;
        
        db.query(query, productIds, (error, products) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            // Combine cart quantities with product details
            const cartItems = products.map(product => ({
                ...product,
                quantity: cart[product.id],
                subtotal: product.price * cart[product.id]
            }));

            const cartCount = Object.values(cart).reduce((total, qty) => total + qty, 0);
            const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0);

            res.json({
                success: true,
                cart: cartItems,
                cartCount: cartCount,
                cartTotal: cartTotal.toFixed(2)
            });
        });

    } catch (error) {
        console.error('Cart details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Quick add to cart (for product cards)
router.post('/cart/quick-add/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;

        // Verify product exists and is active
        const query = 'SELECT id, name, price FROM products WHERE id = ? AND is_active = 1';
        
        db.query(query, [productId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            const product = results[0];

            // Initialize cart if it doesn't exist
            if (!req.session.cart) {
                req.session.cart = {};
            }

            // Add to cart
            if (req.session.cart[productId]) {
                req.session.cart[productId] += quantity;
            } else {
                req.session.cart[productId] = quantity;
            }

            const cartCount = Object.values(req.session.cart).reduce((total, qty) => total + qty, 0);

            res.json({
                success: true,
                message: `${product.name} added to cart`,
                cartCount: cartCount,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price
                }
            });
        });

    } catch (error) {
        console.error('Quick add error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add to cart from wishlist (JSON endpoint)
router.post('/cart/add/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;

        // Verify product exists and is active
        const query = 'SELECT id, name, price FROM products WHERE id = ? AND is_active = 1';

        db.query(query, [productId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            const product = results[0];

            // Initialize cart if it doesn't exist
            if (!req.session.cart) {
                req.session.cart = {};
            }

            // Add to cart
            if (req.session.cart[productId]) {
                req.session.cart[productId] += quantity;
            } else {
                req.session.cart[productId] = quantity;
            }

            const cartCount = Object.values(req.session.cart).reduce((total, qty) => total + qty, 0);

            res.json({
                success: true,
                message: `${product.name} added to cart`,
                cartCount: cartCount,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price
                }
            });
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get cart count for header display
router.get('/cart/count', (req, res) => {
    try {
        const cart = req.session.cart || {};
        const cartCount = Object.values(cart).reduce((total, qty) => total + qty, 0);

        res.json({
            success: true,
            count: cartCount
        });
    } catch (error) {
        console.error('Cart count error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
