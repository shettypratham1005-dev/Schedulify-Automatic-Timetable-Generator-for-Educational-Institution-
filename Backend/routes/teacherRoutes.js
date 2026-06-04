const express = require("express");
const router = express.Router();
const Teacher = require("../models/teacher");

// ----------------- CREATE Teacher -----------------
router.post("/", async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------- GET all Teachers for dropdown -----------------
router.get("/", async (req, res) => {
  try {
    const { className } = req.query;

    let filter = {};
    if (className) {
      // Teachers who teach this class
      filter.classNames = className;
    }

    const teachers = await Teacher.find(filter);
    res.json(teachers);

  } catch (err) {
    console.error("🔥 /api/faculties GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------- GET all Teachers (full data with lecture counts) -----------------
router.get("/all", async (req, res) => {
  try {
    const Teacher = require("../models/teacher");
    const Timetable = require("../models/timetable");
    
    const [teachers, timetables] = await Promise.all([
      Teacher.find().lean(),
      Timetable.find().lean()
    ]);

    const TIMES = ["08:15", "09:15", "10:15", "10:30", "11:30", "12:30", "01:30", "02:30", "03:30", "04:30"];

    // Calculate actual hours (slots) per teacher
    const teacherWorkload = {};
    timetables.forEach(t => {
      if (t.faculty) {
        const fid = t.faculty.toString();
        const startIdx = TIMES.indexOf(t.startTime);
        const endIdx = TIMES.indexOf(t.endTime);
        
        let duration = 1;
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          duration = endIdx - startIdx;
        }

        console.log(`[Workload] Faculty: ${fid}, Session: ${t.startTime}-${t.endTime}, Duration: ${duration}`);
        teacherWorkload[fid] = (teacherWorkload[fid] || 0) + duration;
      }
    });

    const enrichedTeachers = teachers.map(t => {
      const workload = teacherWorkload[t._id.toString()] || 0;
      console.log(`[Workload Result] Teacher: ${t.name}, Final Load: ${workload}`);
      return {
        ...t,
        actualLectures: workload
      };
    });

    res.status(200).json(enrichedTeachers);
  } catch (err) {
    console.error("🔥 /api/faculties/all error:", err);
    res.status(500).json({ message: "Failed to fetch teachers with workload" });
  }
});

// ----------------- DELETE Teacher by ID -----------------
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- UPDATE Teacher by ID -----------------
router.put("/:id", async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTeacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(updatedTeacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;