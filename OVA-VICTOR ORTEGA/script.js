/* ============================================================
   OVA – TEORÍA GENERAL DE SISTEMAS
   script.js – Lógica interactiva completa
   Incluye: Navbar, Progreso, Tabs, Video, Drag&Drop, Quiz, Juego 2
   EDITAR: Busca los comentarios // EDITAR: para personalizar
============================================================ */

/* ─── 1. NAVBAR & MENÚ HAMBURGUESA ──────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navMenu    = document.getElementById('nav-menu');
const navbar     = document.getElementById('navbar');
const navLinks   = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

// Cierra el menú al hacer clic en un enlace
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// Sombra en navbar al hacer scroll
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});


/* ─── 2. BARRA DE PROGRESO DE LECTURA ────────────────────── */
const progressBar = document.getElementById('reading-progress-bar');

window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
});


/* ─── 3. INDICADOR DE SECCIÓN ACTIVA ────────────────────── */
// EDITAR: nombres de sección si agregas/quitas secciones al HTML
const sectionNames = {
  inicio:    'Inicio',
  teoria:    'Teoría',
  ejemplos:  'Ejemplos',
  video:     'Video',
  juegos:    'Juegos',
  quiz:      'Quiz'
};
const sectionIndicatorText = document.getElementById('section-indicator-text');
const allSections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      sectionIndicatorText.textContent = sectionNames[id] || id;

      // Marca el link activo en el navbar
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

allSections.forEach(s => sectionObserver.observe(s));


/* ─── 4. ANIMACIONES FADE-IN AL HACER SCROLL ─────────────── */
const fadeElements = document.querySelectorAll(
  '.concept-card, .theory-intro, .game-block, .quiz-container, .video-wrapper, .example-layout'
);
fadeElements.forEach(el => el.classList.add('fade-in-up'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElements.forEach(el => fadeObserver.observe(el));


/* ─── 5. TABS DE EJEMPLOS ────────────────────────────────── */
const tabBtns    = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + target)?.classList.add('active');
  });
});


/* ─── 6. VIDEO DE YOUTUBE (overlay de clic) ──────────────── */
const videoOverlay = document.getElementById('video-overlay');
const ytIframe     = document.getElementById('yt-iframe');
const videoPlayBtn = document.getElementById('video-play-btn');

if (videoOverlay && ytIframe) {
  videoOverlay.addEventListener('click', () => {
    // EDITAR: si cambias el src del iframe, asegúrate de agregar ?autoplay=1 al activar
    const src = ytIframe.src;
    if (src.includes('VIDEO_ID')) {
      // Aún no se ha configurado el ID del video
      alert('⚠️ Por favor reemplaza VIDEO_ID en el HTML con el ID real del video de YouTube.');
      return;
    }
    ytIframe.src = src.includes('?') ? src + '&autoplay=1' : src + '?autoplay=1';
    ytIframe.style.display = 'block';
    videoOverlay.style.display = 'none';
  });
}


/* ============================================================
   7. JUEGO 1 – EMPAREJAR CONCEPTOS (DRAG & DROP)
   EDITAR: Los pares están definidos en el HTML con
   data-term (términos) y data-pair (zonas de drop).
   Para agregar/quitar pares, modifica el HTML directamente.
============================================================ */
let draggedTerm = null;

const dragTerms  = document.querySelectorAll('.drag-term');
const dropZones  = document.querySelectorAll('.drop-zone');
const checkDragBtn  = document.getElementById('check-drag-btn');
const resetDragBtn  = document.getElementById('reset-drag-btn');
const dragResult    = document.getElementById('drag-result');

// ── Eventos de arrastre en escritorio
dragTerms.forEach(term => {
  term.addEventListener('dragstart', (e) => {
    if (term.classList.contains('used')) { e.preventDefault(); return; }
    draggedTerm = term;
    term.classList.add('dragging');
    e.dataTransfer.setData('text/plain', term.dataset.term);
  });
  term.addEventListener('dragend', () => {
    term.classList.remove('dragging');
    draggedTerm = null;
  });
});

dropZones.forEach(zone => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (!draggedTerm) return;

    // Si ya tiene un término, lo devolvemos a la columna
    const existing = zone.querySelector('.drag-term');
    if (existing) {
      existing.classList.remove('used');
      document.querySelector('.drag-terms-col').appendChild(existing);
    }

    draggedTerm.classList.add('used');
    zone.appendChild(draggedTerm);
    draggedTerm = null;
  });
});

// ── Touch/clic para móviles (selección en dos pasos)
let selectedTerm = null;
dragTerms.forEach(term => {
  term.addEventListener('click', () => {
    if (term.classList.contains('used')) return;
    dragTerms.forEach(t => t.style.outline = '');
    if (selectedTerm === term) { selectedTerm = null; return; }
    selectedTerm = term;
    term.style.outline = '3px solid var(--green)';
  });
});

dropZones.forEach(zone => {
  zone.addEventListener('click', () => {
    if (!selectedTerm) return;
    const existing = zone.querySelector('.drag-term');
    if (existing) {
      existing.classList.remove('used');
      existing.style.outline = '';
      document.querySelector('.drag-terms-col').appendChild(existing);
    }
    selectedTerm.classList.add('used');
    selectedTerm.style.outline = '';
    zone.appendChild(selectedTerm);
    selectedTerm = null;
  });
});

// ── Verificar respuestas
checkDragBtn.addEventListener('click', () => {
  let correct = 0;
  const total  = dropZones.length;

  dropZones.forEach(zone => {
    zone.classList.remove('matched', 'wrong');
    const dropped = zone.querySelector('.drag-term');
    if (dropped) {
      const isCorrect = dropped.dataset.term === zone.dataset.pair;
      zone.classList.add(isCorrect ? 'matched' : 'wrong');
      dropped.classList.add(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect) correct++;
    }
  });

  // EDITAR: Retroalimentación del juego de emparejamiento
  dragResult.classList.add('show');
  if (correct === total) {
    dragResult.className = 'game-result show success';
    dragResult.innerHTML = `🎉 ¡Perfecto! Emparejaste todos los conceptos correctamente (${correct}/${total}).`;
  } else if (correct >= Math.ceil(total / 2)) {
    dragResult.className = 'game-result show partial';
    dragResult.innerHTML = `👍 ¡Buen intento! Lograste ${correct} de ${total}. Revisa los resaltados en rojo.`;
  } else {
    dragResult.className = 'game-result show fail';
    dragResult.innerHTML = `📚 Obtuviste ${correct} de ${total}. Te recomendamos repasar la sección de Teoría y volver a intentarlo.`;
  }
});

// ── Reiniciar juego 1
resetDragBtn.addEventListener('click', () => {
  const termsCol = document.querySelector('.drag-terms-col');
  dropZones.forEach(zone => {
    const dropped = zone.querySelector('.drag-term');
    if (dropped) {
      dropped.classList.remove('used', 'correct', 'incorrect');
      dropped.style.outline = '';
      termsCol.appendChild(dropped);
    }
    zone.classList.remove('matched', 'wrong');
  });
  dragResult.classList.remove('show');
  dragResult.className = 'game-result';
  dragResult.innerHTML = '';
  selectedTerm = null;
  dragTerms.forEach(t => { t.style.outline = ''; t.classList.remove('used', 'correct', 'incorrect'); });
  // Re-barajar los términos visualmente
  shuffleChildren(termsCol);
});


/* ============================================================
   8. JUEGO 2 – ADIVINA EL CONCEPTO
   EDITAR: Modifica el array `guessRounds` para cambiar
   definiciones, respuesta correcta y opciones de distractor.
   Cada ronda tiene: { definition, correct, options[] }
   El array debe tener exactamente el mismo número de rondas
   que el valor de TOTAL_ROUNDS (o actualiza TOTAL_ROUNDS).
============================================================ */

