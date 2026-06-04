import { useState, useEffect } from "react";
import axios from "axios";

const TimetableForm = ({ onTimetableAdded }) => {
  const [className, setClassName] = useState("TE");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("08:15");
  const [endTime, setEndTime] = useState("09:15");
  const [faculty, setFaculty] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [batch, setBatch] = useState("");
  const [type, setType] = useState("Lecture");

  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [batches, setBatches] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, sRes, rRes, bRes] = await Promise.all([
          axios.get("http://localhost:5000/api/faculties"),
          axios.get("http://localhost:5000/api/subjects"),
          axios.get("http://localhost:5000/api/rooms"),
          axios.get("http://localhost:5000/api/batches")
        ]);

        setFaculties(fRes.data);
        setSubjects(sRes.data);
        setRooms(rRes.data);
        setBatches(bRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/timetables", {
        className,
        day,
        startTime,
        endTime,
        faculty,
        subject,
        room,
        batch: type !== "Lecture" ? batch : null,
        type
      });

      alert("Timetable added ✅");
      onTimetableAdded(res.data);
    } catch (err) {
      console.error("Error creating timetable:", err);
      alert(err.response?.data?.message || "Failed to create timetable");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Class:</label>
        <select value={className} onChange={(e) => setClassName(e.target.value)}>
          <option value="TE">TE</option>
          <option value="BE">BE</option>
        </select>
      </div>

      <div>
        <label>Day:</label>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Start Time:</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>

      <div>
        <label>End Time:</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      <div>
        <label>Faculty:</label>
        <select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
          <option value="">Select</option>
          {faculties.map(f => (
            <option key={f._id} value={f._id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Subject:</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">Select</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Room:</label>
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Select</option>
          {rooms.map(r => (
            <option key={r._id} value={r._id}>{r.roomNo}</option>
          ))}
        </select>
      </div>

      {type !== "Lecture" && (
        <div>
          <label>Batch:</label>
          <select value={batch} onChange={(e) => setBatch(e.target.value)}>
            <option value="">Select</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Lecture">Lecture</option>
          <option value="Practical">Practical</option>
          <option value="Tutorial">Tutorial</option>
        </select>
      </div>

      <button type="submit">Add Timetable Entry</button>
    </form>
  );
};

export default TimetableForm;