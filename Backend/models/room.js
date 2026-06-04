const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  room_no: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 10 },
  type: { type: String, enum: ["Classroom", "Lab", "Lecture"], required: true },

  // ✅ ADD THIS
  classNames: [{
    type: String,
    enum: ["SE", "TE", "BE"]
  }]
});

module.exports = mongoose.models.Room || mongoose.model("Room", roomSchema, "room");