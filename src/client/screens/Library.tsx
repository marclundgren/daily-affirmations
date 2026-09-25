import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Affirmation } from '../../shared/types';
import { describeSchedule } from '../../shared/schedule';
import { previewText } from '../../shared/markdown';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { IconButton, Screen, cx } from '../components/ui';

export function Library() {
  const { affirmations, reorder } = useStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = affirmations.findIndex(a => a.id === active.id);
    const to = affirmations.findIndex(a => a.id === over.id);
    reorder(arrayMove(affirmations, from, to));
  };

  return (
    <Screen title="Library" trailing={<IconButton icon="plus" label="New affirmation" to="/library/new" className="text-fg" />}>
      <p className="mt-2 mb-5 px-1 text-sm text-muted">
        {affirmations.length} affirmation{affirmations.length === 1 ? '' : 's'}. Drag the handle to change the order.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={affirmations.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {affirmations.map(a => (
              <Row key={a.id} affirmation={a} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {affirmations.length === 0 && (
        <Link to="/library/new" className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line py-12 text-muted">
          <Icon name="plus" className="size-7" />
          Write your first affirmation
        </Link>
      )}
    </Screen>
  );
}

function Row({ affirmation: a }: { affirmation: Affirmation }) {
  const { hueOf } = useStore();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: a.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, '--hue': a.archived ? 0 : hueOf(a.id) } as CSSProperties}
      className={cx('relative flex items-center rounded-3xl bg-surface', isDragging && 'z-10 shadow-2xl ring-2 ring-accent', a.archived && 'opacity-50')}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${a.title}`}
        className="flex w-12 shrink-0 cursor-grab touch-none items-center justify-center self-stretch text-faint active:cursor-grabbing"
      >
        <Icon name="grip" />
      </button>
      <Link to={`/library/${a.id}`} className="min-w-0 flex-1 py-4 pr-2 active:opacity-70">
        <p className={cx('truncate text-[11px] font-light uppercase tracking-[0.2em]', a.archived ? 'text-faint' : 'text-hue')}>{a.title}</p>
        <p className="mt-1 truncate text-[15px] font-medium">{previewText(a.body)}</p>
        <p className="mt-1 text-xs text-faint">{a.archived ? 'Paused' : describeSchedule(a)}</p>
      </Link>
      <Icon name="next" className="mr-4 size-4 shrink-0 text-faint" />
    </li>
  );
}
