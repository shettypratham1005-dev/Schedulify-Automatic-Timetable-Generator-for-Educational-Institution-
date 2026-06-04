const mongoose = require("mongoose");
const config = require("./config/timetableConfig");
const Teacher = require("./models/teacher");
const Subject = require("./models/subject");
const Batch = require("./models/batch");

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function verify() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const sems = [4, 6, 8];
    const teachers = await Teacher.find().lean();
    const tNames = teachers.map(t => t.name.toLowerCase());

    const subjects = await Subject.find().lean();
    const sNames = subjects.map(s => s.name.toLowerCase());

    const batches = await Batch.find().lean();

    console.log("\n--- CONFIG VERIFICATION (Even Semesters: 4, 6, 8) ---");

    for (const sem of sems) {
      const semConfig = config[sem];
      if (!semConfig) {
          console.error(`❌ Missing config for Sem ${sem}`);
          continue;
      }
      
      console.log(`\nSEM ${sem} (${semConfig.className}):`);
      for (const s of semConfig.subjects) {
          // Check Subject
          if (!sNames.includes(s.name.toLowerCase())) {
              console.warn(`  ⚠️ Subject '${s.name}' not found in DB.`);
          } else {
              console.log(`  ✅ Subject '${s.name}' matched.`);
          }

          // Check Faculty (unless ANY)
          if (s.faculty !== "ANY") {
            if (!tNames.includes(s.faculty.toLowerCase())) {
                console.warn(`  ⚠️ Faculty '${s.faculty}' for '${s.name}' not found in DB.`);
            } else {
                console.log(`  ✅ Faculty '${s.faculty}' matched.`);
            }
          }
      }
    }

    console.log("\nVerification complete.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
