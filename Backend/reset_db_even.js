const mongoose = require("mongoose");
const Teacher = require("./models/teacher");
const Subject = require("./models/subject");
const Room = require("./models/room");
const Batch = require("./models/batch");
const Timetable = require("./models/timetable");
const config = require("./config/timetableConfig");

const MONGO_URI = "mongodb://127.0.0.1:27017/Timetable";

async function resetAndSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Timetable DB");

    // 1. DELETE EXISTING DATA (EXCEPT USERS)
    console.log("Cleaning database...");
    await Promise.all([
        Teacher.deleteMany({}),
        Subject.deleteMany({}),
        Room.deleteMany({}),
        Batch.deleteMany({}),
        Timetable.deleteMany({})
    ]);

    // 2. SEED TEACHERS (Unique from config 4, 6, 8)
    const teachers = new Set();
    [4, 6, 8].forEach(sem => {
        config[sem].subjects.forEach(s => {
            if (s.faculty && s.faculty !== "ANY") teachers.add(s.faculty);
        });
    });

    const teacherDocs = Array.from(teachers).map(name => ({
        teacher_id: `T_${name.replace(/\./g, "").toUpperCase()}`,
        name,
        department: "IT",
        maxLectures: 24,
        classNames: ["SE", "TE", "BE"]
    }));
    await Teacher.insertMany(teacherDocs);
    console.log(`✅ Seeded ${teacherDocs.length} Teachers`);

    // 3. SEED ROOMS (From config + some extras)
    const classrooms = ["415", "416", "417", "218", "409"];
    const labs = ["410A", "410B", "401", "402", "403", "407", "411", "411B", "317"];
    
    const roomDocs = [
        ...classrooms.map(no => ({ room_id: `R_${no}`, room_no: no, type: "Lecture", capacity: 60 })),
        ...labs.map(no => ({ room_id: `R_${no}`, room_no: no, type: "Lab", capacity: 25 }))
    ];
    await Room.insertMany(roomDocs);
    console.log(`✅ Seeded ${roomDocs.length} Rooms`);

    // 4. SEED SUBJECTS (4, 6, 8 ONLY)
    const subjectDocs = [];
    [4, 6, 8].forEach(sem => {
        const className = config[sem].className;
        config[sem].subjects.forEach((s, idx) => {
            subjectDocs.push({
                sub_id: `S${sem}_${idx}`,
                name: s.name,
                type: s.type === "Practical" ? "Lab" : "Theory",
                className,
                semester: sem,
                credits: 3
            });
        });
    });
    await Subject.insertMany(subjectDocs);
    console.log(`✅ Seeded ${subjectDocs.length} Subjects (Sems 4, 6, 8)`);

    // 5. SEED BATCHES (A, B, C, D for SE, TE, BE)
    const batchDocs = [];
    const yrToSem = { "SE": 4, "TE": 6, "BE": 8 };
    ["SE", "TE", "BE"].forEach(year => {
        ["A", "B", "C", "D"].forEach(name => {
            batchDocs.push({
                batch_id: `B_${year}_${name}`,
                name: `Batch ${name}`,
                year,
                division: name, // Using name as division
                semester: yrToSem[year],
                size: 20
            });
        });
    });
    await Batch.insertMany(batchDocs);
    console.log(`✅ Seeded ${batchDocs.length} Batches`);

    console.log("🎉 Database RESET and SEEDED for Even Semesters!");
    process.exit(0);

  } catch (err) {
    console.error("🔥 Reset failed:", err);
    process.exit(1);
  }
}

resetAndSeed();
