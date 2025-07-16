const jwt = require("jsonwebtoken");

const authSeller = (req, res, next) => {
  try {
    // ✅ Get token from cookie OR Authorization header
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "No token. User not authorized." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (decodedToken.role !== "seller" && decodedToken.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Sellers or admins only." });
    }

    req.user = { _id: decodedToken.id, role: decodedToken.role };
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = authSeller;
