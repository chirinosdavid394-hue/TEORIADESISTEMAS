/* ═══════════════════════════════════════════════════════════
   OVA · DEFINICIONES DE SISTEMA · TGS
   JavaScript — Navbar, Juegos, Quiz
   ═══════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────
   NAVBAR: scroll + hamburger + active link
──────────────────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightNavLink();
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

function highlightNavLink() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const links    = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

/* ────────────────────────────────────────────────────────────
   TARJETAS EXPANDIBLES (autores)
──────────────────────────────────────────────────────────── */
function toggleExpand(btn) {
  const card   = btn.closest('.author-card');
  const expand = card.querySelector('.def-expand');
  const isOpen = expand.classList.toggle('open');
  btn.textContent = isOpen ? 'Ver menos ▴' : 'Ver más ▾';
}

/* ────────────────────────────────────────────────────────────
   MODALES DE EJEMPLOS
──────────────────────────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

/* ════════════════════════════════════════════════════════════
   JUEGO 1: SOPA DE LETRAS
════════════════════════════════════════════════════════════ */
const WS_WORDS = ['SISTEMA', 'ENTRADA', 'SALIDA', 'PROCESO', 'ELEMENTOS'];
const WS_SIZE  = 10; // 10x10

let wsGrid        = [];   // 10x10 char array
let wsWordData    = [];   // [{word, cells:[{r,c}]}]
let wsSelected    = [];   // células seleccionadas en el turno actual
let wsFoundWords  = [];   // palabras encontradas
let wsFirstClick  = null; // primera celda seleccionada

