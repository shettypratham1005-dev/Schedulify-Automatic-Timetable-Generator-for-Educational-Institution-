// src/pages/Dashboard.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  Users, Home, BookOpen, Layers, 
  ArrowRight, Calendar, UserCheck, ShieldCheck, Zap, LogOut,
  Activity, Clock, Database, Globe,
  Check, AlertCircle, PlayCircle, CheckCircle2, MoreVertical,
  Briefcase, BarChart3, LayoutDashboard, Cpu, Server, ClipboardCheck,
  ZapOff, Sparkles, Filter, Terminal, Radio, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); 
  const [activityLogs, setActivityLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data && data.analytics && data.analytics.preSynthesis) {
        const newLogs = [
            `[${new Date().toLocaleTimeString()}] System Synchronization Complete.`,
            `[${new Date().toLocaleTimeString()}] Diagnostic Engine: Analyzing Configuration...`,
            `[${new Date().toLocaleTimeString()}] Health Score: ${data.analytics.preSynthesis.readinessScore || 0}%`
        ];
        setActivityLogs(prev => [...prev, ...newLogs].slice(-15));
    }
  }, [data]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get('http://localhost:5000/api/timetables/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("🔥 Intelligence Link Severed:", err);
      toast.error("Resource link failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEven = async () => {
    const confirm = window.confirm("Initiate Neural Synthesis with Diagnostic Correction?");
    if (!confirm) return;

    setActivityLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CRITICAL: Synthesis Initiated...`]);
    setLoading(true);
    const id = toast.loading("Synthesizing Neural Grid...");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post('http://localhost:5000/api/timetables/auto-generate-even', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.update(id, { render: "✨ Schedulify: System Orchestrated!", type: "success", isLoading: false, autoClose: 3000 });
      fetchStats();
    } catch (err) {
      toast.update(id, { render: `❌ Collision: ${err.response?.data?.message || err.message}`, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="intelligence-loader">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="ion-aura"
        >
          <Radio size={64} color="#8b5cf6" />
        </motion.div>
        <p className="loader-text">Synchronizing Academic Intelligence...</p>
      </div>
    );
  }

  const { analytics, counts } = data || {};
  const yearStats = analytics?.yearStats || {};
  const preGen = analytics?.preSynthesis || {};

  const getStatusIcon = (label) => {
    switch (label) {
      case 'Complete': return <CheckCircle2 size={14} />;
      case 'In Progress': return <PlayCircle size={14} />;
      case 'Sync Required': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="v5-diagnostic-root">
      <ToastContainer theme="dark" position="bottom-right" />
      
      {/* V5 DEEP SIDEBAR */}
      <aside className="v5-sidebar">
        <header className="v5-branding">
          <div className="b-icon"><Sparkles size={24} /></div>
          <div className="b-text">
            <h3>ACADEMIC</h3>
            <span>NAVIGATOR V5</span>
          </div>
        </header>

        <nav className="v5-nav">
          <div className="nav-group">
            <span className="group-label">Intelligence</span>
            <button className={`nav-link ${viewMode === 'overview' ? 'active' : ''}`} onClick={() => setViewMode('overview')}>
              <LayoutDashboard size={20} />
              <span>Diagnostic Center</span>
            </button>
            <button className={`nav-link ${viewMode === 'rooms' ? 'active' : ''}`} onClick={() => setViewMode('rooms')}>
              <Radio size={20} />
              <span>Resource Grid</span>
            </button>
          </div>

          <div className="nav-group">
            <span className="group-label">Archives</span>
            <button className="nav-link" onClick={() => window.location.href='/timetable'}>
              <Calendar size={20} />
              <span>Master Schedule</span>
            </button>
            <button className="nav-link" onClick={() => window.location.href='/faculties'}>
              <Users size={20} />
              <span>Faculty Roster</span>
            </button>
          </div>
        </nav>

        <section className="v5-live-logs">
            <div className="log-header">
                <Terminal size={14} />
                <span>Live Activity</span>
            </div>
            <div className="log-scroll">
                {activityLogs.map((log, i) => (
                    <div key={i} className="log-entry">{log}</div>
                ))}
            </div>
        </section>

        <footer className="v5-sidebar-footer">
          <button className="v5-logout" onClick={() => { localStorage.removeItem("token"); window.location.href="/login"; }}>
            <LogOut size={18} />
            <span>Terminate Link</span>
          </button>
        </footer>
      </aside>

      {/* V5 MAIN COMMAND CENTER */}
      <main className="v5-workspace">
        <header className="v5-topbar">
          <div className="t-left">
            <div className="t-title-row">
                <h2>{viewMode === 'overview' ? 'System Diagnostic Overview' : 'Neural Resource Topology'}</h2>
            </div>
            <div className="t-meta">Session: 2026 Academic Deployment | Status: Active Interference Enabled</div>
          </div>
          <div className="t-right">
            <div className="pulse-card">
              <div className="p-dot green"></div>
              <span>Cluster: Healthy</span>
            </div>
          </div>
        </header>

        <div className="v5-viewport">
          <AnimatePresence mode="wait">
            {viewMode === 'overview' ? (
              <motion.div 
                key="v5-overview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="v5-dashboard-layout"
              >
                {/* YEAR KPI GRID */}
                <div className="v5-stat-row">
                  {['SE', 'TE', 'BE'].map((yr) => {
                    const stats = yearStats[yr] || {};
                    return (
                      <div key={yr} className={`v5-mini-card ${stats.statusColor}`}>
                        <div className="vmc-header">
                            <span className="vmc-label">{yr} YEAR</span>
                            <div className={`vmc-chip ${stats.statusColor}`}>
                                {getStatusIcon(stats.statusLabel)}
                                {stats.statusLabel}
                            </div>
                        </div>
                        <div className="vmc-body">
                          {stats.percent > 0 ? (
                            <div className="vmc-data">
                                <span className="vmc-big">{stats.percent}%</span>
                                <span className="vmc-sub">{stats.slotsFilled} Blocks Secure</span>
                                <div className="vmc-mini-track">
                                    <div className="fill" style={{ width: `${stats.percent}%` }}></div>
                                </div>
                            </div>
                          ) : (
                            <div className="vmc-empty">
                                <ZapOff size={24} />
                                <span>Synthesis Required</span>
                            </div>
                          )}
                        </div>
                        <button className="vmc-action" onClick={() => window.location.href='/timetable'}>
                            Examine Details <ArrowRight size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="v5-main-diagnostic-row">
                    {/* READINESS GAUGE & INSIGHTS */}
                    <section className="v5-panel-luxe diagnostic-hub">
                        <header className="ph-header">
                            <div className="ph-title-group">
                                <Activity size={24} color="#8b5cf6" />
                                <h3>Intelligence Diagnostic</h3>
                            </div>
                            <div className="ph-health-score">
                                <div className="score-ring">
                                    <svg viewBox="0 0 36 36" className="circular-chart">
                                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle" strokeDasharray={`${preGen.readinessScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <span className="percentage">{preGen.readinessScore}%</span>
                                </div>
                                <span>Health Score</span>
                            </div>
                        </header>

                        <div className="diagnostic-content-v5">
                            {preGen.strategicInsights?.length > 0 ? (
                                <div className="insight-ticker-v5">
                                    {preGen.strategicInsights.map((insight, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            initial={{ x: -10, opacity: 0 }} 
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`insight-card-v5 ${insight.startsWith('OVERLOAD') ? 'warning' : insight.startsWith('GAP') ? 'error' : 'info'}`}
                                        >
                                            <div className="i-icon">
                                                {insight.startsWith('OVERLOAD') ? <Users size={16} /> : insight.startsWith('GAP') ? <AlertCircle size={16} /> : <Info size={16} />}
                                            </div>
                                            <p>{insight}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-diagnostic-data">
                                    <ClipboardCheck size={48} />
                                    <h4>Neural Integrity Optimal</h4>
                                    <p>No critical conflicts or resource gaps detected in current configuration.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ACTION & INTEGRITY */}
                    <div className="v5-side-rail">
                        <section className="v5-panel-luxe synthesis-card">
                            <div className="syn-viz">
                                <div className="outer-orbit"></div>
                                <div className="inner-pulse"></div>
                                <PlayCircle size={32} />
                            </div>
                            <h4>Neural Synthesis</h4>
                            <p>Map your {preGen.totalNeededHours} requirements across your infrastructure using our v5 scheduling algorithm.</p>
                            <button className="v5-btn-primary" onClick={handleGenerateEven}>
                                Initiate Link
                            </button>
                        </section>

                        <section className="v5-panel-luxe meta-infobox mt-4">
                            <div className="mi-row">
                                <Database size={16} />
                                <span>Data Integrity: <strong>Secure</strong></span>
                            </div>
                            <div className="mi-row">
                                <ShieldCheck size={16} />
                                <span>Engine State: <strong>Optimized</strong></span>
                            </div>
                            <div className="mi-divider"></div>
                            <div className="mi-resource-grid">
                                <div className="res-cell">
                                    <span className="val">{counts?.teachers}</span>
                                    <span className="lbl">Faculties</span>
                                </div>
                                <div className="res-cell">
                                    <span className="val">{counts?.rooms}</span>
                                    <span className="lbl">Rooms</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="v5-rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="v5-room-topology"
              >
                <div className="v5-panel-luxe">
                    <header className="rtl-header">
                        <h2>Resource Topology</h2>
                        <div className="util-global-v5">Global Load: {analytics?.roomUtilization}%</div>
                    </header>
                    <div className="v5-room-grid">
                        {analytics?.roomOccupancyGrid?.map((r) => (
                            <div key={r.id} className={`v5-room-node ${r.status.toLowerCase()}`}>
                                <div className="node-head">
                                    <span className="n-id">{r.name}</span>
                                    <div className={`n-pulse ${r.status.toLowerCase()}`}></div>
                                </div>
                                <div className="node-body">
                                    <span className="n-type">{r.type}</span>
                                    <div className="n-track">
                                        <div className="n-bar" style={{ width: `${r.utilPercent}%` }}></div>
                                    </div>
                                </div>
                                <div className="node-footer">
                                    <span className="n-status">{r.status}</span>
                                    <span className="n-util">{r.utilPercent}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;