import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ApplicationTable from '../components/ApplicationTable';
import ApplicationModal from '../components/ApplicationModal';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, Applied: 0, Assessment: 0, Interview: 0, Offer: 0, Rejected: 0, Selected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchApplications = useCallback(async (searchVal, statusVal) => {
    setLoading(true);
    try {
      // Build params — only include non-empty values
      const params = {};
      if (searchVal && searchVal.length > 0) params.search = searchVal;
      if (statusVal && statusVal.length > 0) params.status = statusVal;

      const { data } = await api.get('/applications', { params });
      setApplications(data.applications);
    } catch (e) {
      console.error('Fetch applications error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/applications/stats');
      setStats(data.stats);
    } catch (e) {
      console.error('Fetch stats error:', e);
    }
  }, []);

  // Fetch apps whenever debounced search or status filter changes
  useEffect(() => {
    fetchApplications(debouncedSearch, filterStatus);
  }, [debouncedSearch, filterStatus, fetchApplications]);

  // Fetch stats once on mount and after mutations
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Called after add/edit/delete — refresh both
  const handleRefresh = useCallback(() => {
    fetchApplications(debouncedSearch, filterStatus);
    fetchStats();
  }, [debouncedSearch, filterStatus, fetchApplications, fetchStats]);

  const handleEdit = app => { setEditData(app); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setEditData(null); };

  const handleClear = () => {
    setSearch('');
    setFilterStatus('');
    setDebouncedSearch('');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.01em' }}>
              My Applications
            </h1>
            <p className="text-sm" style={{ color: '#6b7a99' }}>Track every opportunity in one place</p>
          </div>
          <button onClick={() => { setEditData(null); setModalOpen(true); }}
            className="flex items-center gap-2 text-sm font-bold text-white px-5 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #4b7cf3, #3a6be0)',
              boxShadow: '0 4px 20px rgba(75,124,243,0.35)',
              border: 'none', cursor: 'pointer'
            }}>
            <span className="text-lg leading-none font-light">+</span>
            Add Application
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { type: 'total',     count: stats.total,     delay: 0   },
            { type: 'Applied',   count: stats.Applied,   delay: 50  },
            { type: 'Interview', count: stats.Interview, delay: 100 },
            { type: 'Offer',     count: stats.Offer,     delay: 150 },
            { type: 'Rejected',  count: stats.Rejected,  delay: 200 },
            { type: 'Selected',  count: stats.Selected,  delay: 250 },
          ].map(s => <StatCard key={s.type} {...s} />)}
        </div>

        {/* Table card */}
        <div className="card animate-fade-up delay-3 p-6" style={{ opacity: 0 }}>
          {/* Card header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="icon-badge"
                style={{ background: 'rgba(75,124,243,0.12)', border: '1px solid rgba(75,124,243,0.2)', width: 38, height: 38, borderRadius: 10 }}>
                <svg className="w-4 h-4" style={{ color: '#4b7cf3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Applications</p>
                <p className="text-xs" style={{ color: '#6b7a99' }}>
                  {loading ? 'Loading...' : `${applications.length} result${applications.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#6b7a99' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search company or role..."
                  style={{
                    background: '#111827',
                    border: `1px solid ${search ? 'rgba(75,124,243,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 10,
                    paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                    color: '#e2e8f0', fontSize: 13,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    minWidth: 220, transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                  onBlur={e => e.target.style.borderColor = search ? 'rgba(75,124,243,0.4)' : 'rgba(255,255,255,0.07)'}
                />
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  background: '#111827',
                  border: `1px solid ${filterStatus ? 'rgba(75,124,243,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10, padding: '8px 14px',
                  color: filterStatus ? '#e2e8f0' : '#6b7a99',
                  fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif',
                  cursor: 'pointer', colorScheme: 'dark', transition: 'border-color 0.2s'
                }}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Clear button — only shows when filters are active */}
              {(search || filterStatus) && (
                <button onClick={handleClear}
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: '#f87171', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '6px 12px',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'background 0.15s'
                  }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Loading spinner */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(75,124,243,0.3)', borderTopColor: '#4b7cf3' }} />
            </div>
          ) : (
            <ApplicationTable
              applications={applications}
              onEdit={handleEdit}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </main>

      <ApplicationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleRefresh}
        editData={editData}
      />

      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(75,124,243,0.05) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)' }} />
    </div>
  );
}