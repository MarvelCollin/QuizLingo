<img src="public/favicon.svg" alt="QuizLingo seal logo" width="64" height="64" />

# QuizLingo

Practice for the HSK 3.0 exam, levels 1 to 3. Every answer is saved to your account and schedules when you see the word again.

Live at [marvelcollin.com/quizlingo](https://marvelcollin.com/quizlingo/).

## Features

- **Accounts**: sign up with name, email and password. Progress follows you to any device
- **Four ways to practice**: flashcards you grade yourself, meaning quiz, listening quiz (browser speech) and pinyin quiz
- **Review schedule**: right answers push a word further out (1, 3, 7, 14, 30 days), wrong answers bring it back in 10 minutes
- **Dashboard**: words due today, words mastered per level, accuracy, streak, the last 14 days and recent rounds
- **Word list**: all 988 words with search, a filter on every column, sorting, and filters saved in the URL
- **Keyboard shortcuts** in practice: 1 to 4 to answer, Space to flip or replay, Enter for next
- **Light and dark mode**, mobile tab bar, WCAG AA contrast checked with axe

## Tech Stack

- React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query
- Vercel Functions in `api/` with Turso (libSQL)
- Fonts: Figtree and Noto Serif SC, self hosted

## Project layout

```
api/              Vercel Functions: auth, progress, sessions, stats (api/_lib holds shared code)
src/app/          router and query client
src/components/   shared ui and layout components
src/features/     auth, dashboard, practice, progress, vocabulary, words
public/data/      HSK 3.0 word lists built by scripts/build-hsk-data.mjs
```

## Security

- The Turso URL and token are read only by the functions in `api/`. They never reach the browser
- `npm run build` ends with `scripts/check-bundle.mjs`, which fails the build if a secret shows up in `dist/`
- Passwords are hashed with scrypt, sessions are random tokens stored as SHA-256 hashes in an httpOnly cookie
- Failed sign ins are limited to 10 per email in 15 minutes
- `vercel.json` sets a Content Security Policy and other security headers

## 🚀 Setup

Local development:

```bash
cp .env.example .env.local   # TURSO_DATABASE_URL=file:local.db works offline
npm install
npm run dev                  # open http://localhost:5173/quizlingo/
```

The app lives under the `/quizlingo/` base path, and the API is served at `/quizlingo/api/`.

Deploying on Vercel:

1. Import this repository at vercel.com/new (framework preset: Vite).
2. Add two environment variables, marked Sensitive: `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. Deploy. Tables are created on the first API request.
4. marvelcollin.com proxies `/quizlingo/*` to this project with a rewrite in its own `vercel.json`.

## 📚 Vocabulary data

`public/data/{1,2,3}.min.json` follow the **HSK exam syllabus** (《HSK 考试大纲》, published 2025-11 by the Center for Language Education and Cooperation, in force from 2026-07). Each file is cumulative: level 3 holds every word from levels 1 to 3. The field `l` is the level a word first appears.

| Level | New words | Total |
|-------|----------:|------:|
| HSK 1 | 300 | 300 |
| HSK 2 | 200 | 500 |
| HSK 3 | 500 | 1,000 |

Sources:

- Word list, levels and pinyin: transcription of the official syllabus by [hsk-tutor.com](https://github.com/uranbekanarbaev/hsk-3.0-vocabulary-dataset), checked against [krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0) (CC BY-SA 4.0). The syllabus content belongs to its rights holders.
- English meanings, traditional forms, radicals and frequency: [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT), with [CC-CEDICT](https://cc-cedict.org/) (CC BY-SA 4.0) for words it lacks.

Because the meanings come from CC-CEDICT, the generated data files are shared under **CC BY-SA 4.0**.

To rebuild the files, clone the three source repositories and run:

```bash
node scripts/build-hsk-data.mjs \
  --syllabus hsk-3.0-vocabulary-dataset/data/by-level \
  --dict complete-hsk-vocabulary/complete.min.json \
  --cedict "HSK-3.0/Scripts and data/all_cedict.json" \
  --out public/data
```
