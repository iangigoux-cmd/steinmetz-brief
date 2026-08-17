// Capa 0 — el polvo en el haz de luz que sedimenta en la X.
// Sin color: sólo blanco modulado por una key lateral dura con falloff a negro.
//
// Se usa OGL y no three.js: de three sólo necesitábamos la plomería de buffers
// y uniforms —los dos shaders están escritos a mano— y costaba 385 KB gzip
// contra los 38 de OGL. El presupuesto de la spec es 250 KB para todo el sitio.
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

const CANT = { alta: 60000, media: 24000, baja: 9000 };

function nivel() {
  const movil = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (movil || cores <= 4) return 'baja';
  return cores >= 8 ? 'alta' : 'media';
}

// Puntos sobre las dos diagonales de la X, con dispersión de tiza.
function puntoEnEquis(rnd) {
  const brazo = rnd() < 0.5 ? 1 : -1;
  const t = rnd() * 2 - 1;                 // recorrido del brazo, -1..1
  const grosor = (rnd() - 0.5) * 0.16;     // ancho del trazo
  const polvo = (rnd() - 0.5) * 0.05;      // borde polvoriento
  return [t * 1.15 + grosor, t * brazo * 1.15 + polvo, (rnd() - 0.5) * 0.12];
}

const VERT = `
  attribute vec3 position;
  attribute vec3 aDestino;
  attribute float aEscala;
  uniform mat4 modelViewMatrix, projectionMatrix;
  uniform float uTiempo, uAsentar, uDPR;
  uniform vec2 uPuntero;
  varying float vLuz;

  // Campo de flujo trigonométrico: deriva de polvo, barato y sin divergencia visible.
  vec3 flujo(vec3 p, float t){
    return vec3(
      sin(p.y*1.3 + t*0.35) + sin(p.z*0.7 - t*0.21),
      sin(p.z*1.1 - t*0.29) + sin(p.x*0.9 + t*0.17),
      sin(p.x*1.7 + t*0.23) + sin(p.y*0.6 - t*0.31)
    );
  }

  void main(){
    vec3 deriva = flujo(position * 0.6, uTiempo) * 0.16;
    vec3 suelto = position + deriva;
    vec3 puesto = aDestino + deriva * 0.12;
    float k = smoothstep(0.0, 1.0, uAsentar);
    vec3 p = mix(suelto, puesto, k);

    // El puntero inclina la nube; nunca el scroll.
    p.x += uPuntero.x * 0.22;
    p.y += uPuntero.y * 0.14;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aEscala * uDPR * (2.2 / -mv.z);

    // Key lateral dura desde la derecha, falloff a negro. Sin color.
    // Va de ese lado a propósito: deja el polvo apagado detrás del texto,
    // que vive a la izquierda.
    float key = smoothstep(-1.8, 0.9, p.x);
    float prof = smoothstep(-2.0, 1.5, p.z);
    vLuz = (0.10 + key * 0.90) * (0.45 + prof * 0.55);
  }
`;

const FRAG = `
  precision highp float;
  varying float vLuz;
  void main(){
    // Partícula redonda con borde suave — grano de tiza, no cuadrado.
    vec2 d = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.12, length(d));
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(1.0), a * vLuz * 0.55);
  }
`;

