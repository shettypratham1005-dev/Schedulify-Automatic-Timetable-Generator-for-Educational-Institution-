const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');

// Get all batches
router.get('/', async (req, res) => {
    try {
        const { department, year } = req.query;
        let query = {};
        
        if (department) {
            query.department = department;
        }
        if (year) {
            query.year = year;
        }
        
        const batches = await Batch.find(query)
            .populate('department', 'name fullName')
            .sort({ name: 1 });
        res.json(batches);
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single batch
router.get('/:id', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('department', 'name fullName');
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        res.json(batch);
    } catch (error) {
        console.error('Error fetching batch:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create batch
router.post('/', async (req, res) => {
    try {
        const { name, department, year, students } = req.body;
        
        const batch = new Batch({
            name,
            department,
            year,
            students: students || []
        });
        
        await batch.save();
        const populatedBatch = await Batch.findById(batch._id)
            .populate('department', 'name fullName');
        res.status(201).json(populatedBatch);
    } catch (error) {
        console.error('Error creating batch:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Batch already exists for this department and year' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update batch
router.put('/:id', async (req, res) => {
    try {
        const { name, department, year, students, isActive } = req.body;
        
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { name, department, year, students, isActive },
            { new: true, runValidators: true }
        ).populate('department', 'name fullName');
        
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        
        res.json(batch);
    } catch (error) {
        console.error('Error updating batch:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete batch
router.delete('/:id', async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        console.error('Error deleting batch:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
