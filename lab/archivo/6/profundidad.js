// Capa 1 — la foto gana volumen: los UV se desplazan según el mapa de
// profundidad siguiendo el puntero. Un solo contexto WebGL para todas las
// figuras: el renderer vive fuera del DOM y su resultado se copia a un canvas
// 2D por figura. Movido por puntero, jamás por scroll.
//
// OGL en lugar de three.js por el presupuesto de 250 KB — ver escena.js.
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl';

const VERT = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform sampler2D uFoto, uProf;
  uniform vec2 uPuntero;
  uniform float uFuerza;
  varying vec2 vUv;
  void main(){
    float d = texture2D(uProf, vUv).r;      // 1 = cerca, 0 = lejos
    // Lo cercano se desplaza más: es lo que produce el paralaje.
    vec2 off = uPuntero * uFuerza * (d - 0.5);
    gl_FragColor = texture2D(uFoto, vUv + off);
  }
`;

function cargarTextura(gl, url) {
  return new Promise((resolve, reject) => {
    const tex = new Texture(gl, { generateMipmaps: false });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { tex.image = img; resolve(tex); };
    img.onerror = reject;
    img.src = url;
  });
}

export function iniciar() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  const figuras = [...document.querySelectorAll('[data-foto-profundidad]')];
  if (!figuras.length) return 0;

  const dpr = Math.min(devicePixelRatio, 2);
  let renderer;
  try {
    renderer = new Renderer({ alpha: true, antialias: false, dpr });
  } catch (e) { return 0; }
  const gl = renderer.gl;
  const lienzo = gl.canvas;                // nunca entra al DOM

  // Triángulo que cubre la pantalla: más barato que un quad de dos triángulos.
  const geo = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    uv:       { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });

  const items = [];
  let programadas = 0;

  for (const fig of figuras) {
    const src = fig.dataset.src, depth = fig.dataset.depth;
    if (!src || !depth) continue;
    programadas++;

    const programa = new Program(gl, {
      vertex: VERT, fragment: FRAG, cullFace: null, depthTest: false,
      uniforms: {
        uFoto: { value: null }, uProf: { value: null },
        uPuntero: { value: [0, 0] },
        // Cada foto declara cuánto aguanta: un mapa de plano en fuga necesita
        // menos recorrido que uno que separa objetos de verdad.
        uFuerza: { value: Number(fig.dataset.fuerza || 0.035) },
      },
    });
    const malla = new Mesh(gl, { geometry: geo, program: programa });

    Promise.all([cargarTextura(gl, src), cargarTextura(gl, depth)])
      .then(([foto, prof]) => {
        programa.uniforms.uFoto.value = foto;
        programa.uniforms.uProf.value = prof;
        const img = fig.querySelector('img');
        const copia = document.createElement('canvas');
        copia.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
        fig.style.position = 'relative';
        fig.appendChild(copia);
        if (img) img.style.visibility = 'hidden';   // se oculta, NO se elimina
        items.push({ fig, malla, programa, copia, ctx: copia.getContext('2d'),
                     objetivo: { x: 0, y: 0 } });
        // Las texturas cargan async, así que el retorno de iniciar() no puede
        // contarlas. El número vivo se publica acá.
        window.__fotosVolumen = items.length;
      })
      .catch(() => { /* sin mapa: la foto queda plana y visible */ });
  }

  addEventListener('pointermove', (e) => {
    for (const it of items) {
      const r = it.fig.getBoundingClientRect();
      it.objetivo.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      it.objetivo.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
  }, { passive: true });

  const visible = new Set();
  const obs = new IntersectionObserver((es) => {
    for (const e of es) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
  }, { rootMargin: '100px' });
  figuras.forEach((f) => obs.observe(f));

  function bucle() {
    requestAnimationFrame(bucle);
    if (document.hidden) return;
    for (const it of items) {
      if (!visible.has(it.fig)) continue;
      const u = it.programa.uniforms.uPuntero.value;
      u[0] += (it.objetivo.x - u[0]) * 0.06;
      u[1] += (it.objetivo.y - u[1]) * 0.06;

      const r = it.fig.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (lienzo.width !== w || lienzo.height !== h) renderer.setSize(r.width, r.height);
      if (it.copia.width !== w || it.copia.height !== h) { it.copia.width = w; it.copia.height = h; }

      renderer.render({ scene: it.malla });
      it.ctx.drawImage(lienzo, 0, 0, it.copia.width, it.copia.height);
    }
  }
  requestAnimationFrame(bucle);
  // Devuelve cuántas figuras quedaron programadas. Las que efectivamente
  // llegaron a convertirse se leen en window.__fotosVolumen.
  return programadas;
}
