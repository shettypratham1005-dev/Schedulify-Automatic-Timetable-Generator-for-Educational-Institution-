import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const navigate = useNavigate();

  const fetchTeachers = () => {
    axios.get("http://localhost:5000/api/teachers")
      .then(res => setTeachers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Delete this teacher?")) {
      axios.delete(`http://localhost:5000/api/teachers/${id}`)
        .then(() => fetchTeachers())
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <h1>Teachers</h1>
      <button onClick={() => navigate("/add-teacher")}>Add Teacher</button>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => (
            <tr key={t._id}>
              <td>{t.name}</td>
              <td>
                <button onClick={() => navigate(`/edit-teacher/${t._id}`)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherList;