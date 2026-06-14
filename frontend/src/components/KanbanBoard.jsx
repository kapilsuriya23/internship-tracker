import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import api from '../api/axios';
import KanbanColumn, { STATUS_META } from './KanbanColumn';
import KanbanCard from './KanbanCard';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

export default function KanbanBoard({ applications, onRefresh, onEdit }) {
  const [activeId, setActiveId] = useState(null);
  const [localApps, setLocalApps] = useState(applications);

  // Keep local copy in sync when parent data changes (search/filter/refresh)
  useEffect(() => { setLocalApps(applications); }, [applications]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const app = localApps.find(a => a._id === active.id);
    const newStatus = over.id;
    if (!app || app.status === newStatus) return;

    const prevStatus = app.status;

    // Optimistic update — instant UI feedback
    setLocalApps(prev => prev.map(a => a._id === active.id ? { ...a, status: newStatus } : a));

    try {
      await api.patch(`/applications/${active.id}/status`, { status: newStatus });
      onRefresh(); // refresh stat cards
    } catch (err) {
      console.error('Status update failed:', err);
      // Revert on failure
      setLocalApps(prev => prev.map(a => a._id === active.id ? { ...a, status: prevStatus } : a));
    }
  };

  const activeApp = localApps.find(a => a._id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            applications={localApps.filter(a => a.status === status)}
            activeId={activeId}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Floating card while dragging — portaled to body to avoid
          transform-context offset issues from animated parent containers */}
      {createPortal(
        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeApp ? (
            <div style={{ width: 280, cursor: 'grabbing' }}>
              <KanbanCard app={activeApp} isDragging={false} onEdit={() => {}} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}