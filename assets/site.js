// ══════════════════════════════════════
// CONTENU — tout le site est rendu depuis content.json (édité via l'admin local : lancer-backend.bat)
// ══════════════════════════════════════
let CONTENT = null;
let currentLang = 'fr';
// texte dans la langue courante, repli sur le français si la traduction manque
const pick = (o, l) => { l = l || currentLang; return o ? (o[l] || o.fr || '') : ''; };

// PARAMÈTRES DE LA PAGE — lus sur <body> : un même gabarit sert index.html, esa.html et les futures pages par entreprise
//   data-content="content-esa.json"  fichier de contenu (défaut : content.json)
//   data-default-lang="en"           langue de départ, sans lire la langue mémorisée du site au premier chargement
//   data-langs="en,fr"               langues proposées (défaut : les 4) ; les autres boutons sont masqués
const ALL_LANGS = ['fr', 'en', 'de', 'it'];
const PAGE = (function () {
  const d = document.body.dataset;
  let langs = (d.langs || '').split(',').map(s => s.trim()).filter(l => ALL_LANGS.includes(l));
  if (!langs.length) langs = ALL_LANGS.slice();
  const def = ALL_LANGS.includes(d.defaultLang) ? d.defaultLang : '';
  return { content: d.content || 'content.json', defaultLang: def, langs: langs };
})();
document.querySelectorAll('.lang-btn').forEach(b => { if (!PAGE.langs.includes(b.getAttribute('data-lang'))) b.style.display = 'none'; });

// langue au démarrage : celle imposée par la page (et, dans le même onglet, le choix fait ensuite sur CETTE page,
// pour qu'un retour depuis une sous-page la conserve) ; sinon la langue mémorisée du site
function initialLang() {
  let lang = '';
  if (PAGE.defaultLang) {
    try { lang = sessionStorage.getItem('cvLang:' + PAGE.content) || ''; } catch (e) {}
    if (!PAGE.langs.includes(lang)) lang = PAGE.defaultLang;
  } else {
    lang = 'fr';
    try { lang = localStorage.getItem('cvLang') || 'fr'; } catch (e) {}
    if (!ALL_LANGS.includes(lang)) lang = 'fr';
  }
  return PAGE.langs.includes(lang) ? lang : PAGE.langs[0];
}

const CONTACT_ICONS = {
  email: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
  phone: '<path d="M6.62 10.79a15.49 15.49 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"/>',
  pin: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/>',
  car: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
  github: '<path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>'
};

function renderStatics() {
  const lb = CONTENT.labels;
  // sommaire
  const navMap = { about: 'about', formation: 'formation', experiences: 'exp', projets: 'projets', competences: 'comp', langues: 'lang', interets: 'int', contact: 'contact' };
  for (const [sec, key] of Object.entries(navMap)) {
    const a = document.querySelector('#main-nav a[href="#' + sec + '"]');
    if (a) a.textContent = pick(lb.nav[key]);
  }
  // libellés de sections
  const secMap = { about: 'about', formation: 'formation', experiences: 'exp', projets: 'projets', competences: 'comp', langues: 'lang', interets: 'int', contact: 'contact' };
  for (const [sec, key] of Object.entries(secMap)) {
    const el = document.querySelector('#' + sec + ' .section-label');
    if (el) el.textContent = pick(lb.sections[key]);
  }
  // hero
  document.querySelector('.hero-badge').textContent = pick(CONTENT.hero.badge);
  document.querySelector('.hero .title').innerHTML = pick(CONTENT.hero.title);
  document.querySelector('.hero .tagline').innerHTML = pick(CONTENT.hero.tagline);
  const photo = document.getElementById('hero-photo');
  if (photo) {
    if (CONTENT.hero.photo) { photo.src = CONTENT.hero.photo; photo.style.display = ''; photo.onerror = () => { photo.style.display = 'none'; }; }
    else photo.style.display = 'none';
  }
  // boutons CV (libellé + fichier)
  document.querySelectorAll('a.btn-download, a.btn-download-inline').forEach(a => a.setAttribute('href', CONTENT.pdf));
  const dl1 = document.querySelector('.btn-download span'); if (dl1) dl1.textContent = pick(lb.dlBtn);
  const dl2 = document.querySelector('.btn-download-inline span'); if (dl2) dl2.textContent = pick(lb.dlBtnLong);
  const heroContact = document.querySelector('.cta-row .btn-ghost'); if (heroContact) heroContact.textContent = pick(lb.nav.contact);
  const foot = document.querySelector('.cv-footer > span'); if (foot) foot.textContent = pick(lb.footer);
  if (lb.pageTitle) document.title = pick(lb.pageTitle);
}

