(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================================
  // SCROLL PROGRESS BAR
  // ==========================================================================
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFrac   = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${scrollFrac})`;
  }, { passive: true });

  // ==========================================================================
  // NAV TOGGLE (mobile)
  // ==========================================================================
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    navLinks.forEach(link => link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }));
  }

  // ==========================================================================
  // BACK TO TOP
  // ==========================================================================
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ==========================================================================
  // HERO TYPEWRITER
  // ==========================================================================
  (function () {
    const el = document.getElementById('hero-subtitle-typed');
    if (!el) return;
    const phrases = [
      'Software Engineering Student',
      'Full-Stack Developer',
      'Competitive Programmer',
      'Teaching Assistant @ PSUT',
    ];
    let pi = 0, ci = 0, deleting = false;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    el.appendChild(cursor);

    function type() {
      const phrase = phrases[pi];
      if (!deleting) {
        el.textContent = phrase.slice(0, ++ci);
        el.appendChild(cursor);
        if (ci === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
      } else {
        el.textContent = phrase.slice(0, --ci);
        el.appendChild(cursor);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 300); return; }
      }
      setTimeout(type, deleting ? 38 : 75);
    }
    setTimeout(type, 900);
  })();

  // ==========================================================================
  // THREE.JS — HERO NETWORK GRAPH
  // ==========================================================================
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    const heroScene  = new THREE.Scene();
    const heroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.z = 7.5;

    const heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const parallaxGroup = new THREE.Group();
    const graphGroup    = new THREE.Group();
    parallaxGroup.add(graphGroup);
    heroScene.add(parallaxGroup);

    // Nodes
    const nodeCount = 45;
    const nodes     = [];
    const sphereGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const cyanCol    = new THREE.Color(0x00D4FF);
    const amberCol   = new THREE.Color(0xFFB830);
    const tealCol    = new THREE.Color(0x00FFC8);

    for (let i = 0; i < nodeCount; i++) {
      const u     = Math.random();
      const v     = Math.random();
      const theta = u * 2 * Math.PI;
      const phi   = Math.acos(2 * v - 1);
      const r     = Math.cbrt(Math.random()) * 4.5;
      const x     = r * Math.sin(phi) * Math.cos(theta);
      const y     = r * Math.sin(phi) * Math.sin(theta);
      const z     = r * Math.cos(phi);

      const isAmber = (i % 9 === 0);
      const isTeal  = (i % 6 === 0 && !isAmber);
      const col     = isAmber ? amberCol : (isTeal ? tealCol : cyanCol);

      const mesh = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: col }));
      mesh.position.set(x, y, z);
      graphGroup.add(mesh);

      nodes.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Edges
    const maxLines    = 300;
    const lineGeom    = new THREE.BufferGeometry();
    const linePosArr  = new Float32Array(maxLines * 2 * 3);
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePosArr, 3));
    lineGeom.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const lineMat     = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.28 });
    graphGroup.add(new THREE.LineSegments(lineGeom, lineMat));

    // Mouse parallax
    let targetTiltX = 0, targetTiltY = 0;
    window.addEventListener('mousemove', e => {
      targetTiltY = ((e.clientX / window.innerWidth)  * 2 - 1) * 0.15;
      targetTiltX = ((e.clientY / window.innerHeight) * 2 - 1) * 0.15;
    }, { passive: true });

    // ==========================================================================
    // THREE.JS — CONTACT GLOBE
    // ==========================================================================
    const contactCanvas = document.getElementById('contact-canvas');
    let contactScene, contactCamera, contactRenderer, globeMesh;

    if (contactCanvas) {
      contactScene  = new THREE.Scene();
      const parent  = contactCanvas.parentElement;
      const initW   = parent.clientWidth  || window.innerWidth;
      const initH   = parent.clientHeight || 500;

      contactCamera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 100);
      contactCamera.position.z = 5.5;

      contactRenderer = new THREE.WebGLRenderer({ canvas: contactCanvas, antialias: true, alpha: true });
      contactRenderer.setSize(initW, initH);
      contactRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      globeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x00D4FF, wireframe: true, transparent: true, opacity: 0.12 })
      );
      contactScene.add(globeMesh);

      new ResizeObserver(entries => {
        for (const e of entries) {
          contactCamera.aspect = e.contentRect.width / (e.contentRect.height || 500);
          contactCamera.updateProjectionMatrix();
          contactRenderer.setSize(e.contentRect.width, e.contentRect.height || 500);
        }
      }).observe(contactCanvas.parentElement);
    }

    // Resize
    new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width, h = e.contentRect.height;
        heroCamera.aspect = w / h;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(w, h);
      }
    }).observe(heroCanvas.parentElement);

    // Render loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Move nodes
        nodes.forEach(node => {
          node.mesh.position.add(node.velocity);
          if (node.mesh.position.length() > 4.5) {
            const n = node.mesh.position.clone().normalize();
            node.velocity.reflect(n);
            node.mesh.position.copy(n.multiplyScalar(4.49));
          }
          node.mesh.scale.setScalar(1 + 0.3 * Math.sin(t * 2.5 + node.phase));
        });

        // Update lines
        const positions = lineGeom.attributes.position.array;
        let lineIdx = 0, activeLines = 0;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (activeLines >= maxLines) break;
            const p1 = nodes[i].mesh.position, p2 = nodes[j].mesh.position;
            if (p1.distanceTo(p2) < 2.6) {
              positions[lineIdx++] = p1.x; positions[lineIdx++] = p1.y; positions[lineIdx++] = p1.z;
              positions[lineIdx++] = p2.x; positions[lineIdx++] = p2.y; positions[lineIdx++] = p2.z;
              activeLines++;
            }
          }
        }
        for (let k = lineIdx; k < maxLines * 6; k++) positions[k] = 0;
        lineGeom.setDrawRange(0, activeLines * 2);
        lineGeom.attributes.position.needsUpdate = true;

        graphGroup.rotation.y    += 0.0005;
        parallaxGroup.rotation.x += (targetTiltX - parallaxGroup.rotation.x) * 0.05;
        parallaxGroup.rotation.y += (targetTiltY - parallaxGroup.rotation.y) * 0.05;
      }

      heroRenderer.render(heroScene, heroCamera);

      if (contactScene && contactCamera && contactRenderer) {
        if (!prefersReducedMotion && globeMesh) {
          globeMesh.rotation.y += 0.0008;
          globeMesh.rotation.x += 0.0002;
        }
        contactRenderer.render(contactScene, contactCamera);
      }
    }
    animate();
  }

  // ==========================================================================
  // SCROLLSPY
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const scrollspyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -55% 0px' });
  sections.forEach(s => scrollspyObserver.observe(s));

  // ==========================================================================
  // TIMELINE ENTRANCE
  // ==========================================================================
  const timelineItems = document.querySelectorAll('.timeline-item');
  const tlObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        tlObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  timelineItems.forEach(item => tlObserver.observe(item));

  // ==========================================================================
  // PROJECT CARDS ENTRANCE
  // ==========================================================================
  const projCards = document.querySelectorAll('.proj-card');
  const projObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
          projObserver.unobserve(entry.target);
        }, i * 100);
      }
    });
  }, { threshold: 0.1 });
  projCards.forEach(card => projObserver.observe(card));

  // ==========================================================================
  // CERT CARDS ENTRANCE
  // ==========================================================================
  const certCards = document.querySelectorAll('.cert-card');
  const certObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
          certObserver.unobserve(entry.target);
        }, i * 120);
      }
    });
  }, { threshold: 0.1 });
  certCards.forEach(card => certObserver.observe(card));

  // ==========================================================================
  // STATS COUNT-UP
  // ==========================================================================
  const statNums   = document.querySelectorAll('.stat-num');
  const statsRow   = document.getElementById('stats-row');
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNums.forEach(el => {
          const target   = parseInt(el.dataset.target, 10);
          const suffix   = el.dataset.suffix || '';
          const duration = 1400;
          let startTime  = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            const prog = Math.min((ts - startTime) / duration, 1);
            el.textContent = Math.floor(prog * target) + suffix;
            if (prog < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          }
          requestAnimationFrame(step);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  if (statsRow) statsObserver.observe(statsRow);

})();
