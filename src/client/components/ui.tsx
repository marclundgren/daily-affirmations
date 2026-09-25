import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon, type IconName } from './Icon';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' };

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition active:scale-[0.97] disabled:opacity-40',
        variant === 'primary' && 'bg-accent text-on-accent',
        variant === 'secondary' && 'bg-surface-2 text-fg',
        variant === 'ghost' && 'text-muted',
        variant === 'danger' && 'bg-red-500/10 text-red-400',
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ icon, label, to, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string; to?: string }) {
  const classes = cx('grid size-11 place-items-center rounded-full text-muted transition active:scale-90 active:bg-surface-2', className);
  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label}>
        <Icon name={icon} />
      </Link>
    );
  }
  return (
    <button type="button" className={classes} aria-label={label} {...props}>
      <Icon name={icon} />
    </button>
  );
}

/** Screen scaffold: title bar that stays put, content below, room for the tab bar. */
export function Screen({ title, leading, trailing, children, tabs = true }: { title?: ReactNode; leading?: ReactNode; trailing?: ReactNode; children: ReactNode; tabs?: boolean }) {
  return (
    <div className={cx('mx-auto min-h-dvh max-w-xl px-4', tabs ? 'pb-28' : 'pb-safe')}>
      {(title || leading || trailing) && (
        <header className="sticky top-0 z-10 -mx-4 flex items-center gap-1 bg-bg/85 px-2 pt-safe pb-2 backdrop-blur-xl">
          <div className="flex min-w-11">{leading}</div>
          <h1 className="flex-1 truncate text-center text-[15px] font-semibold">{title}</h1>
          <div className="flex min-w-11 justify-end">{trailing}</div>
        </header>
      )}
      {children}
    </div>
  );
}

export function Section({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-[0.16em] text-faint">{title}</h2>
      {children}
      {footer && <p className="mt-2 px-1 text-xs leading-relaxed text-faint">{footer}</p>}
    </section>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-surface-2 p-1" role="radiogroup">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'h-10 rounded-full text-sm font-medium transition',
            value === o.value ? 'bg-bg text-fg shadow-sm' : 'text-muted',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center gap-4 rounded-2xl bg-surface px-4 py-3.5 text-left">
      <span className="flex-1">
        <span className="block text-[15px]">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-faint">{description}</span>}
      </span>
      <span className={cx('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-accent' : 'bg-surface-2')}>
        <span className={cx('absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
      </span>
    </button>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx('h-10 min-w-10 rounded-full px-3 text-sm font-medium transition active:scale-95', selected ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted')}
    >
      {children}
    </button>
  );
}

export function ProgressRing({ value, total, size = 76 }: { value: number; total: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const fraction = total ? value / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export { cx };
