const express = require("express");
const router = express.Router();
const Room = require("../models/room");

// -------------------- CREATE ROOM --------------------
router.post("/", async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error("Error saving room:", err);
    res.status(400).json({ error: err.message });
  }
});

// -------------------- GET ALL ROOMS --------------------
// GET Rooms (Filtered by class)
router.get("/", async (req, res) => {
  try {
    const { className } = req.query;

    let filter = {};
    if (className) {
      filter.className = className;
    }

    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET ROOM BY ID --------------------
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- DELETE ROOM --------------------
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Room.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- UPDATE ROOM --------------------
router.put("/:id", async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
