const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Get all subjects
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
        
        const subjects = await Subject.find(query)
            .populate('department', 'name fullName')
            .sort({ name: 1 });
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single subject
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('department', 'name fullName');
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create subject
router.post('/', async (req, res) => {
    try {
        const { name, code, department, year, isLab, lectureDuration, labDuration, lecturesPerWeek } = req.body;
        
        const subject = new Subject({
            name,
            code,
            department,
            year,
            isLab: isLab || false,
            lectureDuration: lectureDuration || 1,
            labDuration: labDuration || 2,
            lecturesPerWeek: lecturesPerWeek || 4
        });
        
        await subject.save();
        const populatedSubject = await Subject.findById(subject._id).populate('department', 'name fullName');
        res.status(201).json(populatedSubject);
    } catch (error) {
        console.error('Error creating subject:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Subject already exists for this department and year' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update subject
router.put('/:id', async (req, res) => {
    try {
        const { name, code, department, year, isLab, lectureDuration, labDuration, lecturesPerWeek } = req.body;
        
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            {
                name,
                code,
                department,
                year,
                isLab,
                lectureDuration,
                labDuration,
                lecturesPerWeek
            },
            { new: true, runValidators: true }
        ).populate('department', 'name fullName');
        
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        res.json(subject);
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete subject
router.delete('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
