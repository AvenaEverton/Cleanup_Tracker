// server.js (Node.js with Express)
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

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

app.post("/api/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Email/Username and password are required" });
  }

  try {
    const userSql = "SELECT * FROM users WHERE email = ? OR username = ?";
    const [user] = await db.promise().query(userSql, [emailOrUsername, emailOrUsername]);

    if (!user || user.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { user_id, role, status } = user[0]; // Include the status field
    res.json({ success: true, user: { user_id, role, status } }); // Send the status in the response
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/register", async (req, res) => {
  const { fullName, username, email, password, userType, idImagePath } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userSql = "INSERT INTO users (full_name, username, email, password, role, id_image_path, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"; //added status pending.
    const [result] = await db.promise().query(userSql, [fullName, username, email, hashedPassword, userType, idImagePath]);

    const userId = result.insertId;

    res.json({ message: "User registered successfully", userId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email or username already exists" });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/dashboard", (req, res) => {
  const userCountSql = "SELECT COUNT(*) as userCount FROM users";
  const eventCountSql = "SELECT COUNT(*) as eventCount FROM events";
  const notificationCountSql = "SELECT COUNT(*) as notificationCount FROM notifications";

  db.query(userCountSql, (err, userCountResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch user count" });

    db.query(eventCountSql, (err, eventCountResult) => {
      if (err) return res.status(500).json({ error: "Failed to fetch event count" });

      db.query(notificationCountSql, (err, notificationCountResult) => {
        if (err) return res.status(500).json({ error: "Failed to fetch notification count" });

        res.json({
          userCount: userCountResult[0].userCount,
          eventCount: eventCountResult[0].eventCount,
          notificationCount: notificationCountResult[0].notificationCount,
        });
      });
    });
  });
});

let connectedUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    connectedUsers[userId] = socket.id;

    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, results) => {
      if (!err && results.length > 0) {
        let lastEventNotification = null;
        for (let i = 0; i < results.length; i++) {
          if (results[i].message.startsWith("New event:")) {
            lastEventNotification = results[i];
            break;
          }
        }
        socket.emit("unreadNotifications", { notifications: results, newEvent: lastEventNotification });
      } else {
        socket.emit("unreadNotifications", { notifications: [], newEvent: null });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    Object.keys(connectedUsers).forEach((userId) => {
      if (connectedUsers[userId] === socket.id) delete connectedUsers[userId];
    });
  });
});

app.post("/api/markNotificationsRead", (req, res) => {
  const { notificationId } = req.body;
  const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
  db.query(sql, [notificationId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Notification marked as read" });
  });
});

app.get("/getNotifications", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const sql = `
    SELECT notif_id, user_id, event_id, message, IFNULL(created_at, NOW()) AS created_at 
    FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching notifications:", err);
      return res.status(500).json({ error: "Database error" });
    }

    let lastEventNotification = null;
    for (let i = 0; i < results.length; i++) {
      if (results[i].message.startsWith("New event:")) {
        lastEventNotification = results[i];
        break;
      }
    }
    res.json({ notifications: results, newEvent: lastEventNotification });
  });
});

app.post("/addEvent", (req, res) => {
  const { eventName, description, date, time, location, additionalDetails, createdBy } = req.body;

  const checkSql = "SELECT * FROM events WHERE event_name = ? AND event_date = ? AND event_time = ?";
  db.query(checkSql, [eventName, date, time], (err, results) => {
    if (err) {
      console.error("❌ Error checking event:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length > 0) return res.status(400).json({ message: "Event already exists!" });

    const insertSql = `INSERT INTO events (event_name, description, event_date, event_time, location, add_details, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(insertSql, [eventName, description, date, time, location, additionalDetails, createdBy], (err, result) => {
      if (err) {
        console.error("❌ Error inserting event:", err);
        return res.status(500).json({ error: "Failed to add event" });
      }

      const eventId = result.insertId;

      const notificationSql = `INSERT INTO notifications (user_id, event_id, message, is_read, created_at) SELECT user_id, ?, ?, 0, NOW() FROM users`;
      db.query(notificationSql, [eventId, `New event: ${eventName}`], (err) => {
        if (err) {
          console.error("❌ Error inserting notifications:", err);
          return res.status(500).json({ error: "Failed to create notifications" });
        }

        io.emit("newEvent", { eventName, description, date, time, location });
        res.json({ message: "Event added successfully!" });
      });
    });
  });
});

app.get("/events", (req, res) => {
  const sql = "SELECT * FROM events ORDER BY event_date ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Backend running at http://192.168.1.206:${PORT}`));