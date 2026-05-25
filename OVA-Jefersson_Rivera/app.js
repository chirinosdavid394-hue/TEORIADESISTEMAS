/* ══════════════════════════════════════════
   OVA · Enfoques de la TGS · app.js
   ══════════════════════════════════════════ */

/* ───────────────────────────────────────────
   NAV: toggle mobile menu + active highlight
   ─────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* Highlight active section */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
  });
}, { passive: true });


/* ═══════════════════════════════════════════════
   ╔══════════════════════════════════════════╗
   ║  JUEGO 1: EMPAREJAR CONCEPTOS           ║
   ║  → Arrastrar término sobre definición   ║
   ╚══════════════════════════════════════════╝

   Para cambiar las parejas, edita el array
   `matchPairs` con tus propios términos y def.
   ═══════════════════════════════════════════════ */

const matchPairs = [
  // { term: "Nombre", def: "Definición corta", id: número_único }
  { term: "Holístico",       def: "El todo es mayor que la suma de sus partes; estudia propiedades emergentes.", id: 1 },
  { term: "Cibernético",     def: "Analiza los mecanismos de retroalimentación y control en los sistemas.", id: 2 },
  { term: "Empírico",        def: "Se basa en la observación y experimentación directa sobre sistemas reales.", id: 3 },
  { term: "Epistemológico",  def: "Reflexiona sobre el origen, validez y límites del conocimiento sistémico.", id: 4 },
  { term: "Analítico",       def: "Descompone el sistema en partes para estudiarlas y luego reintegrarlas.", id: 5 },
];

let draggedId = null;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - .5);
}

function buildMatchGame() {
  const termsCol = document.getElementById('termsCol');
  const defsCol  = document.getElementById('defsCol');
  termsCol.innerHTML = '';
  defsCol.innerHTML  = '';

  const shuffledTerms = shuffle(matchPairs);
  const shuffledDefs  = shuffle(matchPairs);

  shuffledTerms.forEach(p => {
    const el = document.createElement('div');
    el.className    = 'match-term';
    el.textContent  = p.term;
    el.draggable    = true;
    el.dataset.id   = p.id;
    el.addEventListener('dragstart', e => {
      draggedId = p.id;
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    termsCol.appendChild(el);
  });

  shuffledDefs.forEach(p => {
    const el = document.createElement('div');
    el.className    = 'match-def';
    el.textContent  = p.def;
    el.dataset.id   = p.id;
    el.dataset.assigned = '';   // will hold the dragged id

    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', ()  => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      el.dataset.assigned = draggedId;
      el.classList.add('assigned');
      // Visual feedback: show which term was dropped
      const termName = matchPairs.find(x => x.id == draggedId)?.term || '';
      el.setAttribute('title', `Asignado: ${termName}`);
    });
    defsCol.appendChild(el);
  });

  document.getElementById('matchResult').classList.add('hidden');
}

document.getElementById('checkMatch').addEventListener('click', () => {
  const defs   = document.querySelectorAll('.match-def');
  const result = document.getElementById('matchResult');
  let correct  = 0;

  defs.forEach(d => {
    d.classList.remove('correct', 'incorrect');
    if (!d.dataset.assigned) return;
    if (parseInt(d.dataset.assigned) === parseInt(d.dataset.id)) {
      d.classList.add('correct'); correct++;
    } else {
      d.classList.add('incorrect');
    }
  });

  result.classList.remove('hidden', 'success', 'partial', 'fail');
  if (correct === matchPairs.length) {
    result.className = 'game-result success';
    result.textContent = `✅ ¡Perfecto! Todas las ${correct} parejas correctas.`;
  } else if (correct >= Math.ceil(matchPairs.length / 2)) {
    result.className = 'game-result partial';
    result.textContent = `⭐ ${correct} de ${matchPairs.length} correctas. ¡Casi! Revisa las marcadas en rojo.`;
  } else {
    result.className = 'game-result fail';
    result.textContent = `❌ ${correct} de ${matchPairs.length} correctas. Intenta de nuevo.`;
  }
});

document.getElementById('resetMatch').addEventListener('click', buildMatchGame);


/* ═══════════════════════════════════════════════
   ╔══════════════════════════════════════════╗
   ║  JUEGO 2: ADIVINA EL ENFOQUE            ║
   ║  → Lee la pista y escribe el nombre     ║
   ╚══════════════════════════════════════════╝

   Para cambiar las pistas, edita el array
   `adivinaClues` con nueva pista y respuesta.
   ═══════════════════════════════════════════════ */

const adivinaClues = [
  // { clue: "Descripción/pista", answer: "respuesta_en_minuscula" }
  { clue: "Soy el enfoque que usa datos del mundo real y experimentos para construir modelos. Confío en lo que puedo medir y observar.", answer: "empírico" },
  { clue: "Me pregunto cómo sabemos lo que sabemos. Analizo los paradigmas científicos y los límites del conocimiento en los sistemas.", answer: "epistemológico" },
  { clue: "Prefiero descomponer el sistema en piezas, estudiarlas por separado y luego unirlas para entender el conjunto.", answer: "analítico" },
  { clue: "Soy obsesionado con la retroalimentación, el control y la homeostasis. Los termostatos me encantan.", answer: "cibernético" },
  { clue: "Para mí, el todo siempre supera la suma de sus partes. Busco propiedades emergentes e interconexiones.", answer: "holístico" },
  { clue: "Represento los sistemas con ecuaciones, matrices y simulaciones computacionales para predecir su comportamiento.", answer: "matemático" },
];

let adivinaCurrent = 0;
let adivinaScore   = 0;
const adivinaAnswered = [];

function normalizeStr(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function buildAdivinaGame() {
  adivinaCurrent = 0;
  adivinaScore   = 0;
  adivinaAnswered.length = 0;
  document.getElementById('adivinaScore').textContent = '';
  renderAdivinaClue();
}

function renderAdivinaClue() {
  const container = document.getElementById('adivinaContent');
  if (adivinaCurrent >= adivinaClues.length) {
    // End screen
    container.innerHTML = `
      <div class="adivina-card">
        <p class="adivina-pista" style="font-size:1.2rem;">🎉 ¡Completaste todas las pistas!</p>
      </div>`;
    document.getElementById('adivinaScore').className = 'game-result success';
    document.getElementById('adivinaScore').textContent =
      `Puntuación final: ${adivinaScore} / ${adivinaClues.length} correctas`;
    document.getElementById('nextClue').disabled = true;
    return;
  }

  const clue = adivinaClues[adivinaCurrent];
  const dots = adivinaClues.map((_, i) => {
    let cls = 'progress-dot';
    if (i < adivinaCurrent) cls += ' done';
    if (i === adivinaCurrent) cls += ' current';
    return `<div class="${cls}"></div>`;
  }).join('');

  container.innerHTML = `
    <div class="progress-bar">${dots}</div>
    <div class="adivina-card">
      <p class="adivina-pista">"${clue.clue}"</p>
      <input
        type="text"
        id="adivinaInput"
        class="adivina-input"
        placeholder="Escribe el enfoque..."
        autocomplete="off"
      />
      <div id="adivinaFeedback" class="adivina-feedback"></div>
    </div>`;

  const input = document.getElementById('adivinaInput');
  input.focus();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAdivina();
  });
  document.getElementById('nextClue').disabled = false;
}

function checkAdivina() {
  const input    = document.getElementById('adivinaInput');
  const feedback = document.getElementById('adivinaFeedback');
  if (!input || !feedback) return;

  const userVal  = normalizeStr(input.value);
  const correctV = normalizeStr(adivinaClues[adivinaCurrent].answer);

  if (userVal === correctV || correctV.includes(userVal) && userVal.length > 3) {
    feedback.className  = 'adivina-feedback ok';
    feedback.textContent = `✅ ¡Correcto! Era: ${adivinaClues[adivinaCurrent].answer}`;
    adivinaScore++;
    input.disabled = true;
  } else if (userVal === '') {
    feedback.className  = 'adivina-feedback fail';
    feedback.textContent = '⚠️ Escribe una respuesta.';
    return;
  } else {
    feedback.className  = 'adivina-feedback fail';
    feedback.textContent = `❌ Incorrecto. La respuesta era: ${adivinaClues[adivinaCurrent].answer}`;
    input.disabled = true;
  }
  adivinaCurrent++;
  // Auto-advance after short delay
  setTimeout(renderAdivinaClue, 1400);
}

document.getElementById('nextClue').addEventListener('click', () => {
  const input = document.getElementById('adivinaInput');
  if (input && !input.disabled) {
    checkAdivina();
  } else {
    renderAdivinaClue();
  }
});
document.getElementById('resetAdivina').addEventListener('click', buildAdivinaGame);


/* Game tabs */
document.querySelectorAll('.game-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`game-${tab.dataset.game}`).classList.add('active');
  });
});


/* ═══════════════════════════════════════════════
   ╔══════════════════════════════════════════╗
   ║  QUIZ INTERACTIVO — 5 preguntas          ║
   ║  Para cambiar preguntas, edita el array  ║
   ║  `quizData` debajo.                      ║
   ╚══════════════════════════════════════════╝
   ═══════════════════════════════════════════════ */

