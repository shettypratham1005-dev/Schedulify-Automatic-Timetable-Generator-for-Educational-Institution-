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
      { name: "ENAS", className: "SE" },
      { name: "DSD", className: "SE" },
      { name: "EDC", className: "SE" },
      { name: "EM", className: "SE" },
      { name: "EVS", className: "SE" },
      { name: "OE", className: "SE" },
    ];

    for (let sub of subjects) {
      // Upsert
      await Subject.findOneAndUpdate(
        { name: sub.name, className: sub.className },
        { $set: sub },
        { upsert: true, new: true }
      );
    }
    console.log("✅ SE Subjects seeded");

    // 2. Faculty
    const faculties = ["DR V.G", "T.S", "B.G", "M.G", "S.P", "Ms.SP"];
    for (let fac of faculties) {
      await Teacher.findOneAndUpdate(
        { name: fac },
        { 
          $set: { name: fac },
          $addToSet: { classNames: "SE" } // Ensure SE is in the array
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
          $set: { room_no: rm, type: "Lab" },
          $addToSet: { classNames: "SE" } 
        },
        { upsert: true, new: true }
      );
    }

    // Classroom
    await Room.findOneAndUpdate(
      { room_no: "417" },
      { 
        $set: { room_no: "417", type: "Classroom" },
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
