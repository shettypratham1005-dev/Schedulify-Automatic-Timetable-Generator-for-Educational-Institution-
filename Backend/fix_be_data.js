const mongoose = require("mongoose");
const Subject = require("./models/subject");

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function cleanup() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for cleanup.");

    // 1. Delete all subjects where semester is null or undefined
    const deleteResult = await Subject.deleteMany({
      $or: [
        { semester: { $exists: false } },
        { semester: null }
      ]
    });
    console.log(`Deleted ${deleteResult.deletedCount} subjects with undefined/null semesters.`);

    // 2. Ensure BE Lab subjects for Sem 7 exist
    const beLabsSem7 = [
        { sub_id: "S_BE_7_MCS_Lab", name: "MCS Lab", type: "Lab", className: "BE", semester: 7, credits: 2 },
        { sub_id: "S_BE_7_ME_Lab", name: "ME Lab", type: "Lab", className: "BE", semester: 7, credits: 2 }
    ];

    for (const lab of beLabsSem7) {
        await Subject.findOneAndUpdate(
            { name: lab.name, className: "BE", semester: 7 },
            { $set: lab },
            { upsert: true, new: true }
        );
        console.log(`Ensured ${lab.name} exists for Sem 7 BE.`);
    }

    console.log("Cleanup and remediation complete.");
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

cleanup();
