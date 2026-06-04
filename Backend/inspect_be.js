const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const Subject = require('./models/subject');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function inspect() {
  await mongoose.connect(uri);
  const entries = await Timetable.find({ semester: 8 }).populate('subject');
  
  const emPm = entries.filter(e => e.subject && ["EM", "PM"].includes(e.subject.name));
  
  console.log(`Found ${emPm.length} EM/PM entries.`);
  emPm.forEach(e => {
    console.log(`- ${e.day} ${e.startTime}: ${e.subject.name} | isParallel: ${e.isParallel} | Room: ${e.roomLabel || 'ID:' + e.room}`);
  });

  // Check for day overlaps
  const counts = {};
  emPm.forEach(e => {
    const key = `${e.day} ${e.startTime}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  console.log("\nOverlap Count:");
  Object.entries(counts).forEach(([k, v]) => {
    if (v > 1) console.log(`[OK] Slot ${k} has ${v} parallel electives.`);
  });

  await mongoose.disconnect();
}
inspect();
