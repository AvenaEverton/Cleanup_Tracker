const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change if you have a different MySQL user
  password: "", // Change if you set a password in XAMPP
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
app.post("/api/login", (req, res) => {
    const { emailOrUsername, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ? OR username = ?";
  
    db.query(query, [emailOrUsername, emailOrUsername], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error" });
      }
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
  
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
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
    });
  });


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
  

// ✅ Start Server
app.listen(5000, () => console.log("🚀 Backend running at http://192.168.1.206:5000"));
