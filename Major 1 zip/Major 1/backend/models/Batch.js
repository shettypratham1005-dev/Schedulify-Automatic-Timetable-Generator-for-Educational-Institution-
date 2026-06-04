const mongoose = require('mongoose');

// Batch Schema
const batchSchema = new mongoose.Schema({
    name: {
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
    students: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique batch per department and year
batchSchema.index({ name: 1, department: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Batch', batchSchema);
