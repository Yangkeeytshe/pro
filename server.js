const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const multer = require('multer');
const session = require("express-session");
const nodemailer = require('nodemailer');
const flash = require('connect-flash');
const hbsHelpers = require('./utils/helper');// Route modules
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/searchRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const myAccountRoutes = require('./routes/myAccountRoutes');
const cartAPI = require('./routes/api/cartAPI');
const wishlistAPI = require('./routes/api/wishlistAPI');
const chatbotAPI = require('./routes/api/chatbotAPI');
const wishlistRoutes = require('./routes/wishlistRoutes');

dotenv.config({ path: './.env' });
const app = express();

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


db.connect(err => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session middleware (before flash)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
// Configure multer storage and file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Make sure this folder exists and is writable
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Save file with original extension
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Flash middleware
app.use(flash());

// Expose flash and user to views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Static files
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

// View engine setup
app.set('view engine', 'hbs');
const partialsDir = path.join(__dirname, 'views', 'partials');
hbs.registerPartials(partialsDir, err => {
  if (err) console.error("Error registering partials:", err);
  else console.log("Partials registered successfully");
});

// Register helpers
Object.entries(hbsHelpers).forEach(([name, fn]) => hbs.registerHelper(name, fn));

// Mount routes
app.use('/', userRoutes);
app.use('/auth', authRoutes);
app.use('/search', searchRoutes);
app.use('/', productRoutes);
app.use('/admin', adminRoutes);
app.use('/', cartRoutes);
app.use('/', myAccountRoutes);
app.use('/api', cartAPI);
app.use('/api', wishlistAPI);
app.use('/api', chatbotAPI);
app.use('/', wishlistRoutes);

// Home page fallback
app.get('/', (req, res) => {
  const query = "SELECT * FROM products LIMIT 3";
  db.query(query, (error, result) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).send("Error fetching products.");
    }
    if (!req.session.cart) req.session.cart = {};
    res.render('product', { products: result, cart: req.session.cart });
  });
});
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'Outlook', 'Yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = db;
