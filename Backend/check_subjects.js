const mongoose = require('mongoose');
const Subject = require('./models/Subject');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     const subs = await Subject.find({ semester: 8 });
     console.log("\n--- BE (Semester 8) Subjects in Database ---");
     subs.forEach(s => {
         console.log(`${s.name} | Type: ${s.type}`);
     });
     mongoose.connection.close();
  });
