/* STEINMETZ · landing v3 «Oficio». Escenas fijas donde el scroll cruza umbrales y dispara animaciones por tiempo
   (método Priveé: nada queda a medias, con histéresis). Sólo el encuadre (columnas, pista, zoom, contador) sigue al scroll.
   Los medios vienen de medios/MANIFIESTO.json. */
(async () => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOVIL = () => innerWidth <= 820;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mapa = (v, a, b) => clamp((v - a) / (b - a));
const G = window.GEO, NS = 'http://www.w3.org/2000/svg';
const el = (tag, at = {}, padre) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); if (padre) padre.appendChild(n); return n; };

// ---------------- medios ----------------
let M = {fotos: [], videos: [], portada: null};
try { M = await (await fetch('medios/MANIFIESTO.json', {cache: 'no-store'})).json(); } catch (e) { console.warn('sin manifiesto de medios'); }
const ruta = p => !p ? '' : (/^(https?:|medios\/|\.\.?\/)/.test(p) ? p : 'medios/' + p);
const usadas = new Set();
function fotos(seccion, n, {orient} = {}) {
  let pool = M.fotos.filter(f => f.seccion === seccion && !usadas.has(f.clave));
  if (orient) pool.sort((a, b) => (b.orientacion === orient) - (a.orientacion === orient));
  if (pool.length < n) pool = pool.concat(M.fotos.filter(f => f.seccion !== seccion && !usadas.has(f.clave) && !pool.includes(f)));
  if (pool.length < n) pool = pool.concat(M.fotos.filter(f => !pool.includes(f)));
  const out = pool.slice(0, n); out.forEach(f => usadas.add(f.clave)); return out;
}
function videos(seccion, n) {
  let pool = M.videos.filter(v => v.seccion === seccion && !usadas.has(v.clave));
  if (pool.length < n) pool = pool.concat(M.videos.filter(v => v.seccion !== seccion && !usadas.has(v.clave)));
  const out = pool.slice(0, n); out.forEach(v => usadas.add(v.clave)); return out;
}
const src = (f, grande = true) => ruta(f?.archivos?.[grande && !MOVIL() ? '2400' : '1200'] || f?.archivos?.['2400'] || f?.archivos?.['1200']);
const img = (f, {grande = true, eager = false} = {}) => f ? `<img src="${src(f, grande)}" alt="${(f.descripcion || '').replace(/"/g, '&quot;')}" ${eager ? '' : 'loading="lazy"'} decoding="async">` : '';
const vsrc = v => ruta(v?.archivos?.[MOVIL() ? '720' : '1080'] || v?.archivos?.['1080'] || v?.archivos?.['720']);
// video diferido: se carga cerca de la vista y se pausa fuera
const vids = [];
function video(v, {clase = ''} = {}) {
  if (!v) return '';
  return `<video class="${clase}" muted playsinline loop preload="none" poster="${ruta(v.archivos?.poster)}" data-src="${vsrc(v)}" aria-label="${(v.descripcion || '').replace(/"/g, '&quot;')}"></video>`;
}
const ioVid = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; if (!RM) v.play().catch(() => {}); }
  else v.pause();
}), {rootMargin: '60% 0px'});
const vigilarVideos = raiz => $$('video[data-src]', raiz).forEach(v => { if (!vids.includes(v)) { vids.push(v); ioVid.observe(v); } });

// ---------------- logotipo: STEINMETZ con la Z en brasa (las letras vienen de marca-sz.js) ----------------
const S_SELLO = SZ.ancho / 2 - SZ.sello.par / 2;   // corrimiento de S y Z cuando forman el sello, centradas
function firma(n, {sello = false} = {}) {
  n.classList.add('firma'); n.setAttribute('aria-label', 'Steinmetz');
  const svg = el('svg', {viewBox: `0 0 ${SZ.ancho} ${SZ.alto}`, 'aria-hidden': 'true'}, n);
  svg.style.overflow = 'visible';
  // el sello es un trazo que parte arriba y gira a la derecha, para dibujarse
  const cx = SZ.ancho / 2, cy = SZ.alto / 2, r = SZ.sello.r;
  const circulo = sello ? el('path', {d: `M${cx},${cy - r}A${r},${r} 0 1 1 ${cx},${cy + r}A${r},${r} 0 1 1 ${cx},${cy - r}Z`, class: 'sello'}, svg) : null;
  const letras = SZ.letras.map((l, i) => {
    const g = el('g', {class: i === 0 ? 'l-s' : i === SZ.letras.length - 1 ? 'l-z' : 'l-m'}, svg);
    el('path', {d: l.d}, g); return g;
  });
  return {svg, circulo, letras};
}
$$('[data-logo]').forEach(n => firma(n));
firma($('#barraLogo'));

// ---------------- scroll con inercia ----------------
const lenis = (!RM && window.Lenis) ? new Lenis({lerp: .075, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.4}) : null;
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
  lenis ? lenis.scrollTo(t, {duration: 2.2}) : t.scrollIntoView();
}));

// ---------------- estados por umbral con histéresis ----------------
function umbral(n, cls, p, at, h = .02) {
  const on = n.classList.contains(cls);
  if (!on && p >= at + h / 2) { n.classList.add(cls); return 1; }
  if (on && p < at - h / 2) { n.classList.remove(cls); return -1; }
  return 0;
}
const progreso = sec => { const r = sec.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
const relativo = (n, padre) => { const a = n.getBoundingClientRect(), b = padre.getBoundingClientRect(); return {left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height}; };
const caja = (n, r) => { n.style.left = r.left + 'px'; n.style.top = r.top + 'px'; n.style.width = r.width + 'px'; n.style.height = r.height + 'px'; };
const escenas = [];

// ================= 00 · película e intro =================
const pelicula = $('#pelicula'), pv = $('#peliculaVideo');
const P = M.portada || {};
const pSrc = MOVIL() ? (P.archivos?.movil || P.archivos?.['720']) : (P.archivos?.['1080'] || P.archivos?.['720']);
if (pSrc) { pv.src = ruta(pSrc); if (P.archivos?.poster) pv.poster = ruta(P.archivos.poster); }
else { const v = videos('portada', 1)[0]; if (v) { pv.src = vsrc(v); pv.poster = ruta(v.archivos?.poster); } }
const segmentos = P.segmentos || [];
const pie = $('#portadaPie');
if (segmentos.length) pv.addEventListener('timeupdate', () => {
  const s = [...segmentos].reverse().find(s => pv.currentTime >= s.t); if (s && pie.dataset.t !== s.texto) { pie.dataset.t = s.texto; pie.textContent = s.texto; }
});
else if (P.descripcion) pie.textContent = P.descripcion;

function encender() {
  pelicula.classList.add('on'); pv.play().catch(() => {});
  $('#portada').classList.add('on'); $('#barra').classList.add('on');
  document.body.classList.remove('en-intro');
  // el scroll se libera cuando la portada ya terminó de entrar (el titular dura ~1,5 s)
  lenis ? setTimeout(() => lenis.start(), 2200) : 0;
}
const intro = $('#intro');
const saltar = RM || scrollY > 10 || location.hash;
if (saltar) { intro.classList.add('fuera'); $('#barraLogo').classList.add('on'); encender(); }
else {
  lenis?.stop();
  const lock = $('#introLogo');
  const {svg: svgL, circulo, letras} = firma(lock, {sello: true});
  const EASE = 'cubic-bezier(.2,.7,.1,1)', SUAVE = 'cubic-bezier(.65,0,.35,1)';
  const s = letras[0], z = letras.at(-1), medio = letras.slice(1, -1);
  const upx = SZ.alto / svgL.getBoundingClientRect().height;      // unidades del dibujo por píxel de pantalla
  const cx = SZ.ancho / 2, cy = SZ.alto / 2, r = SZ.sello.r, dZ = S_SELLO + SZ.sello.zDx;
  const sb = s.firstChild.getBBox(), zb = z.firstChild.getBBox();
  const dibujar = (n, dur, delay) => { const L = n.getTotalLength(); return n.animate([{strokeDasharray: `${L} ${L}`, strokeDashoffset: L}, {strokeDasharray: `${L} ${L}`, strokeDashoffset: 0}], {duration: dur, delay, easing: SUAVE, fill: 'both'}); };

  // 1 · guías de construcción: el círculo del sello, la línea de mayúscula y la base, el eje y la diagonal de la Z
  const guias = el('g', {class: 'guias'}, svgL); svgL.insertBefore(guias, svgL.firstChild);
  const yCap = zb.y, yBase = zb.y + zb.height, ext = SZ.ancho * .04;
  const zx0 = zb.x + dZ, zx1 = zb.x + zb.width + dZ, k = .45;   // la diagonal de la Z en el sello, prolongada
  const G = [
    el('circle', {cx, cy, r: r * 1.0}, guias), el('circle', {cx, cy, r: r * .58}, guias),
    el('line', {x1: -ext, y1: yCap, x2: SZ.ancho + ext, y2: yCap}, guias),
    el('line', {x1: SZ.ancho + ext, y1: yBase, x2: -ext, y2: yBase}, guias),
    el('line', {x1: cx, y1: cy - r * 1.18, x2: cx, y2: cy + r * 1.18}, guias),
    el('line', {x1: zx1 + (zx1 - zx0) * k, y1: yCap - zb.height * k, x2: zx0 - (zx1 - zx0) * k, y2: yBase + zb.height * k}, guias),
  ];
  G.forEach(g => { g.setAttribute('class', 'guia'); g.style.strokeWidth = upx * 1; });
  G.forEach((g, i) => dibujar(g, 1000, i * 90));

  // 2 · la S y la Z se dibujan en su lugar dentro del sello: primero el contorno, después el relleno
  s.style.transform = `translate(${S_SELLO}px, 0)`; z.style.transform = `translate(${dZ}px, 0)`;
  const trazar = (g, color, delay, dur = 1100) => {
    const p = g.firstChild;
    p.style.stroke = color; p.style.strokeWidth = upx * 1.4; p.style.strokeLinejoin = 'round';
    dibujar(p, dur, delay);
    p.animate([{fillOpacity: 0}, {fillOpacity: 1}], {duration: 500, delay: delay + dur * .8, easing: EASE, fill: 'both'});
    p.animate([{strokeOpacity: 1}, {strokeOpacity: 0}], {duration: 400, delay: delay + dur + 200, fill: 'both'});
  };
  trazar(s, '#F3EBDD', 650); trazar(z, '#FF8539', 800);
  // el sello: su borde se dibuja y se llena; la S pasa a hollín sobre la cal
  circulo.style.strokeWidth = upx * 1.4;
  dibujar(circulo, 1100, 900);
  circulo.animate([{fillOpacity: 0}, {fillOpacity: 1}], {duration: 600, delay: 1900, easing: EASE, fill: 'both'});
  s.animate([{fill: '#F3EBDD'}, {fill: '#0E0B08'}], {duration: 500, delay: 1950, easing: EASE, fill: 'both'});
  G.forEach(g => g.animate([{opacity: 1}, {opacity: .35}], {duration: 800, delay: 2200, fill: 'forwards'}));

  // 3 · el círculo se va, la S vuelve a cal y se abren las demás letras entre la S y la Z, dibujándose
  const T2 = 3200;
  circulo.animate([{transform: 'scale(1)', opacity: 1}, {transform: 'scale(.86)', opacity: 0}], {duration: 700, delay: T2, easing: SUAVE, fill: 'forwards'});
  s.animate([{fill: '#0E0B08'}, {fill: '#F3EBDD'}], {duration: 600, delay: T2 + 100, easing: SUAVE, fill: 'forwards'});
  s.animate([{transform: `translate(${S_SELLO}px, 0)`}, {transform: 'translate(0, 0)'}], {duration: 1200, delay: T2 + 350, easing: SUAVE, fill: 'forwards'});
  z.animate([{transform: `translate(${dZ}px, 0)`}, {transform: 'translate(0, 0)'}], {duration: 1200, delay: T2 + 350, easing: SUAVE, fill: 'forwards'});
  // las letras del medio solo existen en el hueco que dejan la S y la Z (se abren simétricas desde el centro)
  const clip = el('clipPath', {id: 'hueco'}, el('defs', {}, svgL));
  const rect = el('rect', {x: sb.x + sb.width, y: -SZ.alto, width: zb.x - (sb.x + sb.width), height: SZ.alto * 3}, clip);
  rect.style.transformBox = 'fill-box'; rect.style.transformOrigin = 'center';
  const grupo = el('g', {'clip-path': 'url(#hueco)'}, svgL);
  medio.forEach(g => grupo.appendChild(g));
  rect.animate([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 1200, delay: T2 + 350, easing: SUAVE, fill: 'both'});
  const mitad = (medio.length - 1) / 2;
  medio.forEach((g, i) => trazar(g, '#F3EBDD', T2 + 450 + Math.abs(i - mitad) * 110, 900));
  const svg = lock;
  let listo = false, ido = false;
  setTimeout(() => { listo = true; $('#introBaja').classList.add('on'); }, 5000);
  pv.preload = 'auto'; pv.load();
  const salir = () => {
    if (!listo || ido) return; ido = true;
    $('#portada').classList.add('on');   // el titular entra mientras vuela el logo
    const a = svg.getBoundingClientRect(), b = $('#barraLogo').getBoundingClientRect();
    intro.classList.add('sale'); pelicula.classList.add('on'); pv.play().catch(() => {});
    svg.animate([{transform: 'none'}, {transform: `translate(${b.left - a.left}px,${b.top - a.top}px) scale(${b.width / a.width})`}], {duration: 1500, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards'});
    setTimeout(() => { $('#barraLogo').classList.add('on'); intro.classList.add('fuera'); encender(); }, 1500);
  };
  addEventListener('wheel', e => { if (e.deltaY > 0) salir(); }, {passive: true});
  let ty = 0; addEventListener('touchstart', e => ty = e.touches[0].clientY, {passive: true});
  addEventListener('touchmove', e => { if (ty - e.touches[0].clientY > 12) salir(); }, {passive: true});
  addEventListener('keydown', e => { if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) salir(); });
  intro.addEventListener('click', salir);
}

// ================= 02 · problema =================
(() => {
  const sec = $('#problema'), fijo = $('.fijo', sec), cont = $('#problemaFotos');
  const MIEDOS = [
    ['Que te vendan lo mismo que a todos.', 'Ni genérico', 'A medida.'],
    ['Que tome seis meses y muera en piloto.', 'Ni piloto eterno', 'Tres semanas.'],
    ['Que tus datos terminen en un servidor ajeno.', 'Ni servidor ajeno', 'Dentro de tu red.'],
  ];
  const fs = fotos('problema', 3);
  cont.innerHTML = MIEDOS.map(([m, d, r], i) => `<div class="foto fuera">${img(fs[i])}<p class="miedo">${m}</p><div class="respuesta"><span class="dato">${d}</span><span class="display">${r}</span></div></div>`).join('');
  const piezas = $$('.foto', cont), A = $$('.grilla-a .hueco', sec), B = $$('.grilla-b .hueco', sec);
  const colocar = () => { const destino = sec.classList.contains('b') ? B : A; piezas.forEach((p, i) => caja(p, relativo(destino[i], fijo))); };
  colocar(); addEventListener('resize', colocar);
  escenas.push(p => {
    const a = umbral(sec, 'on', p, .04);
    if (a === 1) piezas.slice().reverse().forEach((n, i) => setTimeout(() => sec.classList.contains('on') && n.classList.remove('fuera'), 250 + i * 220));
    if (a === -1) piezas.forEach(n => n.classList.add('fuera'));
    if (umbral(sec, 'b', p, .52)) colocar();
    umbral(sec, 'c', p, .70);
  });
})();

// ================= 03 · mosaico =================
(() => {
  const sec = $('#oficios'), fijo = $('.fijo', sec), cols = $('#mosaicoCols');
  // la puerta (primera foto de «a medida») + las del mosaico + un adelanto de cada oficio sin quitárselo a su sección
  const [puerta] = fotos('a-medida', 1);
  const propias = M.fotos.filter(f => f.seccion === 'mosaico'); propias.forEach(f => usadas.add(f.clave));
  // adelantos: se repiten a propósito en su sección (otra pantalla), así que no se marcan como usados
  const adelanto = [['conocimiento', 3], ['proceso', 3], ['perimetro', 2], ['a-medida', 2]].flatMap(([s, n]) => M.fotos.filter(f => f.seccion === s && f !== puerta).slice(-n));
  const elegidas = [];
  [...propias, ...adelanto].forEach((f, i) => elegidas.push(f));   // propias primero, luego adelantos
  for (let i = elegidas.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [elegidas[i], elegidas[j]] = [elegidas[j], elegidas[i]]; }   // mezcla fija
  elegidas.splice(5, 0, puerta);   // la puerta queda en la segunda columna, cerca del centro
  const n = MOVIL() ? 2 : 4, columnas = Array.from({length: n}, () => []);
  elegidas.forEach((f, i) => columnas[i % n].push(f));
  const ETIQ = {'a-medida': 'Oficio', 'conocimiento': 'Archivo', 'agentes': 'Mecanismo', 'tres-semanas': 'Tiempo', 'perimetro': 'Resguardo', 'proceso': 'Taller'};
  cols.innerHTML = columnas.map(c => `<div class="mosaico-col">${c.map(f => `<figure style="aspect-ratio:${f.ancho || 4}/${f.alto || 5}" data-clave="${f.clave}">${img(f, {grande: false})}${ETIQ[f.seccion] ? `<figcaption>${ETIQ[f.seccion]}</figcaption>` : ''}</figure>`).join('')}</div>`).join('');
  const colsEl = $$('.mosaico-col', cols);
  // la foto que se abre es la primera de «a medida» (y es la misma que abre la sección siguiente)
  const fig = $(`figure[data-clave="${puerta?.clave}"]`, cols);
  const at = $('#atraviesa'); at.querySelector('img').src = src(puerta);
  $('#medidaPortada').src = src(puerta); $('#medidaPortada').alt = puerta?.descripcion || '';
  const amp = [1.0, -0.7, 1.25, -0.9];
  let abierta = false;
  escenas.push(p => {
    colsEl.forEach((c, i) => {
      const h = c.scrollHeight - innerHeight * 1.0;
      const k = amp[i % 4], base = k > 0 ? 0 : -h * Math.abs(k) * .9;
      c.style.transform = `translate3d(0,${base - (k > 0 ? 1 : -1) * p * h * Math.abs(k) * .9}px,0)`;
    });
    umbral(sec, 'on', p, .06);
    const d = umbral(sec, 'd', p, .66);
    if (d === 1 && fig) {
      abierta = true; at.style.transition = 'none'; caja(at, relativo(fig, fijo)); at.classList.add('on');
      requestAnimationFrame(() => requestAnimationFrame(() => { at.style.transition = ''; caja(at, {left: 0, top: 0, width: fijo.clientWidth, height: fijo.clientHeight}); }));
    }
    if (d === -1 && abierta) {
      abierta = false; caja(at, relativo(fig, fijo)); setTimeout(() => !sec.classList.contains('d') && at.classList.remove('on'), 1500);
    }
  });
})();

// ================= 04 · a medida (horizontal) =================
(() => {
  const sec = $('#a-medida'), pista = $('#pistaMedida'), fijo = $('.fijo', sec);
  const fs = fotos('a-medida', Math.max(1, M.fotos.filter(f => f.seccion === 'a-medida' && !usadas.has(f.clave)).length)), vs = videos('a-medida', 1);
  let conVideo = false;
  const LEY = ['Primero se mide.', 'Cada pieza, para un lugar.', 'Con tus reglas.', 'Nada de talla única.', 'Encaja o no se entrega.'];
  const ALTOS = [.62, .78, .5, .7, .56, .66], ALIN = ['start', 'end', 'center', 'start', 'end', 'center'];
  let h = '';
  fs.forEach((f, i) => {
    const alto = ALTOS[i % 6], ar = (f.ancho || 4) / (f.alto || 3);
    h += `<div class="hcuadro" style="--ar:${ar.toFixed(3)};height:${alto * 100}svh;width:calc(${alto * 100}svh * ${ar.toFixed(3)});align-self:${ALIN[i % 6]};margin-block:${ALIN[i % 6] === 'center' ? 0 : 10}svh"><figure>${img(f)}</figure><span class="dato">${String(i + 1).padStart(2, '0')} · ${LEY[i % LEY.length]}</span></div>`;
    if (i === 1) h += `<div class="hfrase"><p class="display">Un sistema tuyo, no una licencia más.</p></div>`;
    if ((i === 3 || i === fs.length - 1) && vs[0] && !conVideo && (conVideo = true)) h += `<div class="hcuadro" style="--ar:1.778;height:58svh;width:calc(58svh * 1.778);align-self:center"><figure>${video(vs[0])}</figure><span class="dato">${vs[0].descripcion || ''}</span></div>`;
  });
  h += `<div class="hfrase" style="width:min(460px,80vw)"><p class="dato sec">Sigue</p><p class="display">Y lo que ya escribiste, responde.</p></div>`;
  pista.insertAdjacentHTML('beforeend', h); vigilarVideos(pista);
  const cuadros = $$('.hcuadro', pista);
  let ancho = 0;
  const medir = () => { ancho = pista.scrollWidth; sec.style.setProperty('--alto', `${Math.max(innerHeight * 2, innerHeight * (MOVIL() ? 2.0 : 1.3) * paradas().length + (MOVIL() ? 0 : (ancho - innerWidth) * .5) + innerHeight * 3.4)}px`); };
  // en móvil la pista se detiene en cada cuadro, centrado (65 % quieta, 35 % moviéndose)
  const paradas = () => { const max = Math.max(0, ancho - innerWidth); const xs = [0, ...[...pista.children].filter(c => !c.classList.contains('panel-portada') && !c.classList.contains('enpista')).map(c => clamp(c.offsetLeft + c.offsetWidth / 2 - innerWidth / 2, 0, max))]; return [...new Set(xs.map(Math.round))].sort((a, b) => a - b); };
  const EASEIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  // la sección se monta encima del final del mosaico para que la foto que se abrió continúe sin corte
  sec.style.marginTop = '-100svh'; sec.style.background = 'transparent';
  medir(); addEventListener('resize', medir); $$('img', pista).forEach(i => i.addEventListener('load', medir));
  escenas.push((p, r) => {
    fijo.style.visibility = r.top <= 1 ? 'visible' : 'hidden';
    // en móvil y escritorio la pista se detiene centrada en cada cuadro y frase (70–75 % quieta)
    const st = paradas(), hold = MOVIL() ? .75 : .7, q = mapa(p, .28, .92) * (st.length - 1), i = Math.min(st.length - 2, Math.floor(q)), f = q - i, t = f < hold ? 0 : EASEIO((f - hold) / (1 - hold));
    const x = -(st[i] + (st[i + 1] - st[i]) * (q >= st.length - 1 ? 1 : t));
    pista.style.transform = `translate3d(${x}px,0,0)`;
    cuadros.forEach(c => { const b = c.getBoundingClientRect(); if (!c.classList.contains('visto') && b.left < innerWidth * (MOVIL() ? 1.6 : .82)) c.classList.add('visto'); else if (c.classList.contains('visto') && b.left > innerWidth * (MOVIL() ? 2 : .95)) c.classList.remove('visto'); });
  });
})();

// ================= 05 · conocimiento =================
(() => {
  const sec = $('#conocimiento'), z = $('#zoomCon');
  const [vb, vp] = videos('conocimiento', 2);
  if (vb) z.innerHTML = video(vb); else { const [princ] = fotos('conocimiento', 1, {orient: 'horizontal'}); z.querySelector('img').src = src(princ); z.querySelector('img').alt = princ?.descripcion || ''; }
  const CITAS = [
    ['El cambio de turno se anota en la bitácora 4.', 'Manual de operaciones · p. 14'],
    ['La garantía cubre doce meses desde la entrega.', 'Contrato marco · cláusula 7'],
    ['La muestra se rotula antes de entrar al frío.', 'Protocolo de laboratorio · p. 3'],
    ['Las compras sobre 200 UF llevan dos firmas.', 'Política de compras · p. 9'],
  ];
  // si hay segundo video, ocupa la tercera fuente y no se consume una foto que no se vería
  const fs = fotos('conocimiento', vp ? 3 : 4, {orient: 'vertical'});
  $('#fuentes').innerHTML = CITAS.map(([q, d], i) => `<div class="fuente">${i === 2 && vp ? video(vp) : img(fs[vp && i > 2 ? i - 1 : i])}<div class="cita"><q>${q}</q><span class="dato">${d}</span></div></div>`).join('');
  $('.fijo', sec).insertAdjacentHTML('beforeend', '<p class="dato fuentes-cab">Cada respuesta, con su fuente · ejemplos</p>');
  vigilarVideos(sec);
  escenas.push(p => {
    const s = .34 + .66 * Math.pow(mapa(p, 0, .16), 1.4);
    z.style.transform = `translate(-50%,-50%) scale(${s})`;
    umbral(sec, 'on', p, .10);
    umbral(sec, 'b', p, .62);
  });
})();

// ================= 06 · agentes =================
(() => {
  const sec = $('#agentes'), cont = $('#agentesVideos');
  let vs = videos('agentes', 3);
  const piezas = vs.map(v => `<div class="foto">${video(v)}<span class="leyenda dato">${v.descripcion || ''}</span></div>`);
  if (piezas.length < 3) fotos('agentes', 3 - piezas.length).forEach(f => piezas.push(`<div class="foto">${img(f)}<span class="leyenda dato">${f.descripcion || ''}</span></div>`));
  cont.innerHTML = piezas.join(''); vigilarVideos(cont);
  const capas = $$('.foto', cont); capas[0]?.classList.add('on');
  const REG = [
    ['08:00', 'Informe semanal armado y enviado', 'listo'],
    ['08:04', '214 filas copiadas de ventas a facturación', 'listo'],
    ['09:12', 'Contrato 31: dos cláusulas distintas al modelo', 'revisar'],
    ['11:30', 'Orden de compra cuadrada con su guía', 'listo'],
    ['15:02', 'Planilla de turnos actualizada', 'listo'],
    ['17:45', 'Registro del día guardado', 'listo'],
  ];
  $('#registro').innerHTML = REG.map(([t, x, e]) => `<li><b>${t}</b><span>${x}</span><i>${e}</i></li>`).join('');
  $('#registro').insertAdjacentHTML('afterend', '<p class="registro-nota">Registro de ejemplo</p>');
  const lis = $$('#registro li');
  escenas.push(p => {
    umbral(sec, 'on', p, .05);
    const k = p < .38 ? 0 : p < .68 ? 1 : 2;
    capas.forEach((c, i) => c.classList.toggle('on', i === Math.min(k, capas.length - 1)));
    lis.forEach((li, i) => umbral(li, 'on', p, .12 + i * .07));
  });
})();

// ================= 07 · tres semanas =================
(() => {
  const sec = $('#tres-semanas'), cont = $('#semanasVideo');
  const [v] = videos('tres-semanas', 1);
  cont.innerHTML = v ? video(v) : img(fotos('tres-semanas', 1)[0]); vigilarVideos(cont);
  const dia = $('#dia'), pasos = $$('.semanas-pasos article', sec);
  escenas.push(p => {
    const d = 1 + Math.floor(mapa(p, .06, .88) * 20.999);
    const t = String(d).padStart(2, '0'); if (dia.textContent !== t) dia.textContent = t;
    pasos.forEach(a => umbral(a, 'on', p, +a.dataset.desde));
    umbral(sec, 'fin', p, .86);
  });
})();

// ================= 08 · perímetro =================
(() => {
  const sec = $('#perimetro'), centro = $('#periCentro');
  const [vs] = videos('perimetro', 1);
  if (vs) { centro.innerHTML = video(vs); vigilarVideos(centro); }
  else { const [luz] = fotos('perimetro', 1); centro.querySelector('img').src = src(luz); centro.querySelector('img').alt = luz?.descripcion || ''; }
  const cimg = () => centro.querySelector('img,video');
  const ms = fotos('perimetro', 4);
  $('#muros').innerHTML = ['n', 's', 'o', 'e'].map((k, i) => `<div class="foto muro-${k}">${img(ms[i])}</div>`).join('');
  const cs = M.fotos.filter(f => f.seccion === 'mosaico' || f.seccion === 'conocimiento').slice(0, 6);   // se repiten a propósito (otra pantalla): no le quitan fotos a nadie
  const contra = $('#contra'); contra.innerHTML = cs.map(f => `<figure>${img(f, {grande: false})}</figure>`).join('');
  escenas.push(p => {
    const i = 30 * mapa(p, .05, .35);
    centro.style.clipPath = `inset(${i * .9}% ${i}% ${i * .9}% ${i}%)`;
    cimg().style.transform = `scale(${1.15 - .15 * mapa(p, 0, .6)})`;
    umbral(sec, 'b', p, .38);
    umbral(sec, 'on', p, .45);
    // corre al revés: baja mientras tú bajas
    const h = contra.scrollHeight;
    contra.style.transform = `translate3d(0,${-h + p * (h + innerHeight)}px,0)`;
  });
})();

// ================= 09 · por escrito (tarjetas apiladas) =================
(() => {
  const C = [
    ['Dónde corre', 'Sobre tu nube y con tus cuentas.'],
    ['Entrenamiento', 'Tus datos no entrenan modelos. De nadie.'],
    ['Quién ve qué', 'Cada cargo ve lo suyo.'],
    ['Trazabilidad', 'Cada respuesta y cada acción quedan registradas.'],
    ['Las suscripciones', 'A tu nombre. Nada queda amarrado a nosotros.'],
    ['Al terminar', 'Te entregamos todo, íntegro, dentro de 30 días.'],
  ];
  const fs = fotos('proceso', 6);
  $('#pila').innerHTML = C.map(([t, x], i) => `<article class="carta" style="--i:${i}"><figure>${img(fs[i])}</figure><div class="carta-texto"><span class="num">${String(i + 1).padStart(2, '0')} / 06</span><div><h3 class="display">${t}</h3><p style="margin-top:16px">${x}</p></div></div></article>`).join('');
  const cartas = $$('.carta');
  escenas.push(() => {
    cartas.forEach((c, i) => {
      const sig = cartas[i + 1]; if (!sig) return;
      const a = c.getBoundingClientRect(), b = sig.getBoundingClientRect();
      const k = clamp(1 - (b.top - a.top) / a.height);
      c.style.transform = `scale(${1 - .06 * k})`; c.style.filter = `brightness(${1 - .45 * k})`;
    });
  });
})();

// ================= 10 · cierre y créditos =================
(() => {
  const [f] = fotos('cierre', 1);
  const i = $('#cierreFoto img'); i.src = src(f); i.alt = f?.descripcion || '';
  const lista = [...(M.portada?.creditos || []), ...M.videos, ...M.fotos].filter(x => x.autor || x.fuente);
  $('#creditos').innerHTML = lista.map(x => `${x.descripcion ? x.descripcion.split('.')[0] : x.clave || ''} · ${x.estilo ? x.estilo + ' · ' : ''}${x.autor || ''}${x.fuente ? ` · <a href="${x.fuente}" target="_blank" rel="noopener">fuente</a>` : ''}`).join('<br>');
  $('#verCreditos').addEventListener('click', () => { const c = $('#creditos'); c.hidden = !c.hidden; lenis?.resize(); });
})();

// ---------------- secciones que no son escenas fijas: entran al aparecer ----------------
const ioOn = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }), {threshold: .1});
$$('.cierre, .apilado').forEach(s => ioOn.observe(s));
vigilarVideos(document);

