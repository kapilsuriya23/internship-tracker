import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import KanbanBoard from '../components/KanbanBoard';
import ApplicationModal from '../components/ApplicationModal';

const STATUSES = ['Applied', 'Mailed', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

export default function Dashboard() {
  const [applications, setApplications]   = useState([]);
  const [stats, setStats]                 = useState({ total:0,Applied:0,Assessment:0,Interview:0,Offer:0,Rejected:0,Selected:0,Mailed:0 });
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [modalOpen, setModalOpen]         = useState(false);
  const [editData, setEditData]           = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchApplications = useCallback(async (s, st) => {
    setLoading(true);
    try {
      const params = {};
      if (s)  params.search = s;
      if (st) params.status = st;
      const { data } = await api.get('/applications', { params });
      setApplications(data.applications);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/applications/stats');
      setStats(data.stats);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchApplications(debouncedSearch, filterStatus); }, [debouncedSearch, filterStatus, fetchApplications]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = useCallback(() => {
    fetchApplications(debouncedSearch, filterStatus);
    fetchStats();
  }, [debouncedSearch, filterStatus, fetchApplications, fetchStats]);

  const handleEdit  = app => { setEditData(app); setModalOpen(true); };
  const handleClose = ()  => { setModalOpen(false); setEditData(null); };
  const handleClear = ()  => { setSearch(''); setFilterStatus(''); setDebouncedSearch(''); };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-black" style={{ fontSize: 26, letterSpacing: '-0.02em', color: '#e2e0ff' }}>
              My Applications
            </h1>
            <p style={{ color: '#8b8aad', fontSize: 14, marginTop: 4 }}>
              Track every opportunity in one place
            </p>
          </div>
          <button onClick={() => { setEditData(null); setModalOpen(true); }}
            className="iris-btn flex items-center gap-2 font-bold text-sm px-5 py-3"
            style={{ borderRadius: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 300 }}>+</span>
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {[
            { type: 'total',      count: stats.total,      delay: 0   },
            { type: 'Applied',    count: stats.Applied,    delay: 40  },
            { type: 'Mailed',     count: stats.Mailed,     delay: 80  },
            { type: 'Assessment', count: stats.Assessment, delay: 120 },
            { type: 'Interview',  count: stats.Interview,  delay: 160 },
            { type: 'Offer',      count: stats.Offer,      delay: 200 },
            { type: 'Rejected',   count: stats.Rejected,   delay: 240 },
            { type: 'Selected',   count: stats.Selected,   delay: 280 },
          ].map(s => <StatCard key={s.type} {...s} />)}
        </div>

        {/* Board card */}
        <div className="neu iris-border animate-fade-up delay-3 p-6" style={{ opacity: 0 }}>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-bold text-sm" style={{ color: '#e2e0ff' }}>Kanban Board</p>
              <p className="text-xs mt-0.5" style={{ color: '#8b8aad' }}>
                {loading ? 'Loading...' : `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <svg className="w-4 h-4" style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: '#8b8aad', pointerEvents: 'none'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search company, role, location..."
                  className="neu-input" style={{ paddingLeft: 38, minWidth: 240, borderRadius: 12 }} />
              </div>

              {/* Status filter */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="neu-input" style={{ width: 'auto', borderRadius: 12, colorScheme: 'dark' }}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {(search || filterStatus) && (
                <button onClick={handleClear} className="neu-btn text-xs font-bold px-3 py-2"
                  style={{ color: '#f87171', borderRadius: 10 }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2.5px solid rgba(167,139,250,0.2)',
                borderTopColor: '#a78bfa',
              }} className="animate-spin" />
            </div>
          ) : (
            <KanbanBoard applications={applications} onEdit={handleEdit} onRefresh={handleRefresh} />
          )}
        </div>
      </main>

      <ApplicationModal isOpen={modalOpen} onClose={handleClose} onSuccess={handleRefresh} editData={editData} />
    </div>
  );
}