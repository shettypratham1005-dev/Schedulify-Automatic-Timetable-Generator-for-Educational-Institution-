const mongoose = require('mongoose');
const Subject = require('./models/subject');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Batch = require('./models/batch');
const config = require('./config/timetableConfig');

const uri = "mongodb://127.0.0.1:27017/Timetable";

const validStartTimeIndices = [0, 1, 3, 4, 5, 7, 8];
const validPracticalStartIndices = [0, 3, 4, 7];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

async function diagnose() {
  await mongoose.connect(uri);
  const sem = 4;
  const classConfig = config[sem];
  const teachersDB = await Teacher.find({});
  const roomsDB = await Room.find({});
  const subjectsDB = await Subject.find({ semester: sem });
  const allBatches = await Batch.find({ year: classConfig.className });

  console.log(`--- Diagnosing Semester ${sem} ---`);
  console.log(`Teachers: ${teachersDB.length}, Rooms: ${roomsDB.length}, Batches: ${allBatches.length}`);

  const dbSubjects = {};
  subjectsDB.forEach(s => dbSubjects[s.name.toLowerCase()] = s);

  const getTeacher = (n) => teachersDB.find(t => t.name.toLowerCase() === n.toLowerCase());
  const getRoom = (n) => roomsDB.find(r => r.room_no === n);

  const practicalReqs = [];
  const lectureReqs = [];
  classConfig.subjects.forEach(sc => {
    const sub = dbSubjects[sc.name.toLowerCase()];
    const teacher = getTeacher(sc.faculty || "");
    if (!sub) console.log(`⚠️ Subject MISSING: ${sc.name}`);
    if (!teacher && sc.faculty !== "ANY") console.log(`⚠️ Teacher MISSING: ${sc.faculty}`);
    
    if (sc.type === "Practical") {
        practicalReqs.push({ sub, teacher, room: getRoom(sc.labRoom) });
    } else {
        lectureReqs.push({ sub, teacher, rooms: (classConfig.lectureRooms || []).map(r => getRoom(r)).filter(r => r) });
    }
  });

  console.log(`Practicals: ${practicalReqs.length}, Lectures: ${lectureReqs.length}`);

  // Test one batch placement
  let timeline = [];
  const b = allBatches[0];
  console.log(`Testing placement for Batch ${b.name}...`);

  for (const d of days) {
    for (const sIdx of validStartTimeIndices) {
      let placed = false;
      for (const lect of lectureReqs) {
          const r = roomsDB.find(x => x.type === "Lecture");
          // Simplified canPlace
          const conflict = timeline.find(t => t.day === d && t.slotIdx === sIdx && (t.faculty?._id === lect.teacher?._id || t.room?._id === r?._id));
          if (!conflict) {
              timeline.push({ day: d, slotIdx: sIdx, faculty: lect.teacher, room: r, batch: b.name });
              placed = true;
              break;
          }
      }
      if (!placed) console.log(`❌ FAILED TO PLACE at ${d} slot ${sIdx}`);
    }
  }

  process.exit(0);
}

diagnose();
