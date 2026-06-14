import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

export const STATUS_META = {
  Applied:    { color: '#4b7cf3', bg: 'rgba(75,124,243,0.08)',  border: 'rgba(75,124,243,0.25)'  },
  Assessment: { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.25)'   },
  Interview:  { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)'  },
  Offer:      { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)'   },
  Rejected:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)'   },
  Selected:   { color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.25)'  },
};

export default function KanbanColumn({ status, applications, activeId, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];

  return (
    <div className="flex-shrink-0" style={{ width: 280 }}>
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
          <h3 className="text-sm font-bold text-white">{status}</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} style={{
        background: isOver ? meta.bg : '#111827',
        border: `1.5px dashed ${isOver ? meta.border : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 14, minHeight: 140, padding: 10,
        transition: 'background 0.15s, border-color 0.15s',
      }}>
        {applications.map(app => (
          <KanbanCard key={app._id} app={app} isDragging={activeId === app._id} onEdit={onEdit} />
        ))}
        {applications.length === 0 && (
          <div className="text-center py-10 text-xs" style={{ color: '#3a4a66' }}>
            Drop applications here
          </div>
        )}
      </div>
    </div>
  );
}