const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>`,
  cards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="15" height="14" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12"/></svg>`,
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.8.4-1.3 1-1.3 1.9M12 17h.01"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>`,
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

const state = { data:store.load(), view:'home', deckId:null, search:'', study:null, quiz:null };
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
  else if(state.view==='decks') content=decksView();
  else if(state.view==='deck') content=deckView();
  else if(state.view==='study') content=studyView();
  else if(state.view==='quiz-select') content=quizSelectView();
  else if(state.view==='quiz') content=quizView();
  else if(state.view==='stats') content=statsView();
  $('#app').innerHTML = state.view==='study' || state.view==='quiz' ? content : shell(content,state.view==='deck'?'decks':state.view);
  bindGlobal();
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
  return state.data.decks.filter(d=>d.name.toLowerCase().includes(q)||d.cards.some(c=>c.front.toLowerCase().includes(q)||c.back.toLowerCase().includes(q)));
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
    <div class="flash-wrap"><div class="flashcard ${s.flipped?'flipped':''}" data-action="flip"><div class="face front"><div class="face-label">Question</div><div class="face-text">${esc(c.front)}</div><div class="face-hint">Tap card or press space to reveal</div></div><div class="face back"><div class="face-label">Answer</div><div class="face-text">${esc(c.back)}</div><div class="face-hint">How well did you remember?</div></div></div></div>
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

function quizSelectView(){ return `<section class="page-head"><div><div class="eyebrow">Test yourself</div><h1>Quick quiz</h1><p class="subhead">Pick a deck. We’ll turn it into a multiple-choice challenge.</p></div></section>${deckGrid(filteredDecks())}`; }
function startQuiz(id){
  const d=state.data.decks.find(x=>x.id===id); if(!d||d.cards.length<2){toast('A quiz needs at least 2 cards');return;}
  const cards=[...d.cards].sort(()=>Math.random()-.5).slice(0,Math.min(10,d.cards.length));
  const questions=cards.map(c=>{const wrong=d.cards.filter(x=>x.id!==c.id).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.back);const options=[c.back,...wrong].sort(()=>Math.random()-.5);return {card:c,options,selected:null};});
  state.quiz={deckId:id,questions,index:0,score:0}; state.view='quiz'; render();
}
function quizView(){
  const q=state.quiz,d=state.data.decks.find(x=>x.id===q.deckId),item=q.questions[q.index]; if(!item) return quizDone(d,q);
  return `<main class="main"><div class="study-shell"><div class="study-top"><button class="icon-btn" data-action="exit-quiz">${ICONS.close}</button><div class="study-progress"><i style="width:${q.index/q.questions.length*100}%"></i></div><div class="study-counter">${q.index+1} / ${q.questions.length}</div></div>
    <section class="quiz-card"><div class="quiz-label">Choose the correct answer</div><div class="quiz-question">${esc(item.card.front)}</div><div class="options">${item.options.map((o,i)=>{const cls=item.selected?(o===item.card.back?'correct':o===item.selected?'wrong':''):'';return `<button class="option ${cls}" ${item.selected?'disabled':''} data-option="${i}"><span class="option-letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`}).join('')}</div>${item.selected?`<div class="quiz-next"><button class="btn btn-primary" data-action="quiz-next">${q.index===q.questions.length-1?'See results':'Next question'} ${ICONS.arrow}</button></div>`:''}</section></div></main>`;
}
function quizDone(d,q){ const pct=Math.round(q.score/q.questions.length*100); return `<main class="main"><div class="result"><div class="result-ring" style="--score:${pct*3.6}deg"><strong>${pct}%</strong></div><div class="eyebrow">Quiz complete</div><h1>${pct>=80?'Excellent work.':pct>=50?'Good progress.':'Keep practicing.'}</h1><p class="subhead">You got ${q.score} of ${q.questions.length} correct in ${esc(d.name)}.</p><div class="actions" style="justify-content:center;margin-top:27px"><button class="btn btn-outline" data-quiz="${d.id}">Try again</button><button class="btn btn-primary" data-action="exit-quiz">Back to deck</button></div></div></main>`; }

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
function importModal(){
  modal('Import cards',`<p class="subhead" style="margin-bottom:18px">Paste one card per line. Separate the front and back with a tab, semicolon, or <strong> :: </strong>.</p><div class="field"><label>Cards</label><textarea name="cards" required style="min-height:180px" placeholder="Capital of France :: Paris&#10;2 + 2 :: 4"></textarea></div>`,fd=>{
    const d=state.data.decks.find(x=>x.id===state.deckId); const lines=fd.get('cards').split('\n'); let n=0;
    lines.forEach(line=>{const parts=line.split(/\t|\s*::\s*|\s*;\s*/);if(parts.length>=2&&parts[0].trim()&&parts.slice(1).join(';').trim()){d.cards.push({id:uid(),front:parts[0].trim(),back:parts.slice(1).join(';').trim(),due:0,interval:0,ease:2.5,reviews:0});n++;}});
    if(!n){toast('No valid card pairs found');return;} store.save();closeModal();render();toast(`Imported ${n} card${n===1?'':'s'}`);
  },'Import cards');
}
function toast(msg){ const root=$('#toast-root');root.innerHTML=`<div class="toast">${esc(msg)}</div>`;setTimeout(()=>root.innerHTML='',2400); }

function bindGlobal(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;render();});
  document.querySelectorAll('[data-deck]').forEach(el=>el.onclick=e=>{if(e.target.closest('.kebab'))return;state.deckId=el.dataset.deck;state.view=state.view==='quiz-select'?'quiz-select':'deck';if(state.view==='quiz-select')startQuiz(el.dataset.deck);else render();});
  document.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>startStudy(b.dataset.study));
  document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>startQuiz(b.dataset.quiz));
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
  document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>rateCard(b.dataset.rate));
  document.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{const item=state.quiz.questions[state.quiz.index];item.selected=item.options[+b.dataset.option];if(item.selected===item.card.back)state.quiz.score++;render();});
  document.querySelectorAll('[data-edit-card]').forEach(b=>b.onclick=()=>cardModal(b.dataset.editCard));
  document.querySelectorAll('[data-delete-card]').forEach(b=>b.onclick=()=>{const d=state.data.decks.find(x=>x.id===state.deckId);if(confirm('Delete this card?')){d.cards=d.cards.filter(c=>c.id!==b.dataset.deleteCard);store.save();render();}});
  const search=$('#global-search'); if(search) search.oninput=e=>{state.search=e.target.value; if(state.view==='home')state.view='decks';render();setTimeout(()=>$('#global-search')?.focus(),0);};
}
function action(a){
  if(a==='new-deck')deckModal(); else if(a==='edit-deck')deckModal(true); else if(a==='new-card')cardModal(); else if(a==='import-cards')importModal();
  else if(a==='flip'){state.study.flipped=true;render();}
  else if(a==='exit-study'){state.view='deck';state.deckId=state.study.deckId;state.study=null;render();}
  else if(a==='study-again')startStudy(state.study.deckId);
  else if(a==='quiz-next'){state.quiz.index++;render();}
  else if(a==='exit-quiz'){state.view='deck';state.deckId=state.quiz.deckId;state.quiz=null;render();}
  else if(a==='delete-deck'){if(confirm('Delete this deck and all its cards?')){state.data.decks=state.data.decks.filter(d=>d.id!==state.deckId);store.save();state.view='decks';render();toast('Deck deleted');}}
}

document.addEventListener('keydown',e=>{
  if(state.view==='study'&&!$('#modal-root').children.length){
    if(e.code==='Space'){e.preventDefault();if(!state.study.flipped){state.study.flipped=true;render();}}
    if(state.study.flipped&&['1','2','3','4'].includes(e.key))rateCard(['again','hard','good','easy'][+e.key-1]);
  }
  if(e.key==='Escape'&&$('#modal-root').children.length)closeModal();
});

render();
