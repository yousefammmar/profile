/* Recursive-backtracking maze carve + BFS solve, drawn on a 2D canvas.
   A web re-creation of the algorithm behind Potato Runner (Python/Pygame). */
export function initMaze(canvas, { reduceMotion = false } = {}) {
  const ctx = canvas.getContext('2d');
  const COLS = 16, ROWS = 8;
  const cs = Math.min(canvas.width / COLS, canvas.height / ROWS);
  const ox = (canvas.width - cs * COLS) / 2, oy = (canvas.height - cs * ROWS) / 2;
  const css = getComputedStyle(document.documentElement);
  const ACCENT = css.getPropertyValue('--accent').trim() || '#62f0d4';
  const WALL = 'rgba(255,255,255,0.55)';
  const CARVED = 'rgba(255,255,255,0.05)';

  let cells, stack, phase, path, pi, timer = 0, running = false, raf = 0, last = 0;

  function reset() {
    cells = Array.from({ length: ROWS * COLS }, () => ({ n: true, e: true, s: true, w: true, seen: false }));
    const start = 0;
    cells[start].seen = true;
    stack = [start];
    phase = 'carve';
    path = []; pi = 0; timer = 0;
  }
  const idx = (x, y) => y * COLS + x;
  const neighbours = (i) => {
    const x = i % COLS, y = (i / COLS) | 0, out = [];
    if (y > 0) out.push([idx(x, y - 1), 'n', 's']);
    if (x < COLS - 1) out.push([idx(x + 1, y), 'e', 'w']);
    if (y < ROWS - 1) out.push([idx(x, y + 1), 's', 'n']);
    if (x > 0) out.push([idx(x - 1, y), 'w', 'e']);
    return out;
  };

  function stepCarve() {
    if (!stack.length) { solve(); return; }
    const cur = stack[stack.length - 1];
    const options = neighbours(cur).filter(([i]) => !cells[i].seen);
    if (!options.length) { stack.pop(); return; }
    const [next, a, b] = options[(Math.random() * options.length) | 0];
    cells[cur][a] = false; cells[next][b] = false;
    cells[next].seen = true;
    stack.push(next);
  }

  function solve() {
    const goal = ROWS * COLS - 1, prev = new Map([[0, -1]]), q = [0];
    while (q.length) {
      const c = q.shift();
      if (c === goal) break;
      for (const [n, a] of neighbours(c)) {
        if (!cells[c][a] && !prev.has(n)) { prev.set(n, c); q.push(n); }
      }
    }
    path = [];
    for (let c = goal; c !== -1; c = prev.get(c)) path.push(c);
    path.reverse();
    pi = 0; phase = 'solve';
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    for (let i = 0; i < cells.length; i++) {
      const x = ox + (i % COLS) * cs, y = oy + ((i / COLS) | 0) * cs;
      if (cells[i].seen) { ctx.fillStyle = CARVED; ctx.fillRect(x, y, cs, cs); }
    }
    ctx.strokeStyle = WALL; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < cells.length; i++) {
      const x = ox + (i % COLS) * cs, y = oy + ((i / COLS) | 0) * cs, c = cells[i];
      if (c.n) { ctx.moveTo(x, y); ctx.lineTo(x + cs, y); }
      if (c.w) { ctx.moveTo(x, y); ctx.lineTo(x, y + cs); }
      if (i % COLS === COLS - 1 && c.e) { ctx.moveTo(x + cs, y); ctx.lineTo(x + cs, y + cs); }
      if (((i / COLS) | 0) === ROWS - 1 && c.s) { ctx.moveTo(x, y + cs); ctx.lineTo(x + cs, y + cs); }
    }
    ctx.stroke();
    if (phase === 'carve' && stack.length) {
      const h = stack[stack.length - 1];
      ctx.fillStyle = ACCENT;
      ctx.fillRect(ox + (h % COLS) * cs + 3, oy + ((h / COLS) | 0) * cs + 3, cs - 6, cs - 6);
    }
    if (phase === 'solve' && path.length) {
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 3; ctx.beginPath();
      for (let k = 0; k <= Math.min(pi, path.length - 1); k++) {
        const c = path[k], x = ox + (c % COLS) * cs + cs / 2, y = oy + ((c / COLS) | 0) * cs + cs / 2;
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      const c = path[Math.min(pi, path.length - 1)];
      ctx.fillStyle = ACCENT; ctx.beginPath();
      ctx.arc(ox + (c % COLS) * cs + cs / 2, oy + ((c / COLS) | 0) * cs + cs / 2, cs * 0.28, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop(ts) {
    const dt = ts - last; last = ts;
    timer += dt;
    if (phase === 'carve') { for (let k = 0; k < 2; k++) stepCarve(); }
    else if (phase === 'solve') { if (timer > 40) { timer = 0; pi++; if (pi >= path.length + 25) reset(); } }
    draw();
    raf = requestAnimationFrame(loop);
  }

  reset();
  if (reduceMotion) { while (phase === 'carve') stepCarve(); pi = path.length; draw(); return; }

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(canvas);
}
