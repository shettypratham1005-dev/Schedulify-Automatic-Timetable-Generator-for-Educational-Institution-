const mongoose = require("mongoose");
const config = require("./config/timetableConfig");
const Subject = require("./models/subject");
const Room = require("./models/room");
const Teacher = require("./models/teacher");

async function sync() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Timetable");
    console.log("Connected to MongoDB for Sync...");

    const sems = [4, 6, 8];
    for (const sem of sems) {
        const c = config[sem];
        for (const s of c.subjects) {
            // Find or Create Subject
            let sub = await Subject.findOne({ name: s.name, semester: sem });
            if (!sub) {
                console.log(`+ Creating Subject: ${s.name} (Sem ${sem})`);
                await Subject.create({
                    name: s.name,
                    code: s.name.toUpperCase().replace(/\s/g, ""),
                    semester: sem,
                    type: s.type,
                    department: "Computer Engineering"
                });
            }

            // Ensure Room exists
            if (s.labRoom) {
                let r = await Room.findOne({ room_no: s.labRoom });
                if (!r) {
                    console.log(`+ Creating Room: ${s.labRoom} (Lab)`);
                    await Room.create({ room_no: s.labRoom, type: "Lab", capacity: 30 });
                }
            }
        }
        
        // Ensure Theory Rooms exist
        if (c.lectureRooms) {
            for (const rn of c.lectureRooms) {
                let r = await Room.findOne({ room_no: rn });
                if (!r) {
                    console.log(`+ Creating Room: ${rn} (Theory)`);
                    await Room.create({ room_no: rn, type: "Theory", capacity: 70 });
                }
            }
        }
    }
    
    console.log("Sync Complete.");
    process.exit(0);
}

sync();
