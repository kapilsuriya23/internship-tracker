import { useState } from 'react';
import api from '../api/axios';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

const STATUS_STYLES = {
  Applied:    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Assessment: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Interview:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Offer:      'bg-volt/15 text-volt border-volt/30',
  Rejected:   'bg-red-500/15 text-red-400 border-red-500/30',
  Selected:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ApplicationTable({ applications, onEdit, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/applications/${id}`);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">◌</p>
        <p className="text-frost/30 font-display font-600">No applications yet</p>
        <p className="text-frost/20 text-sm mt-1">Click + Add Application to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            {['Company', 'Role', 'Applied', 'Deadline', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left text-xs font-display font-600 tracking-widest text-frost/30 uppercase pb-4 pr-6">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/4">
          {applications.map((app, i) => (
            <tr key={app._id}
              className="group hover:bg-white/2 transition-colors duration-150"
              style={{ animation: `fadeUp 0.4s ease forwards ${i * 40}ms`, opacity: 0 }}>
              <td className="py-4 pr-6">
                <div className="font-display font-600 text-frost text-sm">{app.company}</div>
                {app.applicationLink && (
                  <a href={app.applicationLink} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-frost/30 hover:text-volt transition-colors">↗ link</a>
                )}
              </td>
              <td className="py-4 pr-6 text-sm text-frost/70">{app.role}</td>
              <td className="py-4 pr-6 text-sm text-frost/50">{fmt(app.appliedDate)}</td>
              <td className="py-4 pr-6 text-sm text-frost/50">{fmt(app.deadline)}</td>
              <td className="py-4 pr-6">
                <select
                  value={app.status}
                  disabled={updatingId === app._id}
                  onChange={e => handleStatusChange(app._id, e.target.value)}
                  className={`status-pill border cursor-pointer bg-transparent ${STATUS_STYLES[app.status]} disabled:opacity-50 transition-all duration-200`}
                >
                  {STATUSES.map(s => <option key={s} value={s} className="bg-ink-muted text-frost">{s}</option>)}
                </select>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button onClick={() => onEdit(app)}
                    className="text-xs text-frost/40 hover:text-volt transition-colors font-display font-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(app._id)} disabled={deletingId === app._id}
                    className="text-xs text-frost/40 hover:text-red-400 transition-colors font-display font-600 disabled:opacity-50">
                    {deletingId === app._id ? '...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}