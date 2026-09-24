import { NavLink } from 'react-router';
import { Icon, type IconName } from './Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Today', icon: 'sun' },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-3">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${isActive ? 'text-fg' : 'text-faint'}`
            }
          >
            <Icon name={tab.icon} className="size-6" strokeWidth={1.75} />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
