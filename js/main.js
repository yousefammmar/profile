import { initMaze } from './maze.js';

// Motion layer (anime.js). If the CDN is unreachable the page simply stays static.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  import('./motion.js').catch(() => document.documentElement.classList.remove('anim'));
}

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ───────── Spotlight follows the cursor inside tiles ─────────
document.querySelectorAll('.tile').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ───────── SkyCast tile: °C / °F toggle ─────────
const temp = document.getElementById('temp');
const unit = document.getElementById('unit');
const btn = document.getElementById('unitBtn');
let celsius = true;
btn.addEventListener('click', () => {
  celsius = !celsius;
  temp.textContent = celsius ? '22' : '71.6';
  unit.textContent = celsius ? '°C' : '°F';
  btn.textContent = celsius ? 'Switch to °F' : 'Switch to °C';
  btn.setAttribute('aria-pressed', String(!celsius));
});

// ───────── Potato Runner tile: live maze ─────────
initMaze(document.getElementById('maze'), { reduceMotion });

// ───────── Hero: one iridescent chrome knot ─────────
const canvas = document.getElementById('knot');
function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
if (webglOk() && !navigator.connection?.saveData) {
  initKnot().catch(() => canvas.remove());
} else {
  canvas.remove();
}

async function initKnot() {
  const THREE = await import('three');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // A tiny studio of coloured light strips gives the chrome something to reflect.
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x05050a);
  const strip = (color, intensity, w, h, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); env.add(m);
  };
  strip(0x62f0d4, 9, 14, 2, [-8, 4, 3], [0, Math.PI / 2.6, 0.3]);
  strip(0xa066ff, 8, 14, 2, [8, -3, 4], [0, -Math.PI / 2.6, -0.2]);
  strip(0xffffff, 6, 18, 1.2, [0, 9, 0], [Math.PI / 2, 0, 0]);
  strip(0x4aa8ff, 4, 10, 2, [0, -8, -4], [-Math.PI / 2, 0, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const scene = new THREE.Scene();
  scene.environment = pmrem.fromScene(env, 0.02).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.35, 0.42, 280, 36, 2, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0x14141c, metalness: 1, roughness: 0.16,
      iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 620],
      clearcoat: 1, clearcoatRoughness: 0.08,
    })
  );
  scene.add(knot);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  let w = 1, h = 1, t = 0, scrollP = 0, running = false, raf = 0, last = 0;

  function layout() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const narrow = w < 720;
    const hh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    knot.userData.base = narrow ? { x: 0, y: 0, s: 0.62 } : w < 1250 ? { x: hh * camera.aspect * 0.31, y: 0.05, s: 0.6 } : { x: hh * camera.aspect * 0.25, y: 0.05, s: 0.78 };
    if (!running) render(0);
  }

  function render(dt) {
    t += dt;
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-3 * dt));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-3 * dt));
    scrollP = Math.min(1, scrollY / Math.max(1, innerHeight));
    const b = knot.userData.base || { x: 0, y: 0, s: 1 };
    knot.position.set(b.x + pointer.x * 0.15, b.y - pointer.y * 0.1 + scrollP * 0.8, 0);
    knot.scale.setScalar(b.s * (1 - scrollP * 0.25));
    knot.rotation.set(0.35 + pointer.y * 0.25 + scrollP * 0.6, t * 0.18 + pointer.x * 0.4 + scrollP * 1.2, 0.1);
    renderer.render(scene, camera);
  }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts; render(dt); raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!running && !reduceMotion) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new ResizeObserver(layout).observe(canvas);
  layout();
  if (reduceMotion) { t = 4; render(0); return; }

  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  function sync() { (inView && !document.hidden) ? start() : stop(); }
  sync();
}
