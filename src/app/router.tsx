import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppShell } from '../components/layout/app-shell';
import { PageFallback } from '../components/layout/page-fallback';
import { RedirectIfSignedIn, RequireSignIn } from '../features/auth/route-guards';

// Each screen is its own chunk, so the first load ships only what it shows
const LoginPage = lazy(() => import('../features/auth/login-page'));
const RegisterPage = lazy(() => import('../features/auth/register-page'));
const DashboardPage = lazy(() => import('../features/dashboard/dashboard-page'));
const PracticePage = lazy(() => import('../features/practice/practice-page'));
const RoundPage = lazy(() => import('../features/practice/round-page'));
const NotFoundPage = lazy(() => import('../pages/not-found-page'));

const page = (element: ReactNode) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

export const router = createBrowserRouter([
  { path: '/login', element: <RedirectIfSignedIn>{page(<LoginPage />)}</RedirectIfSignedIn> },
  { path: '/register', element: <RedirectIfSignedIn>{page(<RegisterPage />)}</RedirectIfSignedIn> },
  {
    path: '/',
    element: (
      <RequireSignIn>
        <AppShell />
      </RequireSignIn>
    ),
    children: [
      { index: true, element: page(<DashboardPage />) },
      { path: 'practice', element: page(<PracticePage />) },
      { path: 'practice/round', element: page(<RoundPage />) },
    ],
  },
  { path: '*', element: page(<NotFoundPage />) },
]);