// ---------------- bucle ----------------
const escSec = ['#problema', '#oficios', '#a-medida', '#conocimiento', '#agentes', '#tres-semanas', '#perimetro', '#contrato'].map(s => $(s));
const todas = $$('main > section'), indic = $('#barraSeccion');
function tick() {
  escenas.forEach((fn, i) => {
    const sec = escSec[i];
    if (!sec) return fn(0);
    const r = sec.getBoundingClientRect();
    if (r.bottom < -innerHeight * .5 || r.top > innerHeight * 1.5) return;
    fn(progreso(sec), r);
  });
  // la película duerme cuando ya la taparon
  const tapada = $('#problema').getBoundingClientRect().top <= 0;
  if (tapada !== pelicula.classList.contains('dormida')) { pelicula.classList.toggle('dormida', tapada); tapada ? pv.pause() : (pelicula.classList.contains('on') && pv.play().catch(() => {})); }
  // indicador de sección
  const c = [...todas].reverse().find(s => { const r = s.getBoundingClientRect(); return r.top <= innerHeight * .5 && r.bottom > innerHeight * .5; });
  if (c && indic.dataset.id !== c.id) { indic.dataset.id = c.id; indic.innerHTML = `<span>${String(todas.indexOf(c) + 1).padStart(2, '0')}</span> ${c.dataset.nombre || ''}`; }
}
function raf(t) { lenis?.raf(t); tick(); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// menos movimiento: todo en su estado final
if (RM) {
  $$('.escena, .cierre, .apilado, .portada').forEach(s => s.classList.add('on'));
  ['#problema', '#conocimiento', '#perimetro'].forEach(s => $(s).classList.add('b'));
  $('#problema').classList.add('c'); $('#tres-semanas').classList.add('fin');
  $$('#registro li, .semanas-pasos article, .hcuadro').forEach(n => n.classList.add('on', 'visto'));
  $$('#problemaFotos .foto').forEach(n => n.classList.remove('fuera'));
}
})();
