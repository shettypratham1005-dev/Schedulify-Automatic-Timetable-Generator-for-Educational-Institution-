const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/Timetable';

async function create() {
  await mongoose.connect(MONGODB_URI);
  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@college.edu' },
    { name: 'Admin User', email: 'admin@college.edu', password: hashedPassword },
    { upsert: true, new: true }
  );
  console.log("✅ Test User Created: admin@college.edu / password123");
  process.exit(0);
}
create();
