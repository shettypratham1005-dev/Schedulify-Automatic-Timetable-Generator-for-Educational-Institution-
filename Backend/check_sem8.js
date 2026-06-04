const mongoose = require('mongoose');
const Subject = require('./models/subject');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const config = require('./config/timetableConfig');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function dryRun() {
  await mongoose.connect(uri);
  console.log("Checking Semester 8 BE Configuration...");
  
  const className = "BE";
  const semester = 8;
  const classConfig = config[semester];
  
  if (!classConfig) { console.log("ERROR: No config for Sem 8"); process.exit(1); }

  const subjectsDB = await Subject.find({ className, semester });
  const teachersDB = await Teacher.find();
  const roomsDB = await Room.find();

  let dbSubjects = {};
  for (let sub of subjectsDB) {
    dbSubjects[sub.name.toLowerCase()] = sub;
  }

  const getTeacher = (facultyName) => {
    if (facultyName === "ANY") return "OK (Random)";
    return teachersDB.find(t => t.name.toLowerCase() === facultyName.toLowerCase());
  };

  const getRoom = (roomNo) => {
    return roomsDB.find(r => r.room_no === roomNo);
  };

  console.log("\n--- Subjects ---");
  for (let subConf of classConfig.subjects) {
    const sub = dbSubjects[subConf.name.toLowerCase()];
    if (!sub) console.log(`[FAIL] Subject: ${subConf.name}`);
    else console.log(`[OK] Subject: ${subConf.name}`);

    const teacher = getTeacher(subConf.faculty);
    if (!teacher) console.log(`[FAIL] Faculty: ${subConf.faculty} for ${subConf.name}`);
    else console.log(`[OK] Faculty: ${subConf.faculty} for ${subConf.name}`);

    if (subConf.labRoom) {
      const room = getRoom(subConf.labRoom);
      if (!room) console.log(`[FAIL] LabRoom: ${subConf.labRoom} for ${subConf.name}`);
      else console.log(`[OK] LabRoom: ${subConf.labRoom} for ${subConf.name}`);
    }
  }

  console.log("\n--- Lecture Rooms ---");
  for (let roomNo of classConfig.lectureRooms) {
    const room = getRoom(roomNo);
    if (!room) console.log(`[FAIL] LectureRoom: ${roomNo}`);
    else console.log(`[OK] LectureRoom: ${roomNo}`);
  }

  console.log("\n--- Reserved ---");
  for (let resItem of classConfig.reserved) {
      let subObj = subjectsDB.find(s => s.name.toLowerCase() === resItem.name.toLowerCase());
      if (!subObj) console.log(`[NOTE] Label Only: ${resItem.name}`);
      else console.log(`[OK] DB Subject linked: ${resItem.name}`);
  }

  mongoose.disconnect();
}

dryRun();
