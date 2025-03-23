const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs"); // ✅ Keep only this if using bcryptjs


const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "clean_up_tracker",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ✅ Login Route
app.use(express.json());

app.post("/api/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const query = "SELECT id, fullName, username, email, password, role FROM users WHERE email = ? OR username = ?";

    db.query(query, [emailOrUsername, emailOrUsername], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      const user = results[0];

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Register Route
app.post("/api/register", async (req, res) => {
  const { fullName, username, email, password, userType, idImagePath } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `INSERT INTO users (fullName, username, email, password, userType, idImagePath, createdAt, role, status) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), 'User', 'Pending')`;

  db.query(query, [fullName, username, email, hashedPassword, userType, idImagePath], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error!" });
    }
    res.status(201).json({ message: "Registration successful!" });
  });
});

// ✅ Admin Dashboard Route
app.get("/api/admin/dashboard", (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COUNT(*) FROM events) AS totalEvents,
      (SELECT COUNT(*) FROM users WHERE status = 'pending') AS pendingApprovals
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results[0]);
  });
});

// ✅ Start Server
app.listen(5000, () => console.log("🚀 Backend running at http://192.168.1.206:5000"));
