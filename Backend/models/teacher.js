const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    teacher_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    maxLectures: { type: Number, min: 1, max: 40, default: 20 },
    availableSlots: [{ type: String }],

    // ✅ ADD THIS
    classNames: [{
        type: String,
        enum: ["SE", "TE", "BE"]
    }]
});

module.exports = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema, "teacher");