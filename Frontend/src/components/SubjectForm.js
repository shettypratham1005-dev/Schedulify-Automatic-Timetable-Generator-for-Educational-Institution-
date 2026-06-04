import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function SubjectForm() {
  const [name, setName] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/subjects/${id}`)
        .then(res => setName(res.data.name))
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name };
    if (id) {
      axios.put(`http://localhost:5000/api/subjects/${id}`, payload)
        .then(() => navigate("/subjects"))
        .catch(err => console.error(err));
    } else {
      axios.post("http://localhost:5000/api/subjects", payload)
        .then(() => navigate("/subjects"))
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <h2>{id ? "Edit Subject" : "Add Subject"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default SubjectForm;