const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     const pLabs = await Timetable.find({ semester: 8, type: 'Practical' }).populate('subject');
     console.log("\n--- BE (Semester 8) All Practicals ---");
     pLabs.forEach(t => {
         const subName = t.subjectLabel || (t.subject && t.subject.name) || "";
         console.log(`${t.day} ${t.startTime} | Sub: ${subName} | Batch: ${t.batch}`);
     });
     mongoose.connection.close();
  });
