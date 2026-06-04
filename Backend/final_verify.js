const mongoose = require('mongoose');
const Timetable = require('./models/timetable');

async function verify() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Timetable');
  console.log("📊 FINAL DB VERIFICATION:");
  
  for (let sem = 3; sem <= 8; sem++) {
    const count = await Timetable.countDocuments({ semester: sem });
    console.log(`Semester ${sem}: ${count} entries`);
  }
  
  process.exit(0);
}

verify();
