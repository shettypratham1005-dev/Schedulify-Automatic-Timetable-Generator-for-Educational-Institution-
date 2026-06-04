const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');

// Get all classrooms
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        
        if (type) {
            query.type = type;
        }
        
        const classrooms = await Classroom.find(query).sort({ roomNumber: 1 });
        res.json(classrooms);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single classroom
router.get('/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom);
    } catch (error) {
        console.error('Error fetching classroom:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create classroom
router.post('/', async (req, res) => {
    try {
        const { roomNumber, type, capacity, isAvailable } = req.body;
        
        const classroom = new Classroom({
            roomNumber,
            type: type || 'classroom',
            capacity: capacity || 60,
            isAvailable: isAvailable !== false
        });
        
        await classroom.save();
        res.status(201).json(classroom);
    } catch (error) {
        console.error('Error creating classroom:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Classroom with this room number already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update classroom
router.put('/:id', async (req, res) => {
    try {
        const { roomNumber, type, capacity, isAvailable } = req.body;
        
        const classroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            { roomNumber, type, capacity, isAvailable },
            { new: true, runValidators: true }
        );
        
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        
        res.json(classroom);
    } catch (error) {
        console.error('Error updating classroom:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete classroom
router.delete('/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findByIdAndDelete(req.params.id);
        
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        
        res.json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize default classrooms
router.post('/initialize', async (req, res) => {
    try {
        const defaultClassrooms = [
            { roomNumber: '415', type: 'classroom', capacity: 60 },
            { roomNumber: '416', type: 'classroom', capacity: 60 },
            { roomNumber: '409', type: 'lab', capacity: 30 },
            { roomNumber: '411B', type: 'lab', capacity: 30 },
            { roomNumber: '407', type: 'lab', capacity: 30 },
            { roomNumber: '410A', type: 'lab', capacity: 30 },
            { roomNumber: '402', type: 'lab', capacity: 30 }
        ];
        
        for (const classroom of defaultClassrooms) {
            const exists = await Classroom.findOne({ roomNumber: classroom.roomNumber });
            if (!exists) {
                await Classroom.create(classroom);
            }
        }
        
        const classrooms = await Classroom.find().sort({ roomNumber: 1 });
        res.json({ message: 'Default classrooms initialized', classrooms });
    } catch (error) {
        console.error('Error initializing classrooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
