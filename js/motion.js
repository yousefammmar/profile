/* Motion layer — anime.js v4.
   Loaded after the page works on its own; any failure just removes the .anim class and content shows as-is. */
import { animate, stagger, splitText, createDrawable, createSpring, onScroll, set } from 'animejs';

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const canHover = matchMedia('(hover: hover)').matches;

/* ───────── 1. Hero entrance ───────── */
const h1 = $('.hero__name');
h1.setAttribute('aria-label', 'Yousef Odeh');
const split = splitText(h1, { chars: { wrap: 'clip' } });
animate(split.chars, { y: ['110%', '0%'], duration: 1000, ease: 'outExpo', delay: stagger(45) });
animate(['.pill', '.hero__lead', '.ask', '.chips li', '.ask__hint', '.hero__links li'].flatMap((s) => $$(s)), {
  opacity: [0, 1], y: [26, 0], duration: 900, ease: 'outExpo', delay: stagger(70, { start: 450 }),
});

/* ───────── 2. Typewriter placeholder in the shortcut box ───────── */
const input = $('#q');
const phrases = ['Ask about projects…', 'What has Yousef built?', 'Where does he teach?', 'Show me the contests', 'Which languages does he use?'];
let pi = 0, typing = true;
function typeNext() {
  if (!typing || document.hidden) { setTimeout(typeNext, 1500); return; }
  const text = phrases[pi++ % phrases.length], o = { n: 0 };
  animate(o, {
    n: text.length, duration: text.length * 55, ease: 'linear',
    onUpdate: () => { if (typing) input.placeholder = text.slice(0, Math.round(o.n)); },
    onComplete: () => setTimeout(typeNext, 1800),
  });
}
setTimeout(typeNext, 1600);
input.addEventListener('focus', () => { typing = false; input.placeholder = 'Try: projects, experience, contests, skills, contact'; });
input.addEventListener('blur', () => { typing = !input.value; });

/* ───────── 3. Shortcut routing (keyword → section, with a pulse) ───────── */
const routes = [
  { re: /\b(cv|resume|résumé|download)\b/, action: 'cv' },
  { re: /contact|e-?mail|hire|phone|reach|linkedin|github|talk/, id: 'contact', label: 'Contact', pulse: '.contact' },
  { re: /skill|stack|language|python|java|c\+\+|php|sql|git|linux|tool|tech|database/, id: 'about', scrollTo: '.skills', label: 'Skills', pulse: '.skills .panel' },
  { re: /contest|cpc|compet|icpc|train|aws|devops|data science|award/, id: 'contests', label: 'Contests & training', pulse: '#contests .panel' },
  { re: /exper|teach|\bta\b|assistant|job|psut|educat|degree|univers|class|study/, id: 'experience', label: 'Experience', pulse: '.rowx' },
  { re: /proj|work|built|build|made|hospital|mind|potato|maze|sky|weather|app|demo/, id: 'work', label: 'Projects', pulse: '.tile' },
  { re: /about|who|photo|bio|summary|yousef/, id: 'about', label: 'About', pulse: '.about__photo, .about__copy' },
];
const hint = $('#askHint');
function go(query, forcedId) {
  const q = query.toLowerCase().trim();
  const r = forcedId ? routes.find((x) => x.id === forcedId || (forcedId === 'skills' && x.scrollTo)) : routes.find((x) => x.re.test(q));
  if (!r) { hint.textContent = 'No match. Try: projects, experience, contests, skills, contact or CV.'; animate('.ask', { x: [0, -8, 8, -4, 0], duration: 400, ease: 'outQuad' }); return; }
  if (r.action === 'cv') { hint.textContent = 'Downloading the CV…'; $('.chip--solid').click(); return; }
  hint.textContent = `Taking you to ${r.label}…`;
  const target = $(r.scrollTo || `#${r.id}`);
  target.scrollIntoView({ behavior: 'smooth', block: r.scrollTo ? 'center' : 'start' });
  setTimeout(() => {
    const els = $$(r.pulse);
    animate(els, { scale: [1, 1.018, 1], duration: 800, ease: 'outExpo', delay: stagger(90) });
    els.forEach((el) => el.classList.add('pulse-target'));
    setTimeout(() => els.forEach((el) => el.classList.remove('pulse-target')), 1400);
    hint.textContent = 'A shortcut box: type a keyword and it jumps to the right section.';
  }, 750);
}
$('#ask').addEventListener('submit', (e) => { e.preventDefault(); go(input.value); });
$$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); go('', a.dataset.go); }));

