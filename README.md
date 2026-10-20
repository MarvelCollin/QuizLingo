<img src="public/favicon.svg" alt="QuizLingo seal logo" width="64" height="64" />

# QuizLingo

Practice for the HSK 3.0 exam, levels 1 to 9. Every answer is saved to your account and schedules when you see the word again.

Live at [marvelcollin.com/quizlingo](https://marvelcollin.com/quizlingo/).

## Features

- **Accounts**: sign up with name, email and password. Progress follows you to any device
- **Eight ways to practice**: flashcards, meaning, listening, pinyin, reading a sentence, sentence listening, fill the gap and word order
- **Native audio**: real recordings for 6,941 words, the browser voice for the rest
- **Review schedule**: right answers push a word further out (1, 3, 7, 14, 30 days), wrong answers bring it back in 10 minutes
- **Dashboard**: words due today, words mastered per level, accuracy, streak, the last 14 days and recent rounds
- **Word list**: all 10,896 words with search, a filter on every column, sorting, and filters saved in the URL
- **Word pages**: readings, the characters in the word, and example sentences with pinyin and English
- **Characters**: all 3,088 characters of HSK 1 to 9 with animated stroke order, a character quiz, and writing practice for the 1,200 characters you need to write
- **Tones**: native recordings of single syllables and two character words, pick the tones you hear
- **Listening tests**: a script you can follow while it plays, tap any line to jump there, three speeds, and a Locate button on each answer that plays the line with the answer
- **Mock tests**: timed parts in the HSK 3.0 layout for every level, an answer grid, a hand in step per part, and results per part against the pass line
- **Grammar**: every grammar point of the 2025 syllabus with a short explanation and two examples
- **Speaking**: read sentences aloud, the browser's speech recogniser marks which characters it heard
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

`public/data/words.min.json` follows the **HSK exam syllabus** (《HSK 考试大纲》, published 2025-11 by the Center for Language Education and Cooperation, in force from 2026-07). The field `l` is the level a word first appears, and band 7-9 is stored as level 7.

| Level | New words | Total |
|-------|----------:|------:|
| HSK 1 | 300 | 300 |
| HSK 2 | 200 | 500 |
| HSK 3 | 500 | 1,000 |
| HSK 4 | 1,000 | 2,000 |
| HSK 5 | 1,600 | 3,600 |
| HSK 6 | 1,800 | 5,400 |
| HSK 7-9 | 5,600 | 11,000 |

The syllabus lists some words twice with different readings (还 hái and huán), so the app has 10,896 word cards. 18 words that neither dictionary covers have hand-written glosses in `scripts/manual-meanings.json`.

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

## 🎧 Study data

Built by `scripts/build-study-data.mjs` from the word list above and these open sources:

| Data | File | Source | License |
|------|------|--------|---------|
| 11,538 example sentences, each filed under the highest level it uses, with pinyin and English | `public/data/sentences-{level}.min.json` | [Tatoeba](https://tatoeba.org) Mandarin and English exports, pinyin from [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | CC BY 2.0 FR, each sentence links to its Tatoeba page |
| The 3,088 characters of HSK 1 to 9, with the 1,200 to write | `public/data/hanzi.min.json` | [krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0) `New HSK (2025)`, meanings from CC-CEDICT | CC BY-SA 4.0 |
| Stroke order for those characters | `public/data/strokes/` | [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) via [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) | Arphic Public License, see `ARPHICPL.TXT` |
| Native recordings of 6,941 words and 1,591 syllables | `public/audio/` | [audio-cmn](https://github.com/hugolpz/audio-cmn), voices by Yue Tan and Chen Wang | CC BY-SA |

Words without a recording are read by the browser's own Chinese voice.

```bash
node scripts/build-study-data.mjs \
  --tatoeba tatoeba \
  --hanzi "HSK-3.0/New HSK (2025)" \
  --cedict "HSK-3.0/Scripts and data/all_cedict.json" \
  --audio audio-cmn/24k-abr
```

The `tatoeba` folder holds `cmn_sentences.tsv`, `cmn-eng_links.tsv` and `eng_sentences.tsv` from https://downloads.tatoeba.org/exports/per_language/.
