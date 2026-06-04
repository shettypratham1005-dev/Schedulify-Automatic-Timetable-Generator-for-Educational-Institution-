const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },

  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false },
  subjectLabel: { type: String, default: null },

  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
  facultyLabel: { type: String, default: null },

  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
  roomLabel: { type: String, default: null },

  className: {
    type: String,
    enum: ["SE", "TE", "BE"],
    required: true
  },

  semester: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ["Lecture", "Practical", "Tutorial", "Project"], // Added Project
    required: true
  },

  batch: {
    type: String,
    default: null
  },
  isParallel: {
    type: String,
    default: null
  }
});

console.log("✅ Timetable Model Loaded. Allowed Types:", timetableSchema.path('type').options.enum);

module.exports = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);