const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const Subject = require('./models/subject');
const Teacher = require('./models/teacher');
const Room = require('./models/room');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function verify() {
  await mongoose.connect(uri);
  console.log("Verifying Semester 8 BE Timetable...");
  
  const entries = await Timetable.find({ semester: 8 }).populate("subject faculty room");
  
  console.log(`\nFound ${entries.length} entries for Sem 8.`);

  // 1. Check OCN Lab spreading
  const ocnLabs = entries.filter(e => (e.subjectLabel === "OCN Lab" || (e.subject && e.subject.name === "OCN Lab")));
  console.log(`\n--- OCN Lab (Found ${ocnLabs.length} sessions) ---`);
  
  const batchSlots = {};
  ocnLabs.forEach(e => {
    const key = `${e.day} ${e.startTime}`;
    if (!batchSlots[key]) batchSlots[key] = [];
    batchSlots[key].push(e.batch || "ALL");
  });

  for (const [slot, batches] of Object.entries(batchSlots)) {
    console.log(`Slot: ${slot} | Batches: ${batches.join(", ")}`);
    if (batches.length > 1) {
        console.log("⚠️ WARNING: More than 1 batch in OCN Lab slot!");
    }
  }

  const daysUsed = [...new Set(ocnLabs.map(e => e.day))];
  console.log(`Days used for OCN Lab: ${daysUsed.join(", ")}`);
  const allowedDays = ["Monday", "Tuesday", "Wednesday"];
  const invalidDays = daysUsed.filter(d => !allowedDays.includes(d));
  if (invalidDays.length > 0) {
      console.log(`❌ ERROR: OCN Lab found on invalid days: ${invalidDays.join(", ")}`);
  } else {
      console.log(`✅ OCN Lab is restricted to allowed days: ${allowedDays.join(", ")}`);
  }

  // 2. Check EM/PM Parallelism
  console.log(`\n--- EM/PM Paralellism ---`);
  const emPm = entries.filter(e => ["EM", "PM"].includes(e.subjectLabel || (e.subject && e.subject.name)));
  
  const timeSlots = {};
  emPm.forEach(e => {
    const key = `${e.day} ${e.startTime}`;
    if (!timeSlots[key]) timeSlots[key] = [];
    timeSlots[key].push(e.subjectLabel || e.subject.name);
  });

  let parallelFound = false;
  for (const [slot, subs] of Object.entries(timeSlots)) {
    if (subs.includes("EM") && subs.includes("PM")) {
        console.log(`✅ Parallel Slot Found: ${slot} (Both EM and PM)`);
        parallelFound = true;
    } else {
        console.log(`Slot: ${slot} | Subjects: ${subs.join(", ")}`);
    }
  }

  if (!parallelFound) {
      console.log("❌ ERROR: EM and PM were NOT found in the same slot!");
  }

  await mongoose.disconnect();
}

verify();
