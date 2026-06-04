import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Plus, RefreshCw, Layers, Calendar, MapPin, User, 
  Trash2, X, Check, Clock, BookOpen, UserPlus, Info, LogOut,
  Download
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./TimetableList.css";

const TimetableList = () => {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState("SE");
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // User context
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    day: "Monday",
    startTime: "08:15",
    endTime: "09:15",
    subject: "",
    faculty: "",
    room: "",
    batch: "",
    type: "Lecture"
  });
  
  // Shared Data for Modal
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    { label: "08:15", end: "09:15", type: "slot" },
    { label: "09:15", end: "10:15", type: "slot" },
    { label: "10:15", end: "10:30", type: "break", labelText: "BREAK" },
    { label: "10:30", end: "11:30", type: "slot" },
    { label: "11:30", end: "12:30", type: "slot" },
    { label: "12:30", end: "01:30", type: "slot" },
    { label: "01:30", end: "02:30", type: "break", labelText: "LUNCH" },
    { label: "02:30", end: "03:30", type: "slot" },
    { label: "03:30", end: "04:30", type: "slot" },
    { label: "04:30", end: "05:30", type: "slot" },
  ];

  const fetchTimetables = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/timetables?className=${selectedClass}&semester=${selectedSemester}`
      );
      setTimetables(res.data);
      setError(null);
    } catch (err) {
      console.error("🔥 Error fetching timetables:", err);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [subRes, teaRes, roomRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/subjects?className=${selectedClass}`),
        axios.get(`http://localhost:5000/api/faculties?className=${selectedClass}`),
        axios.get(`http://localhost:5000/api/rooms`)
      ]);
      setSubjects(subRes.data);
      setTeachers(teaRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.error("🔥 Error fetching form options:", err);
    }
  };

  useEffect(() => {
    fetchTimetables();
    fetchFormOptions();
  }, [selectedClass, selectedSemester]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/timetables/auto-generate-even",
        { className: selectedClass, semester: selectedSemester },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTimetables();
    } catch (err) {
      setError(err.response?.data?.message || "Generation failed. Try adjusting the schedule.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector(".timetable-grid-pro");
    if (!element) return;

    setIsExporting(true);
    // Give state change a moment to render (hide buttons)
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Top margin

        pdf.setFontSize(16);
        pdf.text(`Academic Schedule - ${selectedClass} | Semester ${selectedSemester}`, pdfWidth / 2, 8, { align: "center" });
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`Timetable_${selectedClass}_Sem${selectedSemester}.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        setError("Failed to generate PDF. Please try again.");
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/timetables",
        { ...formData, className: selectedClass, semester: selectedSemester },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchTimetables();
    } catch (err) {
      setError("Failed to add entry. Please check overlapping slots.");
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/timetables/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTimetables();
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const getSlotData = (day, slotLabel) => {
    // Find sessions starting at this time
    const startsAt = timetables.filter((t) => t.day === day && t.startTime === slotLabel);
    
    // Check if this slot is already occupied by a session starting earlier
    const slotIdx = timeSlots.findIndex(s => s.label === slotLabel);
    const isOccupied = timetables.some(t => {
      if (t.day !== day) return false;
      const tStartIdx = timeSlots.findIndex(s => s.label === t.startTime);
      const tEndIdx = timeSlots.findIndex(s => s.end === t.endTime);
      // It's occupied if current slot is BETWEEN start and end
      return slotIdx > tStartIdx && slotIdx <= tEndIdx;
    });

    return { startsAt, isOccupied };
  };

  const openAddModal = (day = "Monday", startTime = "08:15") => {
    setFormData({ ...formData, day, startTime });
    setShowModal(true);
  };

  return (
    <div className={`timetable-container ${isExporting ? 'exporting-mode' : ''}`}>
      <header className="timetable-header-pro glass-card">
        <div className="title-pro-wrapper">
          <div className="header-badge">Intelligent Scheduler</div>
          <div className="title-pro">
            <h2>Academic Schedule</h2>
            <p>Master Control Panel for {selectedClass} | Semester {selectedSemester}</p>
          </div>
        </div>
        
        <div className="controls-pro">
          <select 
            className="select-pro" 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="SE">Second Year (SE)</option>
            <option value="TE">Third Year (TE)</option>
            <option value="BE">Final Year (BE)</option>
          </select>

          <select 
            className="select-pro" 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
          >
            {[3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <button 
            className="btn-pro" 
            onClick={handleAutoGenerate} 
            disabled={loading}
          >
            {loading ? <RefreshCw size={18} className="spin" /> : <Layers size={18} />}
            <span>{loading ? "Optimizing..." : "Auto-Generate"}</span>
          </button>
          
          <button className="btn-pro btn-pro-outline" onClick={handleDownloadPDF} disabled={isExporting}>
            {isExporting ? <RefreshCw size={18} className="spin" /> : <Download size={18} />}
            <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
          </button>

          <button className="btn-pro btn-pro-outline" onClick={() => openAddModal()}>
            <Plus size={18} />
            <span>Add Entry</span>
          </button>


          <div className="user-profile-mini">
            <div className="user-info">
              <span className="user-name">{user.name || "Administrator"}</span>
              <span className="user-role">System Admin</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>


      {error && (
        <div className="alert-pro glass-card" style={{ borderLeft: '4px solid var(--error)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={20} color="var(--error)" />
            <span>{error}</span>
          </div>
          <X size={16} onClick={() => setError(null)} style={{ cursor: 'pointer' }} />
        </div>
      )}

      <div className="timetable-grid-pro shadow-premium">
        <div className="grid-corner"></div>
        {timeSlots.map((slot, sIdx) => (
          <div key={sIdx} className={`grid-time-header ${slot.type === 'break' ? 'header-break' : ''}`}>
            <span>{slot.label}</span>
            <small>{slot.end}</small>
          </div>
        ))}

        {days.map((day, dIdx) => (
          <React.Fragment key={dIdx}>
            <div className="grid-day-side-header">
              <span>{day}</span>
            </div>

            {timeSlots.map((slot, sIdx) => {
              if (slot.type === "break") {
                return (
                  <div key={sIdx} className="cell-pro cell-break">
                    {slot.labelText}
                  </div>
                );
              }

              const { startsAt, isOccupied } = getSlotData(day, slot.label);
              
              if (isOccupied) return null; // Skip rendering this cell since the previous one spans over it

              const calculateSpan = (item) => {
                const sIdx = timeSlots.findIndex(s => s.label === item.startTime);
                const eIdx = timeSlots.findIndex(s => s.end === item.endTime);
                if (sIdx === -1 || eIdx === -1) return 1;
                return Math.max(1, eIdx - sIdx + 1);
              };

              // Determine if any session starting here needs to span multiple columns
              const span = startsAt.length > 0 ? Math.max(...startsAt.map(calculateSpan)) : 1;

              return (
                <div 
                  key={sIdx} 
                  className={`cell-pro ${dIdx % 2 === 0 ? 'stripe' : ''}`} 
                  style={{ 
                    position: 'relative',
                    gridColumn: span > 1 ? `span ${span}` : 'auto'
                  }}
                >
                  {startsAt.length > 0 ? (
                    startsAt.map((item, iIdx) => (
                      <div key={iIdx} className={`entry-card-pro ${item.type?.toLowerCase() || 'lecture'}`} style={{ height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p className="subject-pro">{item.subject?.name || item.subjectLabel}</p>
                          <button 
                            className="delete-btn-pro" 
                            onClick={() => handleDeleteEntry(item._id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="faculty-pro"><User size={12} /> {item.faculty?.name || item.facultyLabel || "Shared"}</p>
                        
                        <div className="meta-pro">
                          <span className="badge-pro room"><MapPin size={10} /> {item.room?.room_no || item.roomLabel || "N/A"}</span>
                          {item.batch && (
                            <span className="badge-pro batch">
                              {item.batch === "ALL" ? "Year-Wide" : `Batch ${item.batch.replace("Batch ", "")}`}
                            </span>
                          )}
                          <span className="badge-pro type">{item.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <button className="add-btn-cell" onClick={() => openAddModal(day, slot.label)}>
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* MANUAL ENTRY MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserPlus size={24} color="var(--primary)" />
                  <h3>Create Manual Entry</h3>
                </div>
                <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                Manually schedule a lecture or practical session. System will check for collisions.
              </p>
            </div>

            <form onSubmit={handleAddEntry}>
              <div className="form-grid">
                <div className="form-group">
                  <label><Calendar size={14} /> Day</label>
                  <select 
                    className="input-pro"
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label><Clock size={14} /> Start Time</label>
                  <select 
                    className="input-pro"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  >
                    {timeSlots.filter(s => s.type === 'slot').map(s => (
                      <option key={s.label} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full">
                  <label><BookOpen size={14} /> Subject</label>
                  <select 
                    className="input-pro"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.type})</option>)}
                  </select>
                </div>

                <div className="form-group full">
                  <label><User size={14} /> Faculty</label>
                  <select 
                    className="input-pro"
                    required
                    value={formData.faculty}
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                  >
                    <option value="">Select Faculty</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label><MapPin size={14} /> Room</label>
                  <select 
                    className="input-pro"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                  >
                    <option value="">Select Room</option>
                    {rooms.map(r => <option key={r._id} value={r._id}>{r.room_no} ({r.type})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label><Layers size={14} /> Batch (Optional)</label>
                  <input 
                    className="input-pro"
                    placeholder="e.g. A"
                    value={formData.batch}
                    onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="submit" className="btn-pro" style={{ flex: 1 }}>
                  <Check size={18} /> Save Entry
                </button>
                <button type="button" className="btn-pro btn-pro-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
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


export default TimetableList;