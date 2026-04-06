interface Props {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const allDone = completed === total && total > 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium font-body" style={{ color: 'var(--text-secondary)' }}>
          {allDone ? 'All done for today!' : `${completed} of ${total} complete`}
        </span>
        <span className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--progress-bg)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: allDone ? 'var(--success)' : 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