// POINTS FORTS (clé optionnelle highlights) — encadré inséré juste sous le hero ; clé absente ou vide = rien
function renderHighlights() {
  const list = CONTENT.highlights;
  let box = document.getElementById('highlights');
  if (!list || !list.length) { if (box) box.remove(); return; }
  if (!box) {
    box = document.createElement('div');
    box.id = 'highlights';
    box.className = 'highlights';
    document.querySelector('.hero').after(box);
  }
  box.innerHTML = list.map((it, i) =>
    '<div class="hl-item"><span class="hl-num">' + String(i + 1).padStart(2, '0') + '</span><p>' + pick(it) + '</p></div>'
  ).join('');
}

function renderAbout() {
  document.querySelector('.about-text').innerHTML =
    CONTENT.about.map(p => '<p>' + pick(p) + '</p>').join('');
}

// cartes datées (formations & expériences)
function datedCardHtml(item) {
  const title = pick(item.title);
  const titleHtml = item.link
    ? '<a href="' + item.link + '" target="_blank" rel="noopener"><span>' + title + '</span><span class="ext-icon">↗</span></a>'
    : '<span>' + title + '</span>';
  const img = item.img
    ? '<img class="card-thumb" src="' + item.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
    : '';
  return '<div class="card' + (item.img ? ' has-img' : '') + '">' +
    '<div class="card-date">' + (item.date || '') + '</div>' +
    '<div class="card-content">' +
    '<div class="card-title">' + titleHtml + '</div>' +
    '<div class="card-subtitle">' + pick(item.subtitle) + '</div>' +
    '<div class="card-desc"><ul>' + item.items.map(li => '<li>' + pick(li) + '</li>').join('') + '</ul></div>' +
    '</div>' + img + '</div>';
}
function renderDatedList(id, arr) {
  document.getElementById(id).innerHTML = arr.map(datedCardHtml).join('');
}

function renderProjects() {
  const view = pick(CONTENT.labels.projView);
  const wipLbl = pick(CONTENT.labels.projWip);
  document.getElementById('projects-scroll').innerHTML = CONTENT.projects.map(p => {
    // un projet avec un album de photos ouvre sa page dédiée (prioritaire sur un lien externe)
    const hasAlbum = p.album && p.album.length && p.slug;
    const link = hasAlbum ? ('projet.html?id=' + encodeURIComponent(p.slug)) : (p.link || '');
    const ext = /^https?:/.test(link);
    const openJs = link ? (ext ? "window.open('" + link + "','_blank','noopener')" : "window.location.href='" + link + "'") : '';
    let h = '<div class="skill-category' + (p.wip ? ' proj-wip' : '') + (openJs ? ' proj-click' : '') + '"' +
      (openJs ? ' onclick="' + openJs + '"' : '') + '>';
    if (p.img) h += '<img src="' + p.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" style="width:calc(100% + 40px);height:170px;object-fit:cover;display:block;margin:-18px -20px 16px;border-radius:10px 10px 0 0;">';
    if (p.wip) h += '<span class="badge-wip">' + wipLbl + '</span>';
    h += '<div class="card-title">' + pick(p.title) + '</div>';
    // mention optionnelle sous le titre (ex. « Report in French ») — clé absente = rien d'affiché
    if (pick(p.note)) h += '<div class="proj-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' + pick(p.note) + '</div>';
    h += '<div class="card-desc">' + pick(p.desc) + '</div>';
    h += '<div class="skill-tags" style="margin-top:14px;">' + p.tags.map(t => '<span class="tag neutral">' + pick(t) + '</span>').join('') + '</div>';
    if (link) h += '<button class="tag-link strong" style="margin-top:14px;" onclick="event.stopPropagation();' + openJs + '">' + view + ' <span class="go">→</span></button>';
    h += '</div>';
    return h;
  }).join('');
}

function renderSkills() {
  document.getElementById('skills-grid').innerHTML = CONTENT.skills.map(cat =>
    '<div class="skill-category"><div class="skill-cat-title">' + pick(cat.title) + '</div><div class="skill-tags">' +
    cat.tags.map(t => t.link
      ? '<button class="tag-link" onclick="window.location.href=\'' + t.link + '\'">' + pick(t.label) + ' ↗</button>'
      : '<span class="tag neutral">' + pick(t.label) + '</span>'
    ).join('') + '</div></div>'
  ).join('');
}

function renderLanguages() {
  document.getElementById('lang-list').innerHTML = CONTENT.languages.map(l =>
    '<div class="lang-item"><div class="lang-flag">' + (l.icon || '') + '</div><div>' +
    '<div class="lang-name">' + pick(l.name) + '</div><div class="lang-level">' + pick(l.level) + '</div></div></div>'
  ).join('');
}

