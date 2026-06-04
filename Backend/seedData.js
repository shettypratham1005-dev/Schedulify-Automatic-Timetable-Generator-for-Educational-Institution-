require("dotenv").config();
const mongoose = require("mongoose");

const Teacher = require("./models/teacher");
const Subject = require("./models/subject");
const Room = require("./models/room");
const Batch = require("./models/batch");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/timetableDB";

// --- DATA ---
const teachersList = [
  "Mr.VG", "Ms.TS", "Mr.SP", "Ms.BG", "Mr.MG", "Ms.SP", "Ms.AR", "Ms.SJ",
  "Ms.SK", "Ms.RR", "Mr.GT", "Mr.AV", "Ms.SS", "Ms.AK", "Ms.KS", "Mr.PG",
  "Ms.NG", "Ms.PK", "Mr.TR", "Mr.VP"
];

const roomsList = [
  { no: "417", type: "Classroom" }, { no: "415", type: "Classroom" }, { no: "416", type: "Classroom" },
  { no: "407", type: "Lab" }, { no: "411B", type: "Lab" }, { no: "411", type: "Lab" },
  { no: "401", type: "Lab" }, { no: "402", type: "Lab" }, { no: "403", type: "Lab" },
  { no: "410A", type: "Lab" }, { no: "410B", type: "Lab" }, { no: "409", type: "Lab" },
  { no: "317", type: "Lab" } // Tutorial Room
];

const subjectsData = [
  // SEM 3 (SE)
  { name: "ENAS", className: "SE", semester: 3, type: "Theory" },
  { name: "DSD", className: "SE", semester: 3, type: "Theory" },
  { name: "ED", className: "SE", semester: 3, type: "Theory" },
  { name: "EDC", className: "SE", semester: 3, type: "Theory" },
  { name: "EM", className: "SE", semester: 3, type: "Theory" },
  { name: "EVS", className: "SE", semester: 3, type: "Theory" },
  { name: "OE", className: "SE", semester: 3, type: "Theory" },
  { name: "ENAS Lab", className: "SE", semester: 3, type: "Lab" },
  { name: "DSD Lab", className: "SE", semester: 3, type: "Lab" },
  { name: "EDC Lab", className: "SE", semester: 3, type: "Lab" },

  // SEM 4 (SE)
  { name: "ADC", className: "SE", semester: 4, type: "Theory" },
  { name: "NNFL", className: "SE", semester: 4, type: "Theory" },
  { name: "SES", className: "SE", semester: 4, type: "Theory" },
  { name: "MC", className: "SE", semester: 4, type: "Theory" },
  { name: "MDM", className: "SE", semester: 4, type: "Theory" },
  { name: "BMD", className: "SE", semester: 4, type: "Theory" },
  { name: "DT", className: "SE", semester: 4, type: "Theory" },
  { name: "ADC Lab", className: "SE", semester: 4, type: "Lab" },
  { name: "SES Lab", className: "SE", semester: 4, type: "Lab" },
  { name: "MC Lab", className: "SE", semester: 4, type: "Lab" },
  { name: "MDM Lab", className: "SE", semester: 4, type: "Lab" },

  // SEM 5 (TE)
  { name: "DCOM", className: "TE", semester: 5, type: "Theory" },
  { name: "DTSP", className: "TE", semester: 5, type: "Theory" },
  { name: "DVLSI", className: "TE", semester: 5, type: "Theory" },
  { name: "RSA", className: "TE", semester: 5, type: "Theory" },
  { name: "DSA", className: "TE", semester: 5, type: "Theory" },
  { name: "ST", className: "TE", semester: 5, type: "Theory" },
  { name: "BCE", className: "TE", semester: 5, type: "Theory" },
  { name: "DCOM Lab", className: "TE", semester: 5, type: "Lab" },
  { name: "DVLSI Lab", className: "TE", semester: 5, type: "Lab" },
  { name: "DTSP Lab", className: "TE", semester: 5, type: "Lab" },
  { name: "BCE Tutorial", className: "TE", semester: 5, type: "Lab" },
  { name: "RSA Tutorial", className: "TE", semester: 5, type: "Lab" },

  // SEM 6 (TE)
  { name: "EMA", className: "TE", semester: 6, type: "Theory" },
  { name: "CCN", className: "TE", semester: 6, type: "Theory" },
  { name: "IPMV", className: "TE", semester: 6, type: "Theory" },
  { name: "ANN & FL", className: "TE", semester: 6, type: "Theory" },
  { name: "DBMS", className: "TE", semester: 6, type: "Theory" },
  { name: "IOT", className: "TE", semester: 6, type: "Theory" },
  { name: "EMA Lab", className: "TE", semester: 6, type: "Lab" },
  { name: "CCN Lab", className: "TE", semester: 6, type: "Lab" },
  { name: "IPMV Lab", className: "TE", semester: 6, type: "Lab" },
  { name: "Skill Lab", className: "TE", semester: 6, type: "Lab" },

  // SEM 7 (BE)
  { name: "MCS", className: "BE", semester: 7, type: "Theory" },
  { name: "ME", className: "BE", semester: 7, type: "Theory" },
  { name: "ICE", className: "BE", semester: 7, type: "Theory" },
  { name: "DL", className: "BE", semester: 7, type: "Theory" },
  { name: "CC", className: "BE", semester: 7, type: "Theory" },
  { name: "DMMM", className: "BE", semester: 7, type: "Theory" },
  { name: "MIS", className: "BE", semester: 7, type: "Theory" },
  { name: "MCS Lab", className: "BE", semester: 7, type: "Lab" },
  { name: "ME Lab", className: "BE", semester: 7, type: "Lab" },

  // SEM 8 (BE)
  { name: "OCN", className: "BE", semester: 8, type: "Theory" },
  { name: "NMT", className: "BE", semester: 8, type: "Theory" },
  { name: "WD", className: "BE", semester: 8, type: "Theory" },
  { name: "PM", className: "BE", semester: 8, type: "Theory" },
  { name: "EM", className: "BE", semester: 8, type: "Theory" },
  { name: "OCN Lab", className: "BE", semester: 8, type: "Lab" }
];

