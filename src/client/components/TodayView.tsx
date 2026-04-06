import { useNavigate, Link } from 'react-router-dom';
import { useTodayAffirmations } from '../hooks/useTodayAffirmations';
import ProgressBar from './ProgressBar';

export default function TodayView() {
  const navigate = useNavigate();
  const { affirmations, loading, isCompleted } = useTodayAffirmations();

  const completedCount = affirmations.filter(a => isCompleted(a.id)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-lg border-b px-5 py-4"
        style={{
          background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold font-display" style={{ color: 'var(--text)' }}>
                Today's Affirmations
              </h1>
              <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <Link
                to="/manage"
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors font-body"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
              >
                Manage
              </Link>
            </div>
          </div>
          <ProgressBar completed={completedCount} total={affirmations.length} />
        </div>
      </div>

      {/* Affirmation Cards */}
      <div className="px-5 py-4 max-w-2xl mx-auto">
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {affirmations.length === 0 && (
            <div className="text-center py-20 md:col-span-2">
              <p className="text-lg mb-4 font-body" style={{ color: 'var(--text-muted)' }}>
                No affirmations for today
              </p>
              <Link to="/manage/new" className="font-body" style={{ color: 'var(--accent)' }}>
                Create your first affirmation
              </Link>
            </div>
          )}
          {affirmations.map(aff => {
            const done = isCompleted(aff.id);
            return (
              <button
                key={aff.id}
                onClick={() => navigate(`/today/${aff.id}`)}
                className="w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98]"
                style={{
                  background: done ? 'color-mix(in srgb, var(--bg-raised) 50%, var(--bg))' : 'var(--bg-raised)',
                  borderColor: done ? 'color-mix(in srgb, var(--border) 50%, transparent)' : 'var(--border)',
                  opacity: done ? 0.7 : 1,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                    style={{
                      background: done ? 'var(--success)' : 'transparent',
                      borderColor: done ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {done && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium truncate font-body ${done ? 'line-through' : ''}`}
                      style={{ color: done ? 'var(--text-muted)' : 'var(--text)' }}
                    >
                      {aff.title}
                    </h3>
                    <p className="text-xs mt-0.5 capitalize font-body" style={{ color: 'var(--text-muted)' }}>
                      {aff.cadence}
                    </p>
                  </div>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
