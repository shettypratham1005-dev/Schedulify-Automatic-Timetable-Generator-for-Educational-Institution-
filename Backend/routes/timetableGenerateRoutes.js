const express = require("express");
const router = express.Router();

// ✅ Correctly import models (ensure file names in /models match exactly)
const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Room = require("../models/room");
const Batch = require("../models/batch");
const Timetable = require("../models/timetable");

// ✅ POST route: Generate a sample timetable entry
router.post("/", async (req, res) => {
  try {
    // Fetch one record from each collection
    const teacher = await Teacher.findOne();
    const subject = await Subject.findOne();
    const room = await Room.findOne();
    const batch = await Batch.findOne();

    // Validate presence of required data
    if (!teacher || !subject || !room || !batch) {
      return res.status(400).json({
        error: "Not enough data in the database to generate a timetable entry.",
      });
    }

    // Create a new timetable entry
    const timetable = new Timetable({
      timetable_id: "TTGEN1",
      day: "Monday",
      slot: "9AM-10AM",
      teacher_id: teacher.teacher_id,
      sub_id: subject.sub_id,
      room_id: room.room_id,
      batch_id: batch.batch_id,
    });

    // Save it to MongoDB
    await timetable.save();

    // Respond to client
    res.status(201).json({
      message: "✅ Timetable generated successfully!",
      timetable,
    });
  } catch (err) {
    console.error("Error generating timetable:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
