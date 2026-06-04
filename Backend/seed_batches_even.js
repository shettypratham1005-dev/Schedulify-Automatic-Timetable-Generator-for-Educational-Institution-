const mongoose = require("mongoose");
const Batch = require("./models/batch");

async function seed() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Timetable");
    console.log("Connected to MongoDB for Batch Seed...");

    await Batch.deleteMany({ semester: { $in: [4, 6, 8] } });

    const data = [
        // Semester 4 (3 batches)
        { name: "Batch A", year: "SE", division: "A", semester: 4 },
        { name: "Batch B", year: "SE", division: "B", semester: 4 },
        { name: "Batch C", year: "SE", division: "C", semester: 4 },
        
        // Semester 6 (4 batches)
        { name: "Batch A", year: "TE", division: "A", semester: 6 },
        { name: "Batch B", year: "TE", division: "B", semester: 6 },
        { name: "Batch C", year: "TE", division: "C", semester: 6 },
        { name: "Batch D", year: "TE", division: "D", semester: 6 },

        // Semester 8 (3 batches)
        { name: "Batch A", year: "BE", division: "A", semester: 8 },
        { name: "Batch B", year: "BE", division: "B", semester: 8 },
        { name: "Batch C", year: "BE", division: "C", semester: 8 }
    ];

    await Batch.insertMany(data);
    console.log("✅ Batches Seeded Correctly.");
    process.exit(0);
}

seed();
