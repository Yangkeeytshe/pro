const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminController");
const db = require('../config/db');

const bcrypt = require("bcrypt");

function isAdminLoggedIn(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  } else {
    return res.redirect("/admin"); // Redirect to login
  }
}

const toggleProductStatus = async (req, res) => {
  const productId = req.params.id;
  try {
    const [product] = await db.query("SELECT status FROM products WHERE id = ?", [productId]);
    const newStatus = product[0].status ? 0 : 1;
    await db.query("UPDATE products SET status = ? WHERE id = ?", [newStatus, productId]);
    res.redirect("/admin/adminManageProduct");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};

// Login Page
router.get("/login", (req, res) => {
  res.render("admin-login", { message: null });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM admin WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send("Database error");

    if (results.length === 0) {
      return res.render("admin-login", { message: "Invalid email or password" });
    }

    const admin = results[0];

    // Compare entered password with hashed password
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) return res.status(500).send("Error comparing passwords");

      if (!isMatch) {
        return res.render("admin-login", { message: "Invalid email or password" });
      }

      // Passwords match
      req.session.admin = admin;
      res.redirect("/admin/adminDashboard"); 
    });
  });
});
// Admin Dashboard Route
router.get("/adminDashboard", isAdminLoggedIn, (req, res) => {
  const admin = req.session.admin;

  db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, userResults) => {
    if (err) return res.status(500).send("Error fetching user data");

    db.query("SELECT COUNT(*) AS totalProducts FROM products", (err, productResults) => {
      if (err) return res.status(500).send("Error fetching product data");

      db.query("SELECT COUNT(*) AS totalNewsLetterSuscriber FROM newsletter", (err, newsletterResults) => {
        if (err) return res.status(500).send("Error fetching order data");

        res.render("adminDashboard", {
          admin,
          totalUsers: userResults[0].totalUsers,
          totalProducts: productResults[0].totalProducts,
          totalNewsLetterSuscriber: newsletterResults[0].totalNewsLetterSuscriber,
        });
      });
    });
  });
});

router.get("/adminAnalytics", isAdminLoggedIn, (req, res) => {
  const dashboardData = {};

  db.query('SELECT COUNT(*) AS userTotal FROM users', (err, userResults) => {
    if (err) return res.status(500).send("Error fetching user data");

    dashboardData.userTotal = userResults[0].userTotal;

    db.query('SELECT COUNT(*) AS productTotal FROM products', (err, productResults) => {
      if (err) return res.status(500).send("Error fetching product data");

      dashboardData.productTotal = productResults[0].productTotal;

      db.query('SELECT COUNT(*) AS newsletterTotal FROM newsletter', (err, newsletterResults) => {
        if (err) return res.status(500).send("Error fetching newsletter data");

        dashboardData.newsletterTotal = newsletterResults[0].newsletterTotal;

        db.query('SELECT name, price, rating FROM products ORDER BY rating DESC LIMIT 5', (err, topProductsResults) => {
          if (err) return res.status(500).send("Error fetching top products");

          dashboardData.topProducts = topProductsResults;

          res.render('adminAnalytics', dashboardData);
        });
      });
    });
  });
});

