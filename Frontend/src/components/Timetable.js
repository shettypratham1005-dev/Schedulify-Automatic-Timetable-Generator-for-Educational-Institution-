import React, { useEffect, useState } from "react";
import axios from "axios";

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/timetables")
      .then((res) => setTimetable(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Timetable</h1>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time Slot</th>
            <th>Batch</th>
            <th>Subject</th>
            <th>Teacher</th>
            <th>Room</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {timetable.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.day}</td>
              <td>{entry.time}</td>
              <td>{entry.batch?.roomNo}</td>
              <td>{entry.subject?.name}</td>
              <td>{entry.faculty?.name}</td>
              <td>{entry.room?.roomNo}</td>
              <td>{entry.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Timetable;