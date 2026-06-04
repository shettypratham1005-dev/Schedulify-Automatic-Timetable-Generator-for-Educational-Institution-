import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const fetchSubjects = () => {
    axios.get("http://localhost:5000/api/subjects")
      .then(res => setSubjects(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Delete this subject?")) {
      axios.delete(`http://localhost:5000/api/subjects/${id}`)
        .then(() => fetchSubjects())
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <h1>Subjects</h1>
      <button onClick={() => navigate("/add-subject")}>Add Subject</button>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>
                <button onClick={() => navigate(`/edit-subject/${s._id}`)}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectList;