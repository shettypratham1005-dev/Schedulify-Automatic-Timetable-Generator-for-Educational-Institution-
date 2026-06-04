const express = require("express");
const router = express.Router();
console.log("✅ Batch routes loaded");
const Batch = require("../models/batch");

router.post("/", async (req, res) => {
  try {
    console.log("📩 Incoming Batch POST:", req.body);
    const batch = new Batch(req.body);
    await batch.save();
    res.status(201).json(batch);
  } catch (err) {
    console.error("❌ Batch POST error:", err);
    res.status(400).json({ error: err.message });
  }
});


// Get All Batches
router.get("/", async (req, res) => {
    try {
        const batches = await Batch.find();
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Batch by batch_id
router.get("/:batch_id", async (req, res) => {
    try {
        const batch = await Batch.findOne({ batch_id: req.params.batch_id });
        if (!batch) return res.status(404).json({ error: "Batch not found" });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Batch.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Batch by _id
router.put("/:id", async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBatch)
      return res.status(404).json({ error: "Batch not found" });
    res.json(updatedBatch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
