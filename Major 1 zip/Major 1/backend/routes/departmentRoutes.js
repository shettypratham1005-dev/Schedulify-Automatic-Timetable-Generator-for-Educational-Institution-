const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single department
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create department
router.post('/', async (req, res) => {
    try {
        const { name, fullName } = req.body;
        
        // Check if department already exists
        const existingDept = await Department.findOne({ name: name.toUpperCase() });
        if (existingDept) {
            return res.status(400).json({ message: 'Department already exists' });
        }
        
        const department = new Department({
            name: name.toUpperCase(),
            fullName
        });
        
        await department.save();
        res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    try {
        const { name, fullName } = req.body;
        
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { name: name.toUpperCase(), fullName },
            { new: true, runValidators: true }
        );
        
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
