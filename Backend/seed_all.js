const mongoose = require('mongoose');
const config = require('./config/timetableConfig');
const Subject = require('./models/subject');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Batch = require('./models/batch');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/Timetable';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database connected");

    // 1. SYNC ROOMS
    const allRoomNos = new Set();
    Object.values(config).forEach(c => {
      c.lectureRooms.forEach(r => allRoomNos.add(r));
      c.subjects.forEach(s => {
        if (s.labRoom) allRoomNos.add(s.labRoom);
      });
    });

    for (let rno of allRoomNos) {
      await Room.findOneAndUpdate(
        { room_no: rno },
        { 
          room_no: rno, 
          capacity: 80, 
          type: rno.includes('410') || rno.includes('411') || rno.includes('407') || rno.includes('401') || rno.includes('402') || rno.includes('403') || rno.includes('409') ? 'Lab' : 'Lecture',
          classNames: ['SE', 'TE', 'BE']
        },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Rooms synced");

    // 2. SYNC TEACHERS
    const allTeachers = new Set();
    Object.values(config).forEach(c => {
      c.subjects.forEach(s => {
        if (s.faculty && s.faculty !== "ANY") allTeachers.add(s.faculty);
      });
    });

    for (let tname of allTeachers) {
      const tid = tname.replace(/\s+/g, '').toUpperCase();
      await Teacher.findOneAndUpdate(
        { name: tname },
        { 
          teacher_id: tid,
          name: tname, 
          department: 'EXTC', 
          email: `${tid.toLowerCase()}@college.edu`,
          classNames: ['SE', 'TE', 'BE']
        },
        { upsert: true, new: true }
      );
    }
    // Specific teachers for EM S8 ANY? No, just pick one later.
    console.log("✅ Teachers synced");

    // 3. SYNC SUBJECTS
    for (let semester in config) {
      const semConfig = config[semester];
      for (let sub of semConfig.subjects) {
        const sid = `${semConfig.className}-S${semester}-${sub.name.replace(/\s+/g, '').toUpperCase()}`;
        await Subject.findOneAndUpdate(
          { name: sub.name, className: semConfig.className, semester: Number(semester) },
          { 
            sub_id: sid,
            name: sub.name, 
            className: semConfig.className, 
            semester: Number(semester), 
            type: sub.type === 'Lecture' ? 'Theory' : 'Lab',
            department: 'EXTC' 
          },
          { upsert: true, new: true }
        );
      }
      
      // Projects in reserved
      if (semConfig.reserved) {
        for (let res of semConfig.reserved) {
           const sid = `${semConfig.className}-S${semester}-${res.name.replace(/\s+/g, '').toUpperCase()}`;
           await Subject.findOneAndUpdate(
             { name: res.name, className: semConfig.className, semester: Number(semester) },
             { 
               sub_id: sid,
               name: res.name, 
               className: semConfig.className, 
               semester: Number(semester), 
               type: 'Theory', // Projects usually marked as theory for credits
               department: 'EXTC' 
             },
             { upsert: true, new: true }
           );
        }
      }
    }
    console.log("✅ Subjects synced");

    // 4. SYNC BATCHES
    const classes = ['SE', 'TE', 'BE'];
    const bNames = ['A', 'B', 'C', 'D'];
    for (let cls of classes) {
      for (let b of bNames) {
        await Batch.findOneAndUpdate(
          { name: b, year: cls },
          { name: b, year: cls },
          { upsert: true, new: true }
        );
      }
    }
    console.log("✅ Batches synced");

    console.log("🚀 ALL DATA SEEDED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
