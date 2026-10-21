/* STEINMETZ · landing v3 «Oficio». Escenas fijas donde el scroll cruza umbrales y dispara animaciones por tiempo
   (método Priveé: nada queda a medias, con histéresis). Sólo el encuadre (columnas, pista, zoom, contador) sigue al scroll.
   Los medios vienen de medios/MANIFIESTO.json. */
(async () => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOVIL = () => innerWidth <= 820;
const TACTIL = matchMedia('(pointer: coarse)').matches;
// alto estable de pantalla: el de las escenas (100lvh). En el teléfono innerHeight cambia cada vez que la barra del
// navegador aparece o se esconde; si el largo de las escenas dependiera de él, la página saltaría a medio gesto.
const sonda = document.createElement('div');
sonda.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
document.body.appendChild(sonda);
let VH = sonda.offsetHeight || innerHeight, anchoPrev = innerWidth;
// 'tamano' sólo se dispara cuando de verdad cambia la pantalla (ancho o alto estable), no con la barra
addEventListener('resize', () => {
  const v = sonda.offsetHeight || innerHeight; if (v === VH && innerWidth === anchoPrev) return;
  VH = v; anchoPrev = innerWidth; dispatchEvent(new Event('tamano'));
});
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
  const pool = M.videos.filter(v => v.seccion === seccion && !usadas.has(v.clave));   // sólo los de su sección: no se roban entre escenas
  const out = pool.slice(0, n); out.forEach(v => usadas.add(v.clave)); return out;
}
// cada foto viene pre-renderizada en bicromía B (brasa) y/o C (pizarra); f.tono es la de su sección
const src = (f, grande = true, tono = f?.tono) => { const a = f?.archivos?.[tono] || f?.archivos?.[f?.tono] || {}; return ruta(a[grande && !MOVIL() ? '1600' : '1200'] || a['1600'] || a['1200']); };
const img = (f, {grande = true, eager = false, tono, clase = ''} = {}) => f ? `<img ${clase ? `class="${clase}" ` : ''}src="${src(f, grande, tono)}" alt="${clase ? '' : (f.descripcion || '').replace(/"/g, '&quot;')}" ${clase ? 'aria-hidden="true" ' : ''}${eager || clase ? '' : 'loading="lazy"'} decoding="async">` : '';
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
// en la barra el logotipo se comprime a SZ al bajar y se expande al subir: TEINMET se pliega contra la S
// (de la Z hacia la S) mientras la Z se corre hasta formar el par del sello. La Z va siempre en el acento.
const barraLogo = $('#barraLogo');
(() => {
  const {letras} = firma(barraLogo), sEnd = letras[0].firstChild.getBBox(), x0 = sEnd.x + sEnd.width;
  letras.slice(1, -1).forEach((g, i) => { const b = g.firstChild.getBBox(); g.style.setProperty('--dx', `${x0 - b.x}px`); g.style.setProperty('--i', i); });
  letras.at(-1).style.setProperty('--zdx', `${SZ.sello.zDx}px`);
})();
let yPrev = scrollY, acum = 0;
function logoSegunScroll() {
  const y = scrollY, d = y - yPrev; yPrev = y; if (!d) return;
  if (Math.sign(d) !== Math.sign(acum)) acum = 0;   // cambia la dirección: se cuenta de nuevo (umbral, sin parpadeo)
  acum += d;
  const sz = barraLogo.classList.contains('sz');
  if (!sz && acum > 90 && y > VH * .5) barraLogo.classList.add('sz');
  else if (sz && (acum < -90 || y < VH * .3)) barraLogo.classList.remove('sz');
}

// ---------------- scroll con inercia ----------------
const lenis = (!RM && window.Lenis) ? new Lenis({lerp: .075, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.4}) : null;
// delegado: también sirve para los enlaces que se arman después (el índice de oficios)
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
  const y = t.getBoundingClientRect().top + scrollY + (t.classList.contains('escena') ? VH * .3 : 0);
  if (lenis) { lenis.start(); lenis.scrollTo(y, {duration: 2.2}); } else scrollTo(0, y);   // un clic suelta el scroll aunque la portada aún esté entrando
});

