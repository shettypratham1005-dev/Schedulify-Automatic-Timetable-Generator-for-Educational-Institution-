const mongoose = require("mongoose");
const config = require("./config/timetableConfig");
const Subject = require("./models/subject");
const Teacher = require("./models/teacher");
const Room = require("./models/room");
const Batch = require("./models/batch");

mongoose.connect("mongodb://127.0.0.1:27017/Timetable")
  .then(() => console.log("✅ MongoDB Connected for Config Sync"))
  .catch(err => console.error("❌ DB Connection Error:", err));

async function sync() {
  try {
    for (let sem in config) {
      const clsConfig = config[sem];
      const semester = parseInt(sem);
      const className = clsConfig.className;

      console.log(`\n🔄 Syncing Semester ${semester} (${className})...`);

      // 1. Sync Rooms
      const allRooms = new Set([...clsConfig.lectureRooms]);
      clsConfig.subjects.forEach(s => {
        if (s.labRoom) allRooms.add(s.labRoom);
      });

      for (let rm of allRooms) {
        await Room.findOneAndUpdate(
          { room_no: rm },
          { 
            $set: { 
                room_no: rm, 
                capacity: 60, 
                type: rm.includes("41") ? "Classroom" : "Lab" 
            },
            $addToSet: { classNames: className }
          },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ Rooms synced`);

      // 2. Sync Teachers
      const allTeachers = new Set();
      clsConfig.subjects.forEach(s => {
        if (s.faculty && s.faculty !== "ANY") allTeachers.add(s.faculty);
      });

      for (let t of allTeachers) {
        await Teacher.findOneAndUpdate(
          { name: t },
          { 
            $set: { 
                name: t, 
                teacher_id: `T_${t.replace(/[^a-zA-Z0-9]/g, '')}`, 
                department: "Computer" 
            },
            $addToSet: { classNames: className }
          },
          { upsert: true, new: true }
        );
      }
      
      // Auto-generate "ANY" teacher fallback
      await Teacher.findOneAndUpdate(
         { name: "ANY" },
         { 
             $set: { name: "ANY", teacher_id: "T_ANY", department: "Computer" }, 
             $addToSet: { classNames: className } 
         },
         { upsert: true, new: true }
      );
      console.log(`✅ Teachers synced`);

      // 3. Sync Subjects
      for (let sub of clsConfig.subjects) {
        let typeEnum = sub.type === "Practical" ? "Lab" : "Theory";
        if (sub.type === "Tutorial") typeEnum = "Theory";
        
        await Subject.findOneAndUpdate(
          { name: sub.name, className, semester },
          { 
            $set: { 
              name: sub.name, 
              className, 
              semester,
              sub_id: `S_${className}_${sem}_${sub.name.replace(/[^a-zA-Z0-9]/g, '')}`,
              type: typeEnum,
              credits: 3
            }
          },
          { upsert: true, new: true }
        );
      }

      // Sync Reserved project Subjects 
      for (let res of clsConfig.reserved) {
        await Subject.findOneAndUpdate(
          { name: res.name, className, semester },
          { 
            $set: { 
              name: res.name, 
              className, 
              semester,
              sub_id: `S_${className}_${sem}_${res.name.replace(/[^a-zA-Z0-9]/g, '')}`,
              type: "Theory",
              credits: 2
            }
          },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ Subjects synced`);

      // 4. Batches
      const batches = ["A", "B", "C", "D"];
      for (let b of batches) {
         await Batch.findOneAndUpdate(
           { name: b, year: className },
           { $set: { name: b, year: className, division: "A" } },
           { upsert: true, new: true }
         );
      }
      console.log(`✅ Batches synced`);
    }

    console.log(`\n🎉 DATABASE SYNC COMPLETE: Your config strings perfectly match MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync Error:", err);
    process.exit(1);
  }
}

sync();
