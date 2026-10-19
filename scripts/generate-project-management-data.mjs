import fs from 'node:fs';
import path from 'node:path';

const sources = [
  {
    id: 'project-management-variant-1',
    name: 'Project Management — Variant 1',
    icon: '📘',
    color: '#397c66',
    file: process.argv[2] || '/Users/aruispan/Downloads/project_management_mcq_transcription-2.md',
    answers: 'B C A B D A E A C E D D E E A C D A A C A B B C E D B D D D E A E E E B C B C C E D B D A E A C B C'.split(' ')
  },
  {
    id: 'project-management-variant-3',
    name: 'Project Management — Variant 3',
    icon: '📗',
    color: '#ae8cff',
    file: process.argv[3] || '/Users/aruispan/Downloads/Final Test - Variant 3 transcription.md',
    answers: 'A B C D A C B B A D C E A E B E C C C D E B A E A C D A B A B E E E D D A D C B C B D E D B C D E'.split(' ')
  }
];

function parseQuestions(markdown, answerLetters) {
  const pattern = /\*\*(\d+)\. Scenario:\*\*\s*([\s\S]*?)\n\n\*\*Question:\*\*\s*([\s\S]*?)\n\n((?:[A-E]\. [^\n]+(?:\n|$)){5})/g;
  const cards = [];
  for (const match of markdown.matchAll(pattern)) {
    const number = Number(match[1]);
    const choices = [...match[4].matchAll(/^([A-E])\.\s+(.+)$/gm)];
    const choiceMap = Object.fromEntries(choices.map(([, letter, text]) => [letter, text.trim()]));
    const answerLetter = answerLetters[number - 1];
    if (!answerLetter || !choiceMap[answerLetter]) throw new Error(`Missing answer for question ${number}`);
    cards.push({
      id: `q${number}`,
      front: match[3].trim(),
      back: choiceMap[answerLetter],
      scenario: match[2].trim(),
      options: choices.map(([, , text]) => text.trim()),
      answerLetter,
      due: 0,
      interval: 0,
      ease: 2.5,
      reviews: 0
    });
  }
  return cards;
}

const decks = sources.map(source => {
  const cards = parseQuestions(fs.readFileSync(source.file, 'utf8'), source.answers);
  if (cards.length !== source.answers.length) {
    throw new Error(`${source.name}: parsed ${cards.length} questions, expected ${source.answers.length}`);
  }
  return {
    id: source.id,
    name: source.name,
    icon: source.icon,
    color: source.color,
    created: 0,
    builtIn: true,
    cards
  };
});

const output = `// Generated from the two supplied Project Management transcriptions.\n` +
  `// Re-run scripts/generate-project-management-data.mjs to rebuild this file.\n` +
  `window.PROJECT_MANAGEMENT_DECKS = ${JSON.stringify(decks, null, 2)};\n`;

const destination = path.resolve(import.meta.dirname, '..', 'project-management-data.js');
fs.writeFileSync(destination, output);
console.log(`Wrote ${destination} (${decks.map(deck => deck.cards.length).join(' + ')} questions)`);
