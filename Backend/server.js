// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// -------------------- IMPORT ROUTES --------------------
const teacherRoutes = require("./routes/teacherRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const roomRoutes = require("./routes/roomRoutes");
const batchRoutes = require("./routes/batchRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const runGaRoute = require("./routes/runGa");
const authRoutes = require("./routes/authRoutes"); // auth routes with signup/login

// -------------------- INIT APP --------------------
const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors()); // allow requests from frontend
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // optional for form submissions

// -------------------- ROUTES --------------------

// Faculties (teachers)
app.use("/api/faculties", teacherRoutes);
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Subjects, Rooms, Batches
app.use("/api/subjects", subjectRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/batches", batchRoutes);

// Timetables
app.use("/api/timetables", timetableRoutes);

// GA / Auto-generate
app.use("/api", runGaRoute); // expects POST /api/run-ga

// Auth (Signup & Login)
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// -------------------- ERROR HANDLER --------------------
// catches unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// catches server errors
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: err.message });
});

// -------------------- MONGODB CONNECTION --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
  
// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});