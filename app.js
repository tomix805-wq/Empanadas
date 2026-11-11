(() => {
  const screens = document.querySelectorAll('.screen');
  const navButtons = document.querySelectorAll('[data-screen]');

  function showScreen(id) {
    screens.forEach(s => s.classList.toggle('active', s.id === `screen-${id}`));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
    btn.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && btn.dataset.screen) {
        e.preventDefault();
        showScreen(btn.dataset.screen);
      }
    });
  });

  // ---------- Origen ----------
  const origenInfo = {
    antiguo: 'Dato curioso: en distintas culturas antiguas existían masas rellenas para llevar comida de forma práctica. En Medio Oriente hay preparaciones como el sambusak que se parecen a la idea de la empanada.',
    espana: 'Dato curioso: en Galicia, España, la empanada suele ser grande y se corta en porciones. Se preparaba para fiestas, viajes y reuniones familiares.',
    america: 'Dato curioso: cuando la receta llegó a América, cada región la transformó. Cambiaron los rellenos, las masas y la forma de cocinarlas según los ingredientes locales.',
    variedades: 'Dato curioso: en Argentina son famosas las de carne, en Chile las de pino, en Colombia hay empanadas con masa de maíz, y en muchos lugares también hay versiones dulces.'
  };
  const detailText = document.getElementById('origen-detail-text');
  document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.info-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      detailText.textContent = origenInfo[card.dataset.info] || detailText.textContent;
    });
  });

  // ---------- Trivia ----------
  const triviaData = [
    { q: '¿Dónde se hicieron muy populares las empanadas grandes llamadas "empanada gallega"?', options: ['Galicia, España', 'Egipto', 'Canadá'], answer: 0, explain: 'La empanada gallega es típica de Galicia, en España.' },
    { q: '¿Cómo llegaron las empanadas a muchos países de América?', options: ['Por viajes y recetas desde España', 'Por internet', 'Por meteoritos'], answer: 0, explain: 'Las recetas viajaron con las personas y se adaptaron en cada lugar.' },
    { q: '¿Las empanadas pueden ser solo saladas?', options: ['No, también pueden ser dulces', 'Sí, siempre saladas', 'Solo pueden ser de carne'], answer: 0, explain: 'Existen empanadas dulces y saladas, con muchos rellenos.' },
    { q: '¿Cuál de estas es una forma común de cocinar empanadas?', options: ['Al horno o fritas', 'Congeladas al sol', 'Solo crudas'], answer: 0, explain: 'Según la región, se preparan al horno o fritas.' },
    { q: '¿Qué pasó con las empanadas al llegar a distintos lugares de América?', options: ['Se adaptaron con ingredientes locales', 'Desaparecieron', 'Se volvieron todas iguales'], answer: 0, explain: 'Cada región creó sus propias variedades.' }
  ];
  let triviaIndex = 0, triviaScore = 0, triviaLocked = false;
  const triviaQuestion = document.getElementById('trivia-question');
  const triviaOptions = document.getElementById('trivia-options');
  const triviaFeedback = document.getElementById('trivia-feedback');
  const triviaScoreEl = document.getElementById('trivia-score');
  const triviaProgress = document.getElementById('trivia-progress');
  const triviaNext = document.getElementById('trivia-next');

  function renderTrivia() {
    const item = triviaData[triviaIndex];
    triviaLocked = false;
    triviaNext.disabled = true;
    triviaFeedback.textContent = '';
    triviaFeedback.className = 'feedback';
    triviaQuestion.textContent = item.q;
    triviaProgress.textContent = `${triviaIndex + 1}/${triviaData.length}`;
    triviaOptions.innerHTML = '';
    item.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => answerTrivia(i, btn));
      triviaOptions.appendChild(btn);
    });
  }
  function answerTrivia(i, btn) {
    if (triviaLocked) return;
    triviaLocked = true;
    const item = triviaData[triviaIndex];
    const buttons = triviaOptions.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    if (i === item.answer) {
      triviaScore += 10;
      btn.classList.add('correct');
      triviaFeedback.textContent = '¡Correcto! ' + item.explain;
      triviaFeedback.classList.add('good');
    } else {
      btn.classList.add('wrong');
      buttons[item.answer].classList.add('correct');
      triviaFeedback.textContent = 'Casi. ' + item.explain;
      triviaFeedback.classList.add('bad');
    }
    triviaScoreEl.textContent = triviaScore;
    triviaNext.disabled = triviaIndex >= triviaData.length - 1;
    if (triviaIndex >= triviaData.length - 1) {
      triviaFeedback.textContent += ` Puntaje final: ${triviaScore}/${triviaData.length * 10}.`;
    }
  }
  triviaNext.addEventListener('click', () => {
    if (triviaIndex < triviaData.length - 1) { triviaIndex++; renderTrivia(); }
  });
  document.getElementById('trivia-restart').addEventListener('click', () => {
    triviaIndex = 0; triviaScore = 0; triviaScoreEl.textContent = '0'; renderTrivia();
  });

  // ---------- Memoria ----------
  const memorySymbols = ['🥟','🌽','🧀','🥩','🍗','🥔'];
  const memoryBoard = document.getElementById('memory-board');
  const memoryMovesEl = document.getElementById('memory-moves');
  const memoryPairsEl = document.getElementById('memory-pairs');
  const memoryLeftEl = document.getElementById('memory-left');
  const memoryFeedback = document.getElementById('memory-feedback');
  let memoryCards = [], revealed = [], matchedCount = 0, moves = 0, movesLeft = 18, lockBoard = false;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function initMemory() {
    memoryCards = shuffle([...memorySymbols, ...memorySymbols]).map((sym, idx) => ({ id: idx, sym, matched: false }));
    revealed = []; matchedCount = 0; moves = 0; movesLeft = 18; lockBoard = false;
    memoryMovesEl.textContent = moves;
    memoryPairsEl.textContent = `0/${memorySymbols.length}`;
    memoryLeftEl.textContent = movesLeft;
    memoryFeedback.textContent = '';
    memoryFeedback.className = 'feedback';
    renderMemory();
  }
  function renderMemory() {
    memoryBoard.innerHTML = '';
    memoryCards.forEach(card => {
      const btn = document.createElement('button');
      btn.className = 'memory-card';
      btn.type = 'button';
      btn.dataset.id = card.id;
      btn.setAttribute('aria-label', 'Carta oculta');
      btn.textContent = card.sym;
      if (card.matched) { btn.classList.add('matched', 'revealed'); btn.setAttribute('aria-label', `Carta ${card.sym}`); }
      btn.addEventListener('click', () => onMemoryClick(card.id));
      memoryBoard.appendChild(btn);
    });
  }
  function updateMemoryReveal() {
    memoryBoard.querySelectorAll('.memory-card').forEach(el => {
      const id = Number(el.dataset.id);
      const card = memoryCards.find(c => c.id === id);
      const isRevealed = revealed.includes(id) || card.matched;
      el.classList.toggle('revealed', isRevealed);
      el.classList.toggle('matched', card.matched);
      el.setAttribute('aria-label', isRevealed ? `Carta ${card.sym}` : 'Carta oculta');
    });
  }
  function onMemoryClick(id) {
    if (lockBoard) return;
    const card = memoryCards.find(c => c.id === id);
    if (!card || card.matched || revealed.includes(id)) return;
    if (movesLeft <= 0 && revealed.length === 0) return;
    revealed.push(id);
    updateMemoryReveal();
    if (revealed.length === 2) {
      moves++; movesLeft--;
      memoryMovesEl.textContent = moves;
      memoryLeftEl.textContent = movesLeft;
      const [aId, bId] = revealed;
      const a = memoryCards.find(c => c.id === aId);
      const b = memoryCards.find(c => c.id === bId);
      if (a.sym === b.sym) {
        a.matched = b.matched = true;
        matchedCount++;
        memoryPairsEl.textContent = `${matchedCount}/${memorySymbols.length}`;
        memoryFeedback.textContent = '¡Muy bien! Encontraste una pareja.';
        memoryFeedback.className = 'feedback good';
        revealed = [];
        updateMemoryReveal();
        if (matchedCount === memorySymbols.length) {
          memoryFeedback.textContent = `¡Ganaste! Encontraste todas las parejas en ${moves} movimientos.`;
        }
      } else {
        lockBoard = true;
        memoryFeedback.textContent = 'No coinciden, intenta otra vez.';
        memoryFeedback.className = 'feedback bad';
        setTimeout(() => { revealed = []; lockBoard = false; updateMemoryReveal(); checkMemoryEnd(); }, 700);
        return;
      }
      checkMemoryEnd();
    }
  }
  function checkMemoryEnd() {
    if (matchedCount === memorySymbols.length) return;
    if (movesLeft <= 0 && revealed.length === 0) {
      lockBoard = true;
      memoryFeedback.textContent = 'Se acabaron los movimientos. Pulsa "Nueva partida" para intentarlo de nuevo.';
      memoryFeedback.className = 'feedback bad';
    }
  }
  document.getElementById('memory-restart').addEventListener('click', initMemory);

  // ---------- Arma tu empanada ----------
  const buildState = { masa: null, relleno: null, coccion: null, repulgue: null };
  const buildPreview = document.getElementById('build-preview');
  const buildSummary = document.getElementById('build-summary');
  const buildCookBtn = document.getElementById('build-cook');

  function updateChoiceSelection(group, value) {
    document.querySelectorAll(`.choice-group[data-group="${group}"] .choice`).forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === value);
    });
  }

  document.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.choice-group').dataset.group;
      buildState[group] = btn.dataset.value;
      updateChoiceSelection(group, btn.dataset.value);
      buildSummary.textContent = '';
    });
  });

  const localKeyMap = {
    masa: { 'clásica': 'clasica', 'integral': 'integral', 'de maíz': 'maiz' },
    relleno: { 'carne': 'carne', 'pollo': 'pollo', 'queso': 'queso', 'verduras': 'verduras' },
    coccion: { 'al horno': 'horno', 'frita': 'frita' },
    repulgue: { 'tradicional': 'tradicional', 'de corazones': 'corazones', 'de estrellas': 'estrellas' }
  };

  function localImagePath(state) {
    const m = localKeyMap.masa[state.masa];
    const r = localKeyMap.relleno[state.relleno];
    const c = localKeyMap.coccion[state.coccion];
    const p = localKeyMap.repulgue[state.repulgue];
    return `img/empanadas/${m}__${r}__${c}__${p}.jpg`;
  }

  function buildImageCandidates(sel) {
    const masas = ['clásica', 'integral', 'de maíz'];
    const rellenos = ['carne', 'pollo', 'queso', 'verduras'];
    const cocciones = ['al horno', 'frita'];
    const repulgues = ['tradicional', 'de corazones', 'de estrellas'];
    const combos = [];
    const seen = new Set();
    const push = (s) => {
      const path = localImagePath(s);
      if (!seen.has(path)) { seen.add(path); combos.push({ path, state: { ...s } }); }
    };
    push(sel);
    repulgues.forEach(p => push({ ...sel, repulgue: p }));
    masas.forEach(m => repulgues.forEach(p => push({ masa: m, relleno: sel.relleno, coccion: sel.coccion, repulgue: p })));
    masas.forEach(m => cocciones.forEach(c => repulgues.forEach(p => push({ masa: m, relleno: sel.relleno, coccion: c, repulgue: p }))));
    masas.forEach(m => rellenos.forEach(r => cocciones.forEach(c => repulgues.forEach(p => push({ masa: m, relleno: r, coccion: c, repulgue: p })))));
    return combos;
  }

  function tryLoadImage(candidates, index, alt, summaryBase, exactPath) {
    if (index >= candidates.length) {
      buildPreview.innerHTML = `
        <div class="preview-placeholder">
          <div class="empanada-art" aria-hidden="true">🥟</div>
          <p>No encontré la imagen para esta combinación todavía. La generación puede seguir en curso; inténtalo de nuevo en unos minutos.</p>
        </div>`;
      buildCookBtn.disabled = false;
      buildCookBtn.textContent = 'Ver empanada';
      return;
    }
    const { path } = candidates[index];
    const img = new Image();
    img.alt = alt;
    img.onload = () => {
      buildPreview.innerHTML = `
        <figure class="image-frame">
          <img src="${path}" alt="${alt}">
        </figure>`;
      if (path !== exactPath) {
        buildSummary.textContent = summaryBase + ' (mostrando una imagen similar mientras se completa la generación).';
      }
      buildCookBtn.disabled = false;
      buildCookBtn.textContent = 'Ver empanada';
    };
    img.onerror = () => tryLoadImage(candidates, index + 1, alt, summaryBase, exactPath);
    img.src = path;
  }

  function describeEmpanada() {
    const { masa, relleno, coccion, repulgue } = buildState;
    const missing = Object.entries(buildState).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      buildPreview.innerHTML = `<div class="preview-placeholder"><div class="empanada-art" aria-hidden="true">🥟</div><p>Te falta elegir: <strong>${missing.join(', ')}</strong>.</p></div>`;
      buildSummary.textContent = '';
      return;
    }

    const exactPath = localImagePath(buildState);
    const candidates = buildImageCandidates(buildState);
    const alt = `Empanada de ${relleno} con masa ${masa}, ${coccion} y repulgue ${repulgue}`;
    const summaryBase = `Empanada de ${relleno} con masa ${masa}, ${coccion} y repulgue ${repulgue}.`;

    buildCookBtn.disabled = true;
    buildCookBtn.textContent = 'Preparando...';
    buildSummary.textContent = summaryBase;
    buildPreview.innerHTML = `
      <div class="image-frame loading">
        <div class="loader" aria-hidden="true"></div>
        <p>Preparando tu empanada...</p>
      </div>`;

    tryLoadImage(candidates, 0, alt, summaryBase, exactPath);
  }

  document.getElementById('build-cook').addEventListener('click', describeEmpanada);
  document.getElementById('build-reset').addEventListener('click', () => {
    Object.keys(buildState).forEach(k => buildState[k] = null);
    document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
    buildSummary.textContent = '';
    buildCookBtn.disabled = false;
    buildCookBtn.textContent = 'Ver empanada';
    buildPreview.innerHTML = `<div class="preview-placeholder"><div class="empanada-art" aria-hidden="true">🥟</div><p>Elige tus ingredientes y pulsa <strong>“Ver empanada”</strong> para ver tu empanada.</p></div>`;
  });

  // ---------- Verdadero o Falso ----------
  const vfData = [
    { s: 'Las empanadas existen en muchos países y cada uno tiene sus propias recetas.', a: true, explain: 'Cada región adaptó la empanada con sus ingredientes y costumbres.' },
    { s: 'Todas las empanadas del mundo se cocinan exactamente igual.', a: false, explain: 'Algunas se hornean, otras se fríen, y las recetas cambian mucho.' },
    { s: 'La empanada gallega es una variedad conocida en España.', a: true, explain: 'Es tradicional de Galicia y suele prepararse en forma grande.' },
    { s: 'Las empanadas solo pueden tener relleno de carne.', a: false, explain: 'Pueden llevar pollo, queso, verduras, maíz e incluso rellenos dulces.' },
    { s: 'Las recetas de empanadas viajaron y se transformaron con el tiempo.', a: true, explain: 'Por eso hoy hay tantas variedades diferentes.' }
  ];
  let vfIndex = 0, vfScore = 0, vfLocked = false;
  const vfStatement = document.getElementById('vf-statement');
  const vfFeedback = document.getElementById('vf-feedback');
  const vfScoreEl = document.getElementById('vf-score');
  const vfProgress = document.getElementById('vf-progress');
  const vfNext = document.getElementById('vf-next');
  const vfTrue = document.getElementById('vf-true');
  const vfFalse = document.getElementById('vf-false');

  function renderVF() {
    vfLocked = false;
    vfNext.disabled = true;
    vfTrue.disabled = false; vfFalse.disabled = false;
    vfFeedback.textContent = '';
    vfFeedback.className = 'feedback';
    vfStatement.textContent = vfData[vfIndex].s;
    vfProgress.textContent = `${vfIndex + 1}/${vfData.length}`;
  }
  function answerVF(val) {
    if (vfLocked) return;
    vfLocked = true;
    const item = vfData[vfIndex];
    vfTrue.disabled = true; vfFalse.disabled = true;
    if (val === item.a) {
      vfScore += 10;
      vfFeedback.textContent = '¡Correcto! ' + item.explain;
      vfFeedback.className = 'feedback good';
    } else {
      vfFeedback.textContent = 'Ups, no era así. ' + item.explain;
      vfFeedback.className = 'feedback bad';
    }
    vfScoreEl.textContent = vfScore;
    if (vfIndex < vfData.length - 1) vfNext.disabled = false;
    else vfFeedback.textContent += ` Puntaje final: ${vfScore}/${vfData.length * 10}.`;
  }
  vfTrue.addEventListener('click', () => answerVF(true));
  vfFalse.addEventListener('click', () => answerVF(false));
  vfNext.addEventListener('click', () => { if (vfIndex < vfData.length - 1) { vfIndex++; renderVF(); } });
  document.getElementById('vf-restart').addEventListener('click', () => { vfIndex = 0; vfScore = 0; vfScoreEl.textContent = '0'; renderVF(); });

  // init
  renderTrivia();
  initMemory();
  renderVF();
})();
