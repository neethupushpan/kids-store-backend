const jwt = require("jsonwebtoken");

const authSeller = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "No token. User not authorized." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (decodedToken.role !== 'seller' && decodedToken.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Sellers or admins only." });
    }

    req.user = {_id: decodedToken.id, role: decodedToken.role }; // ✅ updated
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = authSeller;
