// Capa 3 — el sitio se presenta solo: timeline de carga, scroll con peso,
// y las cifras que suben. Nada acá lee la posición del scroll.
//
// Nota: el plan preveía GSAP SplitText para partir el titular en líneas. No
// hace falta: el HTML ya trae cada línea en su propio <span>, así que se
// envuelven en una máscara y se animan directo. Un plugin menos que cargar y
// un modo de fallar menos.
import Lenis from 'lenis';
import gsap from 'gsap';

export function iniciar() {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- scroll con peso físico. No secuestra: sólo suaviza la rueda. ---
  if (!reducido) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // --- timeline de carga del hero: por tiempo, no por scroll ---
  if (!reducido) {
    const lineas = [...document.querySelectorAll('.hero__titulo span')];
    // Cada línea entra desde abajo detrás de una máscara.
    const interiores = lineas.map((linea) => {
      const mascara = document.createElement('span');
      mascara.style.cssText = 'display:block;overflow:hidden';
      linea.parentNode.insertBefore(mascara, linea);
      mascara.appendChild(linea);
      return linea;
    });

    const tl = gsap.timeline({ delay: 0.25 });
    tl.from(interiores, {
      yPercent: 108, opacity: 0, duration: 0.95,
      ease: 'power3.out', stagger: 0.11,
    });
    tl.from('.hero__acciones', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
    tl.from('.marca > *', { opacity: 0, duration: 0.5, stagger: 0.08 }, 0.1);
  }

  // --- contadores: se disparan al entrar en viewport, una sola vez ---
  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const hasta = Number(el.dataset.hasta || 0);
      const prefijo = el.dataset.prefijo || '';
      obs.unobserve(el);
      if (reducido) { el.textContent = prefijo + hasta.toLocaleString('es-CL'); continue; }
      const dato = { v: 0 };
      gsap.to(dato, {
        v: hasta, duration: 1.6, ease: 'power2.out',
        onUpdate: () => {
          el.textContent = prefijo + Math.round(dato.v).toLocaleString('es-CL');
        },
      });
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-contador]').forEach((c) => obs.observe(c));

  return true;
}
