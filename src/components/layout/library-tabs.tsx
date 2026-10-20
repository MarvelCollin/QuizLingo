import { NavLink } from 'react-router';
import { cn } from '../../lib/utils';

const TABS = [
  { to: '/words', label: 'Words' },
  { to: '/characters', label: 'Characters' },
  { to: '/grammar', label: 'Grammar' },
  { to: '/pinyin', label: 'Pinyin' },
] as const;

export const LibraryTabs = () => (
  <nav aria-label="Library" className="flex gap-1 border-b border-hairline">
    {TABS.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          cn(
            '-mb-px flex min-h-11 items-center border-b-2 px-3 text-base transition-colors duration-150',
            isActive ? 'border-strong font-semibold text-ink' : 'border-transparent font-medium text-muted hover:text-ink',
          )
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
);
