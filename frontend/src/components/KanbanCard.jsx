import { useDraggable } from '@dnd-kit/core';

const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

export default function KanbanCard({ app, isDragging, onEdit }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: app._id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={{
      ...style,
      background: '#1a2236',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      touchAction: 'none',
      cursor: 'grab',
    }}>
      {/* Drag handle area */}
      <div {...listeners} {...attributes}>
        <div className="flex items-start gap-2.5 mb-2">
          <div className="icon-badge flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(75,124,243,0.12)', border: '1px solid rgba(75,124,243,0.2)' }}>
            <span style={{ color: '#4b7cf3', fontWeight: 800, fontSize: 12 }}>
              {app.company[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-white truncate">{app.company}</p>
            <p className="text-xs truncate" style={{ color: '#6b7a99' }}>{app.role}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mt-3" style={{ color: '#6b7a99' }}>
          <span>Applied {fmt(app.appliedDate)}</span>
          {app.deadline && (
            <span style={{ color: '#fb923c', fontWeight: 600 }}>Due {fmt(app.deadline)}</span>
          )}
        </div>
      </div>

      {/* Footer actions — outside drag listeners so clicks work */}
      <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {app.applicationLink ? (
          <a href={app.applicationLink} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs font-medium" style={{ color: '#4b7cf3' }}>
            ↗ View posting
          </a>
        ) : <span />}
        <button onClick={(e) => { e.stopPropagation(); onEdit(app); }}
          className="text-xs font-semibold px-2 py-1 rounded-md"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#a3b0cc', border: 'none', cursor: 'pointer' }}>
          Edit
        </button>
      </div>
    </div>
  );
}