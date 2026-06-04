const path = require('path');
// server.js - Main Entry Point
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend HTML files
app.use(express.static(path.join(__dirname, 'frontend')));

// Import Routes
const authRoutes = require('./backend/routes/authRoutes');
const departmentRoutes = require('./backend/routes/departmentRoutes');
const subjectRoutes = require('./backend/routes/subjectRoutes');
const facultyRoutes = require('./backend/routes/facultyRoutes');
const classroomRoutes = require('./backend/routes/classroomRoutes');
const batchRoutes = require('./backend/routes/batchRoutes');
const timetableRoutes = require('./backend/routes/timetableRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/timetable', timetableRoutes);

// Root route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/login.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/login.html'));
});
app.get('/debug-admin', async (req, res) => {
  const Admin = require('./backend/models/Admin');
  const admins = await Admin.find();
  res.json(admins);
});


// Connect to MongoDB FIRST, then start server
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Initialize default admin
    await initializeAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Initialize default admin
async function initializeAdmin() {
  const Admin = require('./backend/models/Admin');
  const bcrypt = require('bcryptjs');

  const adminExists = await Admin.findOne({ username: 'admin' });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      username: 'admin',
      password: 'admin123'
    });

    await admin.save();
    console.log('Default admin created → username: admin | password: admin123');
  }
}