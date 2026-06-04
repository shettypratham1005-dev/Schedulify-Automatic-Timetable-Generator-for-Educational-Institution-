const mongoose = require('mongoose');
const Batch = require('./models/batch');

const MONGODB_URI = "mongodb://127.0.0.1:27017/Timetable";

async function fixBatches() {
    try {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB connected");

        const targetConfigs = [
            { yr: "SE", sem: 4 },
            { yr: "BE", sem: 8 }
        ];
        for (const config of targetConfigs) {
            const yr = config.yr;
            const sem = config.sem;
            const existingD = await Batch.findOne({ year: yr, name: "Batch D" });
            if (!existingD) {
                const newBatch = new Batch({
                    name: "Batch D",
                    year: yr,
                    division: "D",
                    semester: sem
                });
                await newBatch.save();
                console.log(`✅ Added Batch D for ${yr} (Sem ${sem})`);
            } else {
                console.log(`ℹ️ Batch D already exists for ${yr}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("🔥 Error fixing batches:", err);
        process.exit(1);
    }
}

fixBatches();
