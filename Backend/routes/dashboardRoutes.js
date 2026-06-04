const express = require("express");
const router = express.Router();
const Timetable = require("../models/timetable");
const Teacher = require("../models/teacher");
const Room = require("../models/room");
const config = require("../config/timetableConfig");
const auth = require("../middleware/auth");

// 1. DASHBOARD SUMMARY
router.get("/summary", auth, async (req, res) => {
    try {
        const [teachers, rooms, entries] = await Promise.all([
            Teacher.countDocuments(),
            Room.countDocuments(),
            Timetable.countDocuments()
        ]);

        // Count subjects from config (the real source of truth)
        let totalSubjects = 0;
        let theoryCount = 0;
        let practicalCount = 0;

        [4, 6, 8].forEach(sem => {
            if (config[sem] && config[sem].subjects) {
                config[sem].subjects.forEach(sub => {
                    totalSubjects++;
                    if (sub.type === "Lecture" || sub.type === "Tutorial") {
                        theoryCount++;
                    } else if (sub.type === "Practical") {
                        practicalCount++;
                    }
                });
            }
        });

        res.status(200).json({
            semesters: [4, 6, 8],
            batches: 12,
            totalSubjects,
            totalFaculty: teachers,
            totalRooms: rooms,
            breakdown: {
                theory: theoryCount,
                practical: practicalCount
            },
            totalEntries: entries
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. FACULTY WORKLOAD
router.get("/faculty-workload", auth, async (req, res) => {
    try {
        const teachers = await Teacher.find({});
        const entries = await Timetable.find({});

        const workload = teachers.map(t => {
            const facultyEntries = entries.filter(e => 
                String(e.faculty) === String(t._id) || e.facultyLabel === t.name
            );

            let lectures = 0;
            let practicals = 0;
            let tutorials = 0;
            let totalHours = 0;

            const subjectsAssigned = [];

            facultyEntries.forEach(e => {
                if (e.type === "Lecture") {
                    lectures++;
                    totalHours += 1;
                } else if (e.type === "Practical") {
                    practicals++;
                    totalHours += 2; // Each Practical entry is 2 hours
                } else if (e.type === "Tutorial") {
                    tutorials++;
                    totalHours += 1;
                }

                if (e.subjectLabel && !subjectsAssigned.includes(e.subjectLabel)) {
                    subjectsAssigned.push(e.subjectLabel);
                }
            });

            return {
                id: t._id,
                name: t.name,
                department: t.department,
                lectures,
                practicals,
                tutorials,
                totalHours,
                subjects: subjectsAssigned,
                status: totalHours > 15 ? "Overload" : totalHours < 8 ? "Underload" : "Balanced"
            };
        });

        res.status(200).json(workload.sort((a, b) => b.totalHours - a.totalHours));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. DAILY UTILIZATION (Used vs Free Slots)
router.get("/utilization", auth, async (req, res) => {
    try {
        const rooms = await Room.countDocuments();
        const entries = await Timetable.find({});
        
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const totalSlotsPerDay = 7 * rooms; // 7 slots per room per day

        const utilization = days.map(day => {
            const dayEntries = entries.filter(e => e.day === day);
            
            // Count total slots occupied (Practicals count as 2 slots)
            let occupied = 0;
            dayEntries.forEach(e => {
                occupied += (e.type === "Practical" ? 2 : 1);
            });

            return {
                day,
                occupied,
                free: Math.max(0, totalSlotsPerDay - occupied),
                utilPercent: Math.min(100, Math.round((occupied / totalSlotsPerDay) * 100))
            };
        });

        res.status(200).json(utilization);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. SEMESTER-WISE BREAKDOWN
router.get("/semester-breakdown", auth, async (req, res) => {
    try {
        const entries = await Timetable.find({});
        const sems = [4, 6, 8];
        const breakdown = sems.map(sem => {
            const semEntries = entries.filter(e => e.semester === sem);
            const classesString = sem === 4 ? "SE" : sem === 6 ? "TE" : "BE";
            let lectures = 0;
            let practicals = 0;
            const facultySet = new Set();
            
            semEntries.forEach(e => {
                if (e.type === "Lecture") lectures++;
                if (e.type === "Practical") practicals++;
                if (e.facultyLabel) facultySet.add(e.facultyLabel);
            });

            let specialRules = [];
            if (sem === 4) specialRules = [];
            else if (sem === 6) specialRules = ["Thursday/Friday Mini Project"];
            else if (sem === 8) specialRules = ["Thursday PAT", "Friday Major Project", "Honors"];

            return {
                semester: sem,
                className: classesString,
                lectures,
                practicals,
                facultyAssigned: facultySet.size,
                specialRules
            };
        });
        res.status(200).json(breakdown);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. PRACTICAL SCHEDULING INSIGHTS
router.get("/practical-insights", auth, async (req, res) => {
    try {
        const entries = await Timetable.find({ type: "Practical" });
        
        // Find simultaneous practicals
        const simultaneousCount = entries.filter(e => e.batch && e.batch.includes("Batch")).length;
        
        // Group by day and time to find synchronized blocks
        const blocks = {};
        entries.forEach(e => {
            const key = `${e.day}_${e.startTime}`;
            if (!blocks[key]) blocks[key] = [];
            blocks[key].push(e);
        });

        const synchronizedBlocks = Object.values(blocks).filter(arr => arr.length > 1).length;

        // Lab Utilization
        const labUtil = {};
        entries.forEach(e => {
            if (e.roomLabel) {
                labUtil[e.roomLabel] = (labUtil[e.roomLabel] || 0) + 1;
            }
        });

        const labUtilization = Object.keys(labUtil).map(room => ({
            room,
            sessions: labUtil[room]
        }));

        res.status(200).json({
            simultaneousBatchesRunning: simultaneousCount,
            synchronizedBlocks,
            labUtilization: labUtilization.sort((a,b) => b.sessions - a.sessions)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
