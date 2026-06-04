const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const Subject = require('./models/subject');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function verify() {
  await mongoose.connect(uri);
  const entries = await Timetable.find({ semester: 8 }).populate('subject').sort({ day: 1, startTime: 1 });
  
  const slots = {};
  for (const e of entries) {
    const key = `${e.day} ${e.startTime}`;
    if (!slots[key]) slots[key] = [];
    slots[key].push(e);
  }

  console.log("Semester 8 Parallelism Audit:");
  for (const [key, items] of Object.entries(slots)) {
    const names = items.map(i => i.subjectLabel || (i.subject && i.subject.name) || "N/A");
    // Check for EM/PM in same slot
    const hasEM = names.includes("EM");
    const hasPM = names.includes("PM");
    
    if (hasEM || hasPM) {
        console.log(`Slot: ${key} | Subjects: ${names.join(", ")} | Result: ${ (hasEM && hasPM) ? "✅ PARALLEL" : "❌ SINGLE" }`);
    }
  }

  await mongoose.disconnect();
}
verify();
