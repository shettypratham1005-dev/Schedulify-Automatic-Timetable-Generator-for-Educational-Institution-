// frontend/src/components/TimetableList.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function TimetableList() {
  const [timetables, setTimetables] = useState([]);

  // Fetch data
  const fetchTimetable = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/timetables");
      setTimetables(res.data);
    } catch (err) {
      console.error("Error fetching timetable:", err);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // ✅ DELETE FUNCTION
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/timetables/${id}`);
      alert("Deleted successfully ✅");
      fetchTimetable(); // refresh list
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Delete failed ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Timetable List</h2>

      <table border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Class</th>
            <th>Day</th>
            <th>Time</th>
            <th>Subject</th>
            <th>Faculty</th>
            <th>Room</th>
            <th>Batch</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {timetables.length === 0 ? (
            <tr>
              <td colSpan="9">No data available</td>
            </tr>
          ) : (
            timetables.map((tt) => (
              <tr key={tt._id}>
                <td>{tt.className}</td>
                <td>{tt.day}</td>
                <td>{tt.time}</td>
                <td>{tt.subject?.name}</td>
                <td>{tt.faculty?.name}</td>
                <td>{tt.room?.room_no || "N/A"}</td>
                <td>{tt.batch?.name || "-"}</td>
                <td>{tt.type}</td>

                {/* ✅ DELETE BUTTON */}
                <td>
                  <button
                    onClick={() => handleDelete(tt._id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      borderRadius: "5px"
                    }}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableList;