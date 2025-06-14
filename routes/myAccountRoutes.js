const express = require("express");
const path = require("path");
const multer = require("multer");
const db = require("../config/db");
const { ensureLoggedIn } = require("../middleware/auth");
const {
  getLoginedPage,
  updateAddress,
  updateCart,
  postCheckout,
} = require("../controllers/myAccountController");

const router = express.Router();

// ✅ Multer storage config to save image in public/productimage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/productimage');  // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ Routes
router.get('/logined', ensureLoggedIn, getLoginedPage);
router.post('/logined/address', ensureLoggedIn, updateAddress);
router.post('/logined', ensureLoggedIn, updateCart);
router.post('/checkout', ensureLoggedIn, postCheckout);
router.post('/logined/upload-profile-pic', ensureLoggedIn, upload.single('profilePic'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const profilePicPath = '/productimage/' + req.file.filename;
  const userId = req.session.user.id;

  db.query(
    'UPDATE users SET profilePic = ? WHERE id = ?',
    [profilePicPath, userId],
    (err) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).send('Error saving to database');
      }

      // ✅ Update session so user.profilePic is immediately available in HBS
      req.session.user.profilePic = profilePicPath;

      res.redirect('/logined');
    }
  );
});

module.exports = router;
