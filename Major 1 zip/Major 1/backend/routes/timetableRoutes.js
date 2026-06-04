const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const TimetableConfig = require('../models/TimetableConfig');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');
const Batch = require('../models/Batch');
const Department = require('../models/Department');
const { generateTimetable, DAYS } = require('../utils/timetableGenerator');

// Get all timetables
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
        
        const timetables = await Timetable.find(query)
            .populate('department', 'name fullName')
            .sort({ generatedAt: -1 });
        res.json(timetables);
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single timetable
router.get('/:id', async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate('department', 'name fullName');
        
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        res.json(timetable);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get timetable configuration
router.get('/config/:departmentId/:year', async (req, res) => {
    try {
        const { departmentId, year } = req.params;
        
        const config = await TimetableConfig.findOne({ department: departmentId, year });
        
        if (!config) {
            // Return default configuration
            return res.json({
                startTime: '08:15',
                lectureDuration: 60,
                shortBreakDuration: 15,
                shortBreakAfterLectures: 2,
                lunchBreakDuration: 60,
                lunchBreakAfterLectures: 4,
                maxFacultyLecturesPerWeek: 8,
                workingDays: DAYS
            });
        }
        
        res.json(config);
    } catch (error) {
        console.error('Error fetching timetable config:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save timetable configuration
router.post('/config', async (req, res) => {
    try {
        const { 
            department, 
            year, 
            startTime, 
            lectureDuration, 
            shortBreakDuration, 
            shortBreakAfterLectures, 
            lunchBreakDuration, 
            lunchBreakAfterLectures, 
            maxFacultyLecturesPerWeek,
            workingDays 
        } = req.body;
        
        if (!department || !year) {
            return res.status(400).json({ message: 'Department and year are required' });
        }
        
        // Upsert configuration
        const config = await TimetableConfig.findOneAndUpdate(
            { department, year },
            {
                department,
                year,
                startTime: startTime || '08:15',
                lectureDuration: lectureDuration || 60,
                shortBreakDuration: shortBreakDuration || 15,
                shortBreakAfterLectures: shortBreakAfterLectures || 2,
                lunchBreakDuration: lunchBreakDuration || 60,
                lunchBreakAfterLectures: lunchBreakAfterLectures || 4,
                maxFacultyLecturesPerWeek: maxFacultyLecturesPerWeek || 8,
                workingDays: workingDays || DAYS
            },
            { upsert: true, new: true }
        );
        
        res.json(config);
    } catch (error) {
        console.error('Error saving timetable config:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate timetable
router.post('/generate', async (req, res) => {
    try {
        const { 
            departmentId, 
            year,
            // Configuration options
            startTime,
            lectureDuration,
            shortBreakDuration,
            shortBreakAfterLectures,
            lunchBreakDuration,
            lunchBreakAfterLectures,
            maxFacultyLecturesPerWeek
        } = req.body;
        
        // Validate input
        if (!departmentId || !year) {
            return res.status(400).json({ message: 'Department and year are required' });
        }
        
        // Fetch department
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        // Fetch data
        const subjects = await Subject.find({ department: departmentId, year });
        const faculty = await Faculty.find({ department: departmentId }).populate('subjects');
        const classrooms = await Classroom.find({ type: 'classroom', isAvailable: true });
        const labs = await Classroom.find({ type: 'lab', isAvailable: true });
        const batches = await Batch.find({ department: departmentId, year, isActive: true });
        
        // Validate data exists
        if (subjects.length === 0) {
            return res.status(400).json({ message: 'No subjects found for this department and year' });
        }
        if (faculty.length === 0) {
            return res.status(400).json({ message: 'No faculty found for this department' });
        }
        if (classrooms.length < 1) {
            return res.status(400).json({ message: 'At least 1 classroom required' });
        }
        
        // Build configuration object
        const config = {
            startTime: startTime || '08:15',
            lectureDuration: lectureDuration || 60,
            shortBreakDuration: shortBreakDuration || 15,
            shortBreakAfterLectures: shortBreakAfterLectures || 2,
            lunchBreakDuration: lunchBreakDuration || 60,
            lunchBreakAfterLectures: lunchBreakAfterLectures || 4,
            maxFacultyLecturesPerWeek: maxFacultyLecturesPerWeek || 8,
            workingDays: DAYS
        };
        
        // Save configuration
        await TimetableConfig.findOneAndUpdate(
            { department: departmentId, year },
            { ...config, department: departmentId, year },
            { upsert: true }
        );
        
        // Generate timetable using the new generator
        const result = await generateTimetable(
            departmentId, 
            year, 
            subjects, 
            faculty, 
            classrooms, 
            labs, 
            batches,
            config
        );
        
        // Delete existing timetable for this department and year
        await Timetable.deleteOne({ department: departmentId, year });
        
        // Save new timetable
        const newTimetable = new Timetable({
            department: departmentId,
            year,
            weekData: result.timetable,
            timeSlots: result.timeSlots,
            config: config,
            importantNotes: result.importantNotes,
            facultyLoad: result.facultyLoad
        });
        
        await newTimetable.save();
        
        res.status(201).json({
            success: true,
            message: 'Timetable generated successfully',
            timetable: newTimetable,
            importantNotes: result.importantNotes,
            facultyLoad: result.facultyLoad
        });
    } catch (error) {
        console.error('Error generating timetable:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Delete timetable
router.delete('/:id', async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(req.params.id);
        
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        res.json({ message: 'Timetable deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete timetable by department and year
router.delete('/byDeptYear/:departmentId/:year', async (req, res) => {
    try {
        const { departmentId, year } = req.params;
        
        const result = await Timetable.deleteOne({ department: departmentId, year });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        res.json({ message: 'Timetable deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Download PDF by department and year
router.get('/download/:departmentId/:year', async (req, res) => {
    try {
        const { departmentId, year } = req.params;
        
        const timetable = await Timetable.findOne({ department: departmentId, year })
            .populate('department', 'name fullName');
        
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        const { generateTimetablePDF } = require('../utils/pdfGenerator');
        await generateTimetablePDF(timetable, res);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
