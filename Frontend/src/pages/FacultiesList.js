// src/pages/FacultiesList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, Plus, Trash2, Search, 
  MapPin, Book, X, Check, ArrowLeft, Edit2 
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Management.css";

const FacultiesList = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedFacultySchedule, setSelectedFacultySchedule] = useState([]);
  const [currentFacultyName, setCurrentFacultyName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    teacher_id: "",
    name: "",
    department: "Computer Science",
    maxLectures: 20,
    classNames: []
  });

  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faculties/all");
      setFaculties(res.data);
    } catch (err) {
      console.error("🔥 Error fetching faculties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/faculties/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/faculties", formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchFaculties();
      setFormData({ teacher_id: "", name: "", department: "Computer Science", maxLectures: 20, classNames: [] });
    } catch (err) {
      alert("Error saving faculty: " + err.response?.data?.error);
    }
  };

  const handleEdit = (faculty) => {
    setEditingId(faculty._id);
    setFormData({
      teacher_id: faculty.teacher_id,
      name: faculty.name,
      department: faculty.department,
      maxLectures: faculty.maxLectures || 20,
      classNames: faculty.classNames || []
    });
    setShowModal(true);
  };

  const handleViewSchedule = async (faculty) => {
    try {
      setLoading(true);
      setCurrentFacultyName(faculty.name);
      const res = await axios.get(`http://localhost:5000/api/timetables/faculty/${faculty._id}`);
      setSelectedFacultySchedule(res.data);
      setShowScheduleModal(true);
    } catch (err) {
      alert("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this faculty member?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/faculties/${id}`);
      fetchFaculties();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredFaculties = faculties.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClass = (className) => {
    setFormData(prev => ({
      ...prev,
      classNames: prev.classNames.includes(className)
        ? prev.classNames.filter(c => c !== className)
        : [...prev.classNames, className]
    }));
  };

  return (
    <div className="management-container">
      <header className="mgt-header">
        <div className="mgt-title">
          <Link to="/" className="back-link" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1>Faculty Management</h1>
        </div>
        <button className="btn-premium" onClick={() => { setEditingId(null); setFormData({ teacher_id: "", name: "", department: "Computer Science", maxLectures: 20, classNames: [] }); setShowModal(true); }}>
          <Plus size={20} /> Add Faculty
        </button>
      </header>

      <div className="search-bar-pro glass-card" style={{ marginBottom: '30px', padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by name or department..." 
          style={{ background: 'none', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mgt-grid">
        {loading ? (
          <p>Loading faculty data...</p>
        ) : filteredFaculties.length > 0 ? (
          filteredFaculties.map((faculty) => (
            <div key={faculty._id} className="faculty-card glass-card">
              <div className="card-header">
                <div>
                  <h3>{faculty.name}</h3>
                  <span className="dept-badge">{faculty.department}</span>
                </div>
                <Users size={24} color="var(--primary)" style={{ opacity: 0.5 }} />
              </div>
              <div className="card-body">
                <p><Book size={16} /> ID: {faculty.teacher_id}</p>
                <p>
                  <MapPin size={16} /> Workload: {faculty.actualLectures || 0}/{faculty.maxLectures} Lec/Week
                </p>
                <div style={{ marginTop: '5px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, ((faculty.actualLectures || 0) / faculty.maxLectures) * 100)}%`, 
                        background: (faculty.actualLectures || 0) > faculty.maxLectures ? '#ef4444' : 'var(--primary)'
                      }}
                    ></div>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(faculty.classNames || []).map(c => (
                    <span key={c} className="tag-class">{c}</span>
                  ))}
                </div>
              </div>
              <div className="card-footer">
                <button 
                  className="btn-pro-mini" 
                  onClick={() => handleViewSchedule(faculty)}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
                >
                  <Search size={14} /> View Schedule
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" onClick={() => handleEdit(faculty)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="icon-btn delete" onClick={() => handleDelete(faculty._id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No faculty members found matching your search.</p>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2>{editingId ? "Edit Faculty" : "New Faculty Member"}</h2>
              <X size={24} onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Faculty ID</label>
                <input 
                  className="input-pro" 
                  value={formData.teacher_id} 
                  onChange={e => setFormData({...formData, teacher_id: e.target.value})}
                  required 
                  placeholder="e.g. T001"
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  className="input-pro" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. Dr. Jane Smith"
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Department</label>
                <input 
                  className="input-pro" 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Max Lectures per Week</label>
                <input 
                  type="number"
                  className="input-pro" 
                  value={formData.maxLectures} 
                  onChange={e => setFormData({...formData, maxLectures: parseInt(e.target.value) || 0})}
                  required 
                  min="1"
                  max="40"
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                />
              </div>
              
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Assigned Classes</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["SE", "TE", "BE"].map(c => (
                    <button 
                      key={c}
                      type="button"
                      className={`tag-class ${formData.classNames.includes(c) ? 'active' : ''}`}
                      onClick={() => toggleClass(c)}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '8px 15px', 
                        background: formData.classNames.includes(c) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" className="btn-premium" style={{ flex: 1, justifyContent: 'center' }}>
                  <Check size={18} /> Save Faculty
                </button>
                <button type="button" className="btn-premium" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content glass-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 10, paddingBottom: '10px' }}>
              <div>
                <h2>{currentFacultyName}'s Weekly Schedule</h2>
                <p style={{ color: 'var(--text-muted)' }}>Verified assignments across all semesters</p>
              </div>
              <X size={24} onClick={() => setShowScheduleModal(false)} style={{ cursor: 'pointer' }} />
            </div>

            <div className="schedule-mini-list">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                <div key={day} style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', marginBottom: '10px' }}>{day}</h4>
                  {selectedFacultySchedule.filter(s => s.day === day).length > 0 ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {selectedFacultySchedule.filter(s => s.day === day).map((item, idx) => (
                        <div key={idx} className="status-item glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '1rem' }}>{item.subject?.name}</strong>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span><MapPin size={12} /> {item.room?.room_no}</span>
                              <span><Check size={12} /> {item.className} - {item.type}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: '800', color: 'white' }}>{item.startTime} - {item.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No sessions scheduled</p>
                  )}
                </div>
              ))}
            </div>
            
            <button className="btn-premium" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowScheduleModal(false)}>
              Close Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultiesList;