(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('tower-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const el = {
    stage: $('tower-stage'), start: $('tower-start'), end: $('tower-end'),
    play: $('tower-play'), again: $('tower-again'), undo: $('tower-undo'),
    reset: $('tower-reset'), test: $('tower-test'), height: $('tower-height'),
    pieces: $('tower-pieces'), stability: $('tower-stability'), status: $('tower-status'),
    endTitle: $('tower-end-title'), endDesc: $('tower-end-desc'), endLabel: $('tower-end-label'),
    levelName: $('tower-level-name'), levelHint: $('tower-level-hint'), levelDots: $('tower-level-dots'),
    progress: $('tower-progress-fill'), attempts: $('tower-attempts'), targetLabel: $('tower-target-label'),
    modeChip: $('tower-mode-chip'), drawTip: $('tower-draw-tip')
  };
  const startDesc = el.start.querySelector('p');
  const startTitle = el.start.querySelector('h3');
  const startKicker = el.start.querySelector('.tower-screen-kicker');
  const heightLabel = el.height.parentElement.firstElementChild;

  // Tlačítko "Další úroveň" vytvoříme dynamicky, aby nebylo nutné měnit HTML.
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button'; nextBtn.className = 'tower-primary'; nextBtn.id = 'tower-next'; nextBtn.hidden = true;
  nextBtn.textContent = 'Další úroveň →';
  el.again.parentNode.insertBefore(nextBtn, el.again);

  const W = 500, H = 620, FLOOR = 565, MINLEN = 20, SNAP = 19;
  const HOLD = 3;          // sekundy, po které musí stavba držet v cíli
  const TEST_MAX = 14;     // maximální délka jednoho testu

  /* Každá úroveň je malá hádanka:
     target  – oblast, do které musí dosáhnout spoj (x1..x2, minimální výška h)
     anchors – úseky země, kam se smí kotvit (null = kamkoli)
     blocks  – zakázané bloky (nelze v nich stavět, nosník jimi neprojde)
     wind    – boční zrychlení (kolísá jako poryvy)
     tests   – kolik pokusů o gravitaci máš k dispozici */
  const LEVELS = [
    { name: 'Základy', hint: 'Samotná tyč spadne. Pevná je jen síť trojúhelníků.',
      limit: 10, par: 6, maxlen: 120, tests: 4, wind: 0, anchors: null, blocks: [],
      target: { x1: 0, x2: 500, h: 160 } },
    { name: 'Průvan', hint: 'Vane vítr. Čtyřúhelník se bokem složí – potřebuje úhlopříčku.',
      limit: 14, par: 9, maxlen: 110, tests: 3, wind: 120, anchors: null, blocks: [],
      target: { x1: 0, x2: 500, h: 210 } },
    { name: 'Převis', hint: 'Kotvit smíš jen vlevo. Cíl je vpravo – stavba se musí natáhnout.',
      limit: 14, par: 9, maxlen: 100, tests: 3, wind: 0, anchors: [[30, 150]], blocks: [],
      target: { x1: 290, x2: 480, h: 150 } },
    { name: 'Překážka', hint: 'Blok nelze obejít zespodu. Jdi vedle něj nahoru a přes jeho okraj.',
      limit: 15, par: 11, maxlen: 100, tests: 3, wind: 0, anchors: [[30, 130]],
      blocks: [{ x: 150, y: FLOOR - 200, w: 200, h: 90 }],
      target: { x1: 170, x2: 330, h: 240 } },
    { name: 'Bouře', hint: 'Úzký základ, vysoký cíl, silný vítr a jen dva pokusy. Přemýšlej dopředu.',
      limit: 17, par: 12, maxlen: 100, tests: 2, wind: 170, anchors: [[190, 310]], blocks: [],
      target: { x1: 0, x2: 500, h: 270 } }
  ];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  let level = 0, testsLeft = 0;
  let nodes = [], beams = [], saved = null;
  let mode = 'ready';      // ready | build | test | end
  let drawing = null, hover = { x: 250, y: FLOOR };
  let holdTime = 0, testTime = 0, restTime = 0, last = 0, acc = 0, prevTop = 0, stress = 0;
  const particles = []; let shake = 0; let flash = 0; let firstBeam = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function burst(x, y, color, amount = 9) {
    if (reducedMotion) return;
    for (let i = 0; i < amount; i++) { const a = Math.PI * 2 * i / amount + Math.random() * .5; const v = 1 + Math.random() * 2.4;
      particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v - 1,life:1,color}); }
  }

  const cfg = () => LEVELS[level];

  function announce(t) { el.status.textContent = t; }
  function point(e) {
    const r = canvas.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) * W / Math.max(1, r.width), 10, W - 10), y: clamp((e.clientY - r.top) * H / Math.max(1, r.height), 20, FLOOR) };
  }
  function nearest(p) {
    let best = -1, d = SNAP;
    nodes.forEach((n, i) => { const k = dist(n, p); if (k < d) { d = k; best = i; } });
    return best;
  }
  function getAnchor(p) {
    const i = nearest(p);
    if (i !== -1) return { index: i, point: { x: nodes[i].x, y: nodes[i].y } };
    if (p.y > FLOOR - 22) return { index: -1, point: { x: p.x, y: FLOOR } };
    return { index: -1, point: { x: p.x, y: p.y } };
  }
  function newNode(p) {
    const fixed = p.y >= FLOOR - 1;
    const y = fixed ? FLOOR : p.y;
    nodes.push({ x: p.x, y, oldX: p.x, oldY: y, fixed });
    return nodes.length - 1;
  }
  function aliveSet() {
    const s = new Set();
    beams.forEach(b => { if (!b.broken) { s.add(b.a); s.add(b.b); } });
    return s;
  }
  function height() {
    let top = FLOOR;
    aliveSet().forEach(i => { if (nodes[i].y < top) top = nodes[i].y; });
    return Math.max(0, FLOOR - top);
  }
  function inTarget() {
    const t = cfg().target; let ok = false;
    aliveSet().forEach(i => { const n = nodes[i]; if (n.x >= t.x1 && n.x <= t.x2 && FLOOR - n.y >= t.h) ok = true; });
    return ok;
  }

  /* ---------- Pravidla stavění ---------- */
  const groundOk = x => !cfg().anchors || cfg().anchors.some(r => x >= r[0] && x <= r[1]);
  const inBlock = (x, y, m) => cfg().blocks.some(b => x > b.x - m && x < b.x + b.w + m && y > b.y - m && y < b.y + b.h + m);
  function segHitsBlock(a, b) {
    if (!cfg().blocks.length) return false;
    const steps = Math.max(2, Math.ceil(dist(a, b) / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (inBlock(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 2)) return true;
    }
    return false;
  }
  // Vrací text důvodu, proč čára není povolená, nebo ''.
  function validate(a, b) {
    const len = dist(a.point, b.point);
    if (len < MINLEN) return 'Čára je příliš krátká.';
    if (len > cfg().maxlen + 1) return 'Čára je příliš dlouhá (max ' + cfg().maxlen + ').';
    for (const s of [a, b]) {
      if (s.index < 0 && s.point.y >= FLOOR - 1 && !groundOk(s.point.x)) return 'Tady nelze kotvit do země.';
      if (s.index < 0 && inBlock(s.point.x, s.point.y, 1)) return 'Uvnitř překážky nelze stavět.';
    }
    if (segHitsBlock(a.point, b.point)) return 'Nosník nesmí procházet překážkou.';
    return '';
  }

  /* ---------- Průběh hry ---------- */
  function showStart() {
    mode = 'ready';
    el.start.hidden = false; el.end.hidden = true;
    startKicker.textContent = 'Postav vlastní konstrukci';
    startTitle.innerHTML = 'Každá čára<br>se počítá.';
    startDesc.textContent = LEVELS.length + ' hádanek. Omezené nosníky, omezené pokusy, překážky i vítr. Nejdřív přemýšlej, potom testuj.';
    el.play.textContent = 'Začít stavět';
    testsLeft = 0; level = 0;
    updateHUD();
    announce('Klikni na Začít stavět.');
  }
  function startLevel(i) {
    level = clamp(i, 0, LEVELS.length - 1);
    nodes = []; beams = []; saved = null; drawing = null;
    holdTime = testTime = restTime = prevTop = stress = acc = 0;
    testsLeft = cfg().tests;
    firstBeam = false; particles.length = 0; shake = 0; flash = 0;
    mode = 'build';
    el.start.hidden = true; el.end.hidden = true;
    el.stage.focus({ preventScroll: true });
    updateHUD();
    announce('Úroveň ' + (level + 1) + ' – ' + cfg().name + '. ' + cfg().hint + ' Pokusů: ' + testsLeft + '.');
  }
  function stars() {
    const used = beams.length, par = cfg().par;
    return used <= par ? 3 : used <= Math.ceil(par * 1.3) ? 2 : 1;
  }
  function win() {
    mode = 'end'; drawing = null;
    const s = stars(), lastLevel = level === LEVELS.length - 1;
    el.end.hidden = false; flash = 1;
    for (let i = 0; i < 28; i++) burst(50 + Math.random()*400, 80 + Math.random()*260, ['#bdff69','#ffffff','#9bdcc5'][i%3], 2);
    el.endLabel.textContent = 'Úroveň ' + (level + 1) + ' / ' + LEVELS.length + ' · ' + '★'.repeat(s) + '☆'.repeat(3 - s);
    el.endTitle.textContent = lastLevel ? 'Hotovo!' : 'Stavba drží!';
    el.endDesc.textContent = (lastLevel ? 'Zvládl jsi všechny hádanky. ' : 'Cíl splněn. ') + 'Použito nosníků: ' + beams.length + ' z ' + cfg().limit + (s < 3 ? ' (na tři hvězdy stačí ' + cfg().par + ').' : ' – dokonalé.');
    nextBtn.hidden = lastLevel;
    el.again.textContent = lastLevel ? 'Hrát od začátku' : 'Zkusit znovu úroveň';
    announce(el.endTitle.textContent);
    updateHUD();
  }
  function lose(reason) {
    mode = 'end'; drawing = null;
    el.end.hidden = false;
    el.endLabel.textContent = 'Úroveň ' + (level + 1) + ' / ' + LEVELS.length + ' · Konec pokusů';
    el.endTitle.textContent = 'Došly pokusy.';
    el.endDesc.textContent = reason + ' Zkus úroveň znovu a před testem si konstrukci pořádně promysli.';
    nextBtn.hidden = true;
    el.again.textContent = 'Zkusit úroveň znovu';
    announce(el.endTitle.textContent);
    updateHUD();
  }
  function startTest() {
    if (mode !== 'build' || !beams.length || testsLeft <= 0) return;
    testsLeft--;
    saved = nodes.map(n => ({ x: n.x, y: n.y }));
    nodes.forEach(n => { n.oldX = n.x; n.oldY = n.y; });
    beams.forEach(b => { b.broken = false; });
    holdTime = testTime = restTime = 0; prevTop = height(); stress = 0; acc = 0; drawing = null;
    mode = 'test';
    announce('Gravitace' + (cfg().wind ? ' i vítr jsou zapnuté' : ' je zapnutá') + '. Spoj musí být v cílové oblasti a ' + HOLD + ' s vydržet.');
    updateHUD();
  }
  function failTest(reason) {
    nodes.forEach((n, i) => { n.x = n.oldX = saved[i].x; n.y = n.oldY = saved[i].y; });
    beams.forEach(b => { b.broken = false; });
    holdTime = testTime = restTime = stress = 0;
    if (testsLeft <= 0) { lose(reason); return; }
    mode = 'build';
    announce(reason + ' Konstrukce je zpět v původním stavu. Zbývá pokusů: ' + testsLeft + '.');
    updateHUD();
  }

  /* ---------- Kreslení nosníků ---------- */
  function addBeam(a, b) {
    if (mode !== 'build') return false;
    if (beams.length >= cfg().limit) { announce('Došly nosníky. Odeber poslední tlačítkem Zpět.'); return false; }
    const why = validate(a, b); if (why) { announce(why); return false; }
    if (a.index >= 0 && a.index === b.index) return false;
    if (a.index >= 0 && b.index >= 0 && beams.some(e => (e.a === a.index && e.b === b.index) || (e.a === b.index && e.b === a.index))) { announce('Tento spoj už existuje.'); return false; }
    const ai = a.index >= 0 ? a.index : newNode(a.point);
    const bi = b.index >= 0 ? b.index : newNode(b.point);
    if (beams.some(e => (e.a === ai && e.b === bi) || (e.a === bi && e.b === ai))) { announce('Tento spoj už existuje.'); return false; }
    beams.push({ a: ai, b: bi, len: dist(nodes[ai], nodes[bi]), broken: false });
    burst(nodes[bi].x, nodes[bi].y, '#bdff69', 8);
    firstBeam = true;
    updateHUD();
    announce('Nosník přidán. Zbývá ' + (cfg().limit - beams.length) + '.');
    return true;
  }
  function startDraw(p) {
    if (mode !== 'build') return;
    if (beams.length >= cfg().limit) { announce('Došly nosníky. Odeber poslední tlačítkem Zpět, nebo stavbu otestuj.'); return; }
    const a = getAnchor(p);
    if (a.index < 0 && a.point.y >= FLOOR - 1 && !groundOk(a.point.x)) { announce('Tady nelze kotvit do země.'); return; }
    if (a.index < 0 && inBlock(a.point.x, a.point.y, 1)) { announce('Uvnitř překážky nelze stavět.'); return; }
    drawing = { a, end: p };
    announce('Táhni a pusť. Maximální délka nosníku je ' + cfg().maxlen + '.');
  }
  function endDraw(p) {
    if (!drawing) return;
    const a = drawing.a; drawing = null;
    const dx = p.x - a.point.x, dy = p.y - a.point.y, l = Math.hypot(dx, dy);
    if (l < MINLEN) return;
    const k = Math.min(1, cfg().maxlen / l);
    const end = { x: a.point.x + dx * k, y: clamp(a.point.y + dy * k, 20, FLOOR) };
    addBeam(a, getAnchor(end));
  }
  function undo() {
    if (mode !== 'build' || !beams.length) return;
    beams.pop();
    const used = new Set(); beams.forEach(b => { used.add(b.a); used.add(b.b); });
    const map = new Map(), keep = [];
    nodes.forEach((n, i) => { if (used.has(i)) { map.set(i, keep.length); keep.push(n); } });
    beams.forEach(b => { b.a = map.get(b.a); b.b = map.get(b.b); });
    nodes = keep;
    updateHUD(); announce('Poslední nosník odebrán.');
  }

  /* ---------- Fyzika (jen ve fázi testu) ---------- */
  function physics(dt) {
    const gravity = 820;
    const wind = cfg().wind * (0.65 + 0.35 * Math.sin(testTime * 2.2));
    for (const n of nodes) {
      if (n.fixed) continue;
      const vx = (n.x - n.oldX) * 0.985, vy = (n.y - n.oldY) * 0.985;
      n.oldX = n.x; n.oldY = n.y; n.x += vx + wind * dt * dt; n.y += vy + gravity * dt * dt;
    }
    for (let k = 0; k < 20; k++) {
      for (const b of beams) {
        if (b.broken) continue;
        const a = nodes[b.a], c = nodes[b.b], dx = c.x - a.x, dy = c.y - a.y, len = Math.hypot(dx, dy) || 1, delta = (len - b.len) / len;
        const wa = a.fixed ? 0 : 1, wc = c.fixed ? 0 : 1, sum = wa + wc; if (!sum) continue;
        const x = dx * delta, y = dy * delta;
        a.x += x * wa / sum; a.y += y * wa / sum; c.x -= x * wc / sum; c.y -= y * wc / sum;
      }
      for (const n of nodes) {
        if (n.fixed) { n.y = FLOOR; continue; }
        if (n.y > FLOOR) { n.y = FLOOR; n.oldY = n.y + (n.y - n.oldY) * 0.04; n.oldX = n.x - (n.x - n.oldX) * 0.70; }
        for (const bl of cfg().blocks) {
          if (n.x > bl.x && n.x < bl.x + bl.w && n.y > bl.y && n.y < bl.y + bl.h) {
            const dl = n.x - bl.x, dr = bl.x + bl.w - n.x, du = n.y - bl.y, dd = bl.y + bl.h - n.y, m = Math.min(dl, dr, du, dd);
            if (m === du) n.y = bl.y; else if (m === dd) n.y = bl.y + bl.h; else if (m === dl) n.x = bl.x; else n.x = bl.x + bl.w;
          }
        }
        n.x = clamp(n.x, 8, W - 8); n.y = Math.max(12, n.y);
      }
    }
    // Příliš natažený nosník praskne.
    stress = 0;
    for (const b of beams) {
      if (b.broken) continue;
      const s = Math.abs(dist(nodes[b.a], nodes[b.b]) - b.len) / b.len;
      if (s > stress) stress = s;
      if (s > 0.16 && testTime > 0.3) { b.broken = true; shake = 5; burst((nodes[b.a].x + nodes[b.b].x)/2,(nodes[b.a].y + nodes[b.b].y)/2,'#ff8e76',15); }
    }
    const top = height();
    const free = nodes.filter(n => !n.fixed);
    const motion = free.reduce((m, n) => m + Math.hypot(n.x - n.oldX, n.y - n.oldY), 0) / Math.max(1, free.length);
    const settled = motion < 1.6 + cfg().wind * 0.004 && Math.abs(top - prevTop) < 1.2;
    prevTop = top;
    testTime += dt;
    restTime = settled ? restTime + dt : 0;
    holdTime = inTarget() && settled ? holdTime + dt : 0;

    if (holdTime >= HOLD) { win(); return; }
    if (restTime > 1.5 && !inTarget()) { failTest('Stavba se usadila mimo cíl (výška ' + Math.round(top) + ').'); return; }
    if (testTime >= TEST_MAX) failTest('Test vypršel, stavba cíl nesplnila.');
  }

  function updateHUD() {
    const h = Math.round(height());
    heightLabel.textContent = 'Výška stavby · úroveň ' + (level + 1);
    el.height.innerHTML = h + ' <small>/ ' + cfg().target.h + '</small>';
    el.pieces.textContent = cfg().limit - beams.length;
    let s = '—';
    if (mode === 'build') s = beams.length ? 'Příprava' : '—';
    else if (mode === 'test') s = holdTime > 0 ? 'Drží ' + holdTime.toFixed(1) + ' s' : (stress > .025 ? 'V pohybu' : 'Zatěžuje se');
    else if (mode === 'end') s = el.endTitle.textContent === 'Došly pokusy.' ? 'Selhalo' : 'Splněno';
    el.stability.textContent = s;
    el.levelName.textContent = String(level + 1).padStart(2,'0') + ' / ' + cfg().name;
    el.levelHint.textContent = cfg().hint;
    el.levelDots.innerHTML = LEVELS.map((_, i) => '<span class="' + (i < level ? 'done' : i === level ? 'current' : '') + '"></span>').join('');
    el.progress.style.width = Math.min(100, h / cfg().target.h * 100) + '%';
    el.attempts.textContent = 'Pokusy: ' + testsLeft + ' / ' + cfg().tests;
    el.targetLabel.textContent = 'Cíl: ' + cfg().target.h + ' jednotek' + (cfg().target.x2 - cfg().target.x1 < W ? ' ve vyznačené oblasti' : '');
    el.modeChip.innerHTML = '<span></span>' + (mode === 'test' ? ' Test gravitace' : mode === 'build' ? ' Režim stavění' : ' STAVBA');
    el.modeChip.classList.toggle('testing', mode === 'test');
    el.drawTip.hidden = mode !== 'build' || firstBeam;
    el.test.textContent = mode === 'test' ? 'Probíhá test…' : '▶ Otestovat gravitaci (' + testsLeft + ')';
    el.undo.disabled = mode !== 'build' || !beams.length;
    el.test.disabled = mode !== 'build' || !beams.length || testsLeft <= 0;
  }

  /* ---------- Vykreslení ---------- */
  function render(now) {
    const L = cfg(), t = L.target;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shake > .1 && !reducedMotion) { ctx.translate((Math.random()-.5)*shake, (Math.random()-.5)*shake); shake *= .85; }
    ctx.fillStyle = '#19221d'; ctx.fillRect(0, 0, W, H);
    const ambient = ctx.createRadialGradient(W*.5,H*.3,10,W*.5,H*.3,440);
    ambient.addColorStop(0,'rgba(93,144,101,.12)');ambient.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ambient;ctx.fillRect(0,0,W,H);
    ctx.fillStyle = 'rgba(190,220,184,.10)';
    for (let x = 20; x < W; x += 20) for (let y = 20; y < FLOOR; y += 20) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }

    // Cíl
    const ty = FLOOR - t.h;
    ctx.font = '600 12px sans-serif';
    if (t.x2 - t.x1 < W) {
      ctx.fillStyle = 'rgba(189,255,105,.08)'; ctx.fillRect(t.x1, 12, t.x2 - t.x1, ty - 12);
      ctx.setLineDash([8, 7]); ctx.strokeStyle = '#a7f36c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(t.x1, ty); ctx.lineTo(t.x2, ty); ctx.moveTo(t.x1, 12); ctx.lineTo(t.x1, ty); ctx.moveTo(t.x2, 12); ctx.lineTo(t.x2, ty); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c2f6a0'; ctx.fillText('CÍLOVÁ OBLAST', t.x1 + 10, ty - 12);
    } else {
      ctx.setLineDash([8, 7]); ctx.strokeStyle = '#a7f36c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(W, ty); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c2f6a0'; ctx.fillText('CÍLOVÁ VÝŠKA', 18, ty - 12);
    }
    if (mode === 'test' && holdTime > 0) { ctx.fillStyle = '#bdff69'; ctx.fillRect(t.x1, ty - 3, (t.x2 - t.x1) * Math.min(1, holdTime / HOLD), 3); }

    // Zakázané bloky
    for (const b of L.blocks) {
      ctx.fillStyle = 'rgba(255,142,118,.10)'; ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
      ctx.strokeStyle = 'rgba(255,142,118,.28)'; ctx.lineWidth = 1;
      for (let k = -b.h; k < b.w; k += 14) { ctx.beginPath(); ctx.moveTo(b.x + k, b.y + b.h); ctx.lineTo(b.x + k + b.h, b.y); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = '#ff8e76'; ctx.lineWidth = 1.5; ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = '#ffb3a1'; ctx.fillText('ZÁKAZ STAVBY', b.x + 10, b.y + 20);
    }

    // Vítr
    if (L.wind) {
      const ph = (now || 0) / 700;
      ctx.strokeStyle = 'rgba(180,220,230,.35)'; ctx.lineWidth = 1.5; ctx.fillStyle = '#b4dce6';
      for (let k = 0; k < 5; k++) {
        const y = 60 + k * 70, x = ((ph * 60 + k * 90) % 160) - 20, len = 36 + L.wind * 0.12;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.lineTo(x + len - 6, y - 4); ctx.moveTo(x + len, y); ctx.lineTo(x + len - 6, y + 4); ctx.stroke();
      }
      ctx.fillText('VÍTR →', 18, 34);
    }

    // Země
    ctx.fillStyle = '#55675b'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.strokeStyle = 'rgba(220,245,215,.12)'; ctx.lineWidth = 1;
    for (let x = -20; x < W + 40; x += 22) {ctx.beginPath();ctx.moveTo(x,FLOOR+5);ctx.lineTo(x-26,H);ctx.stroke();}
    ctx.fillStyle = '#a2b5a2'; ctx.fillRect(0, FLOOR, W, 3);
    if (L.anchors) {
      const rs = L.anchors.slice().sort((p, q) => p[0] - q[0]);
      let cur = 0;
      const bad = (x1, x2) => {
        if (x2 - x1 < 1) return;
        ctx.fillStyle = 'rgba(255,142,118,.28)'; ctx.fillRect(x1, FLOOR, x2 - x1, H - FLOOR);
        if (x2 - x1 > 90) { ctx.fillStyle = '#ffb3a1'; ctx.font = '600 11px sans-serif'; ctx.fillText('NELZE KOTVIT', (x1 + x2) / 2 - 36, FLOOR + 28); }
      };
      for (const r of rs) { bad(cur, r[0]); cur = r[1]; }
      bad(cur, W);
      for (const r of rs) { ctx.fillStyle = '#bdff69'; ctx.fillRect(r[0], FLOOR, r[1] - r[0], 3); }
    }

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const b of beams) {
      const a = nodes[b.a], c = nodes[b.b];
      if (b.broken) {
        ctx.strokeStyle = 'rgba(255,142,118,.5)'; ctx.lineWidth = 2; ctx.setLineDash([3, 5]);
      } else {
        const strain = Math.abs(dist(a, c) - b.len) / b.len;
        ctx.strokeStyle = strain > .045 ? '#ff8e76' : strain > .018 ? '#ffd58a' : '#b9e9cf'; ctx.lineWidth = 4;
      }
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke(); ctx.setLineDash([]);
      if (!b.broken) { ctx.strokeStyle = 'rgba(255,255,255,.23)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke(); }
    }
    for (const n of nodes) {
      ctx.fillStyle = n.fixed ? '#d8ff85' : '#eaf8ed'; ctx.beginPath(); ctx.arc(n.x, n.y, n.fixed ? 6 : 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#19221d'; ctx.beginPath(); ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    if (drawing) {
      const a = drawing.a.point, p = drawing.end, dx = p.x - a.x, dy = p.y - a.y, l = Math.hypot(dx, dy) || 1, k = Math.min(1, L.maxlen / l);
      const q = { x: a.x + dx * k, y: clamp(a.y + dy * k, 20, FLOOR) }, sn = getAnchor(q), tp = sn.point;
      const bad = l >= MINLEN && !!validate(drawing.a, sn);
      const col = bad ? '#ff8e76' : '#c8ff83';
      ctx.strokeStyle = 'rgba(200,255,131,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(a.x, a.y, L.maxlen, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([7, 5]); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(tp.x, tp.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tp.x, tp.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center';
      const distance = Math.round(dist(a,tp));
      ctx.fillStyle = '#19221d'; ctx.fillRect((a.x+tp.x)/2-24,(a.y+tp.y)/2-25,48,19);
      ctx.fillStyle = col; ctx.fillText(distance + ' / ' + L.maxlen,(a.x+tp.x)/2,(a.y+tp.y)/2-11);ctx.textAlign='start';
    }
    for (let i=particles.length-1;i>=0;i--) {
      const p=particles[i]; p.x+=p.vx;p.y+=p.vy;p.vy+=.07;p.life-=.025;
      if(p.life<=0){particles.splice(i,1);continue;}
      ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2.5*p.life,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(flash>.01){ctx.fillStyle='rgba(189,255,105,'+(flash*.12)+')';ctx.fillRect(0,0,W,H);flash*=.92;}
    ctx.restore();
    if (mode === 'build' && !drawing) {
      const i = nearest(hover);
      if (i >= 0) { const n = nodes[i]; ctx.strokeStyle = '#c8ff83'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.stroke(); }
    }
  }

  /* ---------- Události ---------- */
  canvas.addEventListener('pointerdown', e => { if (mode !== 'build') return; const p = point(e); hover = p; startDraw(p); if (drawing) { canvas.setPointerCapture(e.pointerId); e.preventDefault(); } });
  canvas.addEventListener('pointermove', e => { hover = point(e); if (drawing) { drawing.end = hover; e.preventDefault(); } });
  canvas.addEventListener('pointerup', e => { if (drawing) { endDraw(point(e)); e.preventDefault(); } });
  canvas.addEventListener('pointercancel', () => { drawing = null; });
  canvas.addEventListener('lostpointercapture', () => { drawing = null; });
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|BUTTON)$/.test(e.target.tagName)) return;
    if (mode === 'build' && e.key === 'Escape') { drawing = null; announce('Kreslení zrušeno.'); }
    if (mode === 'build' && (e.key === 'Backspace' || (e.ctrlKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); undo(); }
  });
  el.play.addEventListener('click', () => startLevel(0));
  el.test.addEventListener('click', startTest);
  el.undo.addEventListener('click', undo);
  el.reset.addEventListener('click', () => { if (mode === 'ready') startLevel(0); else startLevel(level); });
  nextBtn.addEventListener('click', () => startLevel(level + 1));
  el.again.addEventListener('click', () => startLevel(el.endTitle.textContent === 'Hotovo!' ? 0 : level));
  document.addEventListener('visibilitychange', () => { last = performance.now(); acc = 0; });

  function loop(t) {
    const dt = Math.min((t - last) / 1000 || 0, 0.04); last = t;
    if (mode === 'test') {
      acc += dt; let n = 0;
      while (acc >= 1 / 120 && n++ < 6 && mode === 'test') { physics(1 / 120); acc -= 1 / 120; }
      updateHUD();
    }
    render(t);
    requestAnimationFrame(loop);
  }
  showStart();
  requestAnimationFrame(loop);
})();
