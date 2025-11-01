// Import Express
const express = require("express");
const app = express();

// ===== Middleware 1: Logging Middleware =====
const loggerMiddleware = (req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${req.method} ${req.url}`);
  next(); // move to the next middleware or route handler
};

// ===== Middleware 2: Bearer Token Authentication =====
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // get header

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // format: "Bearer mysecrettoken"

  if (token === "mysecrettoken") {
    next(); // token is correct → allow access
  } else {
    return res.status(403).json({ error: "Invalid or missing token" });
  }
};

// ===== Apply Logging Middleware Globally =====
app.use(loggerMiddleware);

// ===== Routes =====

// Public route (no authentication required)
app.get("/public", (req, res) => {
  res.json({ message: "Welcome to the public route!" });
});

// Protected route (requires valid Bearer token)
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted! You are viewing a protected route." });
});

// ===== Start Server =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
