const express = require("express");
const mysql = require('mysql2/promise'); // Using promise version
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require('cloudinary').v2;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

cloudinary.config({ 
  cloud_name: 'dgkzqmtgy', 
  api_key: '138712578489821', 
  api_secret: 't60XhGuihc92t01GZtNFpR7dXU0' // Click 'View API Keys' above to copy your API secret
});

// Database connection pool
const db = mysql.createPool({ 
  host: 'localhost',
  user: 'root',
  database: 'clean_up_tracker',
  waitForConnections: true,
  connectionLimit: 10
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Email/Username and password are required" 
    });
  }

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?", 
      [emailOrUsername, emailOrUsername]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    res.json({ 
      success: true,
      user: {
        user_id: user.user_id,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { fullName, username, email, password, userType, idImagePath } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      `INSERT INTO users (fullName, username, email, password, userType, idImagePath, createdAt, role, status)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 'User', 'Pending')`,
      [fullName, username, email, hashedPassword, userType, idImagePath]
    );

    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("Database Error during registration:", error);
    res.status(500).json({ message: "Database error!" });
  }
});

// Admin dashboard endpoint
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const [usersResult] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [eventsResult] = await db.query("SELECT COUNT(*) AS totalEvents FROM events");
    const [approvalsResult] = await db.query("SELECT COUNT(*) AS totalPending FROM users WHERE status = 'Pending'");
    const [reportsResult] = await db.query("SELECT COUNT(*) AS totalReports FROM reports");

    res.json({
      totalUsers: usersResult[0].totalUsers,
      totalEvents: eventsResult[0].totalEvents,
      pendingApprovals: approvalsResult[0].totalPending,
      reports: reportsResult[0].totalReports,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Socket.io setup
let connectedUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", async (userId) => {
    connectedUsers[userId] = socket.id;

    try {
      const [results] = await db.query(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );

      let lastEventNotification = null;
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          if (results[i].message.startsWith("New event:")) {
            lastEventNotification = results[i];
            break;
          }
        }
      }
      socket.emit("unreadNotifications", { notifications: results, newEvent: lastEventNotification });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    Object.keys(connectedUsers).forEach((userId) => {
      if (connectedUsers[userId] === socket.id) delete connectedUsers[userId];
    });
  });
});

// Notification endpoints
app.post("/api/markNotificationsRead", async (req, res) => {
  const { notificationId } = req.body;
  
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [notificationId]);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/getNotifications", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const [results] = await db.query(
      `SELECT notif_id, user_id, event_id, message, IFNULL(created_at, NOW()) AS created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    let lastEventNotification = null;
    for (let i = 0; i < results.length; i++) {
      if (results[i].message.startsWith("New event:")) {
        lastEventNotification = results[i];
        break;
      }
    }
    res.json({ notifications: results, newEvent: lastEventNotification });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Event endpoints
app.post("/addEvent", async (req, res) => {
  const { eventName, description, date, time, location, additionalDetails, createdBy } = req.body;

  try {
    // Check if event exists
    const [existingEvents] = await db.query(
      "SELECT * FROM events WHERE event_name = ? AND event_date = ? AND event_time = ?",
      [eventName, date, time]
    );

    if (existingEvents.length > 0) {
      return res.status(400).json({ message: "Event already exists!" });
    }

    // Insert new event
    const [result] = await db.query(
      `INSERT INTO events (event_name, description, event_date, event_time, location, add_details, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [eventName, description, date, time, location, additionalDetails, createdBy]
    );

    const eventId = result.insertId;

    // Create notifications for all users
    await db.query(
      `INSERT INTO notifications (user_id, event_id, message, is_read, created_at) 
       SELECT user_id, ?, ?, 0, NOW() FROM users`,
      [eventId, `New event: ${eventName}`]
    );

    io.emit("newEvent", { eventName, description, date, time, location });
    res.json({ message: "Event added successfully!" });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: "Failed to add event" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM events ORDER BY event_date ASC");
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const [results] = await db.query("SELECT * FROM events WHERE event_id = ?", [id]);
    
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Admin user management endpoints
app.get('/api/admin/users', async (req, res) => {
  const filter = req.query.filter;
  let sql = 'SELECT user_id, username, status FROM users';

  if (filter && filter !== 'All') {
    sql += ` WHERE status = '${filter}'`;
  }

  try {
    const [users] = await db.query(sql);

    const [approvedCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'approved'");
    const [pendingCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
    const [restrictedCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'restricted'");

    res.json({
      users,
      approvedCount: approvedCount[0].count,
      pendingCount: pendingCount[0].count,
      restrictedCount: restrictedCount[0].count,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/users/:userId/status', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!userId || !status || !['Approved', 'Restricted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    await db.query('UPDATE users SET status = ? WHERE user_id = ?', [status, userId]);
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Event participation endpoint
app.post('/joinEvent', async (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: 'User ID and Event ID are required.' });
  }

  try {
    // Check if user already joined
    const [existing] = await db.query(
      'SELECT * FROM event_participants WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'You have already joined this event.' });
    }

    // Add participation
    await db.query(
      'INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)',
      [userId, eventId]
    );

    res.status(200).json({ message: 'Successfully joined the event.' });
  } catch (error) {
    console.error('Error joining event:', error);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ message: 'Database error: The event_participants table does not exist.' });
    }
    if (error.code === 'ER_FK_CONSTRAINT_FOREIGN_KEY') {
      return res.status(400).json({ message: 'Invalid User ID or Event ID.' });
    }
    
    res.status(500).json({ message: 'Failed to join the event.' });
  }
});

// Report endpoints
app.post("/api/reports", upload.array("images"), async (req, res) => {
  try {
    const { userId, latitude, longitude, description } = req.body;
    const images = req.files;

    if (!userId || !latitude || !longitude || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Insert report (unchanged)
    const [result] = await db.query(
      `INSERT INTO reports (user, latitude, longitude, description, timestamp)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, latitude, longitude, description]
    );

    const reportId = result.insertId;

    // MODIFIED IMAGE HANDLING - Upload to Cloudinary instead of DB
    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        try {
          // Upload to Cloudinary
          const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
            folder: "reports",
            use_filename: true
          });
          
          // Store Cloudinary URL in database instead of image data
          await db.query(
            "INSERT INTO report_images (report_id, image_url) VALUES (?, ?)",
            [reportId, cloudinaryResult.secure_url]
          );
          
          // Delete temporary file
          fs.unlinkSync(image.path);
          
          return cloudinaryResult.secure_url;
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          // Still store the report even if image upload fails
          return null;
        }
      })
    );

    res.status(201).json({ 
      message: "Report created and images uploaded successfully!",
      imageUrls: uploadedImages.filter(url => url !== null)
    });
    
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ 
      message: "Failed to create report", 
      error: error.message 
    });
  }
});

// Endpoint to get user stats: total reports and joined events
app.get('/api/user/stats/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Use the pool.query method for database interaction
    const [reportCountResult] = await pool.execute(
      'SELECT COUNT(*) AS reportCount FROM reports WHERE user = ?',
      [userId]
    );

    const [eventCountResult] = await pool.execute(
      'SELECT COUNT(*) AS eventCount FROM event_participants WHERE user_id = ?',
      [userId]
    );

    res.json({
      reportCount: reportCountResult[0].reportCount,
      eventCount: eventCountResult[0].eventCount
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Database error fetching user statistics' });
  }
});

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Backend running at http://192.168.1.23:${PORT}`));
