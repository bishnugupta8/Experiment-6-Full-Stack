// Import dependencies
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ===== Secret key for JWT signing =====
const SECRET_KEY = "myjwtsecretkey"; // In real projects, store in environment variable

// ===== Hardcoded user credentials =====
const USER = {
  username: "user123",
  password: "password123"
};

// ===== Sample account details =====
let account = {
  balance: 1000
};

// ===== /login Route (Public) =====
// User sends username and password → gets JWT token if valid
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check credentials
  if (username === USER.username && password === USER.password) {
    // Generate token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    res.json({
      message: "Login successful!",
      token
    });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// ===== Middleware to Verify JWT Token =====
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded; // attach decoded info to request
    next();
  });
};

// ===== Protected Routes =====

// GET /balance → view account balance
app.get("/balance", verifyToken, (req, res) => {
  res.json({ balance: account.balance });
});

// POST /deposit → add money to balance
app.post("/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid deposit amount" });
  }

  account.balance += amount;
  res.json({ message: `Deposited ₹${amount}`, newBalance: account.balance });
});

// POST /withdraw → subtract money from balance
app.post("/withdraw", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  if (amount > account.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  account.balance -= amount;
  res.json({ message: `Withdrawn ₹${amount}`, newBalance: account.balance });
});

// ===== Start Server =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🏦 Banking API running on http://localhost:${PORT}`);
});