function renderInterests() {
  document.getElementById('interests-grid').innerHTML = CONTENT.interests.map(it => {
    const click = it.page ? ' onclick="openSport(\'' + it.page + '\')" style="cursor:pointer;"' : '';
    const detailStyle = it.page ? ' style="color:var(--accent);"' : '';
    return '<div class="interest-item"' + click + '><span class="interest-icon">' + (it.icon || '') + '</span>' +
      '<div class="interest-name">' + pick(it.name) + '</div>' +
      '<div class="interest-detail"' + detailStyle + '>' + pick(it.detail) + '</div></div>';
  }).join('');
}

function renderContacts() {
  document.getElementById('contact-grid').innerHTML = CONTENT.contacts.map(c => {
    const inner = '<div class="contact-icon"><svg viewBox="0 0 24 24">' + (CONTACT_ICONS[c.icon] || CONTACT_ICONS.email) + '</svg></div>' +
      '<div><div class="contact-label">' + pick(c.label) + '</div><div class="contact-value">' + pick(c.value) + '</div></div>';
    return c.href
      ? '<a class="contact-item" href="' + c.href + '"' + (/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a>'
      : '<div class="contact-item">' + inner + '</div>';
  }).join('');
}

function renderAll() {
  if (!CONTENT) return;
  renderStatics();
  renderHighlights();
  renderAbout();
  renderDatedList('formation-list', CONTENT.formations);
  renderDatedList('exp-list', CONTENT.experiences);
  renderProjects();
  renderSkills();
  renderLanguages();
  renderInterests();
  renderContacts();
  renderEffectsTexts(); // bras/parcours/PID : textes dépendants de la langue
  updateNav();
}

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('cvLang', lang); } catch (e) {} // mémorise la langue pour les sous-pages (projet.html)
  if (PAGE.defaultLang) { try { sessionStorage.setItem('cvLang:' + PAGE.content, lang); } catch (e) {} } // choix propre à cette page (onglet courant)
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
  renderAll();
}

// PAGE SWITCHING
let _savedScroll = 0;
function showPage(id) {
  if (id !== 'page-cv') {
    _savedScroll = window.scrollY; // mémorise la position du CV uniquement quand on le quitte
  }
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  const target = document.getElementById(id);
  target.style.display = 'block';
  target.classList.add('active');
  if (id === 'page-cv') {
    requestAnimationFrame(() => window.scrollTo({top: _savedScroll, behavior: 'instant'}));
  } else {
    window.scrollTo({top:0});
    // Populate deferred media src attributes
    target.querySelectorAll('img[data-src], video[data-src]').forEach(el => {
      if (!el.src || el.src === window.location.href) {
        el.src = el.getAttribute('data-src');
      }
    });
  }
}
function goBack() { showPage('page-cv'); }
function showPageBack() { showPage('page-cv'); }










// SPORT: handled by separate HTML files

function openSport(act) {
  if (/^https?:/.test(act)) window.open(act, '_blank', 'noopener'); // URL externe (ex. GitHub)
  else window.location.href = act + '.html';
}

// CV NAV ACTIVE ON SCROLL
let sections = document.querySelectorAll('section[id]');
let navLinks = document.querySelectorAll('#main-nav a');
function refreshNavRefs(){ sections = document.querySelectorAll('section[id]'); navLinks = document.querySelectorAll('#main-nav a'); }
let _lastNavActive = null;
function updateNav() {
  let current = '';
  sections.forEach(s => { if(s.getBoundingClientRect().top <= 120) current = s.id; });
  // tout en bas de page, la dernière section ne peut pas atteindre le haut de l'écran : forcer son activation
  if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) current = sections[sections.length - 1].id;
  navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  // garde l'onglet actif visible quand le sommaire déborde (mobile) : centre-le horizontalement
  if(current !== _lastNavActive){
    _lastNavActive = current;
    const nav = document.getElementById('main-nav');
    const act = nav.querySelector('a.active');
    if(act && nav.scrollWidth > nav.clientWidth + 4){
      nav.scrollTo({left: act.offsetLeft - (nav.clientWidth - act.offsetWidth) / 2, behavior: 'smooth'});
    }
  }
}
window.addEventListener('scroll', updateNav, {passive:true});
updateNav();


// RETOUR DEPUIS UNE SOUS-PAGE : restaure la position de lecture (le navigateur ne le fait pas toujours seul)
(function initScrollRestore(){
  window.addEventListener('pagehide', () => {
    try{ sessionStorage.setItem('cvScrollY', String(window.scrollY)); }catch(e){}
  });
  let navType = '';
  try{ navType = performance.getEntriesByType('navigation')[0].type; }catch(e){}
  if(navType === 'back_forward'){
    const y = parseInt(sessionStorage.getItem('cvScrollY') || '0', 10);
    if(y > 0){
      const restore = () => window.scrollTo({top: y, behavior: 'instant'});
      restore();               // le script est en fin de body : la mise en page est déjà disponible
      setTimeout(restore, 60); // seconde passe après stabilisation de la mise en page
    }
  }
})();

