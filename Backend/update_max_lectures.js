const mongoose = require("mongoose");
const Teacher = require("./models/teacher");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/timetable";

async function updateMaxLectures() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await Teacher.updateMany(
      { maxLectures: { $exists: false } },
      { $set: { maxLectures: 20 } }
    );

    console.log(`✅ Updated ${result.modifiedCount} faculty members with default maxLectures: 20.`);
    
    // Also update those that are null or 0 if any
    const result2 = await Teacher.updateMany(
      { $or: [{ maxLectures: null }, { maxLectures: 0 }] },
      { $set: { maxLectures: 20 } }
    );
    console.log(`✅ Updated ${result2.modifiedCount} more faculty members who had null/0 maxLectures.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating maxLectures:", err);
    process.exit(1);
  }
}

updateMaxLectures();
