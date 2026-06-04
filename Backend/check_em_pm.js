const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const Subject = require('./models/subject');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function check() {
  await mongoose.connect(uri);
  const entries = await Timetable.find({ semester: 8 }).populate('subject');
  const emPm = entries.filter(e => ["EM", "PM"].includes(e.subjectLabel || (e.subject && e.subject.name)));
  
  console.log("EM/PM Entries:");
  emPm.forEach(e => {
    console.log(`- ${e.day} ${e.startTime}: ${e.subjectLabel || e.subject.name} (Batch: ${e.batch}, IS_PARALLEL: ${e.isParallel})`);
  });
  
  await mongoose.disconnect();
}
check();
