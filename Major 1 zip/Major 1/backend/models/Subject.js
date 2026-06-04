const mongoose = require('mongoose');

// Subject Schema
const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    year: {
        type: String,
        required: true,
        enum: ['SE', 'TE', 'BE']
    },
    isLab: {
        type: Boolean,
        default: false
    },
    lectureDuration: {
        type: Number,
        default: 1 // in hours
    },
    labDuration: {
        type: Number,
        default: 2 // in hours
    },
    lecturesPerWeek: {
        type: Number,
        default: 4
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique subject per department and year
subjectSchema.index({ code: 1, department: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
