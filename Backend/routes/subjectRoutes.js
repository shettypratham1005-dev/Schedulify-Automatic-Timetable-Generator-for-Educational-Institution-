const express = require("express");
const router = express.Router();
const Subject = require("../models/subject");

// Create Subject
router.post("/", async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Subjects (Filtered by class OR all)
router.get("/", async (req, res) => {
  try {
    const { className } = req.query;

    let filter = {};
    if (className) {
      filter.className = className;
    }

    const subjects = await Subject.find(filter);
    res.json(subjects);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Subject by sub_id
router.get("/:sub_id", async (req, res) => {
  try {
    const subject = await Subject.findOne({ sub_id: req.params.sub_id });
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE by MongoDB _id
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE Subject by _id
router.put("/:id", async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        subject_id: req.body.subject_id,
        name: req.body.name,
        type: req.body.type,
        credits: req.body.credits,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(updatedSubject); // return updated subject
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router; // <-- moved to the end
