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
  // sommaire (demo : section propre à certaines pages, ex. petzl.html — absente ailleurs, donc ignorée)
  const navMap = { about: 'about', formation: 'formation', experiences: 'exp', projets: 'projets', demo: 'demo', competences: 'comp', langues: 'lang', interets: 'int', contact: 'contact' };
  for (const [sec, key] of Object.entries(navMap)) {
    const a = document.querySelector('#main-nav a[href="#' + sec + '"]');
    if (a) a.textContent = pick(lb.nav[key]);
  }
  // libellés de sections
  const secMap = { about: 'about', formation: 'formation', experiences: 'exp', projets: 'projets', demo: 'demo', competences: 'comp', langues: 'lang', interets: 'int', contact: 'contact' };
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
    // un projet avec un album de photos ouvre sa page dédiée (prioritaire sur un lien externe) ;
    // sur une page à contenu propre (ex. content-petzl.json), l'album est lu dans ce même fichier (&c=)
    const hasAlbum = p.album && p.album.length && p.slug;
    const albumSrc = PAGE.content !== 'content.json' ? '&c=' + encodeURIComponent(PAGE.content) : '';
    const link = hasAlbum ? ('projet.html?id=' + encodeURIComponent(p.slug) + albumSrc) : (p.link || '');
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
  addSuiteButtons(); // boutons « Lire la suite » des cartes projets (mobile)
  updateNav();
}

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('cvLang', lang); } catch (e) {} // mémorise la langue pour les sous-pages (projet.html)
  if (PAGE.defaultLang) { try { sessionStorage.setItem('cvLang:' + PAGE.content, lang); } catch (e) {} } // choix propre à cette page (onglet courant)
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
  renderAll();
  // les modules propres à une page (ex. assets/demo-chute.js) se mettent à jour sur cet évènement
  document.dispatchEvent(new CustomEvent('cv:lang', { detail: lang }));
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

// ─── boutons « Lire la suite » des cartes projets (mobile) : re-calcul après chargement des polices,
// aux redimensionnements et rotations d'écran (ResizeObserver = fiable là où l'évènement resize ne suffit pas) ───
function initSuiteButtons(){
  [400, 1200, 2500].forEach(d => setTimeout(addSuiteButtons, d));
  const scroll = document.getElementById('projects-scroll');
  if (scroll && 'ResizeObserver' in window) {
    let deb; new ResizeObserver(() => { clearTimeout(deb); deb = setTimeout(addSuiteButtons, 150); }).observe(scroll);
  }
  window.addEventListener('resize', () => setTimeout(addSuiteButtons, 150));
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
  initSuiteButtons(); // boutons « Lire la suite » des cartes projets (mobile)
}).catch(e => console.error('Chargement de ' + PAGE.content + ' impossible :', e));
