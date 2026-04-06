import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';

type ExtractState = 'idle' | 'extracting' | 'success' | 'error';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AffirmationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleDay, setScheduleDay] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [clipboardDismissed, setClipboardDismissed] = useState(false);
  const [extractState, setExtractState] = useState<ExtractState>('idle');
  const [extractError, setExtractError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getAffirmations().then(affs => {
      const aff = affs.find(a => a.id === Number(id));
      if (aff) {
        setTitle(aff.title);
        setBody(aff.body);
        setCadence(aff.cadence);
        setScheduleDay(aff.schedule_day ?? 0);
        setIsActive(Boolean(aff.is_active));
      }
      setLoading(false);
    });
  }, [id]);

  const handlePasteImage = async () => {
    setExtractState('extracting');
    setExtractError('');
    try {
      const clipboardItems = await navigator.clipboard.read();
      let imageBlob: Blob | null = null;
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type === 'image/png' || type === 'image/jpeg' || type === 'image/webp') {
            imageBlob = await item.getType(type);
            break;
          }
        }
        if (imageBlob) break;
      }
      if (!imageBlob) {
        setExtractState('error');
        setExtractError('No image found in clipboard. Copy an image first, then try again.');
        return;
      }
      const file = new File([imageBlob], 'clipboard-image.png', { type: imageBlob.type });
      const result = await api.extractFromImage(file);
      if (result.error) {
        setExtractState('error');
        setExtractError(result.error);
        return;
      }
      setTitle(result.title);
      setBody(result.body);
      setExtractState('success');
    } catch (err: unknown) {
      setExtractState('error');
      const msg = err instanceof Error ? err.message : 'Failed to read clipboard';
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setExtractError('Clipboard access denied. Please allow clipboard access and try again.');
      } else {
        setExtractError(msg);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      body,
      cadence,
      schedule_day: cadence === 'daily' ? null : scheduleDay,
      is_active: isActive ? 1 : 0,
    };
    if (isEdit) {
      await api.updateAffirmation(Number(id), data);
    } else {
      await api.createAffirmation(data);
    }
    navigate('/manage');
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
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/manage" className="transition-colors" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold font-display" style={{ color: 'var(--text)' }}>
            {isEdit ? 'Edit' : 'New'} Affirmation
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Clipboard Paste Banner */}
        {!isEdit && !clipboardDismissed && (
          <div
            className="rounded-xl border p-4 transition-all"
            style={{
              background: extractState === 'success'
                ? 'var(--success-soft)'
                : extractState === 'error'
                  ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-raised))'
                  : 'var(--bg-raised)',
              borderColor: extractState === 'success'
                ? 'color-mix(in srgb, var(--success) 30%, transparent)'
                : extractState === 'error'
                  ? 'color-mix(in srgb, var(--accent) 20%, var(--border))'
                  : 'var(--border)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {extractState === 'extracting' ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
                    />
                    <span className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
                      Extracting affirmation from image...
                    </span>
                  </div>
                ) : extractState === 'success' ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-body" style={{ color: 'var(--success)' }}>
                      Affirmation extracted! Review and edit below.
                    </span>
                  </div>
                ) : extractState === 'error' ? (
                  <div>
                    <p className="text-sm font-body mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {extractError}
                    </p>
                    <button
                      type="button"
                      onClick={handlePasteImage}
                      className="text-sm font-medium font-body"
                      style={{ color: 'var(--accent)' }}
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePasteImage}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium font-body" style={{ color: 'var(--text)' }}>
                        Paste image from clipboard
                      </p>
                      <p className="text-xs font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Copy an affirmation image, then tap here to extract it
                      </p>
                    </div>
                  </button>
                )}
              </div>
              {extractState !== 'extracting' && (
                <button
                  type="button"
                  onClick={() => setClipboardDismissed(true)}
                  className="flex-shrink-0 p-1 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors font-body"
            style={{
              background: 'var(--bg-input)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            placeholder="e.g., Morning Gratitude"
          />
        </div>

        {/* Body (Markdown) */}
        <div>
          <label className="block text-sm font-medium mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
            Affirmation Text{' '}
            <span style={{ color: 'var(--text-muted)' }}>(Markdown supported)</span>
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors font-mono text-sm leading-relaxed"
            style={{
              background: 'var(--bg-input)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            placeholder={"- I am grateful for this new day\n- I am worthy of love and success\n- I trust the process of life"}
          />
        </div>

        {/* Live Preview */}
        {body.trim() && (
          <div>
            <label className="block text-sm font-medium mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
              Preview
            </label>
            <div
              className="rounded-xl border p-5 sm:p-6"
              style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}
            >
              {title && (
                <h2 className="text-lg font-semibold font-display mb-4" style={{ color: 'var(--text)' }}>
                  {title}
                </h2>
              )}
              <div className="text-lg sm:text-xl leading-relaxed space-y-4 font-body" style={{ color: 'var(--text)' }}>
                <ReactMarkdown
                  components={{
                    ul: ({ children }) => <ul className="space-y-3 sm:space-y-4 list-none pl-0">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 flex-shrink-0 text-sm" style={{ color: 'var(--bullet)' }}>&#9679;</span>
                        <span>{children}</span>
                      </li>
                    ),
                    p: ({ children }) => <p className="mb-3">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold" style={{ color: 'var(--accent)' }}>{children}</strong>,
                  }}
                >
                  {body}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Cadence */}
        <div>
          <label className="block text-sm font-medium mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all capitalize font-body"
                style={{
                  background: cadence === c ? 'var(--accent)' : 'var(--bg-raised)',
                  color: cadence === c ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  border: cadence === c ? 'none' : '1px solid var(--border)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Day */}
        {cadence === 'weekly' && (
          <div>
            <label className="block text-sm font-medium mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
              Day of Week
            </label>
            <select
              value={scheduleDay}
              onChange={e => setScheduleDay(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors font-body"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              {DAY_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {cadence === 'monthly' && (
          <div>
            <label className="block text-sm font-medium mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
              Day of Month
            </label>
            <select
              value={scheduleDay}
              onChange={e => setScheduleDay(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors font-body"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}

        {/* Active toggle (edit only) */}
        {isEdit && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium font-body" style={{ color: 'var(--text-secondary)' }}>Active</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="relative w-12 h-7 rounded-full transition-colors"
              style={{ background: isActive ? 'var(--accent)' : 'var(--border)' }}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  isActive ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-semibold text-lg transition-colors active:scale-[0.98] font-body"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {isEdit ? 'Save Changes' : 'Create Affirmation'}
        </button>
      </form>
    </div>
  );
}