// ---------------- estados por umbral con histéresis ----------------
function umbral(n, cls, p, at, h = .02) {
  const on = n.classList.contains(cls);
  if (!on && p >= at + h / 2) { n.classList.add(cls); return 1; }
  if (on && p < at - h / 2) { n.classList.remove(cls); return -1; }
  return 0;
}
const progreso = sec => { const r = sec.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - VH)); };
const relativo = (n, padre) => { const a = n.getBoundingClientRect(), b = padre.getBoundingClientRect(); return {left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height}; };
const caja = (n, r) => { n.style.left = r.left + 'px'; n.style.top = r.top + 'px'; n.style.width = r.width + 'px'; n.style.height = r.height + 'px'; };
const escenas = [];
let cierreTick = null;

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
  // en táctil el scroll es nativo: se suelta casi de inmediato para que el gesto no se sienta trabado
  lenis ? setTimeout(() => lenis.start(), TACTIL ? 200 : 700) : 0;
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
  G.forEach((g, i) => dibujar(g, 700, i * 60));

  // 2 · la S y la Z se dibujan en su lugar dentro del sello: primero el contorno, después el relleno
  s.style.transform = `translate(${S_SELLO}px, 0)`; z.style.transform = `translate(${dZ}px, 0)`;
  const trazar = (g, color, delay, dur = 750) => {
    const p = g.firstChild;
    p.style.stroke = color; p.style.strokeWidth = upx * 1.4; p.style.strokeLinejoin = 'round';
    dibujar(p, dur, delay);
    p.animate([{fillOpacity: 0}, {fillOpacity: 1}], {duration: 400, delay: delay + dur * .8, easing: EASE, fill: 'both'});
    p.animate([{strokeOpacity: 1}, {strokeOpacity: 0}], {duration: 300, delay: delay + dur + 120, fill: 'both'});
  };
  trazar(s, '#F3EBDD', 400); trazar(z, '#FF8539', 500);
  // el sello: su borde se dibuja y se llena; la S pasa a hollín sobre la cal
  circulo.style.strokeWidth = upx * 1.4;
  dibujar(circulo, 750, 550);
  circulo.animate([{fillOpacity: 0}, {fillOpacity: 1}], {duration: 450, delay: 1250, easing: EASE, fill: 'both'});
  s.animate([{fill: '#F3EBDD'}, {fill: '#0E0B08'}], {duration: 400, delay: 1300, easing: EASE, fill: 'both'});
  G.forEach(g => g.animate([{opacity: 1}, {opacity: .35}], {duration: 600, delay: 1450, fill: 'forwards'}));

  // 3 · el círculo se va, la S vuelve a cal y se abren las demás letras entre la S y la Z, dibujándose
  const T2 = 2000;   // la intro entera dura ~3,3 s (antes ~5 s)
  circulo.animate([{transform: 'scale(1)', opacity: 1}, {transform: 'scale(.86)', opacity: 0}], {duration: 550, delay: T2, easing: SUAVE, fill: 'forwards'});
  s.animate([{fill: '#0E0B08'}, {fill: '#F3EBDD'}], {duration: 500, delay: T2 + 80, easing: SUAVE, fill: 'forwards'});
  s.animate([{transform: `translate(${S_SELLO}px, 0)`}, {transform: 'translate(0, 0)'}], {duration: 900, delay: T2 + 250, easing: SUAVE, fill: 'forwards'});
  z.animate([{transform: `translate(${dZ}px, 0)`}, {transform: 'translate(0, 0)'}], {duration: 900, delay: T2 + 250, easing: SUAVE, fill: 'forwards'});
  // las letras del medio solo existen en el hueco que dejan la S y la Z (se abren simétricas desde el centro)
  const clip = el('clipPath', {id: 'hueco'}, el('defs', {}, svgL));
  const rect = el('rect', {x: sb.x + sb.width, y: -SZ.alto, width: zb.x - (sb.x + sb.width), height: SZ.alto * 3}, clip);
  rect.style.transformBox = 'fill-box'; rect.style.transformOrigin = 'center';
  const grupo = el('g', {'clip-path': 'url(#hueco)'}, svgL);
  medio.forEach(g => grupo.appendChild(g));
  rect.animate([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 900, delay: T2 + 250, easing: SUAVE, fill: 'both'});
  const mitad = (medio.length - 1) / 2;
  medio.forEach((g, i) => trazar(g, '#F3EBDD', T2 + 300 + Math.abs(i - mitad) * 80, 700));
  const svg = lock;
  let listo = false, ido = false, pendiente = false, deuda = 0;
  // un gesto antes de que el logo esté armado no se pierde: queda anotado y sale apenas se puede (~2,4 s;
  // las últimas letras terminan de dibujarse mientras el logo vuela a la barra)
  setTimeout(() => { listo = true; $('#introBaja').classList.add('on'); if (pendiente) salir(); }, 2400);
  pv.preload = 'auto'; pv.load();
  const salir = () => {
    if (ido) return; if (!listo) { pendiente = true; return; } ido = true;
    $('#portada').classList.add('on');   // el titular entra mientras vuela el logo
    const a = svg.getBoundingClientRect(), b = $('#barraLogo').getBoundingClientRect();
    intro.classList.add('sale'); pelicula.classList.add('on'); pv.play().catch(() => {});
    svg.animate([{transform: 'none'}, {transform: `translate(${b.left - a.left}px,${b.top - a.top}px) scale(${b.width / a.width})`}], {duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards'});
    setTimeout(() => {
      $('#barraLogo').classList.add('on'); intro.classList.add('fuera'); encender();
      // lo que se deslizó mientras el logo volaba se aplica al soltar el scroll (antes se perdía)
      if (deuda > 0) { const y = Math.min(deuda * 1.2, VH * .9); lenis ? (lenis.start(), lenis.scrollTo(y, {duration: 1.2})) : scrollTo(0, y); }
    }, 1100);
  };
  const enVuelo = () => ido && intro.classList.contains('sale') && !intro.classList.contains('fuera');
  addEventListener('wheel', e => { if (enVuelo()) deuda += Math.max(0, e.deltaY); if (e.deltaY > 0) salir(); }, {passive: true});
  let ty = 0; addEventListener('touchstart', e => ty = e.touches[0].clientY, {passive: true});
  addEventListener('touchmove', e => { const d = ty - e.touches[0].clientY; if (enVuelo() && d > 0) { deuda += d; ty = e.touches[0].clientY; } if (d > 12) salir(); }, {passive: true});
  addEventListener('keydown', e => { if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) salir(); });
  intro.addEventListener('click', salir);
}