// EDITAR: Aquí defines las rondas del juego. Agrega o modifica libremente.
const guessRounds = [
  {
    definition: 'Es la capacidad de un sistema para mantener su equilibrio dinámico frente a perturbaciones externas, usando mecanismos de retroalimentación para ajustarse continuamente.',
    correct:    'Homeostasis',
    options:    ['Homeostasis', 'Entropía', 'Sinergia', 'Emergencia']
  },
  {
    definition: 'Fenómeno por el cual el sistema como un todo posee propiedades o comportamientos que NO existen en ninguno de sus componentes analizados de forma aislada.',
    correct:    'Emergencia',
    options:    ['Retroalimentación', 'Homeostasis', 'Emergencia', 'Subsistema']
  },
  {
    definition: 'Proceso por el cual las salidas del sistema son monitoreadas y utilizadas como información de entrada para corregir o ajustar los procesos futuros del sistema.',
    correct:    'Retroalimentación',
    options:    ['Entropía', 'Retroalimentación', 'Sinergia', 'Input']
  },
  {
    definition: 'Medida del grado de desorden, desorganización o pérdida de energía útil dentro de un sistema. Aumenta en sistemas cerrados que no reciben energía del exterior.',
    correct:    'Entropía',
    options:    ['Homeostasis', 'Sinergia', 'Entropía', 'Emergencia']
  },
  {
    definition: 'Efecto que ocurre cuando el trabajo conjunto de los elementos de un sistema produce un resultado superior al que se obtendría si cada elemento actuara por separado.',
    correct:    'Sinergia',
    options:    ['Sinergia', 'Entropía', 'Totalidad', 'Homeostasis']
  },
  {
    definition: 'Tipo de sistema que intercambia libremente materia, energía e información con su entorno externo, permitiéndole adaptarse y sobrevivir en entornos cambiantes.',
    correct:    'Sistema Abierto',
    options:    ['Sistema Cerrado', 'Sistema Abierto', 'Suprasistema', 'Subsistema']
  }
];

// EDITAR: Cambia este número si agregas más rondas al array anterior
const TOTAL_ROUNDS = guessRounds.length;

let guessCurrentRound = 0;
let guessScore        = 0;
let guessAnswered     = false;

const guessDefinitionEl = document.getElementById('guess-definition');
const guessOptionsEl    = document.getElementById('guess-options');
const guessFeedbackEl   = document.getElementById('guess-feedback');
const guessRoundEl      = document.getElementById('guess-round');
const guessScoreEl      = document.getElementById('guess-score');
const nextRoundBtn      = document.getElementById('next-round-btn');
const restartGuessBtn   = document.getElementById('restart-guess-btn');

function loadGuessRound(index) {
  if (index >= TOTAL_ROUNDS) {
    showGuessFinal();
    return;
  }
  guessAnswered = false;
  const round = guessRounds[index];

  guessDefinitionEl.textContent = round.definition;
  guessRoundEl.textContent      = `Ronda: ${index + 1} / ${TOTAL_ROUNDS}`;
  guessFeedbackEl.textContent   = '';
  guessFeedbackEl.className     = 'guess-feedback';
  nextRoundBtn.style.display    = 'none';

  // Barajar las opciones
  const shuffled = shuffleArray([...round.options]);

  guessOptionsEl.innerHTML = '';
  shuffled.forEach(option => {
    const btn = document.createElement('button');
    btn.classList.add('guess-option');
    btn.textContent = option;
    btn.addEventListener('click', () => handleGuessAnswer(btn, option, round.correct));
    guessOptionsEl.appendChild(btn);
  });
}

function handleGuessAnswer(clickedBtn, selected, correct) {
  if (guessAnswered) return;
  guessAnswered = true;

  const allOpts = guessOptionsEl.querySelectorAll('.guess-option');
  allOpts.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) btn.classList.add('correct-ans');
  });

  if (selected === correct) {
    guessScore++;
    guessScoreEl.textContent    = `Puntaje: ${guessScore}`;
    guessFeedbackEl.textContent = '✅ ¡Correcto! Muy bien.';
    guessFeedbackEl.className   = 'guess-feedback correct';
  } else {
    clickedBtn.classList.add('wrong-ans');
    guessFeedbackEl.textContent = `❌ Incorrecto. La respuesta era: ${correct}.`;
    guessFeedbackEl.className   = 'guess-feedback wrong';
  }

  // Mostrar botón siguiente o resultado final
  if (guessCurrentRound + 1 < TOTAL_ROUNDS) {
    nextRoundBtn.style.display = 'inline-flex';
  } else {
    setTimeout(showGuessFinal, 800);
  }
}

function showGuessFinal() {
  // EDITAR: Mensajes finales del juego 2 según puntaje
  let emoji, msg;
  if (guessScore === TOTAL_ROUNDS) {
    emoji = '🏆'; msg = '¡Dominio total! Identificaste todos los conceptos correctamente.';
  } else if (guessScore >= Math.ceil(TOTAL_ROUNDS * 0.67)) {
    emoji = '👍'; msg = 'Buen desempeño. Repasa los conceptos que fallaste para reforzarlos.';
  } else {
    emoji = '📚'; msg = 'Te recomendamos repasar la sección Teoría antes de intentarlo de nuevo.';
  }
  guessDefinitionEl.innerHTML = `<strong>${emoji} Juego terminado — Puntaje final: ${guessScore} / ${TOTAL_ROUNDS}</strong><br/>${msg}`;
  guessOptionsEl.innerHTML    = '';
  guessFeedbackEl.textContent = '';
  nextRoundBtn.style.display  = 'none';
  restartGuessBtn.style.display = 'inline-flex';
}

nextRoundBtn.addEventListener('click', () => {
  guessCurrentRound++;
  loadGuessRound(guessCurrentRound);
});

restartGuessBtn.addEventListener('click', () => {
  guessCurrentRound      = 0;
  guessScore             = 0;
  guessScoreEl.textContent = 'Puntaje: 0';
  restartGuessBtn.style.display = 'none';
  loadGuessRound(0);
});

// Iniciar juego 2
loadGuessRound(0);


/* ============================================================
   9. QUIZ DE AUTOEVALUACIÓN
   EDITAR: Las preguntas y respuestas están definidas en el HTML
   con data-correct="true" en el input correcto de cada pregunta.
   La lógica de JS las lee automáticamente.
============================================================ */

const TOTAL_QUESTIONS = 5;
let currentQuestion   = 1;
let quizAnswers       = {};  // { q1: 'b', q2: 'c', ... }

const prevQBtn      = document.getElementById('prev-q-btn');
const nextQBtn      = document.getElementById('next-q-btn');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const quizResult    = document.getElementById('quiz-result');
const quizForm      = document.getElementById('quiz-form');
const progressFill  = document.getElementById('quiz-progress-fill');
const progressLabel = document.getElementById('quiz-progress-label');
const retryQuizBtn  = document.getElementById('retry-quiz-btn');

