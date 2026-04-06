import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';
import { useTodayAffirmations } from '../hooks/useTodayAffirmations';
import type { Affirmation } from '../lib/types';

export default function AffirmationReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const { isCompleted, markComplete, undoComplete } = useTodayAffirmations();

  const done = affirmation ? isCompleted(affirmation.id) : false;

  const load = useCallback(async () => {
    const affs = await api.getTodayAffirmations();
    const aff = affs.find(a => a.id === Number(id));
    if (aff) setAffirmation(aff);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = () => {
    if (!affirmation) return;
    if (done) {
      undoComplete(affirmation.id);
    } else {
      markComplete(affirmation.id);
    }
  };

  if (loading || !affirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="flex items-center px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto flex items-center w-full">
          <button
            onClick={() => navigate('/today')}
            className="transition-colors mr-3"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold truncate font-display" style={{ color: 'var(--text)' }}>
            {affirmation.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto text-xl sm:text-2xl leading-relaxed space-y-4 font-body" style={{ color: 'var(--text)' }}>
          <ReactMarkdown
            components={{
              ul: ({ children }) => <ul className="space-y-4 sm:space-y-5 list-none pl-0">{children}</ul>,
              li: ({ children }) => (
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="mt-1.5 flex-shrink-0 text-sm" style={{ color: 'var(--bullet)' }}>&#9679;</span>
                  <span>{children}</span>
                </li>
              ),
              p: ({ children }) => <p className="mb-4">{children}</p>,
              strong: ({ children }) => <strong className="font-bold" style={{ color: 'var(--accent)' }}>{children}</strong>,
            }}
          >
            {affirmation.body}
          </ReactMarkdown>
        </div>
      </div>

      {/* Bottom action */}
      <div
        className="sticky bottom-0 px-5 py-4 backdrop-blur-lg border-t"
        style={{
          background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] font-body"
            style={{
              background: done ? 'var(--success-soft)' : 'var(--accent)',
              color: done ? 'var(--success)' : 'var(--text-on-accent)',
              border: done ? '1px solid color-mix(in srgb, var(--success) 30%, transparent)' : 'none',
            }}
          >
            {done ? 'Completed - Tap to Undo' : "I've Read This Aloud"}
          </button>
        </div>
      </div>
    </div>
  );
}