// ================= 02 · problema =================
(() => {
  const sec = $('#problema'), fijo = $('.fijo', sec), cont = $('#problemaFotos');
  const MIEDOS = [
    ['Una herramienta genérica que no calza con tu operación.', 'Ni genérico', 'A medida.'],
    ['Un piloto que se alarga meses y nunca se usa.', 'Ni piloto eterno', 'Tres semanas.'],
    ['Tu información en servidores que no controlas.', 'Ni servidor ajeno', 'Dentro de tu red.'],
  ];
  const fs = fotos('problema', 3);
  // cada foto está en C (el miedo, frío); al llegar la respuesta una cortina diagonal la pasa a B (cálida), panel por panel
  cont.innerHTML = MIEDOS.map(([m, d, r], i) => `<div class="foto fuera">${img(fs[i])}${img(fs[i], {tono: 'b', clase: 'otro-tono'})}<p class="miedo">${m}</p><div class="respuesta"><span class="dato">${d}</span><span class="display">${r}</span></div></div>`).join('');
  const piezas = $$('.foto', cont), A = $$('.grilla-a .hueco', sec), B = $$('.grilla-b .hueco', sec);
  const colocar = () => { const destino = sec.classList.contains('b') ? B : A; piezas.forEach((p, i) => caja(p, relativo(destino[i], fijo))); };
  colocar(); addEventListener('tamano', colocar);
  escenas.push((p, r) => {
    // entra mientras el escenario llega (antes había un momento en negro al empezar la escena)
    const on = sec.classList.contains('on'), a = !on && r.top < VH * .8 ? 1 : on && r.top > VH * .95 ? -1 : 0;
    if (a) sec.classList.toggle('on', a === 1);
    if (a === 1) piezas.slice().reverse().forEach((n, i) => setTimeout(() => sec.classList.contains('on') && n.classList.remove('fuera'), 60 + i * 160));
    if (a === -1) piezas.forEach(n => n.classList.add('fuera'));
    if (umbral(sec, 'b', p, .38)) colocar();
    umbral(sec, 'c', p, .64);
  });
})();

