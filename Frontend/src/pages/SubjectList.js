// src/pages/SubjectList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpen, Plus, Trash2, Search, 
  Layers, Clock, X, Check, ArrowLeft, Info, Edit2 
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Management.css";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    subject_id: "",
    name: "",
    type: "Lecture",
    semester: 3,
    className: "SE"
  });

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("🔥 Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/subjects/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/subjects", formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchSubjects();
      setFormData({ subject_id: "", name: "", type: "Lecture", semester: 3, className: "SE" });
    } catch (err) {
      alert("Error saving subject: " + err.response?.data?.error);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setFormData({
      subject_id: subject.subject_id,
      name: subject.name,
      type: subject.type,
      semester: subject.semester,
      className: subject.className
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.subject_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouping logic for the UI
  const groupedSubjects = {
    SE: filteredSubjects.filter(s => s.className === "SE"),
    TE: filteredSubjects.filter(s => s.className === "TE"),
    BE: filteredSubjects.filter(s => s.className === "BE")
  };

  return (
    <div className="management-container">
      <header className="mgt-header">
        <div className="mgt-title">
          <Link to="/" className="back-link" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1>Subject Syllabus</h1>
        </div>
        <button className="btn-premium" onClick={() => { setEditingId(null); setFormData({ subject_id: "", name: "", type: "Lecture", semester: 3, className: "SE" }); setShowModal(true); }}>
          <Plus size={20} /> Add Subject
        </button>
      </header>

      <div className="search-bar-pro glass-card" style={{ marginBottom: '30px', padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search subjects by name or code..." 
          style={{ background: 'none', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading syllabus...</p>
      ) : (
        <>
          {Object.entries(groupedSubjects).map(([className, classSubjects]) => (
            classSubjects.length > 0 && (
              <div key={className} style={{ marginBottom: '60px' }}>
                <h2 className="section-title">
                  <span className="tag-class">{className}</span> 
                  {className === "SE" ? "Second Year" : className === "TE" ? "Third Year" : "Final Year"}
                </h2>
                
                <div className="mgt-grid">
                  {classSubjects.map((subject) => (
                    <div key={subject._id} className="faculty-card glass-card">
                      <div className="card-header">
                        <div>
                          <h3>{subject.name}</h3>
                          <span className="dept-badge" style={{ background: subject.type === 'Practical' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: subject.type === 'Practical' ? 'var(--accent)' : 'var(--success)' }}>
                            {subject.type}
                          </span>
                        </div>
                        <BookOpen size={24} color="var(--primary)" style={{ opacity: 0.5 }} />
                      </div>
                      <div className="card-body">
                        <p><Info size={16} /> Code: {subject.subject_id}</p>
                        <p><Layers size={16} /> Semester: {subject.semester}</p>
                        <p><Clock size={16} /> Class: {subject.className}</p>
                      </div>
                      <div className="card-footer">
                        <button className="icon-btn" onClick={() => handleEdit(subject)}>
                          <Edit2 size={18} />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(subject._id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {filteredSubjects.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '50px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No subjects found for "{searchTerm}".</p>
            </div>
          )}
        </>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2>{editingId ? "Edit Subject" : "New Subject Entry"}</h2>
              <X size={24} onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject ID/Code</label>
                <input 
                  className="input-pro" 
                  value={formData.subject_id} 
                  onChange={e => setFormData({...formData, subject_id: e.target.value})}
                  required 
                  placeholder="e.g. CS401"
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject Name</label>
                <input 
                  className="input-pro" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. Operating Systems"
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class</label>
                  <select 
                    className="input-pro" 
                    value={formData.className} 
                    onChange={e => setFormData({...formData, className: e.target.value, semester: e.target.value === 'SE' ? 3 : e.target.value === 'TE' ? 5 : 7})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(30,41,59,1)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                  >
                    <option value="SE">SE</option>
                    <option value="TE">TE</option>
                    <option value="BE">BE</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Semester</label>
                  <input 
                    type="number"
                    min="1" max="8"
                    className="input-pro" 
                    value={formData.semester} 
                    onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Type</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["Lecture", "Practical", "Tutorial"].map(t => (
                    <button 
                      key={t}
                      type="button"
                      className={`tag-class ${formData.type === t ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, type: t})}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '10px 18px', 
                        background: formData.type === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '10px'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button type="submit" className="btn-premium" style={{ flex: 1, justifyContent: 'center' }}>
                  <Check size={18} /> Add Subject
                </button>
                <button type="button" className="btn-premium" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;