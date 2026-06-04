const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');
const Batch = require('./models/Batch');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     const allSem8 = await Timetable.find({ semester: 8 }).populate('subject faculty room');
     console.log(`\n--- BE (Semester 8) Total Entries: ${allSem8.length} ---`);
     allSem8.forEach(t => {
         const subName = t.subjectLabel || (t.subject && t.subject.name) || "";
         const facName = t.facultyLabel || (t.faculty && t.faculty.name) || "Shared";
         console.log(`${t.day} ${t.startTime} | Type: ${t.type} | Sub: ${subName} | Fac: ${facName} | Batch: ${t.batch}`);
     });
     mongoose.connection.close();
  });
