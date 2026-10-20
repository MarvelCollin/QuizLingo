import { LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useLogout, useSession } from '../../features/auth/use-session';
import { useRecordings } from '../../features/practice/use-recordings';
import { cn } from '../../lib/utils';
import { BrandMark } from './brand-mark';
import { isNavActive, NAV_ITEMS } from './nav-items';

// Desktop: navigation stays visible in the top bar. Mobile: a bottom tab bar with the same three places.
export const AppShell = () => {
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useRecordings();

  const handleSignOut = () => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) });

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-strong px-4 py-2 text-on-strong focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-hairline bg-bg">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4">
          <BrandMark />
          <nav aria-label="Main" className="hidden h-full items-stretch gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={isNavActive(item, pathname) ? 'page' : undefined}
                className={cn(
                  'flex items-center border-b-2 px-3 text-base transition-colors duration-150',
                  isNavActive(item, pathname)
                    ? 'border-strong font-semibold text-ink'
                    : 'border-transparent font-medium text-muted hover:text-ink',
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 text-sm text-muted md:flex">
              <UserRound aria-hidden="true" className="size-4" strokeWidth={1.75} />
              {session.data?.name}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={logout.isPending}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint disabled:opacity-60"
            >
              <LogOut aria-hidden="true" className="size-4" strokeWidth={1.75} />
              {logout.isPending ? 'Signing out' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:pt-10 sm:pb-16">
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-bg pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="grid grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs',
                    isActive ? 'font-bold text-strong' : 'font-medium text-muted',
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
