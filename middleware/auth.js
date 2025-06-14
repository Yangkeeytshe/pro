// middleware/auth.js
exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/logined'); // or any other page you want
  }
  next();
};
exports.ensureLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};