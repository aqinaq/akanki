# Akanki

A free, local-first flashcard and quiz app. It runs entirely in the browser and stores your decks and progress in `localStorage`.

## Run it

```bash
npx serve .
```

Then open the URL printed in your terminal. You can also open `index.html` directly.

## Features

- Create, edit, and delete decks and cards
- Import `.csv`, `.tsv`, and `.txt` files (or paste cards using tabs, semicolons, or `::`)
- Turn pasted `Scenario:`, `Question:`, and `Answer:` blocks directly into a quiz deck
- Spaced-repetition review with four confidence ratings
- Automatic multiple-choice quizzes
- Two built-in Project Management exam decks (Variant 1 with 50 questions and Variant 3 with 49 visible questions), preserving the original scenarios and A–E choices
- Search across decks and cards
- Turn pasted lecture notes or text-based files into a structured learning guide with a plain-language overview, key ideas, terms, and self-check questions
- Local progress, streak, and review activity
- Responsive desktop and mobile layouts
- A2 and B1 vocabulary practice inspired by *English Vocabulary in Use*: meanings, synonyms, opposites, word families, sentence completion, and typed recall
- Add your own level-tagged words, save personal example sentences, and track vocabulary accuracy locally
- See 2,423 unique terms and phrases from the user-provided *English Vocabulary in Use* index directly on the Words page, grouped by its 100 units; mark terms known or for revision and review them in short sessions
- Reveal meanings, synonyms, opposites, related words, examples, and memory tips where reliable details are available; book review prompts use those details
- Import vocabulary on the Words page from CSV or JSON. Book files can include meanings and connections; files with complete A2/B1 word details create automatic practice tasks. Duplicate words are skipped.

The book vocabulary is stored in `book-vocabulary.json` and `book-vocabulary.csv`. The website loads the same content from `book-vocabulary-data.js` so it also works when `index.html` is opened directly. The files include the index terms, units, and checked word details for 225 entries. Other entries remain in the word bank and can be reviewed with the book; missing synonyms or opposites are left blank rather than guessed. The book describes its overall scope as upper A2 to B1; it does not label each index entry with a CEFR level.

The explanation workspace reads PDFs up to 150 MB page by page, along with `.txt`, `.md`, `.csv`, and `.tsv` files. PDF extraction uses Mozilla PDF.js in the browser, so the lecture file is not uploaded. Image-only or scanned PDFs are detected and need OCR before they can be explained.