function updateQuizProgress(q) {
  const pct = (q / TOTAL_QUESTIONS) * 100;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Pregunta ${q} de ${TOTAL_QUESTIONS}`;
}

function showQuestion(num) {
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const el = document.getElementById('qq-' + i);
    if (el) el.style.display = i === num ? 'block' : 'none';
  }
  prevQBtn.disabled = num === 1;

  if (num === TOTAL_QUESTIONS) {
    nextQBtn.style.display   = 'none';
    submitQuizBtn.style.display = 'inline-flex';
  } else {
    nextQBtn.style.display   = 'inline-flex';
    submitQuizBtn.style.display = 'none';
  }
  updateQuizProgress(num);
}

// Guardar respuesta al cambiar
for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
  const radios = document.querySelectorAll(`input[name="q${i}"]`);
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      quizAnswers['q' + i] = radio.value;
    });
  });
}

nextQBtn.addEventListener('click', () => {
  if (currentQuestion < TOTAL_QUESTIONS) {
    currentQuestion++;
    showQuestion(currentQuestion);
  }
});

prevQBtn.addEventListener('click', () => {
  if (currentQuestion > 1) {
    currentQuestion--;
    showQuestion(currentQuestion);
  }
});

submitQuizBtn.addEventListener('click', () => {
  // Validar que todas estén respondidas
  let unanswered = [];
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    if (!quizAnswers['q' + i]) unanswered.push(i);
  }
  if (unanswered.length > 0) {
    alert(`Por favor responde ${unanswered.length > 1 ? 'las preguntas' : 'la pregunta'} ${unanswered.join(', ')} antes de enviar.`);
    showQuestion(unanswered[0]);
    currentQuestion = unanswered[0];
    return;
  }
  evaluateQuiz();
});

function evaluateQuiz() {
  let score = 0;

  // Resaltar correctas e incorrectas visualmente
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const questionEl = document.getElementById('qq-' + i);
    const options    = questionEl.querySelectorAll('.option-label');
    const userAnswer = quizAnswers['q' + i];

    options.forEach(label => {
      const radio    = label.querySelector('input');
      const isCorrect = radio.dataset.correct === 'true';
      const isSelected = radio.value === userAnswer;
      label.classList.remove('correct', 'incorrect', 'selected');

      if (isCorrect)  label.classList.add('correct');
      if (isSelected && !isCorrect) label.classList.add('incorrect');
      if (isSelected && isCorrect)  score++;
      radio.disabled = true;
    });
    questionEl.style.display = 'block';  // Mostrar todas al revisar
  }

  // EDITAR: Mensajes de retroalimentación del quiz según puntaje
  let titleText, feedbackText, iconText;
  if (score === 5) {
    iconText     = '🏆';
    titleText    = '¡Excelente dominio!';
    feedbackText = 'Obtuviste un puntaje perfecto. Tienes un sólido entendimiento de los conceptos fundamentales de la TGS.';
  } else if (score >= 3) {
    iconText     = '👏';
    titleText    = '¡Buen trabajo!';
    feedbackText = `Respondiste ${score}/5 correctamente. Repasa los conceptos en los que fallaste y vuelve a intentarlo.`;
  } else {
    iconText     = '📖';
    titleText    = 'Necesitas reforzar los conceptos';
    feedbackText = `Obtuviste ${score}/5. Te recomendamos revisar detenidamente la sección de Teoría y los Ejemplos antes de volver a evaluar.`;
  }

  document.getElementById('result-icon').textContent    = iconText;
  document.getElementById('result-title').textContent   = titleText;
  document.getElementById('result-score').textContent   = `Puntaje: ${score} / ${TOTAL_QUESTIONS}`;
  document.getElementById('result-feedback').textContent = feedbackText;

  // Ocultar form y mostrar resultado
  quizForm.style.display   = 'none';
  quizResult.style.display = 'block';
  progressFill.style.width = '100%';
  progressLabel.textContent = `Resultado final: ${score} / ${TOTAL_QUESTIONS}`;
}

// Reiniciar quiz
retryQuizBtn.addEventListener('click', () => {
  currentQuestion = 1;
  quizAnswers     = {};

  // Resetear radios
  quizForm.querySelectorAll('input[type="radio"]').forEach(r => {
    r.checked  = false;
    r.disabled = false;
  });
  quizForm.querySelectorAll('.option-label').forEach(l => {
    l.classList.remove('correct', 'incorrect', 'selected');
  });

  quizForm.style.display    = 'block';
  quizResult.style.display  = 'none';
  showQuestion(1);
});

// Inicializar quiz
showQuestion(1);


/* ─── UTILIDADES ─────────────────────────────────────────── */

// Barajar array (Fisher-Yates)
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Barajar nodos hijo de un elemento del DOM
function shuffleChildren(parent) {
  const children = Array.from(parent.children);
  shuffleArray(children);
  children.forEach(c => parent.appendChild(c));
}
