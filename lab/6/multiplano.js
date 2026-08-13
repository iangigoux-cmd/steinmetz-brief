// Capa 2 — profundidad sin WebGL: cada capa se desplaza distinto según el
// puntero. Y el trazo de la X, que se dibuja al entrar en viewport.
export function iniciar() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  // --- multiplano ---
  const grupos = [...document.querySelectorAll('[data-multiplano]')];
  const estado = new WeakMap();

  for (const g of grupos) {
    g.style.perspective = '900px';
    g.style.transformStyle = 'preserve-3d';
    estado.set(g, { x: 0, y: 0, ox: 0, oy: 0 });
    for (const capa of g.querySelectorAll('.capa')) {
      const z = Number(capa.dataset.z || 0);
      capa.style.transform = `translateZ(${z * 14}px)`;
      capa.style.willChange = 'transform';
    }
  }

  addEventListener('pointermove', (e) => {
    for (const g of grupos) {
      const r = g.getBoundingClientRect();
      const s = estado.get(g);
      s.ox = ((e.clientX - r.left) / r.width - 0.5) * 2;
      s.oy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
  }, { passive: true });

  function bucle() {
    requestAnimationFrame(bucle);
    if (document.hidden) return;
    for (const g of grupos) {
      const s = estado.get(g);
      s.x += (s.ox - s.x) * 0.055;
      s.y += (s.oy - s.y) * 0.055;
      for (const capa of g.querySelectorAll('.capa')) {
        const z = Number(capa.dataset.z || 0);
        // 2–6 px de recorrido, como fija la investigación. Nunca más.
        const amp = 2 + z * 2;
        capa.style.transform =
          `translateZ(${z * 14}px) translate3d(${(s.x * amp).toFixed(2)}px, ${(s.y * amp).toFixed(2)}px, 0)`;
      }
    }
  }
  requestAnimationFrame(bucle);

  // --- trazo de la X, al entrar en viewport ---
  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const paths = e.target.querySelectorAll('path');
      paths.forEach((p, i) => {
        p.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.22,.61,.36,1)';
        p.style.transitionDelay = `${i * 220}ms`;
        p.style.strokeDashoffset = '0';
      });
      obs.unobserve(e.target);
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-trazo]').forEach((s) => obs.observe(s));

  return true;
}
