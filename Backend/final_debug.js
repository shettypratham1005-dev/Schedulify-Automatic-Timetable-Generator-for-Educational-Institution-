const config = require("./config/timetableConfig");
const mongoose = require("mongoose");
const Teacher = require("./models/teacher");
const Room = require("./models/room");
const Subject = require("./models/subject");
const Batch = require("./models/batch");
const Timetable = require("./models/timetable");
require("dotenv").config();

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const vStartI = [0, 1, 3, 4, 5, 7, 8];

const canPlace = (timeline, d, s, dur, teacher, room, batchId) => {
  let needed = Array.from({ length: dur }, (_, i) => s + i);
  for (let t of timeline) {
    if (t.day !== d) continue;
    let tI = Array.from({ length: t.duration }, (_, i) => t.slotIdx + i);
    if (needed.some(idx => tI.includes(idx))) {
      if (teacher && t.faculty && String(t.faculty?._id || t.faculty) === String(teacher?._id || teacher)) return false;
      if (room && t.room && String(t.room?._id || t.room) === String(room?._id || room)) return false;
      if (batchId && t.batchId && String(t.batchId) === String(batchId)) return false;
    }
  }
  return true;
};

function prebookLabs(sems, globalT, teachersDB, roomsDB, dbSubjects, allBatches) {
  const gT = (n) => teachersDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
  const gR = (n) => roomsDB.find(r => r.room_no === n);

  for (const sem of sems) {
    const cC = config[sem];
    const batches = allBatches.filter(b => b.year === cC.className).map(b => b.name).sort();
    const pR = [];
    cC.subjects.forEach(sc => {
      if (sc.type === "Practical") pR.push({ sub: dbSubjects[sem][sc.name.toLowerCase()], f: gT(sc.faculty), r: gR(sc.labRoom) });
    });

    if (sem === 8) {
      vStartI.forEach(idx => batches.forEach(b => {
        globalT.push({ day: "Friday", slotIdx: idx, duration: 1, subject: dbSubjects[8]["major project"], type: "Project", batch: b, batchId: `BE-${b}`, isExternal: true });
      }));
      const ocn = pR.find(p => p.sub?.name?.toLowerCase().includes("ocn")) || pR[0];
      const sch = [{ b: "A", d: "Monday", s: 1, dur: 3 }, { b: "B", d: "Monday", s: 7, dur: 2 }, { b: "C", d: "Tuesday", s: 0, dur: 2 }, { b: "D", d: "Wednesday", s: 3, dur: 2 }];
      sch.forEach(t => {
        globalT.push({ day: t.d, slotIdx: t.s, duration: t.dur, subject: ocn.sub, faculty: ocn.f, room: ocn.r, batch: t.b, batchId: `BE-${t.b}`, type: "Practical", isExternal: true });
      });
    } else {
      const lDs = sem === 4 ? ["Monday", "Tuesday", "Wednesday", "Thursday"] : ["Tuesday", "Wednesday", "Thursday", "Friday"];
      const lS = sem === 4 ? 3 : 7;
      const year = sem === 4 ? "SE" : "TE";
      for (let di = 0; di < 4; di++) {
        const d = lDs[di];
        for (let bi = 0; bi < batches.length; bi++) {
          const b = batches[bi];
          const p = pR[(bi + di) % pR.length];
          globalT.push({ day: d, slotIdx: lS, duration: 2, subject: p.sub, faculty: p.f, room: p.r, batch: b, batchId: `${year}-${b}`, type: "Practical", isExternal: true });
        }
      }
    }
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Timetable");
  const sems = [4, 6, 8];
  const tDB = await Teacher.find({});
  const rDB = await Room.find({});
  const bDB = await Batch.find({});
  const dbSubs = {};
  for (let s of sems) {
    dbSubs[s] = {};
    (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
  }

  let globalTimeline = [];
  prebookLabs(sems, globalTimeline, tDB, rDB, dbSubs, bDB);

  console.log("Pre-booked Labs SUCCESS. Entries:", globalTimeline.length);

  for (let s of sems) {
    console.log(`\n--- Testing Sem ${s} ---`);
    const cC = config[s];
    const bL = bDB.filter(b => b.year === cC.className).map(b => b.name).sort();
    const lR = [];
    cC.subjects.forEach(sc => {
      if (sc.type === "Lecture") lR.push({ name: sc.name, f: sc.faculty });
    });

    const semFacultyNames = new Set(cC.subjects.map(sc => sc.faculty));
    const semTeachersPool = tDB.filter(t => semFacultyNames.has(t.name));

    console.log(`Batches: ${bL.length}, Teachers: ${semTeachersPool.length}, Rooms: ${rDB.length}`);
    
    // Check specific day 2:30 PM for TE
    if (s === 6) {
        const d = "Tuesday"; const slot = 7;
        const busy = globalTimeline.filter(t => t.day === d && t.slotIdx === slot);
        console.log(`At Tuesday 2:30 PM, Labs pre-booked in rooms:`, busy.map(t => t.room?.room_no));
        const freeRooms = rDB.filter(r => !busy.some(t => String(t.room?._id || t.room) === String(r._id)));
        console.log(`Free rooms at Tuesday 2:30 PM: ${freeRooms.length}`);
    }
  }
  process.exit(0);
}

run();
