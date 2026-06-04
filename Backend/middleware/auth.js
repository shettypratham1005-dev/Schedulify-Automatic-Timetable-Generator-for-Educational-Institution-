const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

module.exports = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token || token.includes("null") || token.includes("undefined")) {
    return res.status(401).json({ message: "Access denied: No token provided" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trimLeft();
  }

  if (!token || token === "null" || token === "undefined" || token === "") {
    console.error("🔥 Auth Middleware: Missing or literal 'null' token.");
    return res.status(401).json({ message: "Session expired or invalid. Please log in again." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("🔥 Auth Middleware Error! Invalid token:", err.message);
    res.status(401).json({ message: "Invalid or expired session. Please log in again." });
  }
};