function initWordSearch() {
  wsGrid       = [];
  wsWordData   = [];
  wsSelected   = [];
  wsFoundWords = [];
  wsFirstClick = null;

  // Crear cuadrícula vacía
  for (let r = 0; r < WS_SIZE; r++) {
    wsGrid.push(Array(WS_SIZE).fill(''));
  }

  // Colocar palabras
  const directions = [
    [0,1],[1,0],[0,-1],[-1,0],   // H, V, H-inv, V-inv
    [1,1],[1,-1],[-1,1],[-1,-1]  // diagonales
  ];

  WS_WORDS.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const dir  = directions[Math.floor(Math.random() * directions.length)];
      const dr = dir[0], dc = dir[1];
      const startR = Math.floor(Math.random() * WS_SIZE);
      const startC = Math.floor(Math.random() * WS_SIZE);
      const cells  = [];

      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const nr = startR + dr * i;
        const nc = startC + dc * i;
        if (nr < 0 || nr >= WS_SIZE || nc < 0 || nc >= WS_SIZE) { fits = false; break; }
        if (wsGrid[nr][nc] !== '' && wsGrid[nr][nc] !== word[i]) { fits = false; break; }
        cells.push({ r: nr, c: nc });
      }

      if (fits) {
        cells.forEach((cell, i) => { wsGrid[cell.r][cell.c] = word[i]; });
        wsWordData.push({ word, cells });
        placed = true;
      }
    }
  });

  // Rellenar con letras aleatorias
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < WS_SIZE; r++) {
    for (let c = 0; c < WS_SIZE; c++) {
      if (wsGrid[r][c] === '') {
        wsGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  renderWordSearch();
}

function renderWordSearch() {
  const container = document.getElementById('wordGrid');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${WS_SIZE}, 38px)`;

  for (let r = 0; r < WS_SIZE; r++) {
    for (let c = 0; c < WS_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = wsGrid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;

      // Mark found
      const isFound = wsWordData.some(wd =>
        wsFoundWords.includes(wd.word) &&
        wd.cells.some(cl => cl.r === r && cl.c === c)
      );
      if (isFound) cell.classList.add('found');

      cell.addEventListener('click', onCellClick);
      container.appendChild(cell);
    }
  }

  // Word list
  const list = document.getElementById('wordList');
  list.innerHTML = '';
  WS_WORDS.forEach(w => {
    const li = document.createElement('li');
    li.className = 'word-item' + (wsFoundWords.includes(w) ? ' found-word' : '');
    li.textContent = w;
    li.id = 'wi-' + w;
    list.appendChild(li);
  });

  document.getElementById('foundCount').textContent = wsFoundWords.length;
  document.getElementById('ws-win-msg').style.display = wsFoundWords.length === 5 ? 'block' : 'none';
}

function onCellClick(e) {
  const r = parseInt(e.target.dataset.r);
  const c = parseInt(e.target.dataset.c);

  // Already found cell
  if (e.target.classList.contains('found')) return;

  if (!wsFirstClick) {
    // Primera celda
    wsFirstClick = { r, c };
    clearSelection();
    e.target.classList.add('selected');
  } else {
    // Segunda celda: validar si forman una palabra
    const r1 = wsFirstClick.r, c1 = wsFirstClick.c;
    const r2 = r, c2 = c;

    // Obtener celdas en la línea recta entre (r1,c1) y (r2,c2)
    const lineCells = getCellsBetween(r1, c1, r2, c2);

    if (lineCells) {
      const word = lineCells.map(cl => wsGrid[cl.r][cl.c]).join('');
      const wordRev = word.split('').reverse().join('');

      const matchFwd = WS_WORDS.find(w => w === word);
      const matchRev = WS_WORDS.find(w => w === wordRev);
      const matched  = matchFwd || matchRev;

      if (matched && !wsFoundWords.includes(matched)) {
        wsFoundWords.push(matched);
        // Mark found cells
        const actualCells = matchRev ? [...lineCells].reverse() : lineCells;
        actualCells.forEach(cl => {
          const cellEl = document.querySelector(`.grid-cell[data-r="${cl.r}"][data-c="${cl.c}"]`);
          if (cellEl) { cellEl.classList.remove('selected'); cellEl.classList.add('found'); }
        });
        document.getElementById('foundCount').textContent = wsFoundWords.length;
        const wi = document.getElementById('wi-' + matched);
        if (wi) wi.classList.add('found-word');
        if (wsFoundWords.length === 5) {
          document.getElementById('ws-win-msg').style.display = 'block';
        }
      } else {
        clearSelection();
      }
    } else {
      clearSelection();
      // Nueva primera selección
      wsFirstClick = { r, c };
      e.target.classList.add('selected');
      return;
    }

    wsFirstClick = null;
    clearSelection();
  }
}

function getCellsBetween(r1, c1, r2, c2) {
  const dr = r2 - r1, dc = c2 - c1;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return null;
  // Must be straight or diagonal
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  const cells = [];
  for (let i = 0; i <= len; i++) {
    cells.push({ r: r1 + stepR * i, c: c1 + stepC * i });
  }
  return cells;
}

function clearSelection() {
  document.querySelectorAll('.grid-cell.selected').forEach(el => el.classList.remove('selected'));
}

/* ════════════════════════════════════════════════════════════
   JUEGO 2: EMPAREJAR CONCEPTOS
════════════════════════════════════════════════════════════ */
const MATCH_PAIRS = [
  { term: 'Sistema',          def: 'Conjunto de elementos en interacción con un objetivo común.' },
  { term: 'Entrada',          def: 'Recursos o datos que ingresan al sistema desde el entorno.' },
  { term: 'Retroalimentación',def: 'Mecanismo por el cual la salida regula el funcionamiento interno.' },
  { term: 'Homeostasis',      def: 'Capacidad del sistema para mantener su equilibrio interno.' },
  { term: 'Emergencia',       def: 'Propiedades del todo que no poseen las partes por separado.' },
];

let matchSelectedTerm = null;
let matchSelectedDef  = null;
let matchScore        = 0;
let matchMatched      = [];

function initMatchGame() {
  matchSelectedTerm = null;
  matchSelectedDef  = null;
  matchScore        = 0;
  matchMatched      = [];

  const shuffledTerms = shuffle([...MATCH_PAIRS]);
  const shuffledDefs  = shuffle([...MATCH_PAIRS]);

  const termsCol = document.getElementById('matchTerms');
  const defsCol  = document.getElementById('matchDefs');

  termsCol.innerHTML = '<h4 class="col-title">📌 Conceptos</h4>';
  defsCol.innerHTML  = '<h4 class="col-title">📖 Definiciones</h4>';

  shuffledTerms.forEach(pair => {
    const item = document.createElement('div');
    item.className = 'match-item';
    item.textContent = pair.term;
    item.dataset.key = pair.term;
    item.dataset.type = 'term';
    item.addEventListener('click', onMatchClick);
    termsCol.appendChild(item);
  });

  shuffledDefs.forEach(pair => {
    const item = document.createElement('div');
    item.className = 'match-item';
    item.textContent = pair.def;
    item.dataset.key = pair.term; // same key as term
    item.dataset.type = 'def';
    item.addEventListener('click', onMatchClick);
    defsCol.appendChild(item);
  });

  document.getElementById('matchScore').textContent = '0';
  document.getElementById('matchFeedback').textContent = '';
}

function onMatchClick(e) {
  const el   = e.currentTarget;
  const type = el.dataset.type;
  const key  = el.dataset.key;

  if (el.classList.contains('matched')) return;

  if (type === 'term') {
    // Deselect previous term
    document.querySelectorAll('.match-item[data-type="term"].selected').forEach(el => el.classList.remove('selected'));
    el.classList.add('selected');
    matchSelectedTerm = { el, key };
  } else {
    // Deselect previous def
    document.querySelectorAll('.match-item[data-type="def"].selected').forEach(el => el.classList.remove('selected'));
    el.classList.add('selected');
    matchSelectedDef = { el, key };
  }

  // Check match if both selected
  if (matchSelectedTerm && matchSelectedDef) {
    if (matchSelectedTerm.key === matchSelectedDef.key) {
      // Correct
      matchSelectedTerm.el.classList.remove('selected');
      matchSelectedDef.el.classList.remove('selected');
      matchSelectedTerm.el.classList.add('matched');
      matchSelectedDef.el.classList.add('matched');
      matchScore++;
      document.getElementById('matchScore').textContent = matchScore;
      const fb = document.getElementById('matchFeedback');
      fb.textContent = matchScore < 5 ? '✅ ¡Correcto! Sigue emparejando...' : '🏆 ¡Excelente! Completaste todos los pares.';
      fb.style.color = matchScore < 5 ? '#81c784' : '#D4AF37';
    } else {
      // Wrong
      const termEl = matchSelectedTerm.el;
      const defEl  = matchSelectedDef.el;
      termEl.classList.add('wrong');
      defEl.classList.add('wrong');
      document.getElementById('matchFeedback').textContent = '❌ No coinciden. Intenta de nuevo.';
      document.getElementById('matchFeedback').style.color = '#ef9a9a';
      setTimeout(() => {
        termEl.classList.remove('wrong', 'selected');
        defEl.classList.remove('wrong', 'selected');
      }, 700);
    }
    matchSelectedTerm = null;
    matchSelectedDef  = null;
  }
}

/* ════════════════════════════════════════════════════════════
   QUIZ EVALUACIÓN
════════════════════════════════════════════════════════════ */
const QUIZ_QUESTIONS = [
  {
    text: '¿Cuál de los siguientes autores es considerado el padre de la Teoría General de Sistemas?',
    options: ['Norbert Wiener', 'Ludwig von Bertalanffy', 'Georg W. F. Hegel', 'Niklas Luhmann'],
    answer: 1,
    explanation: 'Ludwig von Bertalanffy (1901–1972) formuló la TGS como disciplina científica en la década de 1940.',
  },
  {
    text: '¿Qué concepto describe la propiedad de un sistema en la que el todo tiene propiedades que sus partes no poseen individualmente?',
    options: ['Homeostasis', 'Retroalimentación', 'Emergencia', 'Entropía'],
    answer: 2,
    explanation: 'La emergencia es la aparición de propiedades sistémicas que no existen en los componentes aislados.',
  },
  {
    text: 'En el modelo básico de sistema, ¿cuál es el componente que ajusta el comportamiento del sistema según la diferencia entre el estado actual y el deseado?',
    options: ['Entrada', 'Proceso', 'Salida', 'Retroalimentación'],
    answer: 3,
    explanation: 'La retroalimentación (feedback) es el mecanismo regulador, concepto clave en la cibernética de Wiener.',
  },
  {
    text: 'Según la TGS, ¿qué define el "límite" de un sistema?',
    options: [
      'La cantidad máxima de entradas que puede recibir',
      'La frontera que separa al sistema de su entorno',
      'El número de elementos que lo componen',
      'La velocidad de procesamiento de la información',
    ],
    answer: 1,
    explanation: 'El límite es la frontera que delimita qué pertenece al sistema y qué pertenece al entorno.',
  },
  {
    text: '¿Cuál de los siguientes NO es un ejemplo de sistema según la TGS?',
    options: [
      'El cuerpo humano',
      'Una computadora',
      'El color rojo',
      'El sistema solar',
    ],
    answer: 2,
    explanation: '"El color rojo" es una propiedad, no un conjunto de elementos en interacción. Los demás son sistemas con entradas, procesos, salidas y límites definidos.',
  },
];

let quizAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
let quizSubmitted = false;

function initQuiz() {
  quizAnswers  = new Array(QUIZ_QUESTIONS.length).fill(null);
  quizSubmitted = false;
  document.getElementById('quizResult').style.display   = 'none';
  document.getElementById('quizContainer').style.display = 'block';
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quizContainer');
  container.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  QUIZ_QUESTIONS.forEach((q, qi) => {
    const block = document.createElement('div');
    block.className = 'quiz-question';
    block.innerHTML = `<p class="q-number">Pregunta ${qi + 1} de ${QUIZ_QUESTIONS.length}</p>
                       <p class="q-text">${q.text}</p>
                       <div class="q-options" id="opts-${qi}"></div>`;

    const optsDiv = block.querySelector(`#opts-${qi}`);
    q.options.forEach((opt, oi) => {
      const btn = document.createElement('div');
      btn.className = 'q-option';
      if (quizAnswers[qi] === oi) btn.classList.add('selected');
      btn.innerHTML = `<span class="q-letter">${letters[oi]}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => selectAnswer(qi, oi));
      optsDiv.appendChild(btn);
    });

    container.appendChild(block);
  });

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.className = 'quiz-submit';
  submitBtn.textContent = 'Enviar respuestas →';
  submitBtn.addEventListener('click', submitQuiz);
  container.appendChild(submitBtn);
}

function selectAnswer(qi, oi) {
  if (quizSubmitted) return;
  quizAnswers[qi] = oi;

  // Update UI for this question
  const optsDiv = document.getElementById('opts-' + qi);
  optsDiv.querySelectorAll('.q-option').forEach((btn, idx) => {
    btn.classList.toggle('selected', idx === oi);
  });
}

function submitQuiz() {
  if (quizAnswers.includes(null)) {
    alert('Por favor responde todas las preguntas antes de enviar.');
    return;
  }
  quizSubmitted = true;

  let score = 0;
  QUIZ_QUESTIONS.forEach((q, qi) => {
    const optsDiv = document.getElementById('opts-' + qi);
    optsDiv.querySelectorAll('.q-option').forEach((btn, oi) => {
      btn.classList.remove('selected');
      if (oi === q.answer) btn.classList.add('reveal-correct');
      if (oi === quizAnswers[qi] && oi !== q.answer) btn.classList.add('incorrect');
      if (oi === quizAnswers[qi] && oi === q.answer) { btn.classList.remove('reveal-correct'); btn.classList.add('correct'); }
    });
    if (quizAnswers[qi] === q.answer) score++;
  });

  // Show result after a short delay
  setTimeout(() => showResult(score), 600);
}

function showResult(score) {
  document.getElementById('quizContainer').style.display = 'none';
  const resultDiv = document.getElementById('quizResult');
  resultDiv.style.display = 'block';

  const pct   = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const emoji = score === 5 ? '🏆' : score >= 3 ? '👍' : '📚';
  const msg   = score === 5 ? '¡Perfecto! Dominas los conceptos fundamentales.' :
                score >= 3  ? 'Buen trabajo. Repasa los temas donde tuviste dudas.' :
                              'Sigue estudiando. La práctica hace al maestro.';

  document.getElementById('resultScore').innerHTML = `${emoji}<br>${score} / ${QUIZ_QUESTIONS.length}<br><small style="font-size:20px;color:var(--white-dim)">${pct}% — ${msg}</small>`;

  let fbHTML = '<div>';
  QUIZ_QUESTIONS.forEach((q, qi) => {
    const correct = quizAnswers[qi] === q.answer;
    fbHTML += `<div class="feedback-item">
      <span class="fb-icon">${correct ? '✅' : '❌'}</span>
      <div><strong>P${qi+1}:</strong> ${correct ? 'Correcto.' : `Incorrecto. <span style="color:var(--gold)">Respuesta: ${q.options[q.answer]}.</span>`}<br>
      <span style="color:var(--white-dim);font-size:13px">${q.explanation}</span></div>
    </div>`;
  });
  fbHTML += '</div>';
  document.getElementById('resultFeedback').innerHTML = fbHTML;
}

/* ────────────────────────────────────────────────────────────
   UTILIDADES
──────────────────────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ────────────────────────────────────────────────────────────
   INIT al cargar la página
──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initWordSearch();
  initMatchGame();
  initQuiz();
});
