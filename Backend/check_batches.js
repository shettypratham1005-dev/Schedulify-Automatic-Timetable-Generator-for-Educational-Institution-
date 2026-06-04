const mongoose = require('mongoose');
const Batch = require('./models/Batch');

mongoose.connect('mongodb://127.0.0.1:27017/Timetable')
  .then(async () => {
     const beBatches = await Batch.find({ year: 'BE' });
     console.log("\n--- BE (Semester 8) Batches in DB ---");
     beBatches.forEach(b => {
         console.log(b.name);
     });
     mongoose.connection.close();
  });
