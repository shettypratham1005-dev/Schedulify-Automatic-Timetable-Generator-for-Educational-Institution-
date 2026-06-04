import React, { useState } from "react";
import axios from "axios";

function GenerateTimetableButton() {
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [timetable, setTimetable] = useState([]);

  const classes = ["Class 10", "Class 11", "Class 12"];

  const generateTimetable = async () => {
    console.log("Sending className:", selectedClass);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/timetables/auto-generate",
        { className: selectedClass }
      );
      console.log("Backend response:", response.data);
      setTimetable(response.data.data || []);
    } catch (error) {
      console.error("Error generating timetable:", error.response?.data || error.message);
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Timetable Generator</h3>
      <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
        {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
      </select>
      <button onClick={generateTimetable}>Generate Timetable ⚡</button>

      {timetable.length > 0 && (
        <table style={{ margin: "20px auto", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map(item => (
              <tr key={item._id}>
                <td>{item.day}</td>
                <td>{item.startTime} - {item.endTime}</td>
                <td>{item.subject?.name}</td>
                <td>{item.faculty?.name}</td>
                <td>{item.room?.room_no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GenerateTimetableButton;