// PROJETS : flèches ‹ › (boutons .proj-arrow) pour faire défiler les cartes.
function initProjectsCarousel(){
  const track = document.querySelector('#projets .projects-scroll');
  if(!track) return;
  window.projScroll = function(dir){
    const cards = track.querySelectorAll('.skill-category');
    const stride = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 316;
    track.scrollBy({left: dir * stride, behavior: 'smooth'});
  };
}

// COUVERTURE : panorama (hero.pano) qui dérive lentement — 2 copies côte à côte,
// translateX(-50%) = boucle sans couture si les bords gauche/droit de la photo se raccordent (360°).
function initPano(){
  const src = CONTENT.hero && CONTENT.hero.pano;
  if(!src) return;
  const box = document.getElementById('pano'), track = document.getElementById('pano-track');
  const img = document.createElement('img');
  img.alt = '';
  img.onload = () => {
    track.append(img.cloneNode());
    box.style.display = '';
    document.body.classList.add('has-pano'); // la photo de profil vient chevaucher le panorama
    requestAnimationFrame(() => {
      // vitesse constante (~22 px/s) quelle que soit la largeur affichée du panorama
      const w = img.offsetWidth || img.naturalWidth;
      track.style.animationDuration = Math.max(30, Math.round(w / 22)) + 's';
    });
  };
  img.onerror = () => { box.style.display = 'none'; };
  track.append(img);
  img.src = src;
}

// ══════════════════════════════════════
// EFFETS INTERACTIFS — bras robot · parcours · PID (pilotés par content.json > features)
// ══════════════════════════════════════
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// boucle d'animation : rAF si dispo, sinon repli setInterval (rendus sans compositeur)
function runLoop(frame){ let alive=false; function loop(){ alive=true; frame(); requestAnimationFrame(loop); } requestAnimationFrame(loop); setTimeout(()=>{ if(!alive) setInterval(frame,33); },500); }

// libellés techniques du PID (les 4 langues) — titre/description viennent de content.json
const PID_L10N = {
  kp:{fr:'Kp — proportionnel',en:'Kp — proportional',de:'Kp — Proportionalanteil',it:'Kp — proporzionale'},
  ki:{fr:'Ki — intégral',en:'Ki — integral',de:'Ki — Integralanteil',it:'Ki — integrale'},
  kd:{fr:'Kd — dérivé',en:'Kd — derivative',de:'Kd — Differentialanteil',it:'Kd — derivativo'},
  mou:{fr:'Trop mou',en:'Too soft',de:'Zu träge',it:'Troppo molle'},
  instable:{fr:'Instable',en:'Unstable',de:'Instabil',it:'Instabile'},
  regle:{fr:'Bien réglé',en:'Well tuned',de:'Gut eingestellt',it:'Ben regolato'},
  over:{fr:'Dépassement',en:'Overshoot',de:'Überschwingen',it:'Sovraelongazione'},
  settle:{fr:'Temps de réponse',en:'Settling time',de:'Ausregelzeit',it:'Tempo di risposta'},
  errlbl:{fr:'Erreur statique',en:'Steady-state error',de:'Bleibende Abweichung',it:'Errore a regime'},
  verdict:{fr:'Verdict',en:'Verdict',de:'Urteil',it:'Verdetto'},
  consigne:{fr:'consigne',en:'setpoint',de:'Sollwert',it:'setpoint'},
  vInstable:{fr:'Instable ✗',en:'Unstable ✗',de:'Instabil ✗',it:'Instabile ✗'},
  vBien:{fr:'Bien réglé ✓',en:'Well tuned ✓',de:'Gut eingestellt ✓',it:'Ben regolato ✓'},
  vErr:{fr:'Erreur statique',en:'Steady-state error',de:'Regelabweichung',it:'Errore a regime'},
  vMoyen:{fr:'Peut mieux faire',en:'Could be better',de:'Geht besser',it:'Può migliorare'}
};

let _armApi = null, _parcoursApi = null, _pidApi = null;

