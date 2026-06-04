const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    year: { type: String, required: true, enum: ["SE", "TE", "BE"] },
    division: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 }
});

module.exports = mongoose.models.Batch || mongoose.model("Batch", batchSchema, "batch");