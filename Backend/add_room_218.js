const mongoose = require('mongoose');
const Room = require('./models/room');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function addRoom() {
  await mongoose.connect(uri);
  const existing = await Room.findOne({ room_no: "218" });
  if (!existing) {
    await Room.create({ 
      room_no: "218", 
      capacity: 60, 
      type: "Classroom",
      classNames: ["BE"]
    });
    console.log("✅ Room 218 added successfully!");
  } else {
    console.log("ℹ️ Room 218 already exists.");
  }
  mongoose.disconnect();
}

addRoom();
