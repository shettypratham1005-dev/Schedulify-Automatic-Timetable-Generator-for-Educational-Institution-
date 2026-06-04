const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    sub_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Theory", "Lab"], required: true },
    credits: { type: Number, min: 1, max: 10 },

    // ✅ ADD THIS
    className: {
        type: String,
        enum: ["SE", "TE", "BE"],
        required: true
    },
    semester: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.models.Subject || mongoose.model("Subject", subjectSchema, "subjects");