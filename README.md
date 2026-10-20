# HSK Flashcard

A modern, interactive flashcard and quiz application for preparing for the HSK 3.0 exam (Levels 1 to 3).

## 🌐 Live Demo

**Visit the app**: [https://marvelcollin.github.io/HSKFlashCard/](https://marvelcollin.github.io/HSKFlashCard/)

## 🎯 Features

- **Dual Learning Modes**: Flashcard and Quiz modes
- **HSK 3.0 Levels 1 to 3**: Vocabulary from the November 2025 HSK exam syllabus (300, 500 and 1,000 words, cumulative)
- **Randomized Questions**: Different order every session
- **Reveal Answer**: Option to see answers without submitting
- **Fully Responsive**: Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

- React 19 with TypeScript
- Vite
- Tailwind CSS
- GitHub Pages

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
