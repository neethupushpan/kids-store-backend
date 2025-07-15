const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "No token. User not authorized." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // ✅ Check for admin role
    if (decodedToken.role !== 'admin' ){
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = authAdmin;