const quizData = [
  /* ── Pregunta 1 ── */
  {
    q: "¿Cuál es el enfoque de la TGS que se basa principalmente en la observación y experimentación directa?",
    options: ["Enfoque Epistemológico", "Enfoque Empírico", "Enfoque Holístico", "Enfoque Cibernético"],
    correct: 1,  // índice 0-based de la opción correcta
    explanation: "El enfoque empírico utiliza datos del mundo tangible para construir y validar modelos sistémicos."
  },
  /* ── Pregunta 2 ── */
  {
    q: "La retroalimentación negativa es un concepto central del:",
    options: ["Enfoque Analítico", "Enfoque Matemático-Formal", "Enfoque Cibernético", "Enfoque Empírico"],
    correct: 2,
    explanation: "La cibernética estudia los mecanismos de control y retroalimentación. La retroalimentación negativa estabiliza el sistema."
  },
  /* ── Pregunta 3 ── */
  {
    q: "Según el enfoque holístico, ¿cuál de las siguientes afirmaciones es correcta?",
    options: [
      "Las partes del sistema pueden estudiarse de forma aislada para comprender el todo.",
      "El todo es igual a la suma de sus partes.",
      "El todo tiene propiedades emergentes que no pueden explicarse solo por sus partes.",
      "Solo los datos cuantitativos permiten comprender un sistema."
    ],
    correct: 2,
    explanation: "El enfoque holístico afirma que el todo tiene propiedades emergentes; el todo es mayor que la suma de sus partes."
  },
  /* ── Pregunta 4 ── */
  {
    q: "Un científico que se pregunta «¿cómo sabemos que nuestros modelos del sistema son válidos?» está adoptando un enfoque:",
    options: ["Analítico", "Epistemológico", "Empírico", "Matemático-Formal"],
    correct: 1,
    explanation: "El enfoque epistemológico reflexiona sobre el origen, validez y límites del conocimiento sistémico."
  },
  /* ── Pregunta 5 ── */
  {
    q: "El uso de ecuaciones diferenciales y simulaciones computacionales para predecir el comportamiento de un sistema corresponde al enfoque:",
    options: ["Holístico", "Cibernético", "Matemático-Formal", "Epistemológico"],
    correct: 2,
    explanation: "El enfoque matemático-formal usa modelos cuantitativos, álgebra de sistemas y simulaciones para predecir el comportamiento."
  },
];

function buildQuiz() {
  const form = document.getElementById('quizForm');
  form.innerHTML = '';

  quizData.forEach((item, qi) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-question';
    qDiv.dataset.qi = qi;

    const qText = document.createElement('p');
    qText.innerHTML = `<span class="q-num">${qi + 1}.</span> ${item.q}`;
    qDiv.appendChild(qText);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';

    item.options.forEach((opt, oi) => {
      const label = document.createElement('label');
      label.className = 'quiz-option';
      label.innerHTML = `
        <input type="radio" name="q${qi}" value="${oi}" />
        ${opt}`;
      optionsDiv.appendChild(label);
    });
    qDiv.appendChild(optionsDiv);
    form.appendChild(qDiv);
  });
}

document.getElementById('submitQuiz').addEventListener('click', () => {
  let score = 0;
  let allAnswered = true;

  quizData.forEach((item, qi) => {
    const selected = document.querySelector(`input[name="q${qi}"]:checked`);
    const qDiv     = document.querySelector(`.quiz-question[data-qi="${qi}"]`);
    const options  = qDiv.querySelectorAll('.quiz-option');

    if (!selected) { allAnswered = false; return; }

    const userAns = parseInt(selected.value);
    options.forEach((opt, oi) => {
      opt.style.pointerEvents = 'none';
      if (oi === item.correct) opt.classList.add('correct');
      if (oi === userAns && userAns !== item.correct) opt.classList.add('incorrect');
    });
    if (userAns === item.correct) score++;
  });

  if (!allAnswered) {
    alert('⚠️ Por favor responde todas las preguntas antes de enviar.');
    return;
  }

  document.getElementById('submitQuiz').disabled = true;

  const pct    = Math.round((score / quizData.length) * 100);
  const result = document.getElementById('quizResult');
  result.classList.remove('hidden');

  let emoji = '😕', msg = '';
  if (pct >= 80) { emoji = '🎉'; msg = '¡Excelente! Dominas los enfoques de la TGS.'; }
  else if (pct >= 60) { emoji = '👍'; msg = 'Buen trabajo. Repasa los enfoques en los que fallaste.'; }
  else { emoji = '📖'; msg = 'Te recomendamos revisar la sección Teoría y volver a intentarlo.'; }

  result.innerHTML = `
    <div class="quiz-score-label">Resultado</div>
    <div class="quiz-score">${score}/${quizData.length}</div>
    <div class="quiz-score-label">${pct}% de respuestas correctas</div>
    <div class="quiz-feedback">${emoji} ${msg}</div>
    <button class="quiz-retake" id="retakeBtn">🔄 Volver a intentar</button>
  `;
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });

  document.getElementById('retakeBtn').addEventListener('click', () => {
    result.classList.add('hidden');
    document.getElementById('submitQuiz').disabled = false;
    buildQuiz();
    window.scrollTo({ top: document.getElementById('quiz').offsetTop - 80, behavior: 'smooth' });
  });
});


/* ══════════════════════════════════════════
   INIT — ejecuta todo al cargar
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildMatchGame();
  buildAdivinaGame();
  buildQuiz();
});
