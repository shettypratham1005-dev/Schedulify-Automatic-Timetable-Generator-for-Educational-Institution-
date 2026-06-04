// src/pages/AnalyticsDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import {
  Download, Search, RefreshCw, Users, BookOpen,
  MapPin, CheckCircle, AlertTriangle, FileText, Layout, Layers,
  ArrowUpRight, Calendar, Home
} from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [semesterBreakdown, setSemesterBreakdown] = useState([]);
  const [practicalInsights, setPracticalInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [sumRes, workRes, utilRes, semRes, pracRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/summary', config),
        axios.get('http://localhost:5000/api/dashboard/faculty-workload', config),
        axios.get('http://localhost:5000/api/dashboard/utilization', config),
        axios.get('http://localhost:5000/api/dashboard/semester-breakdown', config),
        axios.get('http://localhost:5000/api/dashboard/practical-insights', config)
      ]);

      setSummary(sumRes.data);
      setWorkload(workRes.data);
      setUtilization(utilRes.data);
      setSemesterBreakdown(semRes.data);
      setPracticalInsights(pracRes.data);
    } catch (err) {
      console.error("Analytics fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      doc.setFontSize(18);
      doc.text("Academic Analytics Report - 2026", 14, 22);
      doc.setFontSize(9);
      doc.text("Generated: " + new Date().toLocaleString(), 14, 28);

      // Summary table
      autoTable(doc, {
        startY: 35,
        head: [['Metric', 'Value']],
        body: [
          ['Total Subjects', String(summary?.totalSubjects || 0)],
          ['Total Faculty', String(summary?.totalFaculty || 0)],
          ['Theory Subjects', String(summary?.breakdown?.theory || 0)],
          ['Practical Subjects', String(summary?.breakdown?.practical || 0)],
          ['Timetable Entries', String(summary?.totalEntries || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Faculty workload table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Faculty', 'Dept', 'Lectures', 'Practicals', 'Total Hrs', 'Status']],
        body: workload.map(f => [
          f.name, f.department,
          String(f.lectures), String(f.practicals),
          String(f.totalHours), f.status
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });

      doc.save("ANALYTICS_REPORT_2026.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      alert("PDF export failed: " + err.message);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(workload.map(f => ({
      Name: f.name, Department: f.department,
      Lectures: f.lectures, Practicals: f.practicals,
      Tutorials: f.tutorials, Total_Hours: f.totalHours,
      Status: f.status, Subjects: f.subjects.join(', ')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Workload");
    XLSX.writeFile(wb, "FACULTY_WORKLOAD_2026.xlsx");
  };

  if (loading) {
    return (
      <div className="ad-loader">
        <RefreshCw size={36} className="ad-spin" style={{ color: '#6366f1' }} />
        <p>Loading Analytics...</p>
      </div>
    );
  }

  const filteredWorkload = workload.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgUtil = utilization.length > 0
    ? Math.round(utilization.reduce((a, b) => a + b.utilPercent, 0) / utilization.length)
    : 0;

  return (
    <div className="ad-root">
      <div className="ad-container">

        {/* HEADER */}
        <div className="ad-header">
          <div className="ad-header-left">
            <h1>System Intelligence</h1>
            <p>Live analytics and resource efficiency monitors — 2026 Academic Session</p>
          </div>
          <div className="ad-header-actions">
            <button className="ad-btn ad-btn-nav" onClick={() => window.location.href = '/timetable'}>
              <Calendar size={15} /> Timetable
            </button>
            <button className="ad-btn ad-btn-nav" onClick={() => window.location.href = '/faculties'}>
              <Users size={15} /> Faculties
            </button>
            <button className="ad-btn ad-btn-outline" onClick={fetchData}>
              <RefreshCw size={15} className={refreshing ? 'ad-spin' : ''} /> Refresh
            </button>
            <button className="ad-btn ad-btn-indigo" onClick={exportPDF}>
              <Download size={15} /> PDF Report
            </button>
            <button className="ad-btn ad-btn-emerald" onClick={exportExcel}>
              <FileText size={15} /> Excel Export
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="ad-summary-grid">
          <div className="ad-stat-card">
            <div className="card-top">
              <div className="card-icon blue"><Layout size={22} /></div>
              <ArrowUpRight size={18} style={{ color: '#cbd5e1' }} />
            </div>
            <div className="card-label">Academic Semesters</div>
            <div className="card-value">4, 6, 8</div>
            <div className="card-sub">Even Semester Streams</div>
          </div>
          <div className="ad-stat-card">
            <div className="card-top">
              <div className="card-icon indigo"><Users size={22} /></div>
              <ArrowUpRight size={18} style={{ color: '#cbd5e1' }} />
            </div>
            <div className="card-label">Faculty Strength</div>
            <div className="card-value">{summary?.totalFaculty || 0}</div>
            <div className="card-sub">Active Instructors</div>
          </div>
          <div className="ad-stat-card">
            <div className="card-top">
              <div className="card-icon emerald"><BookOpen size={22} /></div>
              <ArrowUpRight size={18} style={{ color: '#cbd5e1' }} />
            </div>
            <div className="card-label">Total Subjects</div>
            <div className="card-value">{summary?.totalSubjects || 0}</div>
            <div className="card-sub">{summary?.breakdown?.theory || 0} Theory | {summary?.breakdown?.practical || 0} Lab</div>
          </div>
          <div className="ad-stat-card">
            <div className="card-top">
              <div className="card-icon amber"><CheckCircle size={22} /></div>
              <ArrowUpRight size={18} style={{ color: '#cbd5e1' }} />
            </div>
            <div className="card-label">Timetable Entries</div>
            <div className="card-value">{summary?.totalEntries || 0}</div>
            <div className="card-sub">Scheduled Sessions</div>
          </div>
        </div>

        {/* SEMESTER BREAKDOWN */}
        <h2 className="ad-section-title">Semester-wise Breakdown</h2>
        <div className="ad-semester-grid">
          {semesterBreakdown.map((sem, idx) => (
            <div key={idx} className="ad-sem-card">
              <div className="sem-header">
                <div>
                  <h3 className="sem-title">Semester {sem.semester}</h3>
                  <span className="sem-year">{sem.className} Year</span>
                </div>
                <div className="sem-icon"><Layers size={20} /></div>
              </div>
              <div className="sem-stat-row">
                <span className="stat-label">Total Lectures</span>
                <span className="stat-value">{sem.lectures}</span>
              </div>
              <div className="sem-stat-row">
                <span className="stat-label">Total Practicals</span>
                <span className="stat-value">{sem.practicals}</span>
              </div>
              <div className="sem-stat-row" style={{ borderTop: '1px solid var(--ad-border-light)', paddingTop: 10 }}>
                <span className="stat-label">Faculty Assigned</span>
                <span className="stat-value">{sem.facultyAssigned}</span>
              </div>
              {sem.specialRules && sem.specialRules.length > 0 && (
                <div className="sem-rules">
                  <div className="rules-title">Special Rules</div>
                  <ul style={{ margin: 0, padding: 0 }}>
                    {sem.specialRules.map((rule, i) => (
                      <li key={i}><AlertTriangle size={12} /> {rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PRACTICAL INSIGHTS */}
        {practicalInsights && (
          <div className="ad-practical-panel">
            <h2><MapPin size={20} style={{ color: '#6366f1' }} /> Practical Scheduling Insights</h2>
            <div className="ad-prac-grid">
              <div className="ad-prac-highlight">
                <div className="big-num">{practicalInsights.synchronizedBlocks}</div>
                <div className="big-label">Synchronized 2-Hr Blocks</div>
                <div className="big-sub">Across all batches</div>
              </div>
              <div>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginTop: 0, marginBottom: 14 }}>
                  Lab Utilization
                </h3>
                <div className="ad-lab-grid">
                  {practicalInsights.labUtilization.slice(0, 8).map((lab, i) => (
                    <div key={i} className="ad-lab-cell">
                      <div className="lab-name">Room {lab.room}</div>
                      <div className="lab-sessions">{lab.sessions} <span>sessions</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS */}
        <div className="ad-charts-row">
          <div className="ad-chart-panel">
            <div className="panel-header">
              <h3>Faculty Workload (Hrs/Week)</h3>
              <span className="panel-badge">Top 6</span>
            </div>
            <div className="ad-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workload.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="totalHours" radius={[6, 6, 0, 0]}>
                    {workload.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.totalHours > 15 ? '#ef4444' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ad-chart-panel">
            <div className="panel-header">
              <h3>Daily Slot Utilization</h3>
              <span className="panel-badge">Avg: {avgUtil}%</span>
            </div>
            <div className="ad-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilization}>
                  <defs>
                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="utilPercent" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUtil)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* FACULTY TABLE */}
        <div className="ad-table-panel">
          <div className="ad-table-header">
            <h3>Faculty Workload Intelligence</h3>
            <div className="ad-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Instructor</th>
                  <th style={{ textAlign: 'center' }}>Lectures</th>
                  <th style={{ textAlign: 'center' }}>Practicals</th>
                  <th>Workload</th>
                  <th>Status</th>
                  <th>Assigned Subjects</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkload.map((f, i) => (
                  <tr key={i}>
                    <td>
                      <div className="faculty-cell">
                        <div className="faculty-avatar">{f.name.charAt(0)}</div>
                        <div>
                          <div className="faculty-name">{f.name}</div>
                          <div className="faculty-dept">{f.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-center">{f.lectures}</td>
                    <td className="td-center">{f.practicals}</td>
                    <td style={{ fontWeight: 700 }}>{f.totalHours} Hrs/Week</td>
                    <td>
                      <span className={`status-badge ${f.status.toLowerCase()}`}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      <div className="subject-tags">
                        {f.subjects.map((s, idx) => (
                          <span key={idx} className="subject-tag">{s}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