// ─── initialisation unique (après chargement de content.json) ───
function initEffects(){
  const F = (CONTENT && CONTENT.features) || {};
  // Bras robot : retiré du DOM si désactivé
  if(!(F.arm && F.arm.enabled !== false)) { const c=document.getElementById('arm-hero'); if(c) c.remove(); }
  else _armApi = initArm();
  // Parcours : section retirée si désactivé (+ son lien de sommaire)
  if(!(F.parcours && F.parcours.enabled !== false)) {
    const s=document.getElementById('parcours'); if(s) s.remove();
    const l=document.getElementById('nav-parcours-link'); if(l) l.remove();
    refreshNavRefs(); // la section/le lien retirés ne doivent plus fausser la nav au scroll
  } else _parcoursApi = initParcours();
  // PID : carte retirée si désactivé
  if(!(F.pid && F.pid.enabled !== false)) { const p=document.getElementById('pid-card'); if(p) p.remove(); }
  else _pidApi = initPid();
  renderEffectsTexts();
  // boutons « Lire la suite » : re-calcul après chargement des polices, aux redimensionnements
  // et rotations d'écran (ResizeObserver = fiable là où l'évènement resize ne suffit pas)
  [400, 1200, 2500].forEach(d => setTimeout(addSuiteButtons, d));
  const scroll = document.getElementById('projects-scroll');
  if (scroll && 'ResizeObserver' in window) {
    let deb; new ResizeObserver(() => { clearTimeout(deb); deb = setTimeout(addSuiteButtons, 150); }).observe(scroll);
  }
  window.addEventListener('resize', () => setTimeout(addSuiteButtons, 150));
}

// ─── textes dépendants de la langue (appelé à chaque setLang) ───
function renderEffectsTexts(){
  if(!CONTENT) return;
  const F = CONTENT.features || {};
  // Parcours : titre de section, lien de sommaire, accroche, carte d'étape courante
  if(_parcoursApi && F.parcours){
    const lbl=document.getElementById('parcours-label'); if(lbl) lbl.textContent=pick(F.parcours.title);
    const nav=document.getElementById('nav-parcours-link'); if(nav){ nav.textContent=pick(F.parcours.title); nav.style.display=''; }
    const cue=document.getElementById('course-cue'); if(cue) cue.textContent=pick(F.parcours.cue);
    _parcoursApi.refresh();
  }
  // PID : titre + description (content.json) et libellés techniques (dico)
  if(_pidApi && F.pid){
    const t=document.getElementById('pid-title'); if(t) t.textContent=pick(F.pid.title);
    const d=document.getElementById('pid-desc'); if(d) d.textContent=pick(F.pid.desc);
    document.querySelectorAll('#pid-card [data-k]').forEach(el=>{ const k=el.getAttribute('data-k'); if(PID_L10N[k]) el.textContent=pick(PID_L10N[k]); });
    _pidApi.refresh();
  }
  addSuiteButtons(); // boutons « Lire la suite » des cartes projets (mobile)
}

