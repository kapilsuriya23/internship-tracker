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

  // Debounce search input — waits 400ms after typing stops
  const searchDebounce = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);


  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus) params.status = filterStatus;

      const [appsRes, statsRes] = await Promise.all([
        api.get('/applications', { params }),
        api.get('/applications/stats')
      ]);
      setApplications(appsRes.data.applications);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  },  [debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => { setEditData(null); setModalOpen(true); };
  const handleEdit = (app) => { setEditData(app); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setEditData(null); };

  return (
    <div className="noise-bg min-h-screen bg-ink">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 animate-fade-up">
          <div>
            <h1 className="font-display font-800 text-3xl text-frost">My Applications</h1>
            <p className="text-frost/40 text-sm mt-1">Track every opportunity in one place</p>
          </div>
          <button onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-volt text-ink font-display font-700 text-sm px-5 py-3 rounded-xl hover:bg-volt-dark transition-colors duration-200 shadow-lg shadow-volt/15 animate-pulse-volt">
            <span className="text-lg leading-none">+</span>
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { type: 'total', count: stats.total, delay: 0 },
            { type: 'Applied', count: stats.Applied, delay: 60 },
            { type: 'Interview', count: stats.Interview, delay: 120 },
            { type: 'Offer', count: stats.Offer, delay: 180 },
            { type: 'Rejected', count: stats.Rejected, delay: 240 },
            { type: 'Selected', count: stats.Selected, delay: 300 },
          ].map(s => <StatCard key={s.type} {...s} />)}
        </div>

        {/* Table section */}
        <div className="bg-ink-soft border border-white/6 rounded-3xl p-6 animate-fade-up delay-200" style={{ opacity: 0 }}>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-frost/30 text-sm">⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search company or role..."
                className="w-full bg-ink-muted border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-frost placeholder-frost/20 focus:border-volt/40 transition-colors"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-ink-muted border border-white/8 rounded-xl px-4 py-2.5 text-sm text-frost/70 focus:border-volt/40 transition-colors"
            >
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(search || filterStatus) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); }}
                className="text-sm text-frost/40 hover:text-frost transition-colors px-3">
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-volt border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ApplicationTable
              applications={applications}
              onEdit={handleEdit}
              onRefresh={fetchData}
            />
          )}
        </div>
      </main>

      <ApplicationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchData}
        editData={editData}
      />

      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-volt/3 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/4 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}