import { useState } from 'react';
import api from '../api/axios';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

const STATUS_STYLE = {
  Applied:    { bg: 'rgba(75,124,243,0.15)',  color: '#7aa3f7', border: 'rgba(75,124,243,0.3)'  },
  Assessment: { bg: 'rgba(234,179,8,0.15)',   color: '#fbbf24', border: 'rgba(234,179,8,0.3)'   },
  Interview:  { bg: 'rgba(249,115,22,0.15)',  color: '#fb923c', border: 'rgba(249,115,22,0.3)'  },
  Offer:      { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
  Rejected:   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
  Selected:   { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc', border: 'rgba(168,85,247,0.3)'  },
};

const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

export default function ApplicationTable({ applications, onEdit, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try { await api.patch(`/applications/${id}/status`, { status }); onRefresh(); }
    catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    setDeletingId(id);
    try { await api.delete(`/applications/${id}`); onRefresh(); }
    catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  if (!applications.length) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
        style={{ background: 'rgba(75,124,243,0.1)', border: '1px solid rgba(75,124,243,0.2)' }}>📋</div>
      <p className="font-bold text-white mb-1">No applications yet</p>
      <p className="text-sm" style={{ color: '#6b7a99' }}>Click + Add Application to get started</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        <thead>
          <tr>
            {['Company & Role', 'Applied', 'Deadline', 'Status', 'Actions'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '0 16px 12px',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#6b7a99',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app, i) => (
            <tr key={app._id}
              style={{ animation: `fadeUp 0.4s ease forwards ${i * 35}ms`, opacity: 0 }}
              className="group">
              {/* Company + Role */}
              <td style={{ padding: '12px 16px' }}>
                <div className="flex items-center gap-3">
                  <div className="icon-badge flex-shrink-0"
                    style={{ width: 38, height: 38, background: 'rgba(75,124,243,0.12)',
                      border: '1px solid rgba(75,124,243,0.2)', borderRadius: 10 }}>
                    <span style={{ color: '#4b7cf3', fontWeight: 800, fontSize: 14 }}>
                      {app.company[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{app.company}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7a99' }}>{app.role}</p>
                    {app.applicationLink && (
                      <a href={app.applicationLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs transition-colors"
                        style={{ color: '#4b7cf3' }}
                        onMouseEnter={e => e.target.style.color = '#7aa3f7'}
                        onMouseLeave={e => e.target.style.color = '#4b7cf3'}>
                        ↗ Open Link
                      </a>
                    )}
                  </div>
                </div>
              </td>

              {/* Applied */}
              <td style={{ padding: '12px 16px' }}>
                <span className="text-sm font-medium" style={{ color: '#a3b0cc' }}>{fmt(app.appliedDate)}</span>
              </td>

              {/* Deadline */}
              <td style={{ padding: '12px 16px' }}>
                <span className="text-sm" style={{ color: app.deadline ? '#a3b0cc' : '#3a4a66' }}>
                  {fmt(app.deadline)}
                </span>
              </td>

              {/* Status */}
              <td style={{ padding: '12px 16px' }}>
                {(() => {
                  const s = STATUS_STYLE[app.status] || STATUS_STYLE.Applied;
                  return (
                    <select value={app.status} disabled={updatingId === app._id}
                      onChange={e => handleStatus(app._id, e.target.value)}
                      className="status-chip"
                      style={{
                        background: s.bg, color: s.color,
                        border: `1px solid ${s.border}`,
                        cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                        colorScheme: 'dark', transition: 'opacity 0.2s',
                        opacity: updatingId === app._id ? 0.5 : 1
                      }}>
                      {STATUSES.map(st => (
                        <option key={st} value={st} style={{ background: '#1a2236', color: '#e2e8f0' }}>{st}</option>
                      ))}
                    </select>
                  );
                })()}
              </td>

              {/* Actions */}
              <td style={{ padding: '12px 16px' }}>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button onClick={() => onEdit(app)}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
                      background: 'rgba(75,124,243,0.12)', color: '#4b7cf3',
                      border: '1px solid rgba(75,124,243,0.2)', cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s'
                    }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(app._id)} disabled={deletingId === app._id}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.1)', color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: deletingId === app._id ? 0.5 : 1,
                      transition: 'background 0.15s'
                    }}>
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