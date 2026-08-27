import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import api from '../api/axios';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const STATUSES = ['Applied', 'Mailed', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

export default function KanbanBoard({ applications, onRefresh, onEdit }) {
  const [activeId, setActiveId] = useState(null);
  const [localApps, setLocalApps] = useState(applications);

  useEffect(() => { setLocalApps(applications); }, [applications]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = e => setActiveId(e.active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const app = localApps.find(a => a._id === active.id);
    const newStatus = over.id;
    if (!app || app.status === newStatus) return;
    const prev = app.status;
    setLocalApps(p => p.map(a => a._id === active.id ? { ...a, status: newStatus } : a));
    try {
      await api.patch(`/applications/${active.id}/status`, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
      setLocalApps(p => p.map(a => a._id === active.id ? { ...a, status: prev } : a));
    }
  };

  const activeApp = localApps.find(a => a._id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            applications={localApps.filter(a => a.status === status)}
            activeId={activeId}
            onEdit={onEdit}
            onDelete={onRefresh}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeApp ? (
            <div style={{ width: 272, cursor: 'grabbing' }}>
              <KanbanCard app={activeApp} isDragging={false} onEdit={() => {}} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}