const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     console.log("Connected to MongoDB -> Timetable");
     
     const sem8Fri = await Timetable.find({ semester: 8, day: 'Friday' }).populate('faculty room subject');
     console.log("\n--- BE (Semester 8) Friday ---");
     sem8Fri.forEach(t => {
         console.log(`${t.startTime}-${t.endTime} | Sub: ${t.subjectLabel || (t.subject && t.subject.name)} | Fac: ${t.facultyLabel || (t.faculty && t.faculty.name)} | Room: ${t.roomLabel || (t.room && t.room.room_no)} | Batch: ${t.batch}`);
     });
     
     const ocnLabs = await Timetable.find({ semester: 8, type: 'Practical' }).populate('faculty room subject');
     console.log("\n--- BE (Semester 8) OCN Labs Batches ---");
     ocnLabs.forEach(t => {
         const subName = t.subjectLabel || (t.subject && t.subject.name) || "";
         if (subName.toLowerCase().includes("ocn")) {
             console.log(`${t.day} ${t.startTime} | Batch: ${t.batch}`);
         }
     });

     const sem4Slots = await Timetable.find({ semester: 4 }).populate('subject');
     console.log(`\n--- SE (Semester 4) Total Slots Scheduled: ${sem4Slots.length} ---`);

     mongoose.connection.close();
  });
