const express = require("express");
const mysql = require("mysql");
const db = require("../db");
const router = express.Router();
const { postCheckout } = require("../controllers/checkout.js");
const { ensureAdmin } = require("../middleware/auth");
const { sendOrderConfirmationEmail } = require("../controllers/checkout");

// Home Page
router.get("/", (req, res) => {
  const query = "SELECT * FROM products WHERE id BETWEEN 1 AND 8";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching featured products:", err);
      return res.status(500).send("Database error.");
    }
    res.render("index", { products: results });
  });
});

// Auth Pages
router.get("/register", (req, res) => res.render("register"));
router.get("/login", (req, res) => res.render("login"));
router.get("/signin", (req, res) => res.render("signin"));

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Error logging out");
    res.redirect("/");
  });
});

// After Login Page
router.get("/logined", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("logined", { user: req.session.user });
});

// Static Pages
router.get("/articles", (req, res) => res.render("articles"));
router.get("/stores", (req, res) => res.render("stores"));
router.get("/p1", (req, res) => res.render("p1"));
router.get("/A1", (req, res) => res.render("A1"));
router.get("/A2", (req, res) => res.render("A2"));
router.get("/A3", (req, res) => res.render("A3"));

// Shop with pagination and sorting
router.get("/shop", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const productsPerPage = 8;
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
    case "newest":
      orderClause = " ORDER BY date_uploaded DESC";
      break;
    case "oldest":
      orderClause = " ORDER BY date_uploaded ASC";
      break;
    case "recommended":
      orderClause = " ORDER BY rating DESC";
      break;
    case "ascending":
      orderClause = " ORDER BY price ASC";
      break;
    case "descending":
      orderClause = " ORDER BY price DESC";
      break;
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
      res.render("shop", {
        products,
        currentPage: page,
        totalPages,
        shopsort,
        category,
      });
    });
  });
});

// Product Detail
router.get("/product/:id", (req, res) => {
  const productId = req.params.id;
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [productId],
    (err, results) => {
      if (err) return res.status(500).send("Database error.");
      if (results.length === 0)
        return res.status(404).send("Product not found.");
      res.render("product-detail", { product: results[0] });
    }
  );
});

// ------------------------
// Cart Functionality
// ------------------------

// View Cart
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  let totalPrice = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.product_price * item.quantity;
    totalItems += item.quantity;
  });

  // Get and clear the success message
  const success = req.session.success;
  req.session.success = null;

  res.render("cart", {
    cart,
    totalPrice: totalPrice.toFixed(2),
    totalItems,
    success, // Pass to template
  });
});

// Add to Cart
router.post("/cart/add/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    "SELECT * FROM products WHERE id = ?",
    [productId],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(500).send("Product not found");

      const product = results[0];
      if (!req.session.cart) req.session.cart = [];

      const existingItem = req.session.cart.find(
        (item) => item.product_id == product.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        req.session.cart.push({
          product_id: product.id,
          product_name: product.name,
          product_price: parseFloat(product.price),
          image: product.image,
          quantity: 1,
        });
      }

      res.redirect("/cart");
    }
  );
});

// Update Quantity
router.post("/update_quantity", (req, res) => {
  const { product_id, action } = req.body;
  const cart = req.session.cart || [];

  const product = cart.find((item) => item.product_id == product_id);
  if (product) {
    if (action === "increment") product.quantity += 1;
    if (action === "decrement" && product.quantity > 1) product.quantity -= 1;
  }

  req.session.cart = cart;
  res.redirect("/cart");
});

// Remove from Cart
router.post("/cart/remove/:id", (req, res) => {
  const productId = req.params.id;
  if (!req.session.cart) req.session.cart = [];

  req.session.cart = req.session.cart.filter(
    (item) => item.product_id != productId
  );
  res.redirect("/cart");
});

router.get("/checkout", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const user = db.query(
    "SELECT * FROM users WHERE id = ?",
    [req.session.user.id],
    (err, results) => {
      if (err) return res.status(500).send("Database error.");
      if (results.length === 0) return res.status(404).send("User not found.");
      else {
        const cart = req.session.cart || [];
        let totalPrice = 0;
        let totalItems = 0;

        cart.forEach((item) => {
          totalPrice += item.product_price * item.quantity;
          totalItems += item.quantity;
        });
        res.render("checkout", {
          cart: req.session.cart || [],
          totalPrice: totalPrice.toFixed(2),
          totalItems,
          user: results[0],
        });
      }
    }
  );
});router.post("/order/checkout", async (req, res) => {
  const cart = req.body.cart || req.session.cart || [];
  if (!cart.length) {
    return res.status(400).send("Cart is empty");
  }

  try {
    // Pass `order_items` as JSON string if needed
    req.body.order_items = cart;

    const order = await postCheckout(req, res);
    if (order) {
      const { orderId } = order;
      req.session.orderId = orderId;
      res.redirect(`/order/success?orderId=${orderId}`);
    } else {
      res.status(500).send("Order processing failed.");
    }
  } catch (err) {
    console.error("Error during checkout:", err);
    if (!res.headersSent) {
      res.status(500).send("Error processing order.");
    }
  }
});

router.get("/loading", (req, res) => {
  const message = req.query.message || "Loading...";
  res.render("loading", { message });
});

router.get("/order/success", (req, res) => {
  const orderId = req.query.orderId;
  if (!orderId) {
    return res.redirect("/");
  }
  res.render("order-success", {
    orderId,
  });
});

// Newsletter Subscription
router.post("/subscribe", (req, res) => {
  const email = req.body.email;
  const query = "INSERT INTO newsletter (email) VALUES (?)";

  db.query(query, [email], (err) => {
    if (err) return res.status(500).send("Error saving email.");
    res.redirect("back");
  });
});

module.exports = router;
