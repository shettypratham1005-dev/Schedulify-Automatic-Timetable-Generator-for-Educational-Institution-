const mongoose = require('mongoose');
const config = require('./config/timetableConfig');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Subject = require('./models/subject');
const Batch = require('./models/batch');

const uri = "mongodb://127.0.0.1:27017/Timetable";
const validStartTimeIndices = [0, 1, 3, 4, 5, 7, 8];
const validPracticalStartIndices = [0, 3, 4, 7];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const canPlace = (activeTimeline, d, sIdx, duration, teacher, room, batch) => {
  if (duration === 2 && !validPracticalStartIndices.includes(sIdx)) return false;
  if (duration === 1 && !validStartTimeIndices.includes(sIdx)) return false;
  let neededIndices = duration === 1 ? [sIdx] : [sIdx, sIdx + 1];

  for (let t of activeTimeline) {
    if (t.day !== d) continue;
    let tIndices = t.duration === 1 ? [t.slotIdx] : [t.slotIdx, t.slotIdx + 1];
    const overlap = neededIndices.some(idx => tIndices.includes(idx));
    if (overlap) {
      if (teacher && t.faculty) {
        const tid1 = t.faculty._id ? t.faculty._id.toString() : t.faculty.toString();
        const tid2 = teacher._id ? teacher._id.toString() : teacher.toString();
        if (tid1 === tid2) return false;
      }
      if (room && t.room) {
        const rid1 = t.room._id ? t.room._id.toString() : t.room.toString();
        const rid2 = room._id ? room._id.toString() : room.toString();
        if (rid1 === rid2) return false;
      }
      if (batch && t.batch && t.batch === batch && !t.isExternal) return false;
    }
  }
  return true;
};

async function test_gen() {
  await mongoose.connect(uri);
  const sem = 4;
  const teachersDB = await Teacher.find({});
  const roomsDB = await Room.find({});
  const subjectsDB = await Subject.find({ semester: sem });
  const allBatches = await Batch.find({ year: "SE" });

  const getTeacher = (n) => teachersDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
  const getRoom = (n) => roomsDB.find(r => r.room_no === n);
  const dbSubjects = {};
  subjectsDB.forEach(s => dbSubjects[s.name.toLowerCase()] = s);

  const classConfig = config[sem];
  const lectureReqs = [];
  classConfig.subjects.forEach(sc => {
      if (sc.type === "Lecture") {
          lectureReqs.push({ sub: dbSubjects[sc.name.toLowerCase()], teacher: getTeacher(sc.faculty), rooms: (classConfig.lectureRooms || []).map(r => getRoom(r)).filter(r => r) });
      }
  });

  // Backfill to 35
  while(lectureReqs.length < 27) lectureReqs.push({...lectureReqs[lectureReqs.length % 7], isBackfill: true});

  let timeline = [];
  let success = true;

  for (const b of allBatches) {
      for (const d of days) {
          for (const s of validStartTimeIndices) {
              let placed = false;
              for (const lect of lectureReqs) {
                 // Try any room
                 for (const r of roomsDB) {
                     let teacher = lect.teacher;
                     let can = canPlace(timeline, d, s, 1, teacher, r, b.name);
                     if (!can && lect.isBackfill) {
                         const tFallback = teachersDB.find(t => canPlace(timeline, d, s, 1, t, r, b.name));
                         if (tFallback) { teacher = tFallback; can = true; }
                     }
                     if (can) {
                         timeline.push({ day: d, slotIdx: s, duration: 1, faculty: teacher, room: r, batch: b.name });
                         placed = true; break;
                     }
                 }
                 if (placed) break;
              }
              if (!placed) { console.log(`FAILED at ${b.name} ${d} ${s}`); success = false; break; }
          }
          if (!success) break;
      }
      if (!success) break;
  }

  console.log("FINAL SUCCESS:", success);
  process.exit(0);
}

test_gen();
