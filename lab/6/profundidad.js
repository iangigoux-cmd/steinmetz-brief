// Capa 1 — la foto gana volumen: los UV se desplazan según el mapa de
// profundidad siguiendo el puntero. Un solo contexto WebGL para todas las
// figuras: el renderer vive fuera del DOM y su resultado se copia a un canvas
// 2D por figura. Movido por puntero, jamás por scroll.
import * as THREE from 'three';

const VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
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

export function iniciar() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  const figuras = [...document.querySelectorAll('[data-foto-profundidad]')];
  if (!figuras.length) return 0;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  } catch (e) { return 0; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const lienzo = renderer.domElement;      // nunca entra al DOM

  const escena = new THREE.Scene();
  const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const malla = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial());
  escena.add(malla);

  const cargador = new THREE.TextureLoader();
  const items = [];
  let convertidas = 0;

  for (const fig of figuras) {
    const src = fig.dataset.src, depth = fig.dataset.depth;
    if (!src || !depth) continue;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: {
        uFoto: { value: null }, uProf: { value: null },
        uPuntero: { value: new THREE.Vector2(0, 0) },
        // Cada foto declara cuánto aguanta: un mapa de plano en fuga necesita
        // menos recorrido que uno que separa objetos de verdad.
        uFuerza: { value: Number(fig.dataset.fuerza || 0.035) },
      },
    });

    let listas = 0;
    const alListo = () => {
      if (++listas < 2) return;
      const img = fig.querySelector('img');
      const copia = document.createElement('canvas');
      copia.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      fig.style.position = 'relative';
      fig.appendChild(copia);
      if (img) img.style.visibility = 'hidden';   // se oculta, NO se elimina
      items.push({ fig, material, copia, ctx: copia.getContext('2d'),
                   objetivo: { x: 0, y: 0 } });
      convertidas++;
      // Las texturas cargan async, así que el retorno de iniciar() no puede
      // contarlas. El número vivo se publica acá.
      window.__fotosVolumen = convertidas;
    };
    cargador.load(src,   (t) => { material.uniforms.uFoto.value = t; alListo(); },
                  undefined, () => {});
    cargador.load(depth, (t) => { material.uniforms.uProf.value = t; alListo(); },
                  undefined, () => {});
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
      const u = it.material.uniforms.uPuntero.value;
      u.x += (it.objetivo.x - u.x) * 0.06;
      u.y += (it.objetivo.y - u.y) * 0.06;

      const r = it.fig.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const dpr = Math.min(devicePixelRatio, 2);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (lienzo.width !== w || lienzo.height !== h) renderer.setSize(r.width, r.height, false);
      if (it.copia.width !== w || it.copia.height !== h) { it.copia.width = w; it.copia.height = h; }

      malla.material = it.material;
      renderer.render(escena, camara);
      it.ctx.drawImage(lienzo, 0, 0, it.copia.width, it.copia.height);
    }
  }
  requestAnimationFrame(bucle);
  // Devuelve cuántas figuras quedaron programadas. Las que efectivamente
  // llegaron a convertirse se leen en window.__fotosVolumen.
  return items.length || figuras.filter((f) => f.dataset.src && f.dataset.depth).length;
}