// ─── BRAS ROBOT 2 axes (cinématique inverse) — suit la souris dans le hero ───
function initArm(){
  const stage=document.querySelector('.hero'), canvas=document.getElementById('arm-hero');
  if(!stage||!canvas) return null;
  canvas.style.display='';
  const ctx=canvas.getContext('2d');
  const sizePct=(CONTENT.features.arm && CONTENT.features.arm.size) || 100;
  let L1=150,L2=120,S=1,W=0,H=0;
  function resize(){
    const DPR=Math.min(2,window.devicePixelRatio||1);
    W=stage.clientWidth; H=stage.clientHeight;
    S=(W<700?0.65:1)*(sizePct/100);
    L1=150*S; L2=120*S;
    canvas.width=W*DPR; canvas.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize(); window.addEventListener('resize',resize);
  let a1=-2.2,a2=1.6,tx=null,ty=null,t=0;
  const base=()=>({x:W*(S<1&&W<700?0.88:0.78),y:H-8});
  document.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top;
    if(x>=0&&y>=0&&x<=r.width&&y<=r.height){tx=x;ty=y;} else {tx=ty=null;}
  },{passive:true});
  function solveIK(bx,by,px,py){
    let dx=px-bx,dy=py-by; const dmax=L1+L2-4,d=Math.hypot(dx,dy);
    if(d>dmax){dx*=dmax/d;dy*=dmax/d;}
    const dist=Math.min(Math.hypot(dx,dy),dmax);
    const c2=(dist*dist-L1*L1-L2*L2)/(2*L1*L2);
    const A2=-Math.acos(Math.max(-1,Math.min(1,c2)));
    const A1=Math.atan2(dy,dx)-Math.atan2(L2*Math.sin(A2),L1+L2*Math.cos(A2));
    return [A1,A2];
  }
  function cap(x1,y1,x2,y2,w,c){ ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke(); }
  function frame(){
    if(stage.clientWidth!==W||stage.clientHeight!==H) resize();
    if(!W||!H||canvas.offsetParent===null) return; // masqué (mobile)
    t+=0.016; const b=base(); let px,py;
    if(tx!==null){px=tx;py=ty;}
    else if(!REDUCED){px=b.x-120*S+Math.sin(t*0.5)*85*S; py=H*0.42+Math.cos(t*0.73)*45*S;}
    else {px=b.x-140*S;py=H*0.4;}
    const [g1,g2]=solveIK(b.x,b.y,px,py); a1+=(g1-a1)*0.2; a2+=(g2-a2)*0.2;
    const jx=b.x+L1*Math.cos(a1),jy=b.y+L1*Math.sin(a1);
    const ex=jx+L2*Math.cos(a1+a2),ey=jy+L2*Math.sin(a1+a2);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(96,165,250,0.08)';ctx.lineWidth=1;ctx.setLineDash([4,7]);
    ctx.beginPath();ctx.arc(b.x,b.y,L1+L2-4,Math.PI,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#1e293b';ctx.beginPath();ctx.roundRect(b.x-28*S,b.y-5*S,56*S,10*S,4*S);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.stroke();
    cap(b.x,b.y-3*S,jx,jy,13*S,'#243352'); cap(b.x,b.y-3*S,jx,jy,8*S,'#31446e');
    cap(jx,jy,ex,ey,10*S,'#2b3d63'); cap(jx,jy,ex,ey,6*S,'#3b5488');
    for(const [cx2,cy2,r] of [[b.x,b.y-3*S,8*S],[jx,jy,6.5*S]]){
      ctx.fillStyle='#0d1526';ctx.beginPath();ctx.arc(cx2,cy2,r,0,7);ctx.fill();
      ctx.strokeStyle='#60a5fa';ctx.lineWidth=Math.max(1.2,2*S);ctx.stroke();
      ctx.fillStyle='#60a5fa';ctx.beginPath();ctx.arc(cx2,cy2,2*S,0,7);ctx.fill();
    }
    ctx.save();ctx.translate(ex,ey);ctx.rotate(a1+a2);ctx.scale(S,S);
    ctx.strokeStyle='#60a5fa';ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,-5);ctx.quadraticCurveTo(10,-7,13,-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(10,7,13,2);ctx.stroke();ctx.restore();
    ctx.fillStyle='rgba(96,165,250,0.12)';ctx.beginPath();ctx.arc(ex,ey,13*S,0,7);ctx.fill();
    if(tx!==null){
      ctx.strokeStyle='rgba(52,211,153,0.7)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(px,py,8,0,7);ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px-13,py);ctx.lineTo(px-4,py);ctx.moveTo(px+4,py);ctx.lineTo(px+13,py);
      ctx.moveTo(px,py-13);ctx.lineTo(px,py-4);ctx.moveTo(px,py+4);ctx.lineTo(px,py+13);ctx.stroke();
    }
  }
  runLoop(frame);
  return {};
}

