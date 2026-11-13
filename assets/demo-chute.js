// ══════════════════════════════════════════════════════════════════════════
// DÉMO « chute retenue par une corde » (petzl.html) — système masse-ressort-amortisseur
//   m·ẍ = m·g − T,   T = k·x + c·ẋ tant que la corde est tendue (x > 0), 0 sinon
//   k = EA / L,   c = 2ζ·√(k·m)   (x : allongement de la corde, compté vers le bas)
// À chaque réglage : intégration pas à pas (Euler semi-implicite, Δt = 2 ms) sur 4 s,
// tracé SVG de T(t) et comparaison avec la solution exacte sans amortissement :
//   T max = m·g + √((m·g)² + 2·m·g·k·h)   (k·h = EA·f : la force de choc ne dépend que du facteur de chute f = h/L)
// Textes longs : content-*.json > demo (titre, intro, remarque, limites) ; libellés techniques : L10N ci-dessous.
// Langue : suit setLang() d'assets/site.js (évènement « cv:lang »). Aucune animation : tout est recalculé à chaque saisie.
// ══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  const root = document.getElementById('demo');
  if (!root) return;

  const G = 9.81;    // m/s²
  const DT = 0.002;  // pas d'intégration : 2 ms
  const T_END = 4;   // durée simulée (s)
  const EVERY = 4;   // un point tracé tous les 4 pas (8 ms)

  const L10N = {
    ctrl:     { fr: 'Réglages', en: 'Settings' },
    m:        { fr: 'Masse <var>m</var>', en: 'Mass <var>m</var>' },
    h:        { fr: 'Chute libre <var>h</var>', en: 'Free fall <var>h</var>' },
    L:        { fr: 'Longueur de corde <var>L</var>', en: 'Rope length <var>L</var>' },
    EA:       { fr: 'Module de la corde <var>EA</var>', en: 'Rope modulus <var>EA</var>' },
    z:        { fr: 'Amortissement <var>ζ</var>', en: 'Damping ratio <var>ζ</var>' },
    cases:    { fr: 'Cas types', en: 'Typical cases' },
    plot:     { fr: 'Réponse — force dans la corde <var>T</var>(<var>t</var>)', en: 'Response — rope force <var>T</var>(<var>t</var>)' },
    // ẍ et ẋ : x surmonté de points posés en CSS (.d2 / .d1) — le glyphe « ẍ » manque à la plupart des polices
    eq1:      { fr: 'm·<var class="d2">x</var> = m·g − T', en: 'm·<var class="d2">x</var> = m·g − T' },
    eq2:      { fr: 'T = k·x + c·<var class="d1">x</var> si la corde est tendue (x > 0), sinon T = 0', en: 'T = k·x + c·<var class="d1">x</var> while the rope is taut (x > 0), otherwise T = 0' },
    eq3:      { fr: 'k = EA/L · c = 2ζ·√(k·m) · x : allongement de la corde', en: 'k = EA/L · c = 2ζ·√(k·m) · x: rope elongation' },
    freeFall: { fr: 'chute libre', en: 'free fall' },
    legSim:   { fr: 'simulation — Euler, Δt = 2 ms', en: 'simulation — Euler, Δt = 2 ms' },
    legAna:   { fr: 'solution analytique, ζ = 0', en: 'analytical solution, ζ = 0' },
    f:        { fr: 'Facteur de chute <var>f</var> = <var>h</var>/<var>L</var>', en: 'Fall factor <var>f</var> = <var>h</var>/<var>L</var>' },
    k:        { fr: 'Raideur <var>k</var> = <var>EA</var>/<var>L</var>', en: 'Stiffness <var>k</var> = <var>EA</var>/<var>L</var>' },
    v0:       { fr: 'Vitesse <var>v</var>₀ = √(2<var>gh</var>)', en: 'Speed <var>v</var>₀ = √(2<var>gh</var>)' },
    F:        { fr: 'Force de choc', en: 'Impact force' },
    x:        { fr: 'Allongement max.', en: 'Max. elongation' },
    a:        { fr: 'Décélération max.', en: 'Max. deceleration' },
    valid:    { fr: 'Vérification à ζ = 0 : Euler {e} · analytique {a} · écart {d}', en: 'Check at ζ = 0: Euler {e} · analytical {a} · difference {d}' },
    warnF:    { fr: 'f > 2 : au-delà du pire cas d’une chute en tête sur corde (chute sur le relais, f = 2).', en: 'f > 2: beyond the worst case of a lead fall on a rope (falling onto the belay, f = 2).' },
    peak:     { fr: 'F max', en: 'F max' },
    axisT:    { fr: 'T (kN)', en: 'T (kN)' },
    aria:     { fr: 'Force dans la corde en fonction du temps', en: 'Rope force versus time' },
    schema:   { fr: 'Schéma : point d’ancrage, corde modélisée par un ressort k et un amortisseur c en parallèle, masse m', en: 'Diagram: anchor point, rope modelled as a spring k and a damper c in parallel, mass m' }
  };

  // cas types : les deux premiers ont le même facteur de chute (h et L doublés) → même force de choc
  const PRESETS = [
    { lbl: { fr: 'f = 0,4 · h = 4 m', en: 'f = 0.4 · h = 4 m' }, v: { m: 80, h: 4, L: 10, EA: 23, z: 0.1 } },
    { lbl: { fr: 'f = 0,4 · h = 8 m', en: 'f = 0.4 · h = 8 m' }, v: { m: 80, h: 8, L: 20, EA: 23, z: 0.1 } },
    { lbl: { fr: 'f = 1 · h = 5 m', en: 'f = 1 · h = 5 m' }, v: { m: 80, h: 5, L: 5, EA: 23, z: 0.1 } },
    { lbl: { fr: 'f = 2 · h = 6 m', en: 'f = 2 · h = 6 m' }, v: { m: 80, h: 6, L: 3, EA: 23, z: 0.1 } }
  ];

  const lang = () => (typeof currentLang === 'string' ? currentLang : 'fr');
  const tr = o => (o ? (o[lang()] || o.fr || '') : '');
  const t = key => tr(L10N[key]);
  const num = (v, d) => v.toLocaleString(lang() === 'en' ? 'en-GB' : 'fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const $ = id => document.getElementById(id);

  const IN = { m: $('d-m'), h: $('d-h'), L: $('d-L'), EA: $('d-EA'), z: $('d-z') };
  const OUT = { m: $('d-m-out'), h: $('d-h-out'), L: $('d-L-out'), EA: $('d-EA-out'), z: $('d-z-out') };
  const plot = $('d-plot');
  const presetBtns = root.querySelectorAll('.d-presets button');

  function read() {
    return { m: +IN.m.value, h: +IN.h.value, L: +IN.L.value, EA: +IN.EA.value * 1000, z: +IN.z.value };
  }

  // intégration pas à pas — départ : x = −h (corde molle), v = 0
  function simulate(p, zeta, keep) {
    const k = p.EA / p.L, c = 2 * zeta * Math.sqrt(k * p.m);
    const n = Math.round(T_END / DT);
    let x = -p.h, v = 0, Tmax = 0, tPeak = 0, xMax = 0, first = true;
    const pts = keep ? [] : null;
    for (let i = 0; i <= n; i++) {
      const T = x > 0 ? Math.max(0, k * x + c * v) : 0; // la corde ne travaille qu'en traction
      // force de choc = pic de la première mise en tension (les rebonds suivants ne la dépassent pas)
      if (first) {
        if (T > Tmax) { Tmax = T; tPeak = i * DT; }
        if (x > xMax) xMax = x;
        if (Tmax > 0 && x <= 0) first = false;
      }
      if (keep && i % EVERY === 0) pts.push([i * DT, T]);
      v += (G - T / p.m) * DT; // Euler semi-implicite : la vitesse d'abord…
      x += v * DT;             // …puis la position, avec la nouvelle vitesse
    }
    return { k, c, Tmax, tPeak, xMax, pts };
  }

  // solution exacte sans amortissement, pendant la première mise en tension :
  // x(s) = A·(1 − cos ωs) + B·sin ωs, avec A = m·g/k, B = v₀/ω, jusqu'au retour à x = 0
  function exact(p) {
    const k = p.EA / p.L, w = Math.sqrt(k / p.m), mg = p.m * G;
    const tff = Math.sqrt(2 * p.h / G), v0 = Math.sqrt(2 * G * p.h);
    const A = mg / k, B = v0 / w;
    const Tmax = mg + Math.sqrt(mg * mg + 2 * mg * k * p.h);
    const tau = (2 * Math.PI - 2 * Math.atan2(B, A)) / w; // durée corde tendue
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const s = tau * i / 160;
      if (tff + s > T_END) break;
      pts.push([tff + s, Math.max(0, k * (A * (1 - Math.cos(w * s)) + B * Math.sin(w * s)))]);
    }
    return { Tmax, tff, v0, pts };
  }

  // graduation « ronde » de l'axe des forces (kN)
  function yScale(maxKN) {
    const step = maxKN <= 3 ? 0.5 : maxKN <= 6 ? 1 : maxKN <= 14 ? 2 : 5;
    return { top: Math.max(2 * step, Math.ceil(maxKN / step) * step), step };
  }

  function draw(sim, ex) {
    const W = Math.max(260, Math.round(plot.clientWidth || 600));
    const H = W < 520 ? 210 : 250;
    const PL = 40, PR = 14, PT = 22, PB = 24;
    const iw = W - PL - PR, ih = H - PT - PB;
    const { top, step } = yScale(Math.max(sim.Tmax, ex.Tmax) / 1000 * 1.15);
    const X = s => PL + (s / T_END) * iw;
    const Y = kN => PT + ih - (kN / top) * ih;
    const r = v => (Math.round(v * 10) / 10).toString();
    const path = pts => pts.map((q, i) => (i ? 'L' : 'M') + r(X(q[0])) + ' ' + r(Y(q[1] / 1000))).join('');
    let s = '';

    // zone de chute libre (corde molle) : hachures
    const xf = X(Math.min(ex.tff, T_END));
    s += '<rect x="' + PL + '" y="' + PT + '" width="' + r(xf - PL) + '" height="' + ih + '" fill="url(#d-hatch)"/>';
    s += '<line class="g-grid" x1="' + r(xf) + '" x2="' + r(xf) + '" y1="' + PT + '" y2="' + (PT + ih) + '"/>';
    if (xf - PL > 74) s += '<text class="g-ff" x="' + (PL + 6) + '" y="' + (PT + 13) + '">' + t('freeFall') + '</text>';

    // grille et graduations
    for (let v = 0; v <= top + 1e-9; v += step) {
      const y = r(Y(v));
      if (v > 0) s += '<line class="g-grid" x1="' + PL + '" x2="' + (W - PR) + '" y1="' + y + '" y2="' + y + '"/>';
      s += '<text x="' + (PL - 7) + '" y="' + r(+y + 3.5) + '" text-anchor="end">' + num(v, step < 1 ? 1 : 0) + '</text>';
    }
    for (let q = 0; q <= T_END + 1e-9; q += 1) {
      const x = r(X(q));
      if (q > 0) s += '<line class="g-grid" x1="' + x + '" x2="' + x + '" y1="' + PT + '" y2="' + (PT + ih) + '"/>';
      s += '<text x="' + x + '" y="' + (H - 7) + '" text-anchor="' + (q === T_END ? 'end' : q === 0 ? 'start' : 'middle') + '">' + num(q, 0) + ' s</text>';
    }
    s += '<path class="g-axis" d="M' + PL + ' ' + PT + 'V' + (PT + ih) + 'H' + (W - PR) + '"/>';
    s += '<text x="2" y="' + (PT - 9) + '">' + t('axisT') + '</text>';

    // solution analytique (ζ = 0) en tirets, simulation (Euler) en rouge
    if (ex.pts.length > 1) s += '<path class="g-ana" d="' + path(ex.pts) + '"/>';
    s += '<path class="g-sim" d="' + path(sim.pts) + '"/>';

    // pic de force : croix + cote
    const px = X(sim.tPeak), py = Y(sim.Tmax / 1000);
    s += '<path class="g-peak" d="M' + r(px - 5) + ' ' + r(py) + 'h10M' + r(px) + ' ' + r(py - 5) + 'v10"/>';
    const lbl = t('peak') + ' = ' + num(sim.Tmax / 1000, 2) + ' kN';
    const right = px + 10 + lbl.length * 6.4 < W - PR;
    s += '<text class="g-peak-lbl" x="' + r(right ? px + 10 : px - 10) + '" y="' + r(py - 4) + '" text-anchor="' + (right ? 'start' : 'end') + '">' + lbl + '</text>';

    plot.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('aria') + '">' +
      '<defs><pattern id="d-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="g-hatch" x1="0" y1="0" x2="0" y2="7"/></pattern></defs>' +
      s + '</svg>';
  }

  function update() {
    const p = read();
    const sim = simulate(p, p.z, true);
    const sim0 = p.z === 0 ? sim : simulate(p, 0, false);
    const ex = exact(p);
    const f = p.h / p.L, mg = p.m * G;

    OUT.m.textContent = num(p.m, 0) + ' kg';
    OUT.h.textContent = num(p.h, 1) + ' m';
    OUT.L.textContent = num(p.L, 1) + ' m';
    OUT.EA.textContent = num(p.EA / 1000, p.EA % 1000 ? 1 : 0) + ' kN';
    OUT.z.textContent = num(p.z, 2);
    $('d-c').innerHTML = '<var>c</var> = 2<var>ζ</var>·√(<var>km</var>) = ' + num(sim.c, 0) + ' N·s/m';

    draw(sim, ex);

    $('d-f').textContent = num(f, 2);
    $('d-k').textContent = num(sim.k / 1000, 2) + ' kN/m';
    $('d-v0').textContent = num(ex.v0, 1) + ' m/s';
    $('d-F').textContent = num(sim.Tmax / 1000, 2) + ' kN';
    $('d-x').textContent = num(sim.xMax, 2) + ' m · ' + num(100 * sim.xMax / p.L, 0) + ' %';
    $('d-a').textContent = num((sim.Tmax - mg) / mg, 1) + ' g';
    const err = Math.abs(sim0.Tmax - ex.Tmax) / ex.Tmax * 100;
    $('d-valid').textContent = t('valid')
      .replace('{e}', num(sim0.Tmax / 1000, 3) + ' kN')
      .replace('{a}', num(ex.Tmax / 1000, 3) + ' kN')
      .replace('{d}', (err < 0.01 ? '< ' + num(0.01, 2) : num(err, 2)) + ' %');
    const warn = $('d-warn');
    warn.hidden = !(f > 2 + 1e-9);
    if (!warn.hidden) warn.textContent = t('warnF');

    presetBtns.forEach(b => {
      const v = PRESETS[+b.dataset.p].v;
      b.classList.toggle('on', v.m === p.m && v.h === p.h && v.L === p.L && v.EA * 1000 === p.EA && v.z === p.z);
    });
  }

  function applyTexts() {
    root.querySelectorAll('[data-dk]').forEach(el => { el.innerHTML = t(el.getAttribute('data-dk')); }); // libellés maison : symboles en <var>
    const sch = root.querySelector('.demo-schema'); if (sch) sch.setAttribute('aria-label', t('schema'));
    const D = (typeof CONTENT === 'object' && CONTENT && CONTENT.demo) || null;
    if (D) root.querySelectorAll('[data-demo]').forEach(el => { const v = tr(D[el.getAttribute('data-demo')]); if (v) el.innerHTML = v; });
    presetBtns.forEach(b => { b.textContent = tr(PRESETS[+b.dataset.p].lbl); });
  }

  Object.values(IN).forEach(inp => inp.addEventListener('input', update));
  presetBtns.forEach(b => b.addEventListener('click', () => {
    const v = PRESETS[+b.dataset.p].v;
    IN.m.value = v.m; IN.h.value = v.h; IN.L.value = v.L; IN.EA.value = v.EA; IN.z.value = v.z;
    update();
  }));
  document.addEventListener('cv:lang', () => { applyTexts(); update(); });

  // le tracé suit la largeur de sa case (rotation d'écran, fenêtre redimensionnée)
  let lastW = 0, deb = 0;
  const onResize = () => { const w = plot.clientWidth; if (w && w !== lastW) { lastW = w; clearTimeout(deb); deb = setTimeout(update, 60); } };
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(plot);
  else window.addEventListener('resize', onResize);

  applyTexts();
  update();
})();
