const mongoose = require('mongoose');
const Subject = require('./models/subject');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Batch = require('./models/batch');
const config = require('./config/timetableConfig');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function verifySeed() {
  await mongoose.connect(uri);
  console.log("Connected to", mongoose.connection.name);

  const teachersCount = await Teacher.countDocuments();
  const roomsCount = await Room.countDocuments();
  const batchesCount = await Batch.countDocuments();
  const subjectsCount = await Subject.countDocuments();

  console.log("COLLECTION COUNTS:");
  console.log("- Teachers:", teachersCount);
  console.log("- Rooms:", roomsCount);
  console.log("- Batches:", batchesCount);
  console.log("- Subjects:", subjectsCount);

  if (roomsCount === 0) {
    console.log("❌ DB IS EMPTY. Re-seeding now...");
    // Run seed logic
    await require('./seed_all.js');
    console.log("Seed script logic finished.");
  }

  process.exit(0);
}

verifySeed();