// ─── PARCOURS façon profil de course (lié au défilement) ───
function initParcours(){
  const outer=document.getElementById('course-outer'); if(!outer) return null;
  const main=document.getElementById('course-path'),done=document.getElementById('course-done'),fill=document.getElementById('course-fill');
  const pathD='M 20 330 C 90 320, 130 285, 185 268 C 240 250, 265 290, 320 272 C 380 252, 400 200, 455 185 C 505 172, 520 230, 575 215 C 635 198, 655 140, 710 128 C 760 117, 775 170, 830 150 C 895 126, 930 92, 975 62';
  main.setAttribute('d',pathD); done.setAttribute('d',pathD); fill.setAttribute('d',pathD+' L 975 380 L 20 380 Z');
  const LEN=main.getTotalLength(); done.style.strokeDasharray=LEN; done.style.strokeDashoffset=LEN;
  const grid=document.getElementById('gridlines');
  for(let y=80;y<380;y+=75){ const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',20);l.setAttribute('x2',980);l.setAttribute('y1',y);l.setAttribute('y2',y);
    l.setAttribute('stroke','rgba(255,255,255,0.05)');l.setAttribute('stroke-dasharray','3 6');grid.appendChild(l); }
  const runner=document.getElementById('runner'),robot=document.getElementById('robot'),svgEl=document.getElementById('course-svg');
  const card={t:document.getElementById('cp-title'),d:document.getElementById('cp-desc')};
  const cpg=document.getElementById('checkpoints');
  let cpEls=[],currentCp=-1;
  // les étapes viennent de content.json ; leur position est répartie uniformément le long du tracé
  function steps(){ return (CONTENT.features.parcours.steps)||[]; }
  function positions(){ const s=steps(); const n=s.length; return s.map((cp,i)=> n<=1?1:i/(n-1)); }
  function buildCheckpoints(){
    cpg.innerHTML=''; cpEls=[];
    positions().forEach(at=>{
      const p=main.getPointAtLength(at*LEN);
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      const halo=document.createElementNS('http://www.w3.org/2000/svg','circle');
      halo.setAttribute('cx',p.x);halo.setAttribute('cy',p.y);halo.setAttribute('r',10);
      halo.setAttribute('fill','none');halo.setAttribute('stroke','rgba(96,165,250,0.35)');
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',5);
      c.setAttribute('fill','#0d1526');c.setAttribute('stroke','#60a5fa');c.setAttribute('stroke-width',2);
      g.append(halo,c);cpg.appendChild(g);cpEls.push(c);
    });
  }
  function setCp(i){ const s=steps(); if(!s[i]) return; card.t.textContent=pick(s[i].title); card.d.textContent=pick(s[i].desc); currentCp=i; }
  function onScroll(){
    const r=outer.getBoundingClientRect(); const total=r.height-window.innerHeight;
    const prog=Math.max(0,Math.min(1,-r.top/total)); const at=prog*LEN;
    const p=main.getPointAtLength(at);
    const p2=main.getPointAtLength(Math.min(LEN,at+3)),p1=main.getPointAtLength(Math.max(0,at-3));
    const angle=Math.atan2(p2.y-p1.y,p2.x-p1.x)*180/Math.PI;
    const rs=Math.max(1,Math.min(2,700/(svgEl.clientWidth||700))); // robot agrandi quand le SVG est petit (mobile)
    runner.setAttribute('transform','translate('+p.x+','+p.y+')');
    robot.setAttribute('transform','rotate('+angle.toFixed(1)+') scale('+rs.toFixed(2)+')');
    done.style.strokeDashoffset=LEN-at;
    const pos=positions(); let idx=0;
    pos.forEach((at2,i)=>{ const passed=prog>=at2-0.02; if(cpEls[i]){ cpEls[i].setAttribute('fill',passed?'#34d399':'#0d1526'); cpEls[i].setAttribute('stroke',passed?'#34d399':'#60a5fa'); } if(passed) idx=i; });
    if(idx!==currentCp) setCp(idx);
    const cue=document.getElementById('course-cue'); if(cue) cue.style.opacity=prog>0.95?0.25:1;
  }
  buildCheckpoints();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  setInterval(onScroll,250);
  onScroll();
  // refresh = reconstruit les checkpoints (nb d'étapes a pu changer) et re-traduit la carte
  return { refresh(){ buildCheckpoints(); currentCp=-1; onScroll(); } };
}

