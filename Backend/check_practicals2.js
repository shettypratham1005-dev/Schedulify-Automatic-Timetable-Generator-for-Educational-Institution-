const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     const pSlots = await Timetable.find({ type: 'Practical' });
     console.log(`\n--- Total Practical Entries: ${pSlots.length} ---`);
     pSlots.forEach(t => {
         console.log(`Sem: ${t.semester} | Day: ${t.day} | Batch: ${t.batch}`);
     });
     mongoose.connection.close();
  });