export function iniciar() {
  const canvas = document.getElementById('escena');
  if (!canvas) return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const dpr = Math.min(devicePixelRatio, 2);   // cap 2, nunca 3x
  let renderer;
  try {
    renderer = new Renderer({ canvas, alpha: true, antialias: false, dpr });
  } catch (e) { return false; }
  const gl = renderer.gl;

  const camara = new Camera(gl, { fov: 38, near: 0.1, far: 100 });
  camara.position.z = 4.2;
  const escena = new Transform();

  const n = CANT[nivel()];
  const semillas = new Float32Array(n * 3);
  const destinos = new Float32Array(n * 3);
  const escalas = new Float32Array(n);
  let s = 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;  // determinista

  for (let i = 0; i < n; i++) {
    semillas[i * 3]     = (rnd() - 0.5) * 6;
    semillas[i * 3 + 1] = (rnd() - 0.5) * 4;
    semillas[i * 3 + 2] = (rnd() - 0.5) * 3;
    const d = puntoEnEquis(rnd);
    destinos[i * 3] = d[0]; destinos[i * 3 + 1] = d[1]; destinos[i * 3 + 2] = d[2];
    escalas[i] = 0.5 + rnd() * 1.5;
  }

  const geo = new Geometry(gl, {
    position: { size: 3, data: semillas },
    aDestino: { size: 3, data: destinos },
    aEscala:  { size: 1, data: escalas },
  });

  const programa = new Program(gl, {
    vertex: VERT, fragment: FRAG,
    transparent: true, depthWrite: false, cullFace: null,
    uniforms: {
      uTiempo:  { value: 0 },
      uAsentar: { value: 0 },      // 0 = polvo suelto, 1 = la X formada
      uPuntero: { value: [0, 0] },
      uDPR:     { value: dpr },
    },
  });
  // Aditivo: el polvo suma luz, no la tapa.
  programa.setBlendFunc(gl.SRC_ALPHA, gl.ONE);

  const puntos = new Mesh(gl, { geometry: geo, program: programa, mode: gl.POINTS });
  puntos.setParent(escena);

  // Se mide el CONTENEDOR, nunca el canvas: OGL escribe width/height inline al
  // construirse (300x150) y eso pisa el width:100% de la hoja de estilos. Medir
  // el canvas devolvería ese tamaño y se confirmaría a sí mismo, para siempre.
  function medir() {
    const host = canvas.parentElement;
    if (!host) return;
    const r = host.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    renderer.setSize(r.width, r.height);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    camara.perspective({ aspect: r.width / r.height });
  }
  medir();
  addEventListener('resize', medir);

  // Puntero con inercia.
  const objetivo = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    objetivo.x = (e.clientX / innerWidth) * 2 - 1;
    objetivo.y = -((e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });

  // Sedimentación: arranca sola a los 600 ms de cargar. No depende del scroll.
  let asentar = 0, asentando = false;
  setTimeout(() => { asentando = true; }, 600);

  // El mismo canvas sirve al hero y al cierre: se muda al que esté en viewport.
  // Nunca hay dos escenas vivas — un solo contexto WebGL, como fija la spec.
  const cierre = document.getElementById('escena-cierre');
  const anfitrion = canvas.parentElement;
  let enCierre = false;
  if (cierre) {
    cierre.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
    const seccion = cierre.closest('section');
    if (seccion) seccion.style.position = 'relative';
    new IntersectionObserver(([e]) => {
      enCierre = e.isIntersecting;
      const destino = enCierre ? cierre : anfitrion;
      if (canvas.parentElement !== destino) { destino.appendChild(canvas); medir(); }
      // En el cierre el polvo llega quieto: ya asentado y con deriva mínima.
      if (enCierre) { asentar = 1; asentando = false; }
    }, { threshold: 0.35 }).observe(cierre);
  }

  // Pausa fuera de viewport y en pestaña oculta.
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting || enCierre; })
    .observe(canvas);
  addEventListener('visibilitychange', () => { visible = !document.hidden; });

  let t0 = performance.now(), acumFPS = 60;
  function bucle(t) {
    requestAnimationFrame(bucle);
    if (!visible || document.hidden) { t0 = t; return; }
    const dt = Math.min((t - t0) / 1000, 0.05); t0 = t;
    acumFPS = acumFPS * 0.9 + (1 / Math.max(dt, 0.001)) * 0.1;
    window.__escenaFPS = acumFPS;

    if (asentando && asentar < 1) asentar = Math.min(1, asentar + dt * 0.28);
    programa.uniforms.uAsentar.value = asentar;
    programa.uniforms.uTiempo.value += dt;
    const u = programa.uniforms.uPuntero.value;
    u[0] += (objetivo.x - u[0]) * 0.045;
    u[1] += (objetivo.y - u[1]) * 0.045;

    renderer.render({ scene: escena, camera: camara });
  }
  requestAnimationFrame(bucle);
  return true;
}
