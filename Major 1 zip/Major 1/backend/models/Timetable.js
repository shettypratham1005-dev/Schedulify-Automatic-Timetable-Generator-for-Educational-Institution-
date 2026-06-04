const mongoose = require('mongoose');

// Timetable Schema - Stores the generated timetable
const timetableSchema = new mongoose.Schema({
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
    weekData: {
        type: Map,
        of: Array,
        required: true
    },
    // New fields for dynamic configuration
    timeSlots: {
        type: Array,
        default: []
    },
    config: {
        type: Object,
        default: {}
    },
    importantNotes: {
        type: [String],
        default: []
    },
    facultyLoad: {
        type: Array,
        default: []
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Compound index for unique timetable per department and year
timetableSchema.index({ department: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