// sales Analytics
router.get("/adminSalesAnalytics", isAdminLoggedIn, (req, res) => {
  const salesData = {};

  db.query('SELECT COUNT(*) AS totalSales FROM orders', (err, salesCountResults) => {
    if (err) return res.status(500).send("Error fetching total sales count");

    salesData.totalSales = salesCountResults[0].totalSales;

    db.query('SELECT SUM(total_amount) AS totalRevenue FROM orders', (err, revenueResults) => {
      if (err) return res.status(500).send("Error fetching total revenue");

      salesData.totalRevenue = revenueResults[0].totalRevenue || 0;
      salesData.averageOrderValue = salesData.totalSales > 0
        ? (salesData.totalRevenue / salesData.totalSales).toFixed(2)
        : 0;

      db.query(`
        SELECT DATE(created_at) AS date, SUM(total_amount) AS dailyRevenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, (err, salesTrendResults) => {
        if (err) return res.status(500).send("Error fetching sales trend");
        salesData.salesTrend = salesTrendResults;

        db.query(`
          SELECT p.name, SUM(oi.quantity) AS totalSold
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          GROUP BY oi.product_id
          ORDER BY totalSold DESC
          LIMIT 5
        `, (err, topProductsResults) => {
          if (err) return res.status(500).send("Error fetching top products");
          salesData.topProducts = topProductsResults;

          db.query(`
            SELECT u.name, u.email, SUM(o.total_amount) AS totalSpent
            FROM orders o
            JOIN users u ON o.user_id = u.id
            GROUP BY o.user_id
            ORDER BY totalSpent DESC
            LIMIT 5
          `, (err, topCustomersResults) => {
            if (err) return res.status(500).send("Error fetching top customers");
            salesData.topCustomers = topCustomersResults;

            res.render("adminSalesAnalytics", salesData);
          });
        });
      });
    });
  });
});
// ----------------------------------------------
// View All Users
// ----------------------------------------------
router.get('/adminManageUser', isAdminLoggedIn, (req, res) => {
  const query = "SELECT id, name, email, city, state, country, status FROM users";

  db.query(query, (err, users) => {
    if (err) {
      console.error("DB query error:", err);
      return res.status(500).send("Error loading users");
    }

    res.render("adminManageUser", {
      users,
      admin: req.session.admin
    });
  });
});
// Activate user
router.post('/adminManageUser/users/:id/activate', isAdminLoggedIn, (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE users SET status = 1 WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to activate user");
    }
    // Redirect with /admin prefix
    res.redirect('/admin/adminManageUser');
  });
});

// Deactivate user
router.post('/adminManageUser/users/:id/deactivate', isAdminLoggedIn, (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE users SET status = 0 WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to deactivate user");
    }
    // Redirect with /admin prefix
    res.redirect('/admin/adminManageUser');
  });
});


// GET Edit User Form
router.get('/adminManageUser/users/:id/edit', isAdminLoggedIn, (req, res) => {
  const userId = req.params.id;

  db.query('SELECT id, name, email, city, state, country FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    res.render('adminEditUser', { user: results[0], admin: req.session.admin });
  });
});

// POST Edit User Submission
router.post('/adminManageUser/users/:id/edit', isAdminLoggedIn, (req, res) => {
  const userId = req.params.id;
  const { name, email, city, state, country } = req.body;

  db.query(
    "UPDATE users SET name = ?, email = ?, city = ?, state = ?, country = ? WHERE id = ?",
    [name, email, city, state, country, userId],
    (err) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).send("Update failed");
      }
      // Redirect to the user management page (with /admin prefix)
      res.redirect('/admin/adminManageUser');
    }
  );
});

// ----------------------------------------------
// View All Products
// ----------------------------------------------
router.get('/adminManageProduct', isAdminLoggedIn, (req, res) => {
  const query = "SELECT id, name, category, price, date_uploaded, rating, image FROM products";

  db.query(query, (err, products) => {
    if (err) {
      console.error("DB query error:", err);
      return res.status(500).send("Error loading products");
    }

    res.render("adminManageProduct", {
      products,
      admin: req.session.admin
    });
  });
});

// ----------------------------------------------
// GET Edit Product Form
// ----------------------------------------------
router.get('/adminManageProduct/products/:id/edit', isAdminLoggedIn, (req, res) => {

  const productId = req.params.id;

  db.query('SELECT id, name, category, price, date_uploaded, rating, image FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).send('Error fetching product');
    }
    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }

    res.render('adminEditProduct', { product: results[0], admin: req.session.admin });
  });
});

// ----------------------------------------------
// POST Edit Product Submission
// ----------------------------------------------
router.post('/adminManageProduct/products/:id/edit', isAdminLoggedIn, (req, res) => {
  
      const productId = req.params.id;
  const { name, category, price, date_uploaded, rating, image } = req.body;

  const sql = `UPDATE products
               SET name = ?, category = ?, price = ?, date_uploaded = ?, rating = ?, image = ?
               WHERE id = ?`;

  db.query(sql, [name, category, price, date_uploaded, rating, image, productId], (err, result) => {
    if (err) {
      console.error("Error updating product:", err);
      return res.status(500).send("Update failed");
    }
    // Redirect to product management page after successful update
    res.redirect('/admin/adminManageProduct');
  });
});
// ----------------------------------------------
// Delete Product
// ----------------------------------------------
router.post('/adminManageProduct/products/:id/delete', isAdminLoggedIn, (req, res) => {
  const productId = req.params.id;
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("Failed to delete product:", err);
      return res.status(500).send("Failed to delete product");
    }
    res.redirect('/admin/adminManageProduct');
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect("/admin/login");
  });
})// GET: Show Add New Product Form
router.get('/adminManageProduct/products/add', (req, res) => {
  res.render('adminAddProduct'); 
});

router.post('/adminManageProduct/products/add', (req, res) => {
  const { name, price } = req.body;
  const description = req.body.description || '';
  const category = req.body.category || '';
  const image = req.body.image || '';

  if (!name || !price || isNaN(price)) {
    return res.status(400).send("Name and valid price are required.");
  }

  const sql = `INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, price, description, category, image], (err, result) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send('Database error while adding product.');
    }
    res.redirect('/admin/adminManageProduct');  // Make sure this is the correct path
  });
});  // <-- THIS closing bracket was missing
// GET: Show form
router.get('/adminSetting', isAdminLoggedIn, authController.getAdminSetting);

// POST: Handle form submission
router.post('/updateProfile', isAdminLoggedIn, authController.updateProfile);
router.post("/changePassword", isAdminLoggedIn, authController.changePassword);


module.exports = router;
