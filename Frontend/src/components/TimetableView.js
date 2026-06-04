// frontend/src/components/TimetableView.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeSlots = [
  "8:15-9:15",
  "9:15-10:15",
  "10:15-10:30", // break
  "10:30-11:30",
  "11:30-12:30",
  "12:30-1:30",
  "1:30-2:30", // lunch
  "2:30-3:30",
  "3:30-4:30"
];

function TimetableView() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/timetables");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching timetable:", err);
    }
  };

  // Helper to get data for each cell
  const getCellData = (day, time) => {
    const entry = data.find(
      (d) => d.day === day && d.time === time
    );

    if (!entry) return "";

    return (
      <>
        <div><b>{entry.subject?.name}</b></div>
        <div>{entry.faculty?.name}</div>
        <div>{entry.room?.roomNo}</div>
      </>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Weekly Timetable</h2>

      <table border="1" style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>Time</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td><b>{time}</b></td>

              {time === "10:15-10:30" || time === "1:30-2:30" ? (
                <td colSpan={5} style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                  BREAK
                </td>
              ) : (
                days.map((day) => (
                  <td key={day}>
                    {getCellData(day, time)}
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableView;