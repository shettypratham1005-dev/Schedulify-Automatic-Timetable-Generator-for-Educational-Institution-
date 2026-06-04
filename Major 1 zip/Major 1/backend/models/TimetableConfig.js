const mongoose = require('mongoose');

// TimetableConfig Schema - Stores configurable timing rules
const timetableConfigSchema = new mongoose.Schema({
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
    // Time Configuration
    startTime: {
        type: String,
        default: '08:15' // Default college start time
    },
    lectureDuration: {
        type: Number,
        default: 60, // minutes
        min: 30,
        max: 120
    },
    // Short Break Configuration
    shortBreakDuration: {
        type: Number,
        default: 15, // minutes
        min: 5,
        max: 30
    },
    shortBreakAfterLectures: {
        type: Number,
        default: 2,
        min: 1,
        max: 4
    },
    // Lunch Break Configuration
    lunchBreakDuration: {
        type: Number,
        default: 60, // minutes
        min: 30,
        max: 90
    },
    lunchBreakAfterLectures: {
        type: Number,
        default: 4,
        min: 3,
        max: 6
    },
    // Faculty Load Configuration
    maxFacultyLecturesPerWeek: {
        type: Number,
        default: 8,
        min: 4,
        max: 12
    },
    // Working Days
    workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
timetableConfigSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Compound index for unique config per department and year
timetableConfigSchema.index({ department: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('TimetableConfig', timetableConfigSchema);
