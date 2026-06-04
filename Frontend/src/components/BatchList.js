import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BatchList() {
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  const fetchBatches = () => {
    axios.get("http://localhost:5000/api/batches")
      .then(res => setBatches(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Delete this batch?")) {
      axios.delete(`http://localhost:5000/api/batches/${id}`)
        .then(() => fetchBatches())
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <h1>Batches</h1>
      <button onClick={() => navigate("/add-batch")}>Add Batch</button>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Year</th>
            <th>Division</th>
            <th>Semester</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(b => (
            <tr key={b._id}>
              <td>{b.name}</td>
              <td>{b.year}</td>
              <td>{b.division}</td>
              <td>{b.semester}</td>
              <td>
                <button onClick={() => navigate(`/edit-batch/${b._id}`)}>Edit</button>
                <button onClick={() => handleDelete(b._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BatchList;