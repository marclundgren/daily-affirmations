import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { api } from '../lib/api';
import type { Affirmation } from '../lib/types';
import SortableAffirmationCard from './SortableAffirmationCard';

export default function AffirmationList() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  useEffect(() => {
    api.getAffirmations().then(a => { setAffirmations(a); setLoading(false); });
  }, []);

  const handleDelete = async (id: number) => {
    await api.deleteAffirmation(id);
    setAffirmations(prev => prev.filter(a => a.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAffirmations(prev => {
      const oldIndex = prev.findIndex(a => a.id === active.id);
      const newIndex = prev.findIndex(a => a.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      api.reorderAffirmations(reordered.map(a => a.id)).catch(() => {
        api.getAffirmations().then(setAffirmations);
      });

      return reordered;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--bg)' }}>
      <div
        className="sticky top-0 z-10 backdrop-blur-lg border-b px-5 py-4"
        style={{
          background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/today" className="transition-colors" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold font-display" style={{ color: 'var(--text)' }}>Manage Affirmations</h1>
          </div>
          <Link
            to="/manage/new"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors font-body"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            + New
          </Link>
        </div>
      </div>

      <div className="px-5 py-4 max-w-2xl mx-auto">
        {affirmations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-body" style={{ color: 'var(--text-muted)' }}>No affirmations yet</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={affirmations.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {affirmations.map(aff => (
                  <SortableAffirmationCard
                    key={aff.id}
                    affirmation={aff}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
