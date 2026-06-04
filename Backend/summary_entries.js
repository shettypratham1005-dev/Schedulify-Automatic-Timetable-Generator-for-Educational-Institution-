const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Timetable = require('./models/Timetable');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     const allEntries = await Timetable.find({}).populate('subject');
     const summary = {};
     allEntries.forEach(e => {
         const key = `Sem: ${e.semester} | Type: ${e.type} | Sub: ${e.subject?.name || e.subjectLabel}`;
         summary[key] = (summary[key] || 0) + 1;
     });
     console.log(summary);
     mongoose.connection.close();
  });
