const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ----------------------------------------------
// Admin Login
// ----------------------------------------------
exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("admin-login", { message: "All fields are required" });
  }

  db.query("SELECT * FROM admin WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.render("admin-login", { message: "Database error" });
    }

    if (result.length === 0) {
      return res.render("admin-login", { message: "Invalid email or password" });
    }

    const admin = result[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render("admin-login", { message: "Invalid email or password" });
    }

    // Store admin in session
    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    console.log("Admin logged in:", req.session.admin);
    return res.redirect("/admin/dashboard");
  });
};

// ----------------------------------------------
// View All Products
// ----------------------------------------------
exports.viewProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).send("Server error");
    }

    res.render("admin-manageproduct", {
      products: results,
      admin: req.session.admin
    });
  });
};

// ----------------------------------------------
// Show Edit Product Form
// ----------------------------------------------
exports.editProductForm = (req, res) => {
  const productId = req.params.id;

  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).send("Server Error");
    }

    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.render("admin-editproduct", {
      product: results[0],
      admin: req.session.admin
    });
  });
};

// ----------------------------------------------
// Handle Product Update Submission
// ----------------------------------------------
exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const { name, category, price } = req.body;

  db.query(
    "UPDATE products SET name = ?, category = ?, price = ? WHERE id = ?",
    [name, category, price, productId],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).send("Error updating product");
      }

      res.redirect("/admin/dashboard/manage-products");
    }
  );
};

// Toggle Active/Inactive
exports.toggleProductStatus = (req, res) => {
  const productId = req.params.id;

  // First fetch current status
  db.query("SELECT status FROM products WHERE id = ?", [productId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching product status:", err);
      return res.status(500).send("Server error");
    }

    const currentStatus = results[0].status;
    const newStatus = currentStatus ? 0 : 1;

    // Update status
    db.query("UPDATE products SET status = ? WHERE id = ?", [newStatus, productId], (err, result) => {
      if (err) {
        console.error("Error updating status:", err);
        return res.status(500).send("Update failed");
      }

      res.redirect("/admin/dashboard/manage-products");
    });
  });
};


// View All Users
exports.viewUsers = (req, res) => {
  db.query("SELECT id, name, email, city, state, country, status FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).send("Server Error");
    }

    res.render("admin-manageuser", {
      users: results,
      admin: req.session.admin
    });
  });
};

// Show Edit User Form
exports.editUserForm = (req, res) => {
  const userId = req.params.id;

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error loading user:", err);
      return res.status(404).send("User not found");
    }

    res.render("admin-edituser", {
      user: results[0],
      admin: req.session.admin
    });
  });
};

// Handle Edit User Submission
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email, city, state, country } = req.body;

  db.query(
    "UPDATE users SET name = ?, email = ?, city = ?, state = ?, country = ? WHERE id = ?",
    [name, email, city, state, country, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).send("Update failed");
      }

      res.redirect("/admin/dashboard/manage-users");
    }
  );
};

// Toggle User Status
exports.toggleUserStatus = (req, res) => {
  const userId = req.params.id;

  db.query("SELECT status FROM users WHERE id = ?", [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Error fetching user");
    }

    const currentStatus = results[0].status;
    const newStatus = currentStatus ? 0 : 1;

    db.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, userId], (err) => {
      if (err) {
        console.error("Error updating status:", err);
        return res.status(500).send("Failed to update user status");
      }

      res.redirect("/admin/dashboard/manage-users");
    });
  });
};



exports.analyticsDashboard = async (req, res) => {
  try {
    const [userStats] = await db.promise().query("SELECT COUNT(*) AS total FROM users");
    const [productStats] = await db.promise().query("SELECT COUNT(*) AS total FROM products");
    const [newsletterStats] = await db.promise().query("SELECT COUNT(*) AS total FROM newsletter");

    const [topProducts] = await db.promise().query(`
      SELECT name, price, rating FROM products ORDER BY rating DESC LIMIT 5
    `);

    res.render("admin-analytics", {
      userTotal: userStats[0].total,
      productTotal: productStats[0].total,
      newsletterTotal: newsletterStats[0].total,
      topProducts,
      admin: req.session.admin
    });
  } catch (err) {
    console.error("Error loading analytics:", err);
    res.status(500).send("Server error");
  }
};


// Render the settings page
exports.getAdminSetting = (req, res) => {
  res.render('adminSetting', { admin: req.session.admin }); // loads adminSetting.hbs
};
// Update Name Controller
exports.updateProfile = (req, res) => {
  const { name } = req.body;
  const adminId = req.session.admin.id;

  const sql = "UPDATE admin SET name = ? WHERE id = ?";
  db.query(sql, [name, adminId], (err) => {
    if (err) {
      console.error("Error updating name:", err);
      return res.status(500).send("Database update failed.");
    }

    req.session.admin.name = name;

    res.redirect('/admin/adminSetting?message=Name updated successfully');
  });
};

// Change Password Controller
exports.changePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = "UPDATE admin SET password = ? WHERE email = ?";
    db.query(sql, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Server error");
      }

      res.redirect("/admin/adminSetting?message=Password updated successfully");
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send("Server error");
  }
};
