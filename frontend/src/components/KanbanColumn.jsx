import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

export const STATUS_META = {
  Applied:    { color: '#818cf8', grad: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', glow: 'rgba(79,70,229,0.2)'   },
  Mailed:     { color: '#22d3ee', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)', glow: 'rgba(6,182,212,0.2)'   },
  Assessment: { color: '#fbbf24', grad: 'linear-gradient(135deg,#eab308,#f97316)', glow: 'rgba(234,179,8,0.2)'   },
  Interview:  { color: '#fb923c', grad: 'linear-gradient(135deg,#f97316,#f59e0b)', glow: 'rgba(249,115,22,0.2)'  },
  Offer:      { color: '#34d399', grad: 'linear-gradient(135deg,#10b981,#34d399)', glow: 'rgba(16,185,129,0.2)'  },
  Rejected:   { color: '#f87171', grad: 'linear-gradient(135deg,#ef4444,#f43f5e)', glow: 'rgba(239,68,68,0.2)'   },
  Selected:   { color: '#c084fc', grad: 'linear-gradient(135deg,#a855f7,#ec4899)', glow: 'rgba(168,85,247,0.2)'  },
};

export default function KanbanColumn({ status, applications, activeId, onEdit, onDelete })  {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];

  return (
    <div className="flex-shrink-0" style={{ width: 272 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: meta.grad,
            boxShadow: `0 0 8px ${meta.glow}`,
            display: 'inline-block',
          }} />
          <h3 className="text-sm font-bold" style={{ color: '#e2e0ff' }}>{status}</h3>
        </div>
        <span className="mono text-xs font-bold px-2.5 py-1"
          style={{
            background: meta.glow,
            color: meta.color,
            borderRadius: 20,
            border: `1px solid ${meta.color}40`,
          }}>
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} style={{
        background: isOver
          ? `linear-gradient(135deg, ${meta.glow}, rgba(255,255,255,0.02))`
          : 'rgba(18,18,31,0.6)',
        border: `1.5px dashed ${isOver ? meta.color + '80' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16, minHeight: 160, padding: 10,
        transition: 'all 0.2s',
        boxShadow: isOver ? `0 0 20px ${meta.glow}` : 'none',
      }}>
                {applications.map(app => (
          <KanbanCard key={app._id} app={app} isDragging={activeId === app._id}
            onEdit={onEdit} onDelete={onDelete} />
        ))}
        {applications.length === 0 && (
          <div className="text-center py-10 text-xs" style={{ color: 'rgba(139,138,173,0.3)' }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}