/* ───────── 4. Scroll reveals (IntersectionObserver triggers, anime.js tweens) ───────── */
const revealSel = '.head, .tile, .rowx, .panel, .about__photo, .about__copy, .contact > *';
const reveal = $$(revealSel);
const eerParts = createDrawable('.eer .ent, .eer .dia');
set(eerParts, { draw: '0 0' });
set('.link-lines', { opacity: 0 });
const io = new IntersectionObserver((entries) => {
  let i = 0;
  entries.filter((e) => e.isIntersecting).forEach(({ target }) => {
    io.unobserve(target);
    animate(target, { opacity: [0, 1], y: [44, 0], duration: 1000, ease: 'outExpo', delay: i++ * 90 });
    const tags = $$('.tags li', target);
    if (tags.length) animate(tags, { opacity: [0, 1], scale: [0.7, 1], duration: 600, ease: 'outBack', delay: stagger(45, { start: 350 }) });
    if (target.classList.contains('tile--hospital')) {
      animate(eerParts, { draw: ['0 0', '0 1'], duration: 1400, ease: 'inOutQuad', delay: stagger(140, { start: 300 }) });
      animate('.link-lines', { opacity: [0, 0.55], duration: 900, delay: 1500, ease: 'linear' });
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
reveal.forEach((el) => io.observe(el));

/* ───────── 5. Scroll-synced: statement words + experience rail ───────── */
const stmt = splitText('#statement', { words: true });
animate(stmt.words, {
  opacity: [0.16, 1], ease: 'linear', delay: stagger(60),
  autoplay: onScroll({ target: '#statement', enter: 'bottom-=10% top', leave: 'top+=45% bottom', sync: true }),
});
animate(createDrawable('.rail path'), {
  draw: ['0 0', '0 1'], ease: 'linear',
  autoplay: onScroll({ target: '.rows-wrap', enter: 'center top', leave: 'center bottom', sync: true }),
});

/* ───────── 6. Contact heading ───────── */
const ch = splitText('#contact-h', { words: true });
set(ch.words, { opacity: 0 });
new IntersectionObserver(([e], o) => {
  if (!e.isIntersecting) return; o.disconnect();
  animate(ch.words, { opacity: [0, 1], y: ['60%', '0%'], duration: 900, ease: 'outExpo', delay: stagger(110, { start: 150 }) });
}, { threshold: 0.4 }).observe($('#contact-h'));

/* ───────── 7. Nav: sliding indicator + scroll spy ───────── */
const pill = $('.nav__pill'), ind = $('.nav__ind');
const links = $$('.nav__pill a[href^="#"]').filter((a) => !a.classList.contains('nav__logo'));
let active = null, indShown = false;
function moveTo(a) {
  if (!a) { animate(ind, { opacity: 0, duration: 250 }); indShown = false; return; }
  const props = { x: a.offsetLeft, width: a.offsetWidth, opacity: 1, duration: indShown ? 550 : 0, ease: createSpring({ stiffness: 220, damping: 22 }) };
  indShown = true;
  animate(ind, props);
}
const spy = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    const a = links.find((l) => l.getAttribute('href') === `#${e.target.id}`);
    if (a && a !== active) { active?.classList.remove('is-active'); active = a; a.classList.add('is-active'); moveTo(a); }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main > section[id]').forEach((s) => spy.observe(s));
addEventListener('scroll', () => { if (scrollY < innerHeight * 0.4 && active) { active.classList.remove('is-active'); active = null; moveTo(null); } }, { passive: true });
if (canHover) {
  links.forEach((a) => a.addEventListener('pointerenter', () => moveTo(a)));
  pill.addEventListener('pointerleave', () => moveTo(active));
}

/* ───────── 8. Magnetic buttons (spring back) ───────── */
if (canHover) {
  $$('.chip--solid, .nav__cv, .ask__go').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      animate(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.28, y: (e.clientY - (r.top + r.height / 2)) * 0.4, duration: 250, ease: 'out(3)' });
    });
    el.addEventListener('pointerleave', () => animate(el, { x: 0, y: 0, ease: createSpring({ stiffness: 260, damping: 11 }) }));
  });
}

/* ───────── 9. SkyCast: temperature counts between units ───────── */
const temp = $('#temp'), btn = $('#unitBtn');
const tv = { v: 22 };
btn.addEventListener('click', () => {
  const toF = btn.getAttribute('aria-pressed') === 'true';
  const from = tv.v, to = toF ? 71.6 : 22;
  animate(tv, { v: to, duration: 800, ease: 'outExpo', onUpdate: () => { temp.textContent = toF ? tv.v.toFixed(1) : String(Math.round(tv.v)); } });
});

// Everything above ran: make sure the fail-safe never reverts the visible state.
root.classList.add('anim-ready');
