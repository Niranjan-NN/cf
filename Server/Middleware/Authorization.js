const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

const authenticateJWT = (req, res, next) => {
  try {
    let token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Token should be in the format: "Bearer <token>"
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    } else {
      return res.status(401).json({ message: "Invalid token format" });
    }
  jwt.verify(token, process.env.SECRET_CODE, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" }); // ✅ triggers refresh
      }
      return res.status(403).json({ message: "Invalid token" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }


      req.user = decoded;
      next(); // Call next() inside the verify callback after setting req.user
    });

  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
module.exports = {authenticateJWT,authorizeRoles};