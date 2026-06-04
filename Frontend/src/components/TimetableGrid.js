import { useState, useEffect } from "react";
import axios from "axios";

const TimetableList = () => {
  const [timetables, setTimetables] = useState([]);

  // ---------------- FETCH ----------------
  const fetchTimetables = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/timetables");
      setTimetables(res.data);
    } catch (err) {
      console.error("Error fetching timetable:", err);
    }
  };

  // ---------------- GENERATE ----------------
  const generateTimetable = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/timetables/auto-generate"
      );
      setTimetables(res.data.data);
    } catch (err) {
      console.error("Error generating timetable:", err);
    }
  };

  // ---------------- DELETE ----------------
  const deleteEntry = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/timetables/${id}`
      );
      fetchTimetables();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // ---------------- LOAD ON START ----------------
  useEffect(() => {
    fetchTimetables();
  }, []);

  // ---------------- GRID DATA ----------------
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const timeSlots = [
    "08:15-09:15",
    "09:15-10:15",
    "10:30-11:30",
    "11:30-12:30",
    "12:30-01:30",
    "02:30-03:30",
    "03:30-04:30"
  ];

  // ---------------- STYLES ----------------
  const btnStyle = {
    margin: "5px",
    padding: "8px 15px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px"
  };

  const deleteBtn = {
    marginTop: "5px",
    padding: "3px 8px",
    background: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px"
  };

  const cellStyle = {
    minWidth: "120px",
    height: "90px",
    verticalAlign: "top",
    padding: "5px"
  };

  // ---------------- UI ----------------
  return (
   <div className="container mt-4">
      <h2 className="text-center mb-4">📅 Timetable</h2>

      <div style={{ marginBottom: "15px", textAlign: "center" }}>
        <button className="btn btn-primary m-1">Generate 🚀</button>
        <button className="btn btn-success m-1">Refresh 🔄</button>
        <button className="btn btn-warning m-1">Add ➕</button>
      </div>

      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead style={{ background: "#333", color: "#fff" }}>
          <tr>
            <th>Day / Time</th>
            {timeSlots.map((slot) => (
              <th key={slot}>{slot}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td style={{ fontWeight: "bold" }}>{day}</td>

              {timeSlots.map((slot) => {
                const [start, end] = slot.split("-");

                const entry = timetables.find(
                  (tt) =>
                    tt.day === day &&
                    tt.startTime === start &&
                    tt.endTime === end
                );

                return (
                  <td key={slot} style={cellStyle}>
                    {entry ? (
                      <>
                        <b>{entry.subject?.name}</b><br />
                        {entry.faculty?.name}<br />
                        Room: {entry.room?.roomNo}

                        <br />

                        <button
                          style={deleteBtn}
                          onClick={() => deleteEntry(entry._id)}
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableList;