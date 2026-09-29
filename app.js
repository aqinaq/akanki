const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>`,
  cards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="15" height="14" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12"/></svg>`,
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.8.4-1.3 1-1.3 1.9M12 17h.01"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>`,
  explain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14.5M4 19.5A1.5 1.5 0 0 0 5.5 21H20M4 19.5A1.5 1.5 0 0 1 5.5 18H19"/><path d="m13 7 .5 1.5L15 9l-1.5.5L13 11l-.5-1.5L11 9l1.5-.5z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16m-10 4v6m4-6v6M9 7V4h6v3m3 0-1 14H7L6 7"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
};

const STARTER_DECKS = [
  { id:'spanish', name:'Spanish essentials', icon:'🇪🇸', color:'#ff8b6a', created:Date.now(), cards:[
    ['Buenos días','Good morning'],['¿Cómo estás?','How are you?'],['Gracias','Thank you'],['Por favor','Please'],['Hasta luego','See you later'],['Me llamo…','My name is…'],['¿Cuánto cuesta?','How much does it cost?'],['No entiendo','I do not understand']
  ]},
  { id:'biology', name:'Cell biology', icon:'🧬', color:'#7bb8ff', created:Date.now(), cards:[
    ['What is the powerhouse of the cell?','The mitochondrion'],['Where is genetic material stored?','In the nucleus'],['What does a ribosome do?','Synthesizes proteins'],['What is osmosis?','Movement of water across a semipermeable membrane'],['What is the cell membrane made of?','A phospholipid bilayer'],['What does ATP store?','Chemical energy']
  ]},
  { id:'js', name:'JavaScript concepts', icon:'⚡', color:'#ffd166', created:Date.now(), cards:[
    ['What does const prevent?','Reassignment of the variable binding'],['What is a closure?','A function bundled with its lexical environment'],['What does === compare?','Value and type without coercion'],['What is a Promise?','An object representing a future async result'],['What does Array.map return?','A new transformed array']
  ]}
].map(deck => ({...deck, cards:deck.cards.map((c,i)=>({id:`${deck.id}-${i}`,front:c[0],back:c[1],due:0,interval:0,ease:2.5,reviews:0}))}));

const store = {
  load(){
    try { return JSON.parse(localStorage.getItem('akanki-data')) || {decks:STARTER_DECKS, streak:1, studied:0, history:[0,0,0,0,0,0,0]}; }
    catch { return {decks:STARTER_DECKS, streak:1, studied:0, history:[0,0,0,0,0,0,0]}; }
  },
  save(){ localStorage.setItem('akanki-data', JSON.stringify(state.data)); }
};

const state = { data:store.load(), view:'home', deckId:null, search:'', study:null, quiz:null, explain:{source:'',fileName:'',level:'simple',result:null,status:'',pageCount:0,sourceType:''} };
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const dueCards = deck => deck.cards.filter(c => !c.due || c.due <= Date.now());

function shell(content, active=state.view){
  const totalDue = state.data.decks.reduce((n,d)=>n+dueCards(d).length,0);
  return `<div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark"><span>A</span></div><div class="brand-name">akanki</div></div>
      <nav class="nav">
        ${nav('home','Home',ICONS.home,active)}
        ${nav('explain','Explain',ICONS.explain,active)}
        ${nav('decks','My decks',ICONS.cards,active)}
        ${nav('quiz-select','Quick quiz',ICONS.quiz,active)}
        ${nav('stats','Progress',ICONS.stats,active)}
      </nav>
      <div class="side-bottom"><div class="daily-card"><div class="daily-label">Ready today</div><div class="daily-value">${totalDue}</div><div class="daily-copy">cards waiting for you</div></div></div>
    </aside>
    <main class="main">
      <div class="topbar"><div class="search">${ICONS.search}<input id="global-search" value="${esc(state.search)}" placeholder="Search decks or cards…" /></div><div class="avatar">A</div></div>
      ${content}
    </main>
  </div>`;
}
function nav(view,label,icon,active){ return `<button class="nav-btn ${active===view?'active':''}" data-view="${view}">${icon}<span>${label}</span></button>`; }

function render(){
  let content;
  if(state.view==='home') content=homeView();
  else if(state.view==='explain') content=explainView();
  else if(state.view==='decks') content=decksView();
  else if(state.view==='deck') content=deckView();
  else if(state.view==='study') content=studyView();
  else if(state.view==='quiz-select') content=quizSelectView();
  else if(state.view==='quiz') content=quizView();
  else if(state.view==='stats') content=statsView();
  $('#app').innerHTML = state.view==='study' || state.view==='quiz' ? content : shell(content,state.view==='deck'?'decks':state.view);
  bindGlobal();
}

function explainView(){
  const ex=state.explain;
  return `<section class="page-head explain-head"><div><div class="eyebrow">Understand, then remember</div><h1>Make this make sense.</h1><p class="subhead">Add lecture notes and turn dense material into a clear learning guide.</p></div></section>
    <section class="explain-layout">
      <div class="source-panel">
        <div class="panel-title"><div><span class="step-pill">1</span><h2>Add your material</h2></div><span class="privacy-note">Stays in this browser</span></div>
        <label class="upload-zone ${ex.status==='reading'?'is-reading':''}" id="lecture-dropzone" for="lecture-file">
          <input id="lecture-file" type="file" accept=".pdf,.txt,.md,.csv,.tsv,application/pdf,text/plain,text/markdown,text/csv" ${ex.status==='reading'?'disabled':''} />
          <span class="upload-icon">${ICONS.plus}</span>
          <strong>${ex.status==='reading'?'Reading your PDF…':ex.status==='error'?'PDF could not be read':ex.fileName?esc(ex.fileName):'Choose a lecture PDF'}</strong>
          <span>${ex.status==='reading'?esc(ex.progress||'Preparing pages'):ex.status==='error'?'Choose another file or export a fresh PDF copy':ex.fileName?`${ex.pageCount?`${ex.pageCount} pages · `:''}Ready — choose another anytime`:'PDF, TXT, Markdown, CSV or TSV · up to 150 MB'}</span>
        </label>
        ${ex.status==='scanned'?`<div class="file-alert"><strong>This PDF looks scanned.</strong><span>It contains images rather than selectable text. Run OCR first, or paste the lecture text below.</span></div>`:''}
        <div class="input-divider"><span>or paste your notes</span></div>
        <textarea id="lecture-source" class="lecture-source" placeholder="Paste lecture notes, a transcript, an article, or any topic you want explained…">${esc(ex.source)}</textarea>
        <div class="explain-controls"><div class="level-picker" role="group" aria-label="Explanation level"><button class="level-btn ${ex.level==='simple'?'active':''}" data-level="simple">Simple</button><button class="level-btn ${ex.level==='detailed'?'active':''}" data-level="detailed">Detailed</button><button class="level-btn ${ex.level==='exam'?'active':''}" data-level="exam">Exam prep</button></div><button class="btn btn-primary" data-action="generate-explanation">Explain this ${ICONS.arrow}</button></div>
      </div>
      <div class="explanation-panel">${ex.result?explanationResult(ex.result):explanationEmpty()}</div>
    </section>`;
}

function explanationEmpty(){
  return `<div class="explain-empty"><div class="explain-orbit"><span>✦</span></div><div class="eyebrow">Your guide will appear here</div><h2>From lecture to understanding</h2><p>We’ll break the material into a big-picture overview, essential ideas, useful terms, and questions that reveal what you actually understand.</p><div class="output-preview"><span>01</span><div><strong>The big picture</strong><small>A clear mental model first</small></div></div><div class="output-preview"><span>02</span><div><strong>Key ideas & terms</strong><small>The details worth keeping</small></div></div><div class="output-preview"><span>03</span><div><strong>Check your understanding</strong><small>Active recall, not rereading</small></div></div></div>`;
}

function sourceSentences(text){
  return text.replace(/\r/g,'\n').replace(/^\s*[#>*-]+\s*/gm,'').replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>24);
}
function makeExplanation(text,level){
  const clean=text.replace(/\r/g,'').trim();
  const contentClean=clean.replace(/^Page \d+\s*$/gm,'').trim();
  const lines=contentClean.split('\n').map(s=>s.replace(/^\s*[#>*-]+\s*/,'').trim()).filter(Boolean);
  const titleLine=lines.find(line=>line.length<90&&!/[.!?]$/.test(line));
  const title=(titleLine||state.explain.fileName.replace(/\.[^.]+$/,'')||'Your lecture').replace(/^\d+[.)]\s*/,'');
  const body=titleLine===lines[0]?contentClean.split('\n').slice(1).join('\n').trim():contentClean;
  const sentences=sourceSentences(body);
  const scored=sentences.map((sentence,index)=>({sentence,index,score:(sentence.length>55&&sentence.length<220?3:1)+(sentence.match(/\b(is|are|means|because|therefore|causes|leads to|consists of|refers to)\b/gi)||[]).length+(index<8?2:0)})).sort((a,b)=>b.score-a.score||a.index-b.index);
  const unique=[];
  for(const item of scored){
    const words=new Set(item.sentence.toLowerCase().match(/[a-z\u00c0-\u024f]{4,}/g)||[]);
    if(!unique.some(x=>{const other=new Set(x.sentence.toLowerCase().match(/[a-z\u00c0-\u024f]{4,}/g)||[]);return [...words].filter(w=>other.has(w)).length>Math.min(words.size,other.size)*.65;}))unique.push(item);
  }
  const max=level==='simple'?4:level==='exam'?7:6;
  const ideas=unique.slice(0,max).sort((a,b)=>a.index-b.index).map(x=>x.sentence);
  const overview=(sentences.length?sentences.slice(0,level==='simple'?2:3):lines.slice(0,3)).join(' ');
  const definitions=[];
  const definitionPattern=/^(.{2,55}?)\s+(?:is|are|means|refers to|can be defined as)\s+(.{10,180})[.!?]?$/i;
  sentences.forEach(sentence=>{const match=sentence.match(definitionPattern);if(match&&definitions.length<5)definitions.push({term:match[1].replace(/^(a|an|the)\s+/i,''),meaning:match[2]});});
  const questions=ideas.slice(0,level==='exam'?5:3).map((idea,i)=>{
    const topic=(idea.match(/^(?:The\s+)?(.{3,55}?)(?:\s+is\s+|\s+are\s+|\s+means\s+|,)/i)||[])[1];
    return topic?`In your own words, what is ${topic.trim()} and why does it matter?`:`What is the main point of idea ${i+1}, and how would you explain it without looking?`;
  });
  return {title,overview:overview||contentClean.slice(0,500),ideas,definitions,questions,wordCount:contentClean.split(/\s+/).length,level};
}
function explanationResult(result){
  return `<article class="explain-result"><div class="result-toolbar"><span class="result-label">Learning guide · ${result.wordCount} source words</span><button class="btn btn-soft btn-small" data-action="copy-explanation">Copy guide</button></div><div class="result-intro"><div class="eyebrow">${result.level==='exam'?'Exam-ready breakdown':result.level==='detailed'?'Detailed explanation':'Plain-language explanation'}</div><h2>${esc(result.title)}</h2><p>${esc(result.overview)}</p></div><section class="explain-section"><div class="section-number">01</div><div><h3>The big ideas</h3><div class="idea-list">${result.ideas.map((idea,i)=>`<div class="idea-item"><span>${i+1}</span><p>${esc(idea)}</p></div>`).join('')}</div></div></section>${result.definitions.length?`<section class="explain-section"><div class="section-number">02</div><div><h3>Terms to know</h3><div class="term-list">${result.definitions.map(item=>`<div><strong>${esc(item.term)}</strong><p>${esc(item.meaning)}</p></div>`).join('')}</div></div></section>`:''}<section class="explain-section"><div class="section-number">${result.definitions.length?'03':'02'}</div><div><h3>Check your understanding</h3><p class="section-copy">Answer these without looking back. If an answer feels fuzzy, revisit the matching idea above.</p><ol class="check-list">${result.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></div></section></article>`;
}
function explanationAsText(result){
  return `${result.title}\n\nTHE BIG PICTURE\n${result.overview}\n\nKEY IDEAS\n${result.ideas.map((idea,i)=>`${i+1}. ${idea}`).join('\n')}${result.definitions.length?`\n\nTERMS TO KNOW\n${result.definitions.map(item=>`${item.term}: ${item.meaning}`).join('\n')}`:''}\n\nCHECK YOUR UNDERSTANDING\n${result.questions.map((q,i)=>`${i+1}. ${q}`).join('\n')}`;
}

function homeView(){
  const totalDue=state.data.decks.reduce((n,d)=>n+dueCards(d).length,0);
  const first=state.data.decks.find(d=>dueCards(d).length);
  return `<section class="page-head"><div><div class="eyebrow">Your learning space</div><h1>Good to see you.</h1><p class="subhead">A little practice today goes a long way.</p></div><button class="btn btn-primary" data-action="new-deck">${ICONS.plus} New deck</button></section>
    <section class="hero-grid">
      <div class="focus-card"><div class="focus-tag"><i class="focus-dot"></i> Daily review</div><h2>${totalDue ? `${totalDue} cards are ready to review` : 'You’re all caught up'}</h2><p>${totalDue ? 'Keep your memory fresh with a focused review session.' : 'Nice work. Add more cards or try a quiz while you wait.'}</p>${first?`<button class="btn" data-study="${first.id}">Start reviewing ${ICONS.arrow}</button>`:''}<div class="focus-count">${totalDue}</div></div>
      <div class="stats-card"><div class="stats-top"><div><div class="eyebrow">Current streak</div><div class="big-stat">${state.data.streak} day${state.data.streak===1?'':'s'}</div><div class="stat-note">Keep the momentum going</div></div><div class="streak-bubble">🔥</div></div>${weekBars()}</div>
    </section>
    <section><div class="section-head"><h2>Your decks</h2><button class="btn btn-soft btn-small" data-view="decks">View all</button></div>${deckGrid(state.data.decks.slice(0,6))}</section>`;
}

function weekBars(){
  const labels=['M','T','W','T','F','S','S']; const today=(new Date().getDay()+6)%7;
  return `<div class="week-bars">${labels.map((l,i)=>`<div class="day"><div class="bar ${i===today?'today':''}"><i style="height:${Math.min(100,(state.data.history[i]||0)*14)}%"></i></div>${l}</div>`).join('')}</div>`;
}

function filteredDecks(){
  if(!state.search) return state.data.decks;
  const q=state.search.toLowerCase();
  return state.data.decks.filter(d=>d.name.toLowerCase().includes(q)||d.cards.some(c=>c.front.toLowerCase().includes(q)||c.back.toLowerCase().includes(q)||(c.scenario||'').toLowerCase().includes(q)));
}
function decksView(){ return `<section class="page-head"><div><div class="eyebrow">Library</div><h1>My decks</h1><p class="subhead">${state.data.decks.length} collections · ${state.data.decks.reduce((n,d)=>n+d.cards.length,0)} cards</p></div><button class="btn btn-primary" data-action="new-deck">${ICONS.plus} New deck</button></section>${deckGrid(filteredDecks())}`; }
function deckGrid(decks){
  if(!decks.length) return `<div class="empty">No decks found. Create one and start learning.</div>`;
  return `<div class="deck-grid">${decks.map(d=>{
    const due=dueCards(d).length, learned=d.cards.filter(c=>c.reviews>0).length, pct=d.cards.length?Math.round(learned/d.cards.length*100):0;
    return `<article class="deck-card" data-deck="${d.id}" style="--accent:${d.color}"><div class="deck-stripe"></div><div class="deck-top"><div class="deck-icon">${d.icon}</div><button class="kebab" aria-label="Deck options">···</button></div><h3>${esc(d.name)}</h3><div class="deck-meta">${d.cards.length} cards · ${pct}% learned</div><div class="deck-foot"><div class="progress"><i style="width:${pct}%"></i></div><span class="due-badge">${due} due</span></div></article>`;
  }).join('')}</div>`;
}

function deckView(){
  const d=state.data.decks.find(x=>x.id===state.deckId); if(!d){state.view='decks'; return decksView();}
  const learned=d.cards.filter(c=>c.reviews>0).length;
  return `<button class="back-link" data-view="decks">${ICONS.back} All decks</button>
    <section class="deck-summary"><div><div class="deck-title-row"><div class="deck-icon" style="background:${d.color}33">${d.icon}</div><div><h1>${esc(d.name)}</h1><p class="subhead">Keep going—every review makes this stick.</p></div></div><div class="metric-row"><div class="metric"><strong>${d.cards.length}</strong><span>Total cards</span></div><div class="metric"><strong>${dueCards(d).length}</strong><span>Due now</span></div><div class="metric"><strong>${learned}</strong><span>Seen before</span></div></div></div><div class="mode-actions"><button class="btn btn-outline" data-quiz="${d.id}">${ICONS.quiz} Quiz</button><button class="btn btn-primary" data-study="${d.id}">${ICONS.cards} Study now</button></div></section>
    <div class="section-head"><h2>Cards</h2><div class="actions"><button class="btn btn-soft btn-small" data-action="import-cards">Import</button><button class="btn btn-primary btn-small" data-action="new-card">${ICONS.plus} Add card</button></div></div>
    ${d.cards.length?`<div class="cards-list">${d.cards.map((c,i)=>`<article class="list-card"><span class="list-num">${String(i+1).padStart(2,'0')}</span><div class="list-front">${esc(c.front)}</div><div class="list-back">${esc(c.back)}</div><div class="list-actions"><button class="mini-btn" data-edit-card="${c.id}">${ICONS.edit}</button><button class="mini-btn" data-delete-card="${c.id}">${ICONS.trash}</button></div></article>`).join('')}</div>`:`<div class="empty">This deck is empty. Add your first card to begin.</div>`}
    <div class="actions" style="margin-top:25px"><button class="btn btn-outline btn-small" data-action="edit-deck">Edit deck</button><button class="btn btn-danger btn-small" data-action="delete-deck">Delete deck</button></div>`;
}

function startStudy(id){
  const d=state.data.decks.find(x=>x.id===id); if(!d||!d.cards.length){toast('Add some cards first');return;}
  const due=dueCards(d); state.study={deckId:id,cards:[...(due.length?due:d.cards)].sort(()=>Math.random()-.5),index:0,flipped:false}; state.view='study'; render();
}
function studyView(){
  const s=state.study,d=state.data.decks.find(x=>x.id===s.deckId); const c=s.cards[s.index];
  if(!c) return studyDone(d,s.cards.length);
  const pct=s.index/s.cards.length*100;
  return `<main class="main"><div class="study-shell"><div class="study-top"><button class="icon-btn" data-action="exit-study">${ICONS.close}</button><div class="study-progress"><i style="width:${pct}%"></i></div><div class="study-counter">${s.index+1} / ${s.cards.length}</div></div>
    <div class="flash-wrap"><div class="flashcard ${s.flipped?'flipped':''}" data-action="flip"><div class="face front"><div class="face-label">Question</div>${c.scenario?`<div class="flash-scenario">${esc(c.scenario)}</div>`:''}<div class="face-text">${esc(c.front)}</div><div class="face-hint">Tap card or press space to reveal</div></div><div class="face back"><div class="face-label">Answer</div><div class="face-text">${esc(c.back)}</div><div class="face-hint">How well did you remember?</div></div></div></div>
    <div class="rating-panel">${s.flipped?`<div class="ratings"><button class="rate" style="--rate:#d65e45" data-rate="again"><strong>Again</strong><span>&lt; 1 min</span></button><button class="rate" style="--rate:#d39b2a" data-rate="hard"><strong>Hard</strong><span>2 days</span></button><button class="rate" style="--rate:#3d8768" data-rate="good"><strong>Good</strong><span>4 days</span></button><button class="rate" style="--rate:#617dc5" data-rate="easy"><strong>Easy</strong><span>7 days</span></button></div><div class="shortcut-note">Keyboard shortcuts: 1 · 2 · 3 · 4</div>`:`<div class="show-answer"><button class="btn btn-primary" data-action="flip">Show answer</button></div>`}</div></div></main>`;
}
function studyDone(d,count){
  return `<main class="main"><div class="result"><div style="font-size:60px">🌿</div><div class="eyebrow">Session complete</div><h1>Nicely done.</h1><p class="subhead">You reviewed ${count} card${count===1?'':'s'} from ${esc(d.name)}. That effort compounds.</p><div class="actions" style="justify-content:center;margin-top:27px"><button class="btn btn-outline" data-action="study-again">Study again</button><button class="btn btn-primary" data-action="exit-study">Back to deck</button></div></div></main>`;
}
function rateCard(rating){
  const s=state.study,c=s.cards[s.index]; const days={again:0,hard:2,good:4,easy:7}[rating];
  c.reviews=(c.reviews||0)+1; c.interval=days; c.due=days?Date.now()+days*86400000:Date.now();
  if(rating==='again') c.ease=Math.max(1.3,(c.ease||2.5)-.2); if(rating==='easy') c.ease=(c.ease||2.5)+.15;
  state.data.studied++; const today=(new Date().getDay()+6)%7; state.data.history[today]=(state.data.history[today]||0)+1; store.save();
  s.index++; s.flipped=false; render();
}

function quizSelectView(){ return `<section class="page-head"><div><div class="eyebrow">Test yourself</div><h1>Quick quiz</h1><p class="subhead">Pick a deck, or paste scenario questions and start instantly.</p></div><button class="btn btn-primary" data-action="paste-quiz">${ICONS.plus} Paste a quiz</button></section>${deckGrid(filteredDecks())}`; }
function quizSetupModal(id){
  const d=state.data.decks.find(x=>x.id===id); if(!d||d.cards.length<2){toast('A quiz needs at least 2 cards');return;}
  modal('Set up your quiz',`<p class="subhead" style="margin-bottom:18px">Choose how many questions you want from <strong>${esc(d.name)}</strong>.</p><div class="field"><label for="quiz-question-count">Number of questions</label><input id="quiz-question-count" name="count" type="number" min="2" max="${d.cards.length}" value="${d.cards.length}" required inputmode="numeric" /><span class="field-note">Choose from 2 to ${d.cards.length}, the number of cards in this deck.</span></div>`,fd=>{
    const count=Number(fd.get('count'));
    if(!Number.isInteger(count)||count<2||count>d.cards.length){toast(`Choose a number from 2 to ${d.cards.length}`);return;}
    closeModal();startQuiz(id,count);
  },'Start quiz');
}
function startQuiz(id,count){
  const d=state.data.decks.find(x=>x.id===id); if(!d||d.cards.length<2){toast('A quiz needs at least 2 cards');return;}
  const questionCount=Math.max(2,Math.min(d.cards.length,Number(count)||d.cards.length));
  const cards=[...d.cards].sort(()=>Math.random()-.5).slice(0,questionCount);
  const questions=cards.map(c=>{
    const supplied=(c.options||[]).filter(Boolean);
    const wrong=d.cards.filter(x=>x.id!==c.id&&x.back!==c.back).sort(()=>Math.random()-.5).map(x=>x.back);
    const pool=supplied.length?supplied:[c.back,...wrong];
    const options=[...new Set([c.back,...pool])].slice(0,4).sort(()=>Math.random()-.5);
    return {card:c,options,selected:null};
  });
  state.quiz={deckId:id,questions,index:0}; state.view='quiz'; render();
}
function quizView(){
  const q=state.quiz,d=state.data.decks.find(x=>x.id===q.deckId),item=q.questions[q.index]; if(!item) return quizDone(d,q);
  return `<main class="main"><div class="study-shell"><div class="study-top"><button class="icon-btn" data-action="exit-quiz">${ICONS.close}</button><div class="study-progress"><i style="width:${q.index/q.questions.length*100}%"></i></div><div class="study-counter">${q.index+1} / ${q.questions.length}</div></div>
    <section class="quiz-card"><div class="quiz-label">Choose the correct answer</div>${item.card.scenario?`<div class="quiz-scenario"><strong>Scenario</strong><span>${esc(item.card.scenario)}</span></div>`:''}<div class="quiz-question">${esc(item.card.front)}</div><div class="options">${item.options.map((o,i)=>{const answered=item.selected!==null;const cls=answered?(o===item.card.back?'correct':o===item.selected?'wrong':''):'';return `<button class="option ${cls}" ${answered?'disabled':''} data-option="${i}"><span class="option-letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`}).join('')}</div>${item.selected!==null?`<div class="answer-feedback ${item.selected===item.card.back?'is-correct':'is-wrong'}">${item.selected===item.card.back?'Correct':'Not quite'}${item.selected===item.card.back?'':` · Correct answer: ${esc(item.card.back)}`}</div>`:''}<div class="quiz-nav"><button class="btn btn-outline" data-action="quiz-back" ${q.index===0?'disabled':''}>${ICONS.back} Back</button><span class="quiz-shortcut">Enter or → to continue</span><button class="btn btn-primary" data-action="quiz-next" ${item.selected===null?'disabled title="Choose an answer first"':''}>${q.index===q.questions.length-1?'See results':'Next'} ${ICONS.arrow}</button></div></section></div></main>`;
}
function quizDone(d,q){ const score=q.questions.filter(item=>item.selected===item.card.back).length,pct=Math.round(score/q.questions.length*100); return `<main class="main"><div class="result"><div class="result-ring" style="--score:${pct*3.6}deg"><strong>${pct}%</strong></div><div class="eyebrow">Quiz complete</div><h1>${pct>=80?'Excellent work.':pct>=50?'Good progress.':'Keep practicing.'}</h1><p class="subhead">You got ${score} of ${q.questions.length} correct in ${esc(d.name)}.</p><div class="actions" style="justify-content:center;margin-top:27px"><button class="btn btn-outline" data-quiz="${d.id}">Try again</button><button class="btn btn-primary" data-action="exit-quiz">Back to deck</button></div></div></main>`; }

function statsView(){
  const total=state.data.decks.reduce((n,d)=>n+d.cards.length,0), learned=state.data.decks.reduce((n,d)=>n+d.cards.filter(c=>c.reviews).length,0);
  return `<section class="page-head"><div><div class="eyebrow">Your progress</div><h1>Learning, measured.</h1><p class="subhead">A simple snapshot of the work you’ve put in.</p></div></section><section class="hero-grid"><div class="focus-card"><div class="focus-tag"><i class="focus-dot"></i> All time</div><h2>${state.data.studied} thoughtful reviews completed</h2><p>You’ve started learning ${learned} of your ${total} cards across ${state.data.decks.length} decks.</p><div class="focus-count">${state.data.studied}</div></div><div class="stats-card"><div class="stats-top"><div><div class="eyebrow">Current streak</div><div class="big-stat">${state.data.streak} day${state.data.streak===1?'':'s'}</div><div class="stat-note">This week’s activity</div></div><div class="streak-bubble">🔥</div></div>${weekBars()}</div></section><div class="deck-grid"><div class="stats-card"><div class="eyebrow">Cards learned</div><div class="big-stat">${learned}</div><div class="stat-note">of ${total} total cards</div></div><div class="stats-card"><div class="eyebrow">Decks created</div><div class="big-stat">${state.data.decks.length}</div><div class="stat-note">topics in your library</div></div><div class="stats-card"><div class="eyebrow">Retention</div><div class="big-stat">${state.data.studied?Math.min(96,72+Math.round(learned/Math.max(1,total)*20)):0}%</div><div class="stat-note">estimated from your reviews</div></div></div>`;
}

function modal(title,body,onSubmit,submitLabel='Save'){
  $('#modal-root').innerHTML=`<div class="modal-layer"><form class="modal"><div class="modal-head"><h2>${title}</h2><button type="button" class="icon-btn" data-modal-close>${ICONS.close}</button></div>${body}<div class="modal-actions"><button type="button" class="btn btn-soft" data-modal-close>Cancel</button><button class="btn btn-primary" type="submit">${submitLabel}</button></div></form></div>`;
  const form=$('#modal-root form'); form.addEventListener('submit',e=>{e.preventDefault();onSubmit(new FormData(form));});
  document.querySelectorAll('[data-modal-close]').forEach(b=>b.onclick=closeModal); $('.modal-layer').onclick=e=>{if(e.target.classList.contains('modal-layer'))closeModal();};
  setTimeout(()=>form.querySelector('input,textarea')?.focus(),30);
}
function closeModal(){ $('#modal-root').innerHTML=''; }
function deckModal(edit=false){
  const d=edit?state.data.decks.find(x=>x.id===state.deckId):null, colors=['#ff8b6a','#ffd166','#7bb8ff','#ae8cff','#63c59a']; let color=d?.color||colors[0];
  modal(edit?'Edit deck':'Create a new deck',`<div class="field"><label>Deck name</label><input name="name" required maxlength="60" value="${esc(d?.name||'')}" placeholder="e.g. French vocabulary" /></div><div class="field"><label>Icon or emoji</label><input name="icon" maxlength="4" value="${esc(d?.icon||'📚')}" /></div><div class="field"><label>Color</label><div class="color-row">${colors.map((c,i)=>`<button type="button" class="color-radio ${c===color?'selected':''}" style="background:${c}" data-color="${c}"></button>`).join('')}</div><input type="hidden" name="color" value="${color}" /></div>`,fd=>{
    if(edit){d.name=fd.get('name').trim();d.icon=fd.get('icon')||'📚';d.color=fd.get('color');}
    else {const nd={id:uid(),name:fd.get('name').trim(),icon:fd.get('icon')||'📚',color:fd.get('color'),created:Date.now(),cards:[]};state.data.decks.unshift(nd);state.deckId=nd.id;state.view='deck';}
    store.save();closeModal();render();toast(edit?'Deck updated':'Deck created');
  },edit?'Save changes':'Create deck');
  document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-color]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('input[name=color]').value=b.dataset.color;});
}
function cardModal(cardId=null){
  const d=state.data.decks.find(x=>x.id===state.deckId),c=cardId?d.cards.find(x=>x.id===cardId):null;
  modal(c?'Edit card':'Add a card',`<div class="field"><label>Front / question</label><textarea name="front" required placeholder="What do you want to remember?">${esc(c?.front||'')}</textarea></div><div class="field"><label>Back / answer</label><textarea name="back" required placeholder="The answer or explanation">${esc(c?.back||'')}</textarea></div>`,fd=>{
    if(c){c.front=fd.get('front').trim();c.back=fd.get('back').trim();}
    else d.cards.push({id:uid(),front:fd.get('front').trim(),back:fd.get('back').trim(),due:0,interval:0,ease:2.5,reviews:0});
    store.save();closeModal();render();toast(c?'Card updated':'Card added');
  },c?'Save changes':'Add card');
}

function parseSeparatedValues(text,delimiter){
  const rows=[]; let row=[],value='',quoted=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(char==='"'){
      if(quoted&&text[i+1]==='"'){value+='"';i++;}
      else quoted=!quoted;
    } else if(char===delimiter&&!quoted){row.push(value);value='';}
    else if((char==='\n'||char==='\r')&&!quoted){
      if(char==='\r'&&text[i+1]==='\n')i++;
      row.push(value); if(row.some(cell=>cell.trim()))rows.push(row); row=[]; value='';
    } else value+=char;
  }
  row.push(value); if(row.some(cell=>cell.trim()))rows.push(row);
  return rows;
}

function parseImportedCards(text,fileName=''){
  const clean=String(text).replace(/^\uFEFF/,'').trim();
  if(!clean)return [];
  const structured=parseScenarioQuestions(clean);
  if(structured.length)return structured;
  const extension=fileName.toLowerCase().split('.').pop();
  const sample=clean.split(/\r?\n/,5).join('\n');
  const counts={',':(sample.match(/,/g)||[]).length,';':(sample.match(/;/g)||[]).length,'\t':(sample.match(/\t/g)||[]).length};
  let delimiter=extension==='tsv'?'\t':Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  let rows;
  if(extension==='txt'&&clean.includes('::')&&!clean.includes('\t')){
    rows=clean.split(/\r?\n/).map(line=>line.split(/\s*::\s*/));
  } else if(!counts[delimiter]){
    rows=clean.split(/\r?\n/).map(line=>line.split(/\s*::\s*|\s*;\s*/));
  } else rows=parseSeparatedValues(clean,delimiter);

  const header=(rows[0]||[]).map(value=>value.trim().toLowerCase());
  const frontNames=['front','question','term']; const backNames=['back','answer','definition'];
  const frontIndex=header.findIndex(value=>frontNames.includes(value));
  const backIndex=header.findIndex(value=>backNames.includes(value));
  const hasHeader=frontIndex!==-1&&backIndex!==-1;
  if(hasHeader)rows.shift();
  return rows.map(row=>({
    front:(row[hasHeader?frontIndex:0]||'').trim(),
    back:(row[hasHeader?backIndex:1]||'').trim()
  })).filter(card=>card.front&&card.back);
}

function parseScenarioQuestions(text){
  const lines=String(text).replace(/\r/g,'').split('\n');
  const cards=[]; let current=null,field='';
  const cleanLine=line=>line.replace(/^[\s\u00a0]*(?:(?:\\?\*|[-•])[\s\u00a0]+)?/,'').trim();
  const append=(key,value)=>{current[key]=[current[key],value].filter(Boolean).join(' ').trim();};
  const finish=()=>{
    if(!current)return;
    if(current.question&&current.answer){
      const choices=current.choices||{};
      const answerMatch=current.answer.match(/^([A-H])(?:[.)]\s*(.*))?$/i);
      const answerLetter=answerMatch?.[1].toUpperCase();
      const answerText=answerMatch?.[2]?.trim();
      const back=(answerLetter&&choices[answerLetter])||answerText||current.answer;
      const options=Object.values(choices);
      cards.push({front:current.question,back,scenario:current.scenario||'',...(options.length>1?{options}: {})});
    }
    current=null; field='';
  };
  for(const raw of lines){
    const line=cleanLine(raw); if(!line)continue;
    let match=line.match(/^Scenario\s*:\s*(.*)$/i);
    if(match){finish();current={scenario:match[1].trim(),question:'',answer:'',choices:{}};field='scenario';continue;}
    match=line.match(/^Question\s*:\s*(.*)$/i);
    if(match){current=current||{scenario:'',question:'',answer:'',choices:{}};current.question=match[1].trim();field='question';continue;}
    match=line.match(/^Answer\s*:\s*(.*)$/i);
    if(match){current=current||{scenario:'',question:'',answer:'',choices:{}};current.answer=match[1].trim();field='answer';continue;}
    match=line.match(/^([A-H])[.)]\s+(.+)$/i);
    if(match&&current&&current.question&&!current.answer){current.choices[match[1].toUpperCase()]=match[2].trim();field='';continue;}
    if(current&&field)append(field,line);
  }
  finish();
  return cards;
}

function quizImportModal(){
  modal('Create quiz from text',`<p class="subhead" style="margin-bottom:18px">Paste two or more labeled blocks. Each one becomes a quiz question and also stays available as a flashcard.</p><div class="field"><label>Deck name</label><input name="name" required maxlength="60" value="Scenario quiz" /></div><div class="field"><label>Questions</label><textarea name="cards" required class="quiz-import-input" placeholder="Scenario: Two activities start from the same event…&#10;Question: What is the dashed arrow called?&#10;Answer: D. A dummy activity&#10;&#10;Scenario: A critical path includes contractor work…&#10;Question: Which type of dependency is this?&#10;Answer: A. External dependency"></textarea><span id="quiz-parse-status" class="field-note">Use Scenario:, Question:, and Answer:. Existing answer letters such as “D.” are removed automatically.</span></div>`,fd=>{
    const cards=parseScenarioQuestions(fd.get('cards'));
    if(cards.length<2){toast('Add at least 2 complete questions');return;}
    const deck={id:uid(),name:fd.get('name').trim(),icon:'🧠',color:'#ae8cff',created:Date.now(),cards:cards.map(card=>({id:uid(),...card,due:0,interval:0,ease:2.5,reviews:0}))};
    state.data.decks.unshift(deck);state.deckId=deck.id;store.save();closeModal();quizSetupModal(deck.id);toast(`Created a ${cards.length}-question quiz`);
  },'Create & start quiz');
  const input=$('textarea[name=cards]');
  input.oninput=()=>{const count=parseScenarioQuestions(input.value).length;$('#quiz-parse-status').textContent=count?`${count} complete question${count===1?'':'s'} detected`:'Use Scenario:, Question:, and Answer: for each item.';};
}

function importModal(){
  let fileName='';
  modal('Import cards or questions',`<p class="subhead" style="margin-bottom:18px">Choose a file or paste flashcards or scenario questions.</p><details class="format-help"><summary>See supported format examples</summary><div class="format-examples"><div><strong>Scenario quiz</strong><pre>Scenario: A planner draws a dashed arrow…&#10;Question: What is this arrow called?&#10;Answer: D. A dummy activity</pre></div><div><strong>CSV (.csv)</strong><pre>front,back&#10;"Hello, world",Greeting&#10;Capital of France,Paris</pre></div><div><strong>Plain text</strong><pre>Capital of France :: Paris&#10;2 + 2 ; 4</pre></div></div><p>Scenario blocks may also contain choices labeled <strong>A.</strong> through <strong>H.</strong>.</p></details><div class="field"><label for="card-file">Import a file</label><input id="card-file" type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain" /><span id="file-status" class="field-note">Scenario questions use Scenario:, Question:, and Answer: labels.</span></div><div class="import-divider"><span>or paste</span></div><div class="field"><label>Cards or questions</label><textarea name="cards" required style="min-height:220px" placeholder="Scenario: Two activities start from the same event…&#10;Question: What is the dashed arrow called?&#10;Answer: D. A dummy activity"></textarea></div>`,fd=>{
    const d=state.data.decks.find(x=>x.id===state.deckId); const cards=parseImportedCards(fd.get('cards'),fileName);
    cards.forEach(card=>d.cards.push({id:uid(),...card,due:0,interval:0,ease:2.5,reviews:0}));
    if(!cards.length){toast('No valid card pairs found');return;} store.save();closeModal();render();toast(`Imported ${cards.length} card${cards.length===1?'':'s'}`);
  },'Import cards');
  $('#card-file').onchange=async e=>{
    const file=e.target.files[0]; if(!file)return;
    if(file.size>5*1024*1024){e.target.value='';toast('Please choose a file under 5 MB');return;}
    try {
      fileName=file.name; const contents=await file.text();
      $('textarea[name=cards]').value=contents;
      const count=parseImportedCards(contents,fileName).length;
      $('#file-status').textContent=`${file.name} · ${count} valid card${count===1?'':'s'} found`;
    } catch { toast('That file could not be read'); }
  };
}
function toast(msg){ const root=$('#toast-root');root.innerHTML=`<div class="toast">${esc(msg)}</div>`;setTimeout(()=>root.innerHTML='',2400); }

function bindGlobal(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;render();});
  document.querySelectorAll('[data-deck]').forEach(el=>el.onclick=e=>{if(e.target.closest('.kebab'))return;state.deckId=el.dataset.deck;state.view=state.view==='quiz-select'?'quiz-select':'deck';if(state.view==='quiz-select')quizSetupModal(el.dataset.deck);else render();});
  document.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>startStudy(b.dataset.study));
  document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>quizSetupModal(b.dataset.quiz));
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
  document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>rateCard(b.dataset.rate));
  document.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{const item=state.quiz.questions[state.quiz.index];item.selected=item.options[+b.dataset.option];render();});
  document.querySelectorAll('[data-edit-card]').forEach(b=>b.onclick=()=>cardModal(b.dataset.editCard));
  document.querySelectorAll('[data-delete-card]').forEach(b=>b.onclick=()=>{const d=state.data.decks.find(x=>x.id===state.deckId);if(confirm('Delete this card?')){d.cards=d.cards.filter(c=>c.id!==b.dataset.deleteCard);store.save();render();}});
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.explain.source=$('#lecture-source')?.value||state.explain.source;state.explain.level=b.dataset.level;render();});
  const lectureSource=$('#lecture-source'); if(lectureSource) lectureSource.oninput=e=>{state.explain.source=e.target.value;};
  const lectureFile=$('#lecture-file'); if(lectureFile) lectureFile.onchange=e=>loadLectureFile(e.target.files[0]);
  const dropzone=$('#lecture-dropzone'); if(dropzone){
    dropzone.ondragover=e=>{e.preventDefault();dropzone.classList.add('dragging');};
    dropzone.ondragleave=()=>dropzone.classList.remove('dragging');
    dropzone.ondrop=e=>{e.preventDefault();dropzone.classList.remove('dragging');loadLectureFile(e.dataTransfer.files[0]);};
  }
  const search=$('#global-search'); if(search) search.oninput=e=>{state.search=e.target.value; if(state.view==='home')state.view='decks';render();setTimeout(()=>$('#global-search')?.focus(),0);};
}
async function loadLectureFile(file){
  if(!file)return;
  if(file.size>150*1024*1024){toast('Please choose a file under 150 MB');return;}
  if(!/\.(pdf|txt|md|csv|tsv)$/i.test(file.name)){toast('Choose a PDF or text-based lecture file');return;}
  if(/\.pdf$/i.test(file.name)||file.type==='application/pdf'){await loadPdfLecture(file);return;}
  try {state.explain.source=await file.text();state.explain.fileName=file.name;state.explain.pageCount=0;state.explain.sourceType='text';state.explain.status='ready';state.explain.result=null;render();toast('Lecture file ready');}
  catch {toast('That file could not be read');}
}
async function loadPdfLecture(file){
  const ex=state.explain;
  ex.fileName=file.name;ex.status='reading';ex.progress='Loading document';ex.pageCount=0;ex.sourceType='pdf';ex.result=null;render();
  try {
    const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.mjs';
    const bytes=new Uint8Array(await file.arrayBuffer());
    const pdf=await pdfjs.getDocument({data:bytes}).promise;
    ex.pageCount=pdf.numPages;
    const pages=[];
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
      ex.progress=`Page ${pageNumber} of ${pdf.numPages}`;
      if(pageNumber===1||pageNumber%4===0||pageNumber===pdf.numPages)render();
      const page=await pdf.getPage(pageNumber);
      const content=await page.getTextContent();
      let pageText='';
      for(const item of content.items){
        if(!('str' in item))continue;
        pageText+=item.str;
        pageText+=item.hasEOL?'\n':' ';
      }
      pageText=pageText.replace(/-\s*\n\s*(?=[a-z])/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
      if(pageText)pages.push(`Page ${pageNumber}\n${pageText}`);
    }
    ex.source=pages.join('\n\n');
    const meaningful=ex.source.replace(/Page \d+/g,'').trim();
    ex.status=meaningful.length<Math.max(100,pdf.numPages*20)?'scanned':'ready';
    ex.progress='';render();
    if(ex.status==='scanned')toast('This PDF needs OCR before it can be explained');
    else toast(`PDF ready · ${pdf.numPages} page${pdf.numPages===1?'':'s'}`);
  } catch(error){
    console.error(error);ex.status='error';ex.progress='';render();toast('Could not read this PDF. Try opening it and exporting a fresh copy.');
  }
}
function action(a){
  if(a==='new-deck')deckModal(); else if(a==='edit-deck')deckModal(true); else if(a==='new-card')cardModal(); else if(a==='import-cards')importModal(); else if(a==='paste-quiz')quizImportModal();
  else if(a==='flip'){state.study.flipped=true;render();}
  else if(a==='exit-study'){state.view='deck';state.deckId=state.study.deckId;state.study=null;render();}
  else if(a==='study-again')startStudy(state.study.deckId);
  else if(a==='quiz-back'){if(state.quiz.index>0){state.quiz.index--;render();}}
  else if(a==='quiz-next'){const item=state.quiz.questions[state.quiz.index];if(item?.selected!==null){state.quiz.index++;render();}}
  else if(a==='generate-explanation'){
    const source=$('#lecture-source')?.value.trim()||state.explain.source.trim();
    if(source.length<80){toast('Add a little more lecture material first');return;}
    state.explain.source=source;state.explain.result=makeExplanation(source,state.explain.level);render();
    setTimeout(()=>document.querySelector('.explanation-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),20);
  }
  else if(a==='copy-explanation'){
    const text=explanationAsText(state.explain.result);
    navigator.clipboard?.writeText(text).then(()=>toast('Learning guide copied')).catch(()=>toast('Could not copy the guide'));
  }
  else if(a==='exit-quiz'){state.view='deck';state.deckId=state.quiz.deckId;state.quiz=null;render();}
  else if(a==='delete-deck'){if(confirm('Delete this deck and all its cards?')){state.data.decks=state.data.decks.filter(d=>d.id!==state.deckId);store.save();state.view='decks';render();toast('Deck deleted');}}
}

document.addEventListener('keydown',e=>{
  if(state.view==='study'&&!$('#modal-root').children.length){
    if(e.code==='Space'){e.preventDefault();if(!state.study.flipped){state.study.flipped=true;render();}}
    if(state.study.flipped&&['1','2','3','4'].includes(e.key))rateCard(['again','hard','good','easy'][+e.key-1]);
  }
  if(state.view==='quiz'&&!$('#modal-root').children.length&&!e.repeat){
    const item=state.quiz?.questions[state.quiz.index];
    if(e.key==='ArrowLeft'&&state.quiz.index>0){e.preventDefault();state.quiz.index--;render();}
    if((e.key==='Enter'||e.key==='ArrowRight')&&item?.selected!==null){e.preventDefault();state.quiz.index++;render();}
  }
  if(e.key==='Escape'&&$('#modal-root').children.length)closeModal();
});

render();
