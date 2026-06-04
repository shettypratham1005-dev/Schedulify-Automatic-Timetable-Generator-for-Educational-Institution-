const express = require("express");
const router = express.Router();
const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Room = require("../models/room");
const Batch = require("../models/batch");
const Timetable = require("../models/timetable");

// Generate timetable (demo/test)
router.post("/generate", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    const subjects = await Subject.find();
    const rooms = await Room.find();
    const batches = await Batch.find();

    if (!teachers.length || !subjects.length || !rooms.length || !batches.length) {
      return res.status(400).json({ error: "Missing teachers, subjects, rooms, or batches" });
    }

    let timetable = [];

    batches.forEach((batch) => {
      subjects.forEach((subject) => {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];

        timetable.push({
          day: "Monday",             // example day
          time: "08:15-09:15",       // example slot
          faculty: teacher._id,
          subject: subject._id,
          room: room._id,
          batch: batch._id,
          type: "Lecture",           // default type
          className: batch.year       // TE/BE/SE
        });
      });
    });

    // Save timetable entries
    await Timetable.insertMany(timetable);

    res.json({ message: "Timetable generated successfully", data: timetable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;