// ─── PLAYGROUND PID (section Compétences) ───
function initPid(){
  const cv=document.getElementById('pid-canvas'); if(!cv) return null;
  const ctx=cv.getContext('2d'), box=cv.parentElement;
  const $=id=>document.getElementById(id);
  const inputs={kp:$('kp'),ki:$('ki'),kd:$('kd')}, outs={kp:$('kp-out'),ki:$('ki-out'),kd:$('kd-out')};
  function simulate(Kp,Ki,Kd){
    const m=1,c=0.5,k=3,dt=0.002,T=6; let x=0,v=0,I=0; const pts=[];
    for(let t=0;t<=T;t+=dt){ const e=1-x; I+=e*dt; const u=Kp*e+Ki*I-Kd*v; const a=(u-c*v-k*x)/m; v+=a*dt; x+=v*dt;
      if(Math.abs(x)>50){pts.push([t,x]);break;} if(pts.length===0||t-pts[pts.length-1][0]>=0.01) pts.push([t,x]); }
    return pts;
  }
  function metrics(pts){
    const last=pts[pts.length-1][1]; const diverged=Math.abs(last)>5||pts[pts.length-1][0]<5.9;
    let peak=0; for(const [,x] of pts) peak=Math.max(peak,x); const over=Math.max(0,(peak-1)*100);
    let settle=null; if(Math.abs(last-1)<=0.02){ settle=0; for(let i=pts.length-1;i>=0;i--){ if(Math.abs(pts[i][1]-1)>0.02){ settle=pts[Math.min(i+1,pts.length-1)][0]; break; } } }
    const err=Math.abs(1-last)*100;
    return {over,settle:diverged?null:settle,err:diverged?null:err,diverged};
  }
  function draw(pts){
    const DPR=Math.min(2,window.devicePixelRatio||1); const W=box.clientWidth,H=Math.max(170,box.clientHeight); if(!W) return;
    cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
    const PL=46,PR=18,PT=24,PB=34,iw=W-PL-PR,ih=H-PT-PB,ymin=-0.25,ymax=2.0;
    const X=t=>PL+(t/6)*iw, Y=x=>PT+(1-(x-ymin)/(ymax-ymin))*ih;
    ctx.font='11px JetBrains Mono, Consolas, monospace';
    for(let g=0;g<=2;g+=0.5){ ctx.strokeStyle=g===0?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.06)'; ctx.beginPath();ctx.moveTo(PL,Y(g));ctx.lineTo(W-PR,Y(g));ctx.stroke(); ctx.fillStyle='#64748b';ctx.fillText(g.toFixed(1),12,Y(g)+4); }
    for(let t=0;t<=6;t++){ ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.beginPath();ctx.moveTo(X(t),PT);ctx.lineTo(X(t),H-PB);ctx.stroke(); ctx.fillStyle='#64748b';ctx.fillText(t+' s',X(t)-6,H-14); }
    ctx.strokeStyle='rgba(52,211,153,0.65)';ctx.setLineDash([6,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PL,Y(1));ctx.lineTo(W-PR,Y(1));ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(52,211,153,0.9)';ctx.fillText(pick(PID_L10N.consigne),W-PR-58,Y(1)-6);
    ctx.strokeStyle='#60a5fa';ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.beginPath();
    pts.forEach(([t,x],i)=>{ const yy=Math.max(PT-10,Math.min(H-PB+10,Y(x))); if(i===0)ctx.moveTo(X(t),yy);else ctx.lineTo(X(t),yy); }); ctx.stroke();
  }
  const fmt=(v,u,d)=>v===null?'—':v.toFixed(d)+u;
  function update(){
    const Kp=+inputs.kp.value,Ki=+inputs.ki.value,Kd=+inputs.kd.value;
    outs.kp.textContent=Kp.toFixed(1);outs.ki.textContent=Ki.toFixed(1);outs.kd.textContent=Kd.toFixed(1);
    const pts=simulate(Kp,Ki,Kd); draw(pts); const m=metrics(pts);
    $('m-over').textContent=m.diverged?'∞':fmt(m.over,' %',1); $('m-over').className=m.over>25||m.diverged?'bad':'';
    $('m-settle').textContent=m.diverged?'—':(m.settle!==null&&m.settle<5.9?fmt(m.settle,' s',2):'> 6 s');
    $('m-err').textContent=m.diverged?'—':fmt(m.err,' %',1);
    let key,cls=''; if(m.diverged){key='vInstable';cls='bad';}
    else if(m.over<12&&m.settle!==null&&m.settle<2.2&&m.err<2){key='vBien';cls='good';}
    else if(m.err>5){key='vErr';} else {key='vMoyen';}
    $('m-verdict').textContent=pick(PID_L10N[key]); $('m-verdict').className=cls;
  }
  for(const inp of Object.values(inputs)) inp.addEventListener('input',update);
  document.querySelectorAll('#pid-card .preset').forEach(b=>b.addEventListener('click',()=>{ const [p,i,d]=b.dataset.p.split(','); inputs.kp.value=p;inputs.ki.value=i;inputs.kd.value=d; update(); }));
  window.addEventListener('resize',update);
  update();
  const retry=setInterval(()=>{ if(box.clientWidth){ update(); clearInterval(retry); } },200);
  return { refresh: update };
}

// ─── cartes projets (mobile) : bouton « Lire la suite » quand la description déborde ───
function addSuiteButtons(){
  // libellés optionnels labels.readMore / labels.readLess ; absents = textes français d'origine
  const lb=(CONTENT&&CONTENT.labels)||{};
  const MORE=lb.readMore?pick(lb.readMore):'Lire la suite ▾', LESS=lb.readLess?pick(lb.readLess):'Réduire ▴';
  document.querySelectorAll('#projects-scroll .card-desc').forEach(desc=>{
    const next=desc.nextElementSibling;
    const btn=(next&&next.classList&&next.classList.contains('desc-more'))?next:null;
    const clipped=desc.scrollHeight>desc.clientHeight+2;
    if((clipped||desc.classList.contains('expanded'))&&!btn){
      const b=document.createElement('button'); b.className='desc-more'; b.textContent=MORE;
      b.onclick=e=>{ e.stopPropagation(); const open=desc.classList.toggle('expanded'); b.textContent=open?LESS:MORE; };
      desc.after(b);
    } else if(!clipped&&!desc.classList.contains('expanded')&&btn){ btn.remove(); }
  });
}

// DÉMARRAGE — charge le fichier de contenu de la page (content.json par défaut) puis rend tout le site
fetch(PAGE.content, {cache: 'no-cache'}).then(r => r.json()).then(c => {
  CONTENT = c;
  setLang(initialLang()); // langue imposée par la page, sinon mémorisée (revenir d'une page projet garde la langue)
  initProjectsCarousel();
  initPano();
  initEffects(); // bras robot · parcours · PID (pilotés par content.json > features)
}).catch(e => console.error('Chargement de ' + PAGE.content + ' impossible :', e));
