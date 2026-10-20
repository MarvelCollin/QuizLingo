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
const WordsPage = lazy(() => import('../features/words/words-page'));
const WordPage = lazy(() => import('../features/words/word-page'));
const GrammarPage = lazy(() => import('../features/grammar/grammar-page'));
const TestsPage = lazy(() => import('../features/tests/tests-page'));
const ListeningTestPage = lazy(() => import('../features/tests/listening-test-page'));
const MockTestPage = lazy(() => import('../features/tests/mock-test-page'));
const TonesPage = lazy(() => import('../features/tones/tones-page'));
const CharactersPage = lazy(() => import('../features/characters/characters-page'));
const CharacterPage = lazy(() => import('../features/characters/character-page'));
const CharacterQuizPage = lazy(() =>
  import('../features/characters/character-practice-page').then((m) => ({ default: m.CharacterQuizPage })),
);
const WritingPracticePage = lazy(() =>
  import('../features/characters/character-practice-page').then((m) => ({ default: m.WritingPracticePage })),
);
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
      { path: 'words', element: page(<WordsPage />) },
      { path: 'words/:word', element: page(<WordPage />) },
      { path: 'characters', element: page(<CharactersPage />) },
      { path: 'characters/:char', element: page(<CharacterPage />) },
      { path: 'practice/characters', element: page(<CharacterQuizPage />) },
      { path: 'practice/writing', element: page(<WritingPracticePage />) },
      { path: 'practice/tones', element: page(<TonesPage />) },
      { path: 'grammar', element: page(<GrammarPage />) },
      { path: 'tests', element: page(<TestsPage />) },
      { path: 'tests/listening/:id', element: page(<ListeningTestPage />) },
      { path: 'tests/mock/:level', element: page(<MockTestPage />) },
    ],
  },
  { path: '*', element: page(<NotFoundPage />) },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') });
