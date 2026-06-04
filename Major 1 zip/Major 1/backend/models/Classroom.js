const mongoose = require('mongoose');

// Classroom Schema
const classroomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['classroom', 'lab'],
        default: 'classroom'
    },
    capacity: {
        type: Number,
        default: 60
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Classroom', classroomSchema);
