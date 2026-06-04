const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const Teacher = require('./models/teacher');
const Room = require('./models/room');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function checkConflicts() {
  await mongoose.connect(uri);
  console.log("Checking Existing Timetable Entries for Mon, Tue, Wed...");
  
  const entries = await Timetable.find({ 
    day: { $in: ['Monday', 'Tuesday', 'Wednesday'] } 
  }).populate('faculty').populate('room');

  const formatted = entries.map(x => ({
    day: x.day,
    time: x.startTime,
    class: x.className,
    sem: x.semester,
    teacher: x.faculty ? x.faculty.name : 'NONE',
    room: x.room ? x.room.room_no : 'NONE'
  }));

  console.log(JSON.stringify(formatted, null, 2));
  
  mongoose.disconnect();
}

checkConflicts();