// ================= 03 · cinco oficios (índice) =================
let puerta = null;
(() => {
  const sec = $('#oficios'), fijo = $('.fijo', sec), lista = $('#oficiosLista');
  const OF = [
    ['a-medida', 'A medida', 'El sistema que le falta a tu operación, con tus reglas.'],
    ['conocimiento', 'Conocimiento', 'Tus documentos responden, con la fuente citada.'],
    ['agentes', 'Agentes', 'El trabajo repetido lo hace el sistema, y deja registro.'],
    ['tres-semanas', 'Tres semanas', 'Encendido y en uso en tres semanas. No un piloto.'],
    ['perimetro', 'Perímetro', 'Corre dentro de tu red. Tu información no sale.'],
  ];
  // una foto por oficio, en el tono de su sección (C, B, C, B, C): el índice ya anuncia la alternancia
  const fs = fotos('oficios', OF.length);
  puerta = fs[0];
  lista.innerHTML = OF.map(([id, nombre, linea], i) => `<li class="oficio" data-tono="${$('#' + id)?.dataset.tono || 'b'}" style="--i:${i}"><a href="#${id}"><figure>${img(fs[i], {grande: false})}</figure><div class="oficio-texto"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3 class="display">${nombre}</h3><p>${linea}</p></div></a></li>`).join('');
  // la foto del primer oficio se abre a pantalla completa y es la misma que abre «a medida»
  const fig = $('.oficio figure', lista), at = $('#atraviesa');
  at.querySelector('img').src = src(puerta);
  $('#medidaPortada').src = src(puerta); $('#medidaPortada').alt = puerta?.descripcion || '';
  let abierta = false;
  escenas.push((p, r) => {
    const on = sec.classList.contains('on');
    if (!on && r.top < VH * .8) sec.classList.add('on'); else if (on && r.top > VH * .95) sec.classList.remove('on');
    const d = umbral(sec, 'd', p, .64);
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
  const fs = fotos('a-medida', M.fotos.filter(f => f.seccion === 'a-medida' && !usadas.has(f.clave)).length), vs = videos('a-medida', 1);
  // cinco paradas, cada una con su frase: foto, díptico, video, foto y la frase que lleva a «conocimiento»
  const LEY = ['Primero se mide.', 'Con tus reglas.', 'Un sistema tuyo, no una licencia más.', 'Encaja o no se entrega.'];
  const ALTOS = [.6, .66, .58, .62], ALIN = ['start', 'end', 'center', 'start'];
  const piezas = [...fs.slice(0, 2), vs[0] ? {video: vs[0]} : null, ...fs.slice(2)].filter(Boolean);
  let h = '';
  piezas.forEach((f, i) => {
    const alto = ALTOS[i % 4], ar = f.video ? 16 / 9 : (f.ancho || 4) / (f.alto || 3);
    // el díptico: la misma toma en C y en B; el corte sigue a la foto mientras cruza la pantalla (al centro, mitad y mitad)
    const dip = f.diptico ? `<div class="dip-b">${img(f, {tono: 'b', clase: 'otro-tono'})}</div><i class="corte"></i>` : '';
    h += `<div class="hcuadro${f.diptico ? ' diptico' : ''}" style="--ar:${ar.toFixed(3)};height:${alto * 100}svh;width:calc(${alto * 100}svh * ${ar.toFixed(3)});align-self:${ALIN[i % 4]};margin-block:${ALIN[i % 4] === 'center' ? 0 : 9}svh"><figure>${f.video ? video(f.video) : img(f) + dip}</figure><p class="hley display">${LEY[i % LEY.length]}</p></div>`;
  });
  h += `<div class="hfrase"><p class="display">Y lo que ya escribiste, responde.</p></div>`;
  pista.insertAdjacentHTML('beforeend', h); vigilarVideos(pista);
  const cuadros = $$('.hcuadro', pista), dipticos = $$('.diptico figure', pista);
  let ancho = 0;
  // en móvil cada parada ocupa poco más de una pantalla de scroll y la pista viaja entre paradas por tiempo
  // (nunca queda a medio camino, ni con un gesto rápido); en escritorio sigue al scroll con pausas
  const PASO = .58, ENTRA = .2;
  const medir = () => {
    ancho = pista.scrollWidth; const n = paradas().length;
    sec.style.setProperty('--alto', MOVIL() ? `${VH * (PASO * n + ENTRA * 2 + 1)}px`
      : `${Math.max(VH * 2, VH * .6 * n + (ancho - innerWidth) * .2 + VH * 1.7)}px`);
    lenis?.resize();
  };
  const paradas = () => { const max = Math.max(0, ancho - innerWidth); const xs = [0, ...[...pista.children].filter(c => !c.classList.contains('panel-portada') && !c.classList.contains('enpista')).map(c => clamp(c.offsetLeft + c.offsetWidth / 2 - innerWidth / 2, 0, max))]; return [...new Set(xs.map(Math.round))].sort((a, b) => a - b); };
  const EASEIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  // la sección se monta encima del final del mosaico para que la foto que se abrió continúe sin corte
  sec.style.marginTop = 'calc(-1 * var(--pantalla))'; sec.style.background = 'transparent';
  medir(); addEventListener('tamano', medir); $$('img', pista).forEach(i => i.addEventListener('load', () => { if (pista.scrollWidth !== ancho) medir(); }));
  let parada = 0, meta = 0, tPaso = 0, xMovil = null;
  escenas.push((p, r) => {
    fijo.style.visibility = r.top <= 1 ? 'visible' : 'hidden';
    const st = paradas();
    dipticos.forEach(fg => {
      const b = fg.getBoundingClientRect(), t = clamp((innerWidth - b.left) / (innerWidth + b.width));
      fg.style.setProperty('--corte', `${((1 - t) * 100).toFixed(2)}%`);
    });
    if (MOVIL()) {
      const rango = Math.max(1, r.height - VH), e = ENTRA * VH / rango;
      const q = mapa(p, e, 1 - e) * (st.length - 1);
      // la meta sigue al scroll con histéresis; la pista avanza de a una parada (nunca se salta una con un gesto rápido)
      if (q > meta + .54 || q < meta - .54) meta = clamp(Math.round(q), 0, st.length - 1);
      const ahora = performance.now();
      if (meta !== parada && ahora - tPaso > 560) { parada += Math.sign(meta - parada); tPaso = ahora; }
      const x = -st[parada];
      if (x !== xMovil) { xMovil = x; pista.classList.add('paso'); pista.style.transform = `translate3d(${x}px,0,0)`; }
      cuadros.forEach(c => c.classList.toggle('visto', c.offsetLeft < st[parada] + innerWidth * 1.5));
      return;
    }
    pista.classList.remove('paso'); xMovil = null;
    // en escritorio la pista se detiene centrada en cada cuadro y frase (70 % quieta)
    const hold = .6, q = mapa(p, .16, .94) * (st.length - 1), i = Math.min(st.length - 2, Math.floor(q)), f = q - i, t = f < hold ? 0 : EASEIO((f - hold) / (1 - hold));
    const x = -(st[i] + (st[i + 1] - st[i]) * (q >= st.length - 1 ? 1 : t));
    pista.style.transform = `translate3d(${x}px,0,0)`;
    cuadros.forEach(c => { const b = c.getBoundingClientRect(); if (!c.classList.contains('visto') && b.left < innerWidth * .82) c.classList.add('visto'); else if (c.classList.contains('visto') && b.left > innerWidth * .95) c.classList.remove('visto'); });
  });
})();

// ================= 05 · conocimiento =================
(() => {
  const sec = $('#conocimiento'), z = $('#zoomCon');
  const [vb] = videos('conocimiento', 1);
  if (vb) z.innerHTML = video(vb); else { const [princ] = fotos('conocimiento', 1, {orient: 'horizontal'}); z.querySelector('img').src = src(princ); z.querySelector('img').alt = princ?.descripcion || ''; }
  const CITAS = [
    ['El cambio de turno se anota en la bitácora 4.', 'Manual de operaciones · p. 14'],
    ['La garantía cubre doce meses desde la entrega.', 'Contrato marco · cláusula 7'],
    ['La muestra se rotula antes de entrar al frío.', 'Protocolo de laboratorio · p. 3'],
    ['Las compras sobre 200 UF llevan dos firmas.', 'Política de compras · p. 9'],
  ];
  const fs = fotos('conocimiento', 4);
  $('#fuentes').innerHTML = CITAS.map(([q, d], i) => `<div class="fuente">${img(fs[i], {grande: false})}<div class="cita"><q>${q}</q><span class="dato">${d}</span></div></div>`).join('');
  $('.fijo', sec).insertAdjacentHTML('beforeend', '<p class="dato fuentes-cab">Cada respuesta, con su fuente · ejemplos</p>');
  vigilarVideos(sec);
  escenas.push(p => {
    // abre ya grande (antes partía chica sobre negro, el tramo más muerto de la página) y llena la pantalla enseguida
    const s = .7 + .3 * Math.pow(mapa(p, 0, .12), 1.2);
    z.style.transform = `translate(-50%,-50%) scale(${s})`;
    umbral(sec, 'on', p, .10);
    umbral(sec, 'b', p, .56);
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
  escenas.push((p, r) => {
    // el texto entra mientras el escenario llega (con umbral sobre el progreso quedaba media pantalla vacía en el teléfono)
    if (!sec.classList.contains('on') && r.top < VH * .3) sec.classList.add('on');
    else if (sec.classList.contains('on') && r.top > VH * .6) sec.classList.remove('on');
    const k = p < .36 ? 0 : p < .66 ? 1 : 2;
    capas.forEach((c, i) => c.classList.toggle('on', i === Math.min(k, capas.length - 1)));
    lis.forEach((li, i) => umbral(li, 'on', p, .08 + i * .075));
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
  const cs = fotos('contra', 6);
  const contra = $('#contra'); contra.innerHTML = cs.map(f => `<figure>${img(f, {grande: false})}</figure>`).join('');
  escenas.push(p => {
    const i = 30 * mapa(p, .05, .35);
    centro.style.clipPath = `inset(${i * .9}% ${i}% ${i * .9}% ${i}%)`;
    cimg().style.transform = `scale(${1.15 - .15 * mapa(p, 0, .6)})`;
    // en el teléfono los muros entran mientras la luz se achica (si no, queda una foto chica en un marco negro)
    umbral(sec, 'b', p, MOVIL() ? .14 : .38);
    umbral(sec, 'on', p, .45);
    // corre al revés: baja mientras tú bajas
    const h = contra.scrollHeight;
    contra.style.transform = `translate3d(0,${-h + p * (h + VH)}px,0)`;
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
      c.style.transform = `scale(${1 - .06 * k})`; c.style.setProperty('--osc', (.45 * k).toFixed(3));
    });
  });
})();

// ================= 10 · cierre y créditos =================
(() => {
  const [f] = fotos('cierre', 1);
  const i = $('#cierreFoto img'); i.src = src(f); i.alt = f?.descripcion || '';
  const otro = $('#cierreFoto .otro-tono'); otro.src = src(f, true, 'b');
  const cierre = $('#hablemos'), foto = $('#cierreFoto');
  foto.insertAdjacentHTML('beforeend', '<i class="corte" aria-hidden="true"></i>');
  // C a la izquierda del corte, B a la derecha; quieto respira despacio, con el puntero lo sigue con inercia
  let meta = .62, x = .62, mano = 0;
  const seguir = cx => { const r = cierre.getBoundingClientRect(); meta = clamp((cx - r.left) / r.width, .04, .96); mano = performance.now(); };
  cierre.addEventListener('pointermove', e => seguir(e.clientX), {passive: true});
  cierre.addEventListener('touchmove', e => seguir(e.touches[0].clientX), {passive: true});
  cierreTick = t => {
    const r = cierre.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    if (t - mano > 2500) meta = .62 + .1 * Math.sin(t / 2600);
    x += (meta - x) * (RM ? 1 : .07);
    foto.style.setProperty('--corte', `${(x * 100).toFixed(2)}%`);
  };
  const lista = [...(M.portada?.creditos || []), ...M.videos, ...M.fotos].filter(x => x.autor || x.fuente);
  $('#creditos').innerHTML = lista.map(x => `${x.descripcion ? x.descripcion.split('.')[0] : x.clave || ''} · ${x.autor || ''}${x.licencia ? ' · ' + x.licencia : ''}${x.fuente ? ` · <a href="${x.fuente}" target="_blank" rel="noopener">fuente</a>` : ''}`).join('<br>');
  $('#verCreditos').addEventListener('click', () => { const c = $('#creditos'); c.hidden = !c.hidden; lenis?.resize(); });
})();

// ---------------- secciones que no son escenas fijas: entran al aparecer ----------------
const ioOn = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }), {threshold: .1});
$$('.cierre, .apilado').forEach(s => ioOn.observe(s));
vigilarVideos(document);

// ---------------- bucle ----------------
const escSec = ['#problema', '#oficios', '#a-medida', '#conocimiento', '#agentes', '#tres-semanas', '#perimetro', '#contrato'].map(s => $(s));
const todas = $$('main > section'), indic = $('#barraSeccion'), barra = $('#barra');
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
  // el acento de la página (Z del logo, botón de la barra) es el de la sección en pantalla; CSS lo funde
  const tono = c?.dataset.tono || 'b';
  if (document.documentElement.dataset.tono !== tono) document.documentElement.dataset.tono = tono;
  logoSegunScroll();
  // la barra gana un fondo cuando ya hay contenido debajo (los titulares ya no pasan detrás del logo)
  const sobre = scrollY > VH * .6; if (sobre !== barra.classList.contains('sobre')) barra.classList.toggle('sobre', sobre);
}
function raf(t) { lenis?.raf(t); tick(); cierreTick?.(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// menos movimiento: todo en su estado final
if (RM) {
  $$('.escena, .cierre, .apilado, .portada').forEach(s => s.classList.add('on'));
  ['#problema', '#conocimiento', '#perimetro'].forEach(s => $(s).classList.add('b'));
  $('#problema').classList.add('c'); $('#tres-semanas').classList.add('fin');
  $$('#registro li, .semanas-pasos article, .hcuadro').forEach(n => n.classList.add('on', 'visto'));
  $('#oficios').classList.add('on');
  $$('#problemaFotos .foto').forEach(n => n.classList.remove('fuera'));
}
})();
