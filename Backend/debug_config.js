const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Subject = require('./models/subject');
const Batch = require('./models/batch');
const config = require('./config/timetableConfig');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function debug() {
  await mongoose.connect(uri);
  const semesters = [4, 6, 8];
  
  for (const sem of semesters) {
    console.log(`\n--- Debugging Semester ${sem} ---`);
    const classConfig = config[sem];
    const teachersDB = await Teacher.find({});
    const roomsDB = await Room.find({});
    
    // Check if teachers and rooms in config exist in DB
    classConfig.subjects.forEach(sc => {
      const t = teachersDB.find(x => x.name.toLowerCase() === (sc.faculty || "").toLowerCase());
      if (!t && sc.faculty !== "ANY") {
        console.log(`❌ Teacher not found for ${sc.name}: "${sc.faculty}"`);
      }
      if (sc.labRoom) {
        const r = roomsDB.find(x => x.room_no === sc.labRoom);
        if (!r) console.log(`❌ Lab Room not found for ${sc.name}: "${sc.labRoom}"`);
      }
    });
    
    const className = classConfig.className;
    const batches = await Batch.find({ year: className });
    console.log(`Batches found for ${className}: ${batches.length} (${batches.map(b=>b.name).join(', ')})`);
    
    if (batches.length === 0) console.log(`❌ FATAL: No batches found for ${className}`);
  }
  
  process.exit(0);
}

debug();
