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
- Search across decks and cards
- Turn pasted lecture notes or text-based files into a structured learning guide with a plain-language overview, key ideas, terms, and self-check questions
- Local progress, streak, and review activity
- Responsive desktop and mobile layouts

The explanation workspace reads PDFs up to 150 MB page by page, along with `.txt`, `.md`, `.csv`, and `.tsv` files. PDF extraction uses Mozilla PDF.js in the browser, so the lecture file is not uploaded. Image-only or scanned PDFs are detected and need OCR before they can be explained.
