import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import type { Affirmation } from '../lib/types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function scheduleLabel(aff: Affirmation): string {
  if (aff.cadence === 'daily') return 'Every day';
  if (aff.cadence === 'weekly' && aff.schedule_day !== null) return `Every ${DAY_NAMES[aff.schedule_day]}`;
  if (aff.cadence === 'monthly' && aff.schedule_day !== null) return `Day ${aff.schedule_day} of month`;
  return aff.cadence;
}

function badgeStyle(cadence: string): React.CSSProperties {
  if (cadence === 'weekly') return { background: 'var(--badge-weekly)', color: 'var(--badge-weekly-text)' };
  if (cadence === 'monthly') return { background: 'var(--badge-monthly)', color: 'var(--badge-monthly-text)' };
  return { background: 'var(--accent-soft)', color: 'var(--accent-soft-text)' };
}

interface Props {
  affirmation: Affirmation;
  onDelete: (id: number) => void;
}

export default function SortableAffirmationCard({ affirmation: aff, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: aff.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'var(--bg-raised)',
    borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
    opacity: isDragging ? 0.5 : aff.is_active ? 1 : 0.5,
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.18)' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-xl border"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-shrink-0 p-1 mt-0.5 cursor-grab active:cursor-grabbing"
          style={{ color: 'var(--text-muted)', touchAction: 'none' }}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate font-body" style={{ color: 'var(--text)' }}>{aff.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium font-body"
              style={badgeStyle(aff.cadence)}
            >
              {aff.cadence}
            </span>
            <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>{scheduleLabel(aff)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/manage/${aff.id}/edit`}
            className="p-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
          <button
            onClick={() => onDelete(aff.id)}
            className="p-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
