<img src="public/favicon.svg" alt="QuizLingo seal logo" width="64" height="64" />

# QuizLingo

Study app for the HSK 3.0 exam, levels 1 to 9: words, characters, grammar, tones, listening, speaking and timed mock tests. Every answer is saved to your account and schedules when you see the word again.

Live at [marvelcollin.com/quizlingo](https://marvelcollin.com/quizlingo/).

## Features

- **Starter path**: a guided start for people with no Chinese. Eight stages (how Chinese works, the four tones, the 23 first sounds, the vowel sounds, tones that change, writing basics, your first 61 words, your first sentences), 39 short lessons and a milestone at the end of each stage. Each lesson has cards with native audio, then a quiz. A milestone opens the next stage, and anyone who already knows a stage can test out of it from the first day
- **Animated tone lines**: every tone is drawn as a pitch line while you listen, and tone pairs and the tone changes of 不, 一 and two third tones are shown the same way
- **Pinyin chart**: every syllable with a native recording, by initial and final, with a tone picker and a finder
- **Sound pairs**: train the ear on b and p, j q x, zh and z, an and ang and the rest of the pairs learners mix up
- **Weak spots**: questions you miss are collected, and two right answers in a row clear each one
- **Try the strokes yourself**: draw the eight basic strokes over an outline, with a hint after a miss
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
- Vercel Functions in `api/` with Turso (libSQL), run in the Tokyo region next to the database
- [Hanzi Writer](https://hanziwriter.org) for stroke order and writing practice
- Browser Web Speech API for the fallback voice and for speech recognition
- Fonts: Figtree and Noto Serif SC, self hosted

## Project layout

```
api/              Vercel Functions: auth, progress, sessions, stats (api/_lib holds shared code)
src/app/          router and query client
src/components/   shared ui and layout components
src/features/     auth, dashboard, practice, progress, vocabulary, words, characters,
                  tones, tests (listening and mock), grammar, speaking, study (shared data)
public/data/      words, sentences, characters, strokes, listening tests and grammar notes
public/audio/     native word and syllable recordings
scripts/          data builders, the content checker and the bundle secret check
```

## Security

- The Turso URL and token are read only by the functions in `api/`. They never reach the browser
- `npm run build` ends with `scripts/check-bundle.mjs`, which fails the build if a secret shows up in `dist/`
- Passwords are hashed with scrypt, sessions are random tokens stored as SHA-256 hashes in an httpOnly cookie
- Failed sign ins are limited to 10 per email in 15 minutes, and sign ups to 10 per address per hour
- Passwords use scrypt at N=2^16, r=8, p=2 (the OWASP minimum). Older hashes are upgraded the next time that person signs in
- Saved rows per account are capped, and session, lesson and word ids are validated on the server
- Expired sessions are removed as people sign in
- `vercel.json` sets a Content Security Policy and other security headers

## 🚀 Setup

Local development:

```bash
cp .env.example .env.local   # TURSO_DATABASE_URL=file:local.db works offline
npm install
npm run dev                  # open http://localhost:5173/quizlingo/
```

The app lives under the `/quizlingo/` base path, and the API is served at `/quizlingo/api/`.

Tests:

```bash
npm test          # 120 tests in three groups
```

| Group | Folder | What it covers |
|-------|--------|----------------|
| web | `tests/web/` | pinyin and tone helpers, question builders, round setup, character filters, tone items, speech matching, mock test papers and scoring, and components (End round, word order, answer options, level picker keys, listening questions with Locate, the script view, the mock answer grid, the round hook that saves results), the starter path (unlocking, test out, lesson and milestone questions, tone line geometry, weak spots), the pinyin chart and sound pairs |
| api | `tests/api/` | review schedule, input checks, password hashing, and full flows against a temporary SQLite file: sign up, duplicate email, sign in, fake sessions, saving answers, rounds of every mode, starter path scores, stats, sign out, the 10 attempt sign in limit, the sign up limit, the row caps and the password hash upgrade |
| data | `tests/data/` | word counts per level, sentences rebuild from their words and stay within their level, 3,088 characters with stroke data, every listed recording exists, listening test and grammar note structure, and the starter path (every sound it plays has a recording, every animated character has stroke data, every word is HSK 1, no semicolons or em dashes in its text) |

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

## 🧭 Starter path

Written for QuizLingo and kept in `src/features/basics/content/`. It plays only recordings from the audio set above and animates only characters with stroke data, and `tests/data/basics.test.ts` fails if a lesson points at something missing.

| Stage | Lessons | What it teaches |
|-------|--------:|-----------------|
| Meet Chinese | 2 and a milestone | Characters, pinyin, initial, final and tone |
| The four tones | 4 and a milestone | Each tone with its pitch line, the neutral tone, tone marks, tone pairs in real words |
| First sounds | 7 and a milestone | b p m f, d t n l, g k h, j q x, zh ch sh r, z c s, y w |
| Vowel sounds | 8 and a milestone | Simple vowels, gliding vowels, n and ng endings, the i, u and ü families |
| Tones that change | 4 and a milestone | Two third tones, 不, 一 and the half third tone |
| Writing basics | 3 and a milestone | The basic strokes, stroke order, radicals |
| Your first words | 7 and a milestone | 61 HSK 1 words, which also join the review schedule |
| Your first sentences | 4 and a milestone | Greetings, saying who you are, polite phrases and small talk, in sentences that use only HSK 1 characters |

Pass marks are 70% for a lesson and 80% for a milestone. Scores are saved per account in the `basics_progress` table. Weak spots are kept in the browser, one list per account.

## 📝 Listening tests and grammar notes

| Data | Files | Notes |
|------|-------|-------|
| 40 listening tests, 6 per level for HSK 1 to 3 and 4 per level for HSK 4 to 7-9, each with a script, pinyin, English and questions | `public/data/listening-{level}.json` | Written for QuizLingo |
| All 593 grammar points of the 2025 syllabus, each with an explanation, a pattern and two examples | `public/data/grammar-{level}.json` | Point list from the syllabus via [krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0), notes written for QuizLingo |

Every Chinese line in these files is checked against the word list so it only uses words up to its own level:

```bash
node scripts/check-content.mjs public/data/listening-3.json 3
```

A few grammar examples stay above their level on purpose, where the grammar point itself is built on that word (for example 说不定 or 也罢).

## 🧪 Mock tests

Mock tests follow the HSK 3.0 section layout for each level (questions and minutes per part, set in `src/features/tests/mock-format.ts`). The questions are built from QuizLingo content, not from official past papers. The official HSK 3.0 scoring for levels 4 to 9 is not published yet, so those levels use 100 points per part and a 60 percent pass mark. Essays, translation and the speaking part of the real exam are not marked automatically, so they are left out.
