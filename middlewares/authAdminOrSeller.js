// middlewares/authAdminOrSeller.js
const authAdminOrSeller = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin or Seller only' });
  }
};

module.exports = authAdminOrSeller;
