import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { STATUS_META } from './KanbanColumn';
import api from '../api/axios';

const fmt = d => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  : null;

export default function KanbanCard({ app, isDragging, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: app._id });
  const meta = STATUS_META[app.status] || STATUS_META.Applied;

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.25 : 1,
  };

  const handleDelete = async e => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${app.company} — ${app.role}?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/applications/${app._id}`);
      onDelete();
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <div ref={setNodeRef} style={{
      ...style,
      background: 'var(--bg-raised)',
      borderRadius: 14,
      marginBottom: 10,
      touchAction: 'none',
      cursor: 'grab',
      boxShadow: '4px 4px 12px var(--shadow-dark), -2px -2px 8px var(--shadow-light)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'opacity 0.15s',
    }}>
      {/* Iridescent top accent line */}
      <div style={{
        height: 3, width: '100%',
        background: meta.grad,
        boxShadow: `0 0 8px ${meta.glow}`,
      }} />

      {/* Drag area */}
      <div {...listeners} {...attributes} style={{ padding: '12px 14px 8px' }}>
        {/* Company + Role */}
        <div className="flex items-start gap-2.5 mb-2">
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: meta.grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff',
            boxShadow: `0 3px 10px ${meta.glow}`,
          }}>
            {app.company[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="font-bold text-sm truncate" style={{ color: '#e2e0ff' }}>{app.company}</p>
            <p className="text-xs truncate" style={{ color: '#8b8aad' }}>{app.role}</p>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {app.location && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10 }}>📍</span>
              <span className="text-xs truncate" style={{ color: '#8b8aad' }}>{app.location}</span>
            </div>
          )}
          {app.appliedDate && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10 }}>📅</span>
              <span className="text-xs mono" style={{ color: '#8b8aad' }}>
                Applied {fmt(app.appliedDate)}
              </span>
            </div>
          )}
          {app.recruiterEmail && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10 }}>✉️</span>
              <span className="text-xs truncate" style={{ color: '#8b8aad' }}>
                {app.recruiterEmail.split(',')[0].trim()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions — outside drag listeners */}
      <div style={{
        padding: '8px 14px 12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Links */}
        <div className="flex items-center gap-3">
          {app.jobLink && (
            <a href={app.jobLink} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textDecoration: 'none' }}>
              ↗ Job
            </a>
          )}
          {app.tracking && (
            <a href={app.tracking} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textDecoration: 'none' }}>
              ↗ Track
            </a>
          )}
        </div>

        {/* Edit + Delete */}
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onEdit(app); }}
            style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px',
              borderRadius: 7, cursor: 'pointer', border: 'none',
              background: 'rgba(129,140,248,0.12)', color: '#818cf8',
            }}>
            Edit
          </button>
          <button onClick={handleDelete} disabled={deleting}
            style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px',
              borderRadius: 7, cursor: deleting ? 'not-allowed' : 'pointer', border: 'none',
              background: 'rgba(239,68,68,0.12)', color: '#f87171',
              opacity: deleting ? 0.5 : 1,
            }}>
            {deleting ? '...' : 'Del'}
          </button>
        </div>
      </div>
    </div>
  );
}