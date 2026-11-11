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

  function renderEmpanadaSVG({ masa, relleno, coccion, repulgue }) {
    const masaColors = {
      'clásica': { base: '#e8c178', shadow: '#c9963b', edge: '#b8832e', highlight: '#f6ddb0' },
      'integral': { base: '#c9a46a', shadow: '#9a7440', edge: '#866233', highlight: '#e3c89a' },
      'de maíz': { base: '#f2c94c', shadow: '#d4a017', edge: '#b8860b', highlight: '#fde68a' }
    };
    const rellenoColors = {
      'carne': ['#7b3f2b', '#a65b3d', '#c97a5a'],
      'pollo': ['#e0b07a', '#f3d3a3', '#fff1d6'],
      'queso': ['#f6c453', '#ffe08a', '#fff6cc'],
      'verduras': ['#5fa35f', '#d96b5c', '#f2c94c']
    };
    const cook = coccion === 'frita'
      ? { overlay: 'rgba(140,70,10,0.18)', shine: 'rgba(255,255,255,0.18)', spots: true }
      : { overlay: 'rgba(120,70,20,0.08)', shine: 'rgba(255,255,255,0.08)', spots: false };

    const m = masaColors[masa];
    const r = rellenoColors[relleno];
    const uid = Math.random().toString(36).slice(2, 7);

    const edgePath = [];
    const bumps = 12;
    for (let i = 0; i <= bumps; i++) {
      const t = i / bumps;
      const x = 70 + t * 260;
      const y = 260 - Math.sin(t * Math.PI) * 135;
      if (repulgue === 'tradicional') {
        const by = y - (i % 2 === 0 ? 6 : -2);
        edgePath.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${by.toFixed(1)}`);
      } else if (repulgue === 'de corazones') {
        const bump = (i % 2 === 0 ? -7 : 0);
        edgePath.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(y + bump).toFixed(1)}`);
      } else {
        const spike = (i % 2 === 0 ? -8 : 1);
        edgePath.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(y + spike).toFixed(1)}`);
      }
    }
    const edgeD = edgePath.join(' ');

    const heartDecor = repulgue === 'de corazones'
      ? `<g fill="${m.edge}" opacity="0.55">${[110,150,190,230,270].map((x,i)=>`<path d="M${x} ${228-i%2*4}c-4-6-14-3-14 4 0 8 14 14 14 14s14-6 14-14c0-7-10-9-14-4z"/>`).join('')}</g>`
      : '';
    const starDecor = repulgue === 'de estrellas'
      ? `<g fill="${m.edge}" opacity="0.55">${[110,150,190,230,270].map((x,i)=>`<polygon points="${x},${220-i%2*4} ${x+3},${228-i%2*4} ${x+11},${228-i%2*4} ${x+5},${233-i%2*4} ${x+7},${241-i%2*4} ${x},${236-i%2*4} ${x-7},${241-i%2*4} ${x-5},${233-i%2*4} ${x-11},${228-i%2*4} ${x-3},${228-i%2*4}"/>`).join('')}</g>`
      : '';

    const spots = cook.spots
      ? `<g opacity="0.18" fill="#7a3e00">
          <ellipse cx="150" cy="190" rx="10" ry="6"/>
          <ellipse cx="210" cy="170" rx="8" ry="5"/>
          <ellipse cx="250" cy="200" rx="9" ry="5"/>
          <ellipse cx="185" cy="215" rx="7" ry="4"/>
        </g>` : '';

    const fillingBits = relleno === 'verduras'
      ? `<circle cx="255" cy="215" r="10" fill="${r[0]}"/><circle cx="272" cy="222" r="8" fill="${r[1]}"/><circle cx="262" cy="232" r="7" fill="${r[2]}"/><rect x="240" y="228" width="10" height="6" rx="2" fill="#6aa84f"/>`
      : `<ellipse cx="262" cy="222" rx="18" ry="12" fill="${r[0]}"/><ellipse cx="275" cy="232" rx="12" ry="8" fill="${r[1]}"/><ellipse cx="248" cy="232" rx="10" ry="7" fill="${r[2]}"/>`;

    return `
      <div class="empanada-scene">
        <svg viewBox="0 0 400 320" role="img" aria-label="Empanada de ${relleno} con masa ${masa}, ${coccion}, repulgue ${repulgue}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg-${uid}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fff7e8"/>
              <stop offset="100%" stop-color="#f7e7c4"/>
            </linearGradient>
            <radialGradient id="dough-${uid}" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="${m.highlight}"/>
              <stop offset="55%" stop-color="${m.base}"/>
              <stop offset="100%" stop-color="${m.shadow}"/>
            </radialGradient>
            <filter id="shadow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#8a5a2b" flood-opacity="0.25"/>
            </filter>
          </defs>
          <rect width="400" height="320" fill="url(#bg-${uid})"/>
          <ellipse cx="200" cy="275" rx="135" ry="22" fill="#d9c7a3" opacity="0.7"/>
          <ellipse cx="200" cy="265" rx="150" ry="26" fill="#fff" opacity="0.9"/>
          <ellipse cx="200" cy="265" rx="150" ry="26" fill="none" stroke="#eadfca" stroke-width="4"/>
          <g filter="url(#shadow-${uid})">
            <path d="M70 260 C70 150, 150 95, 200 95 C250 95, 330 150, 330 260 Z" fill="url(#dough-${uid})" stroke="${m.edge}" stroke-width="3"/>
            <path d="M228 205 C250 190, 292 205, 292 232 C285 248, 255 252, 238 242 Z" fill="${m.shadow}" opacity="0.55"/>
            ${fillingBits}
            <path d="${edgeD}" fill="none" stroke="${m.edge}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="${edgeD}" fill="none" stroke="${m.highlight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
            ${heartDecor}
            ${starDecor}
            <path d="M90 245 C110 165, 165 120, 205 112" fill="none" stroke="${cook.shine}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>
            <path d="M70 260 C70 150, 150 95, 200 95 C250 95, 330 150, 330 260 Z" fill="${cook.overlay}"/>
            ${spots}
          </g>
          <g transform="translate(292,34)">
            <rect x="0" y="0" rx="10" ry="10" width="92" height="30" fill="#ffffff" opacity="0.85"/>
            <text x="46" y="20" text-anchor="middle" font-size="13" font-family="Trebuchet MS,Segoe UI,sans-serif" fill="#7a3e00" font-weight="700">${coccion}</text>
          </g>
        </svg>
        <div class="empanada-badges">
          <span class="badge">Masa: ${masa}</span>
          <span class="badge">Relleno: ${relleno}</span>
          <span class="badge">Repulgue: ${repulgue}</span>
        </div>
      </div>`;
  }

  function describeEmpanada() {
    const { masa, relleno, coccion, repulgue } = buildState;
    const missing = Object.entries(buildState).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      buildPreview.innerHTML = `<div class="preview-placeholder"><div class="empanada-art" aria-hidden="true">🥟</div><p>Te falta elegir: <strong>${missing.join(', ')}</strong>.</p></div>`;
      buildSummary.textContent = '';
      return;
    }
    const summaryBase = `Empanada de ${relleno} con masa ${masa}, ${coccion} y repulgue ${repulgue}.`;
    buildSummary.textContent = summaryBase;
    buildPreview.innerHTML = renderEmpanadaSVG(buildState);
    buildCookBtn.textContent = 'Ver otra vez';
  }

  document.getElementById('build-cook').addEventListener('click', describeEmpanada);
  document.getElementById('build-reset').addEventListener('click', () => {
    Object.keys(buildState).forEach(k => buildState[k] = null);
    document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
    buildSummary.textContent = '';
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
