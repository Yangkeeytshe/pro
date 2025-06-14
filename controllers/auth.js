const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const db = require("../config/db");
require("dotenv").config();

exports.register = async (req, res) => {
  console.log(req.body);

  let { name, email, password, passwordConfirm } = req.body;

  // Normalize email
  email = email.trim().toLowerCase();

  // Validate inputs
  if (!name || !email || !password || !passwordConfirm) {
    return res.render("register", {
      message: "All fields are required",
    });
  }

  if (password !== passwordConfirm) {
    return res.render("register", {
      message: "Passwords do not match",
    });
  }

  // Check if email already exists (case-insensitive)
  db.query("SELECT email FROM users WHERE LOWER(email) = ?", [email], async (error, results) => {
    if (error) {
      console.error("Database error: ", error);
      return res.status(500).send("Server error");
    }

    if (results.length > 0) {
      return res.render("register", {
        message: "That email is already in use",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed Password: ", hashedPassword);

      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        async (err, result) => {
          if (err) {
            console.error("Error inserting user: ", err);
            return res.status(500).send("Error registering user");
          }

          console.log("User registered successfully");

          // ✉️ Send registration confirmation email
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Mom's Art!",
            html: `
              <h2>Hi ${name},</h2>
              <p>Thank you for registering at <strong>Mom's Art</strong>.</p>
              <p>We’re excited to have you on board. Start exploring our latest textiles and handcrafted products.</p>
              <br>
              <p>Happy Shopping!</p>
              <p><strong>Mom's Art Team</strong></p>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log("Registration email sent to:", email);
          } catch (emailError) {
            console.error("Error sending registration email:", emailError);
          }

          res.render("login", {
            message: "User registered successfully. Please check your email.",
          });
        }
      );
    } catch (err) {
      console.error("Error hashing password: ", err);
      return res.status(500).send("Error processing registration");
    }
  });
};
exports.loginUser = (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      message: "All fields are required",
    });
  }

  email = email.trim().toLowerCase(); // Normalize

  db.query("SELECT * FROM users WHERE LOWER(email) = ?", [email], async (err, result) => {
    if (err) {
      console.error("Database error: ", err);
      return res.render("login", { message: "Database error" });
    }

    if (result.length === 0) {
      return res.render("login", {
        message: "Invalid email or password",
      });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        message: "Invalid email or password",
      });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic || null,
      role: user.role || "user",
    };

    console.log("Session user set:", req.session.user);

    if (user.role === "admin") {
      return res.redirect("/admin-dashboard");
    } else {
      return res.redirect("/");
    }
  });
};

// ==============================
// 🛍️ Admin - View Products
// ==============================
exports.viewProducts = async (req, res) => {
  try {
    db.query("SELECT * FROM products", (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).send("Server error");
      }

      res.render("admin-manageproduct", {
        products: results,
        admin: req.session.admin,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
