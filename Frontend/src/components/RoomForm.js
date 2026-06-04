// frontend/src/components/RoomForm.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RoomForm() {
  const [roomNo, setRoomNo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("Classroom");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Payload without room_id, MongoDB will generate _id automatically
    const payload = {
      room_no: roomNo,
      capacity: Number(capacity),
      type
    };

    try {
      await axios.post("http://localhost:5000/api/rooms", payload);
      alert("✅ Room added successfully!");
      navigate("/rooms"); // Redirect to Room List
    } catch (err) {
      console.error("Error saving room:", err.response || err);
      alert("❌ Failed to add room. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Room</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
        <label>
          Room No:
          <input
            type="text"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            required
            placeholder="Enter Room Number"
          />
        </label>

        <label>
          Capacity:
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            min="10"
            placeholder="Enter Capacity"
          />
        </label>

        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="Classroom">Classroom</option>
            <option value="Lab">Lab</option>
          </select>
        </label>

        <button type="submit" style={{ padding: "6px 12px", marginTop: "10px" }}>Add Room</button>
      </form>
    </div>
  );
}

export default RoomForm;