const classes = ["SE", "TE", "BE"];
const batches = ["A", "B", "C", "D"];

// --- SEEDER FUNCTION ---
async function seedData() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Database Connected For Seeding");

    // 1. Seed Teachers
    for (const tName of teachersList) {
      await Teacher.findOneAndUpdate(
        { name: tName },
        { 
          teacher_id: "T_" + tName.replace(" ", "_"),
          name: tName,
          department: "IT",
          maxLectures: 20,
          classNames: classes
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log("✅ Teachers Seeded");

    // 2. Seed Rooms
    for (const r of roomsList) {
      await Room.findOneAndUpdate(
        { room_no: r.no },
        {
          room_id: "R_" + r.no,
          room_no: r.no,
          type: r.type,
          capacity: r.type === "Lab" ? 25 : 60,
          classNames: classes
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log("✅ Rooms Seeded");

    // 3. Seed Subjects
    for (let i = 0; i < subjectsData.length; i++) {
      const s = subjectsData[i];
      await Subject.findOneAndUpdate(
        { name: s.name, className: s.className, semester: s.semester },
        {
          sub_id: `SUB_${s.semester}_${i}`,
          name: s.name,
          type: s.type,
          className: s.className,
          semester: s.semester,
          credits: 3
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log("✅ Subjects Seeded");

    // 4. Seed Batches (Required for Practical/Tutorial assignment)
    for (const cls of classes) {
      for (const batchName of batches) {
        await Batch.findOneAndUpdate(
          { name: batchName, year: cls },
          {
            batch_id: `B_${cls}_${batchName}`,
            name: batchName,
            year: cls,
            size: 20
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }
    console.log("✅ Batches Seeded");

    console.log("🎉 All Data Seeded Successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedData();
