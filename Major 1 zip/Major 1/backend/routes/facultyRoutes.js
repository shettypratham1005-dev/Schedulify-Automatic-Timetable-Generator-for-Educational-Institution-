const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// Get all faculty
router.get('/', async (req, res) => {
    try {
        const { department } = req.query;
        let query = {};
        
        if (department) {
            query.department = department;
        }
        
        const faculty = await Faculty.find(query)
            .populate('department', 'name fullName')
            .populate('subjects', 'name code')
            .sort({ name: 1 });
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single faculty
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
            .populate('department', 'name fullName')
            .populate('subjects', 'name code');
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create faculty
router.post('/', async (req, res) => {
    try {
        const { name, employeeId, email, phone, department, subjects, maxLecturesPerWeek } = req.body;
        
        const faculty = new Faculty({
            name,
            employeeId,
            email,
            phone,
            department,
            subjects: subjects || [],
            maxLecturesPerWeek: maxLecturesPerWeek || 8
        });
        
        await faculty.save();
        const populatedFaculty = await Faculty.findById(faculty._id)
            .populate('department', 'name fullName')
            .populate('subjects', 'name code');
        res.status(201).json(populatedFaculty);
    } catch (error) {
        console.error('Error creating faculty:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Faculty with this employee ID already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update faculty
router.put('/:id', async (req, res) => {
    try {
        const { name, employeeId, email, phone, department, subjects, maxLecturesPerWeek, isAvailable } = req.body;
        
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            {
                name,
                employeeId,
                email,
                phone,
                department,
                subjects,
                maxLecturesPerWeek,
                isAvailable
            },
            { new: true, runValidators: true }
        ).populate('department', 'name fullName').populate('subjects', 'name code');
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        res.json(faculty);
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete faculty
router.delete('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
