import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function BatchForm() {
  const [name, setName] = useState("");
  const [year, setYear] = useState("SE");
  const [division, setDivision] = useState("A");
  const [semester, setSemester] = useState(1);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/batches/${id}`)
        .then(res => {
          setName(res.data.name);
          setYear(res.data.year);
          setDivision(res.data.division);
          setSemester(res.data.semester);
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, year, division, semester };
    if (id) {
      axios.put(`http://localhost:5000/api/batches/${id}`, payload)
        .then(() => navigate("/batches"))
        .catch(err => console.error(err));
    } else {
      axios.post("http://localhost:5000/api/batches", payload)
        .then(() => navigate("/batches"))
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <h2>{id ? "Edit Batch" : "Add Batch"}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Batch Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="SE">SE</option>
          <option value="TE">TE</option>
          <option value="BE">BE</option>
        </select>
        <input type="text" placeholder="Division" value={division} onChange={(e) => setDivision(e.target.value)} required />
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">Select Semester</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default BatchForm;