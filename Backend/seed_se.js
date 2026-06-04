const mongoose = require("mongoose");
const Teacher = require("./models/teacher");
const Subject = require("./models/subject");
const Room = require("./models/room");
const Batch = require("./models/batch");

mongoose.connect("mongodb://127.0.0.1:27017/Timetable", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("DB Connected for Seeding"))
  .catch(err => console.error("DB Connection Error:", err));

const runSeed = async () => {
  try {
    // 1. Subjects
    const subjects = [
      { sub_id: "SE_SUB_01", name: "ENAS", type: "Theory", credits: 3, className: "SE" },
      { sub_id: "SE_SUB_02", name: "DSD", type: "Theory", credits: 4, className: "SE" },
      { sub_id: "SE_SUB_03", name: "EDC", type: "Theory", credits: 3, className: "SE" },
      { sub_id: "SE_SUB_04", name: "EM", type: "Theory", credits: 3, className: "SE" },
      { sub_id: "SE_SUB_05", name: "EVS", type: "Theory", credits: 2, className: "SE" },
      { sub_id: "SE_SUB_06", name: "OE", type: "Theory", credits: 2, className: "SE" },
    ];

    for (let sub of subjects) {
      await Subject.findOneAndUpdate(
        { name: sub.name, className: "SE" },
        { $set: sub },
        { upsert: true, new: true }
      );
    }
    console.log("✅ SE Subjects seeded");

    // 2. Faculty
    const faculties = [
      { teacher_id: "FAC_01", name: "DR V.G" },
      { teacher_id: "FAC_02", name: "T.S" },
      { teacher_id: "FAC_03", name: "B.G" },
      { teacher_id: "FAC_04", name: "M.G" },
      { teacher_id: "FAC_05", name: "S.P" },
      { teacher_id: "FAC_06", name: "Ms.SP" }
    ];
    
    for (let fac of faculties) {
      await Teacher.findOneAndUpdate(
        { name: fac.name },
        { 
          $set: { 
            name: fac.name, 
            teacher_id: fac.teacher_id,
            department: "EXTC",
            maxLectures: 20
          },
          $addToSet: { classNames: "SE" }
        },
        { upsert: true, new: true }
      );
    }
    console.log("✅ SE Faculties seeded");

    // 3. Rooms
    const labRooms = ["407", "411B", "411"];
    for (let rm of labRooms) {
      await Room.findOneAndUpdate(
        { room_no: rm },
        { 
          $set: { room_no: rm, capacity: 30, type: "Lab" },
          $addToSet: { classNames: "SE" } 
        },
        { upsert: true, new: true }
      );
    }

    // Classroom
    await Room.findOneAndUpdate(
      { room_no: "417" },
      { 
        $set: { room_no: "417", capacity: 80, type: "Classroom" },
        $addToSet: { classNames: "SE" } 
      },
      { upsert: true, new: true }
    );
    console.log("✅ SE Rooms seeded");

    // 4. Batches
    const batches = ["A", "B", "C", "D"];
    for (let b of batches) {
       await Batch.findOneAndUpdate(
         { name: b, year: "SE" },
         { $set: { name: b, year: "SE", division: "A", semester: 3 } },
         { upsert: true, new: true }
       );
    }
    console.log("✅ SE Batches seeded");

    mongoose.disconnect();
    console.log("✅ SE Seeding Completed!");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    mongoose.disconnect();
  }
};

runSeed();
