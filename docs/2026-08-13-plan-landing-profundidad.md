# Plan — Landing con profundidad (Steinmetz v2)

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: usar
> superpowers:subagent-driven-development (recomendado) o
> superpowers:executing-plans para ejecutar tarea por tarea. Los pasos usan
> checkbox (`- [ ]`) para seguimiento.

**Goal:** Construir `lab/6` — el landing de Steinmetz con cinco capas de
profundidad (3D real, fotografía 2.5D, multiplano CSS, motion graphics y
micro-interacción) sin borrar ni sobrescribir nada de lo que existe.

**Architecture:** Una entrada nueva en `lab/6/` con las seis secciones del
landing actual. Cinco módulos JS independientes, cada uno con una
responsabilidad y una función de arranque que puede fallar sin romper a las
demás. Todo el movimiento se dispara por carga, puntero o loop — nunca por
posición de scroll.

**Tech Stack:** three.js (CDN + import maps, sin build), Lenis, GSAP + SplitText,
CSS `animation-timeline: view()`, Depth-Anything V2 Small vía PyTorch local.

**Spec:** `docs/2026-08-13-spec-landing-profundidad.md`

## Global Constraints

- **Aditivo. No se borra nada.** `index.html`, `style.css`, `main.js`, los 80
  frames, `assets/web/`, `lab/1..5` quedan intactos. Sólo se modifican
  `lab/index.html` y `CLAUDE.md`, y en ambos **agregando**: ninguna línea
  preexistente se borra ni se reescribe.
- **El scroll queda libre.** Ninguna animación se ata a la posición de scroll.
  Disparadores permitidos: carga, puntero, loop ambiental, entrada en viewport
  (sólo para opacidad). ScrollTrigger para narrativa está prohibido.
- **Sin color de acento.** Todo el sitio es blanco sobre `#0a0a0a`. La luz de la
  escena 3D es key blanca lateral con falloff a negro. El único color sale de
  las fotos: óxido y ocre. Prohibido rim light de color, neón y gradientes de marca.
- **Tokens exactos del sitio**, copiados de `style.css`:
  `--negro: #0a0a0a` · `--blanco: #ffffff` · `--gris: #8a8a8a` ·
  `--gris-claro: #b8b8b8` · `--linea: rgba(255, 255, 255, 0.14)` ·
  `--fuente: "Inter", ui-sans-serif, system-ui, sans-serif` ·
  `--mono: "IBM Plex Mono", ui-monospace, "SF Mono", monospace` ·
  `--margen: clamp(1.25rem, 5vw, 5rem)`
- **Presupuestos:** JS total < 250 KB gzip · LCP < 2 s · 60 fps sostenido en
  desktop · DPR cap 2 · render loop pausado fuera de viewport y en pestaña oculta.
- **Sin caras.** El 3D es materia: polvo, tiza, acero.
- Idioma del contenido y de los comentarios de código: español.
- **No hacer `git push`.** Push a `main` = deploy a `steinmetz.cl`. Los commits
  son locales; la publicación es una decisión de Ian, aparte.
- Copy del hero, verbatim: _"Hacer la marca cuesta $1. Saber dónde hacerla:
  $9.999. Steinmetz es saber dónde."_

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `lab/6/index.html` | Las seis secciones, el copy, los contenedores de cada capa. Legible sin JS |
| `lab/6/estilo.css` | Tokens del sitio, layout, capa 4 (grano, viñeta, hairlines), fallbacks CSS |
| `lab/6/escena.js` | Capa 0 — three.js: partículas, campo de flujo, sedimentación en X, luz lateral |
| `lab/6/profundidad.js` | Capa 1 — quad 2.5D: shader de displacement por mapa de profundidad |
| `lab/6/multiplano.js` | Capa 2 — `perspective`/`translateZ` por puntero con inercia |
| `lab/6/orquesta.js` | Capa 3 — timeline de carga GSAP, SplitText, trazo SVG, contadores, Lenis |
| `assets/tools/generar-depthmaps.py` | Genera los mapas de profundidad con Depth-Anything V2 |
| `assets/web/depth/` | Los mapas generados (PNG grises) |
| `lab/index.html` | **Modificado, aditivo** — se agrega el enlace a `/lab/6/` |
| `CLAUDE.md` | **Modificado, aditivo** — se agrega la sección de revisión |

Cada módulo JS exporta una función `iniciar()` que devuelve `true` si arrancó y
`false` si el entorno no lo soporta. `index.html` los invoca dentro de
`try/catch` independientes: si uno falla, los otros siguen.

---

### Task 1: Andamio de `lab/6` — el sitio sin JavaScript

**Files:**
- Create: `lab/6/index.html`
- Create: `lab/6/estilo.css`
- Modify: `lab/index.html` (agregar un `<a href="/lab/6/">`, sin tocar los cinco existentes)

**Interfaces:**
- Produces: los `id` y `data-` que consumen las tareas 2–6:
  `#escena` (canvas del hero), `[data-foto-profundidad]` (figuras con foto),
  `[data-multiplano]` (contenedores de capas), `[data-trazo]` (SVG),
  `[data-contador]` (cifras), `.revelar` (elementos de la timeline de carga).
- Produces: las seis secciones con los `id`: `#hero`, `#historia`, `#problema`,
  `#metodo`, `#trabajo`, `#quien`.

- [ ] **Step 1: Crear la estructura HTML con las seis secciones**

Crear `lab/6/index.html`. El copy sale del sitio en vivo; las etiquetas de
sección son exactamente `01 — LA HISTORIA`, `02 — EL PROBLEMA`,
`03 — EL MÉTODO`, `04 — EL TRABAJO`, `05 — QUIÉN ESTÁ DETRÁS`.

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Steinmetz — LAB 6 · La profundidad</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="estilo.css">
</head>
<body>

<header class="marca">
  <span class="marca__nombre">STEINMETZ</span>
  <span class="marca__lugar">SANTIAGO DE CHILE</span>
</header>

<section class="hero" id="hero">
  <canvas id="escena" aria-hidden="true"></canvas>
  <div class="hero__texto">
    <h1 class="hero__titulo">
      <span class="revelar">Hacer la marca cuesta <b>$1</b>.</span>
      <span class="revelar">Saber dónde hacerla: <b>$9.999</b>.</span>
      <span class="revelar">Steinmetz es saber dónde.</span>
    </h1>
    <p class="hero__acciones revelar">
      <a href="mailto:ian@steinmetz.cl">Hablemos</a>
      <span class="sep">o</span>
      <a href="https://wa.me/56993215043">por WhatsApp</a>
    </p>
  </div>
</section>

<section class="seccion" id="historia">
  <p class="eyebrow">01 — LA HISTORIA</p>
  <figure data-foto-profundidad
          data-src="/assets/web/img/01-marca-tiza-acero-1920.webp"
          data-depth="/assets/web/depth/01-marca-tiza-acero.png">
    <img src="/assets/web/img/01-marca-tiza-acero-1920.webp"
         alt="Marca de tiza sobre acero" loading="lazy">
  </figure>
  <div class="texto">
    <p class="revelar">Ford llamó a Steinmetz porque nadie más podía arreglar el generador.
      Escuchó, midió, y marcó una X con tiza.</p>
    <p class="revelar">La factura decía $10.000. Ford pidió el detalle.
      <b>$1 por hacer la marca. $9.999 por saber dónde hacerla.</b></p>
  </div>
</section>

<section class="seccion" id="problema">
  <p class="eyebrow">02 — EL PROBLEMA</p>
  <div data-multiplano class="problema__capas">
    <p class="revelar capa" data-z="0">La consultora grande te vende volumen.</p>
    <p class="revelar capa" data-z="1">Meses de diagnóstico. Un PDF. Nada encendido.</p>
    <p class="revelar capa" data-z="2">Pagaste por el $1, no por el $9.999.</p>
  </div>
  <svg data-trazo viewBox="0 0 200 200" class="equis" aria-hidden="true">
    <path d="M40 40 L160 160" pathLength="1"/>
    <path d="M160 40 L40 160" pathLength="1"/>
  </svg>
</section>

<section class="seccion" id="metodo">
  <p class="eyebrow">03 — EL MÉTODO</p>
  <ol class="metodo">
    <li class="revelar"><span class="num">01</span> Escuchamos el problema real, no el que está en el brief.</li>
    <li class="revelar"><span class="num">02</span> Construimos el sistema que la corrige. IA donde aporta. Ninguna donde estorba.</li>
    <li class="revelar"><span class="num">03</span> Lo dejamos corriendo en producción, en manos de tu equipo. Encendido, o no existe.</li>
  </ol>
</section>

<section class="seccion" id="trabajo">
  <p class="eyebrow">04 — EL TRABAJO</p>
  <p class="destacado revelar">No mostramos logos. Mostramos sistemas encendidos.</p>
  <figure data-foto-profundidad
          data-src="/assets/web/img/02-nave-estanques-1920.webp"
          data-depth="/assets/web/depth/02-nave-estanques.png">
    <img src="/assets/web/img/02-nave-estanques-1920.webp"
         alt="Nave industrial de estanques" loading="lazy">
  </figure>
  <div class="casos">
    <div class="caso revelar">
      <p class="caso__quien">Una de las grandes cerveceras de Chile</p>
      <p class="caso__que">Plataforma de auditoría y análisis de laboratorio — API,
        base de datos y frontend — corriendo en producción sobre Azure.</p>
    </div>
    <div class="caso revelar">
      <p class="caso__quien">Una empresa de genética aplicada</p>
      <p class="caso__que">Sistema de trazabilidad de muestras, en producción.</p>
    </div>
  </div>
</section>

<section class="seccion" id="quien">
  <p class="eyebrow">05 — QUIÉN ESTÁ DETRÁS</p>
  <div id="escena-cierre" aria-hidden="true"></div>
  <p class="pregunta revelar">¿Dónde hacemos la marca?</p>
  <p class="contacto revelar">
    <a href="mailto:ian@steinmetz.cl">Hablemos</a>
    <span class="sep">o</span>
    <a href="https://wa.me/56993215043">por WhatsApp</a>
  </p>
  <p class="datos">
    <span data-contador data-hasta="9999" data-prefijo="$">$9.999</span>
    <span class="datos__pie">es lo que cuesta saber dónde</span>
  </p>
</section>

<footer class="pie">
  <p>STEINMETZ SpA · RUT 78.484.226-6<br>Consultoría en inteligencia artificial</p>
  <p>ian@steinmetz.cl · +56 9 9321 5043 · Santiago de Chile</p>
  <p><a href="/portal/">Acceso clientes</a></p>
</footer>

</body>
</html>
```

- [ ] **Step 2: Crear los estilos base con los tokens del sitio**

Crear `lab/6/estilo.css`. Los tokens son copia exacta de `style.css` de la raíz.

```css
:root{
  --negro:#0a0a0a; --blanco:#ffffff; --gris:#8a8a8a; --gris-claro:#b8b8b8;
  --linea:rgba(255,255,255,0.14);
  --fuente:"Inter",ui-sans-serif,system-ui,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,"SF Mono",monospace;
  --margen:clamp(1.25rem,5vw,5rem);
}
*{margin:0;padding:0;box-sizing:border-box}
body{
  background:var(--negro); color:var(--blanco);
  font-family:var(--fuente); font-weight:400; line-height:1.6;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  overflow-x:hidden;
}
::selection{background:var(--blanco); color:var(--negro)}
a{color:inherit}
img{display:block; max-width:100%}

/* capa 4 — grano de película global, igual que el sitio actual */
body::after{
  content:""; position:fixed; inset:0; pointer-events:none; z-index:9;
  opacity:.045; mix-blend-mode:screen;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
}

.marca{
  position:fixed; top:0; left:0; right:0; z-index:10;
  display:flex; justify-content:space-between;
  padding:var(--margen); font-family:var(--mono);
  font-size:.75rem; letter-spacing:.08em; color:var(--gris-claro);
}

/* --- hero --- */
.hero{position:relative; min-height:100svh; display:flex; align-items:flex-end;
  padding:var(--margen); overflow:hidden}
#escena{position:absolute; inset:0; width:100%; height:100%; display:block; z-index:0}
.hero__texto{position:relative; z-index:1; max-width:34ch}
.hero__titulo{font-size:clamp(1.75rem,4.5vw,3.25rem); font-weight:500;
  line-height:1.15; letter-spacing:-.02em}
.hero__titulo span{display:block}
.hero__titulo b{font-family:var(--mono); font-weight:500}
.hero__acciones{margin-top:2rem; font-family:var(--mono); font-size:.875rem}
.hero__acciones a{border-bottom:1px solid var(--linea); padding-bottom:2px}
.sep{color:var(--gris); margin:0 .5rem}

/* --- secciones --- */
.seccion{padding:clamp(5rem,12vh,10rem) var(--margen); max-width:90rem; margin:0 auto;
  border-top:1px solid var(--linea)}
.eyebrow{font-family:var(--mono); font-size:.75rem; letter-spacing:.1em;
  color:var(--gris); margin-bottom:2.5rem}
.texto p{max-width:52ch; margin-bottom:1.25rem; color:var(--gris-claro)}
.texto b{color:var(--blanco); font-weight:500}
figure{margin:2.5rem 0; position:relative}

.problema__capas .capa{font-size:clamp(1.25rem,3vw,2rem); font-weight:500;
  line-height:1.3; max-width:24ch; margin-bottom:1.5rem}
.equis{width:clamp(80px,10vw,140px); margin-top:3rem; opacity:.5}
.equis path{fill:none; stroke:var(--blanco); stroke-width:3;
  stroke-dasharray:1; stroke-dashoffset:1}

.metodo{list-style:none; display:grid; gap:2rem;
  grid-template-columns:repeat(auto-fit,minmax(17rem,1fr))}
.metodo li{color:var(--gris-claro); border-top:1px solid var(--linea); padding-top:1rem}
.num{display:block; font-family:var(--mono); font-size:.75rem;
  color:var(--gris); margin-bottom:.75rem}

.destacado{font-size:clamp(1.25rem,2.5vw,1.75rem); font-weight:500; max-width:26ch}
.casos{display:grid; gap:2.5rem; grid-template-columns:repeat(auto-fit,minmax(19rem,1fr))}
.caso__quien{font-family:var(--mono); font-size:.75rem; color:var(--gris);
  letter-spacing:.06em; margin-bottom:.75rem}
.caso__que{color:var(--gris-claro)}

.pregunta{font-size:clamp(1.5rem,4vw,2.75rem); font-weight:500; letter-spacing:-.02em}
.contacto{margin-top:2rem; font-family:var(--mono)}
.contacto a{border-bottom:1px solid var(--linea); padding-bottom:2px}
.datos{margin-top:4rem; font-family:var(--mono); color:var(--gris)}
[data-contador]{display:block; font-size:clamp(2rem,6vw,4rem); color:var(--blanco)}
.datos__pie{font-size:.75rem; letter-spacing:.06em}

.pie{padding:var(--margen); border-top:1px solid var(--linea);
  font-family:var(--mono); font-size:.75rem; color:var(--gris);
  display:grid; gap:1rem}

/* --- capa 2, fallback CSS puro: entrada por viewport, sin JS --- */
@supports (animation-timeline: view()){
  @media (prefers-reduced-motion: no-preference){
    .revelar{
      opacity:0; animation:entrar linear both;
      animation-timeline:view(); animation-range:entry 10% cover 28%;
    }
    @keyframes entrar{to{opacity:1}}
  }
}

@media (prefers-reduced-motion: reduce){
  .revelar{opacity:1 !important; transform:none !important}
  .equis path{stroke-dashoffset:0}
  *,*::before,*::after{animation-duration:.01ms !important; transition-duration:.01ms !important}
}
```

- [ ] **Step 3: Agregar la entrada 6 al conmutador, sin tocar las cinco existentes**

Primero mirar el marcado exacto del enlace 5, con sus tres líneas de contexto:

```bash
cd /Users/ianberndt/Desktop/Steinmetz
grep -n -A3 -B3 'href="/lab/5/"' lab/index.html
```

Copiar **ese mismo bloque** debajo, cambiando sólo el `5` por `6`, el número
visible y el nombre. La entrada 6 se llama **"La profundidad"**, siguiendo la
serie (`El campo · La terminal · El manifiesto · La aurora · La grilla`).

No borrar, no reordenar y no reindentar los cinco existentes: la única
diferencia que puede aparecer en el diff son líneas añadidas.

- [ ] **Step 4: Verificar que renderiza y que se lee sin JavaScript**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 -m http.server 8613 >/dev/null 2>&1 &
sleep 1
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    # sin JavaScript
    ctx = b.new_context(java_script_enabled=False, viewport={"width":1440,"height":900})
    pg = ctx.new_page(); pg.goto("http://localhost:8613/lab/6/"); pg.wait_for_timeout(1500)
    txt = pg.inner_text("body")
    for frase in ["Saber dónde hacerla", "LA HISTORIA", "EL PROBLEMA", "EL MÉTODO",
                  "EL TRABAJO", "QUIÉN ESTÁ DETRÁS", "ian@steinmetz.cl"]:
        print(("OK   " if frase in txt else "FALTA") + f"  {frase}")
    ow = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
    print("desborde-h:", ow)
    pg.screenshot(path="/tmp/lab6-sinjs.png", full_page=True)
    b.close()
PY
```
Expected: siete `OK`, `desborde-h: False`.

Este paso comprueba el criterio 6 de la spec: **el mensaje se lee completo sin JS.**

- [ ] **Step 5: Verificar que no se borró nada**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
git status --porcelain
git diff --stat
```
Expected: `lab/index.html` con líneas **añadidas y cero eliminadas**
(`1 insertion(+)` sin `deletions`), más los archivos nuevos sin trackear.
Si aparece cualquier eliminación, revertir y rehacer la edición como adición.

- [ ] **Step 6: Commit** *(local; no hacer push)*

```bash
git add lab/6/ lab/index.html
git commit -m "feat(lab6): andamio del landing con profundidad, legible sin JS"
```

---

### Task 2: La escena — polvo que sedimenta en la X

**Files:**
- Create: `lab/6/escena.js`
- Modify: `lab/6/index.html` (agregar el import map y la invocación)

**Interfaces:**
- Consumes: `#escena` (el `<canvas>` del hero) y `#escena-cierre` (el `<div>` de
  la sección 05), ambos de la tarea 1.
- Produces: `iniciar()` exportada, devuelve `true` si arrancó, `false` si no hay
  WebGL o si `prefers-reduced-motion` está activo.
- Produces: `window.__escenaFPS` — media móvil de FPS, que la tarea 7 mide.

**Un solo contexto WebGL para los dos momentos.** El renderer es uno; su canvas
se mueve entre el hero y el cierre según cuál esté en viewport, igual que hace
`profundidad.js`. En el cierre la escena entra ya asentada y con la deriva
reducida: el polvo quieto sobre la marca hecha. Nunca hay dos escenas vivas, y
el presupuesto de dos contextos de la spec se respeta.

**Decisión técnica.** No se usa GPGPU con ping-pong de framebuffers. Las
posiciones se calculan **en el vertex shader** a partir de una semilla por
partícula y del tiempo: mismo resultado visual, resolución igualmente infinita,
y una fracción del código y del riesgo. El campo de flujo es trigonométrico en
lugar de curl noise real — a escala de polvo son indistinguibles y cuesta ~8
líneas en vez de ~60.

- [ ] **Step 1: Agregar el import map al `<head>` de `lab/6/index.html`**

```html
<script type="importmap">
{ "imports": { "three": "https://unpkg.com/three@0.180.0/build/three.module.js" } }
</script>
```

- [ ] **Step 2: Escribir `lab/6/escena.js`**

```js
// Capa 0 — el polvo en el haz de luz que sedimenta en la X.
// Sin color: sólo blanco modulado por una key lateral dura con falloff a negro.
import * as THREE from 'three';

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
  return new THREE.Vector3(
    t * 1.15 + grosor,
    t * brazo * 1.15 + polvo,
    (rnd() - 0.5) * 0.12
  );
}

export function iniciar() {
  const canvas = document.getElementById('escena');
  if (!canvas) return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const prueba = document.createElement('canvas');
    if (!(prueba.getContext('webgl2') || prueba.getContext('webgl'))) return false;
  } catch (e) { return false; }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false,
                                             powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));   // cap 2, nunca 3x

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camara.position.set(0, 0, 4.2);

  const n = CANT[nivel()];
  const semillas = new Float32Array(n * 3);
  const destinos = new Float32Array(n * 3);
  const escalas  = new Float32Array(n);
  let s = 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;  // determinista

  for (let i = 0; i < n; i++) {
    semillas[i*3]   = (rnd() - 0.5) * 6;
    semillas[i*3+1] = (rnd() - 0.5) * 4;
    semillas[i*3+2] = (rnd() - 0.5) * 3;
    const d = puntoEnEquis(rnd);
    destinos[i*3] = d.x; destinos[i*3+1] = d.y; destinos[i*3+2] = d.z;
    escalas[i] = 0.5 + rnd() * 1.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(semillas, 3));
  geo.setAttribute('aDestino', new THREE.BufferAttribute(destinos, 3));
  geo.setAttribute('aEscala',  new THREE.BufferAttribute(escalas, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTiempo:   { value: 0 },
      uAsentar:  { value: 0 },      // 0 = polvo suelto, 1 = la X formada
      uPuntero:  { value: new THREE.Vector2(0, 0) },
      uDPR:      { value: Math.min(devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute vec3 aDestino;
      attribute float aEscala;
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

        // Key lateral dura desde la izquierda, falloff a negro. Sin color.
        float key = smoothstep(-1.8, 0.9, p.x);
        float prof = smoothstep(-2.0, 1.5, p.z);
        vLuz = (0.10 + key * 0.90) * (0.45 + prof * 0.55);
      }
    `,
    fragmentShader: `
      varying float vLuz;
      void main(){
        // Partícula redonda con borde suave — grano de tiza, no cuadrado.
        vec2 d = gl_PointCoord - 0.5;
        float a = smoothstep(0.5, 0.12, length(d));
        if (a < 0.01) discard;
        gl_FragColor = vec4(vec3(1.0), a * vLuz * 0.55);
      }
    `,
  });

  const puntos = new THREE.Points(geo, material);
  escena.add(puntos);

  function medir(){
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camara.aspect = r.width / Math.max(r.height, 1);
    camara.updateProjectionMatrix();
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
  let anfitrion = canvas.parentElement, enCierre = false;
  if (cierre) {
    cierre.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
    const seccion = cierre.closest('section');
    if (seccion) seccion.style.position = 'relative';
    new IntersectionObserver(([e]) => {
      enCierre = e.isIntersecting;
      const destino = enCierre ? cierre : anfitrion;
      if (canvas.parentElement !== destino) destino.appendChild(canvas);
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
  function bucle(t){
    requestAnimationFrame(bucle);
    if (!visible) { t0 = t; return; }
    const dt = Math.min((t - t0) / 1000, 0.05); t0 = t;
    acumFPS = acumFPS * 0.9 + (1 / Math.max(dt, 0.001)) * 0.1;
    window.__escenaFPS = acumFPS;

    if (asentando && asentar < 1) asentar = Math.min(1, asentar + dt * 0.28);
    material.uniforms.uAsentar.value = asentar;
    material.uniforms.uTiempo.value += dt;
    material.uniforms.uPuntero.value.x += (objetivo.x - material.uniforms.uPuntero.value.x) * 0.045;
    material.uniforms.uPuntero.value.y += (objetivo.y - material.uniforms.uPuntero.value.y) * 0.045;

    renderer.render(escena, camara);
  }
  requestAnimationFrame(bucle);
  return true;
}
```

- [ ] **Step 3: Invocar la escena desde `index.html`, aislada en `try/catch`**

Agregar antes de `</body>`:

```html
<script type="module">
  try {
    const { iniciar } = await import('./escena.js');
    if (!iniciar()) document.getElementById('escena')?.remove();
  } catch (e) {
    console.warn('escena no disponible:', e);
    document.getElementById('escena')?.remove();
  }
</script>
```

Si la escena no arranca, el canvas se saca del DOM y el hero queda como texto
sobre negro — legible y correcto.

- [ ] **Step 4: Verificar FPS, sedimentación y peso**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width":1440,"height":900})
    pesos = {}
    pg.on("response", lambda r: pesos.__setitem__(r.url.split("/")[-1].split("?")[0],
          int(r.headers.get("content-length") or 0)) if r.status == 200 else None)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8613/lab/6/"); pg.wait_for_timeout(7000)
    print("canvas presente:", pg.locator("#escena").count() == 1)
    print("asentado:", pg.evaluate("window.__escenaFPS !== undefined"))
    print("fps (swiftshader, sólo referencia):", round(pg.evaluate("window.__escenaFPS || 0"), 1))
    js = sum(v for k,v in pesos.items() if k.endswith(".js"))
    print(f"JS transferido: {js/1024:.0f} KB (sin gzip)")
    print("errores:", len(errs), errs[:2])
    b.close()
PY
```
Expected: `canvas presente: True`, `asentado: True`, `errores: 0`.

**El FPS de SwiftShader no sirve como veredicto** — es render por software. La
medición real es el paso siguiente, en el navegador de Ian.

- [ ] **Step 5: Juicio visual en GPU real**

Abrir `http://localhost:8613/lab/6/` en el navegador y confirmar tres cosas:

1. El polvo se suspende y **se asienta solo** en una X reconocible, sin tocar nada.
2. Al mover el mouse la nube se inclina con inercia, sin latigazo.
3. La luz llega **desde la izquierda** con caída a negro a la derecha. Nada de color.

Si la X no se lee, ajustar `puntoEnEquis` (grosor y recorrido). Si el polvo se ve
sucio, bajar `0.55` del `gl_FragColor`. Esta es la puerta estética del proyecto:
si no convence, se para acá y no se arrastra trabajo.

- [ ] **Step 6: Commit** *(local; no hacer push)*

```bash
git add lab/6/escena.js lab/6/index.html
git commit -m "feat(lab6): capa 0 — polvo que sedimenta en la marca de tiza"
```

---

### Task 3: Los mapas de profundidad

**Files:**
- Create: `assets/tools/generar-depthmaps.py`
- Create: `assets/web/depth/*.png` (salida)

**Interfaces:**
- Produces: `assets/web/depth/<nombre>.png` — PNG en escala de grises, mismo
  nombre base que la foto sin el sufijo de ancho. Blanco = cerca, negro = lejos.
- Consume de la tarea 4: los `data-depth` del HTML apuntan exactamente a estas rutas.

- [ ] **Step 1: Instalar la dependencia que falta**

`torch 2.8.0` y `pillow` ya están instalados en la máquina. `transformers` no.

```bash
python3 -m pip install --user transformers
python3 -c "import transformers, torch; print('transformers', transformers.__version__, '· torch', torch.__version__)"
```
Expected: imprime ambas versiones sin error.

- [ ] **Step 2: Escribir el generador**

Crear `assets/tools/generar-depthmaps.py`:

```python
#!/usr/bin/env python3
"""Genera mapas de profundidad de las fotos industriales con Depth-Anything V2.

Uso:  python3 assets/tools/generar-depthmaps.py
Entrada:  assets/web/img/*-1920.webp
Salida:   assets/web/depth/<base>.png   (gris, blanco = cerca)

Corre local en CPU. No toca ninguna imagen existente: solo escribe en depth/.
"""
import re
import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

RAIZ = Path(__file__).resolve().parent.parent.parent
ENTRADA = RAIZ / "assets" / "web" / "img"
SALIDA = RAIZ / "assets" / "web" / "depth"
MODELO = "depth-anything/Depth-Anything-V2-Small-hf"
ANCHO_SALIDA = 960          # el mapa no necesita la resolución de la foto


def base_sin_ancho(nombre: str) -> str:
    """01-marca-tiza-acero-1920.webp -> 01-marca-tiza-acero"""
    return re.sub(r"-\d+$", "", Path(nombre).stem)


def main():
    fotos = sorted(ENTRADA.glob("*-1920.webp"))
    if not fotos:
        sys.exit(f"No hay fotos en {ENTRADA}")

    SALIDA.mkdir(parents=True, exist_ok=True)
    print(f"Cargando {MODELO} (la primera vez descarga ~100 MB)…")
    proc = AutoImageProcessor.from_pretrained(MODELO)
    modelo = AutoModelForDepthEstimation.from_pretrained(MODELO).eval()

    for foto in fotos:
        img = Image.open(foto).convert("RGB")
        with torch.no_grad():
            entradas = proc(images=img, return_tensors="pt")
            prof = modelo(**entradas).predicted_depth

        prof = torch.nn.functional.interpolate(
            prof.unsqueeze(1), size=img.size[::-1], mode="bicubic",
            align_corners=False).squeeze()

        a = prof.numpy()
        a = (a - a.min()) / max(a.max() - a.min(), 1e-6)     # 0..1, cerca = 1
        mapa = Image.fromarray((a * 255).astype(np.uint8), mode="L")

        alto = round(ANCHO_SALIDA * img.size[1] / img.size[0])
        mapa = mapa.resize((ANCHO_SALIDA, alto), Image.LANCZOS)

        destino = SALIDA / f"{base_sin_ancho(foto.name)}.png"
        mapa.save(destino, optimize=True)
        kb = destino.stat().st_size / 1024
        print(f"  {foto.name}  ->  {destino.name}  ({kb:.0f} KB)")

    print(f"\nListo: {len(fotos)} mapa(s) en {SALIDA}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Correrlo**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 assets/tools/generar-depthmaps.py
ls -la assets/web/depth/
```
Expected: un PNG por foto de 1920, cada uno bajo 120 KB.

- [ ] **Step 4: Revisar los mapas uno por uno**

Abrir cada PNG de `assets/web/depth/` junto a su foto y juzgar:

- **`01-marca-tiza-acero`** — la marca de tiza tiene que salir **más clara** que
  la placa de fondo. Si sale plana, esta foto se sirve sin profundidad.
- **`02-nave-estanques`** — las columnas del frente claras, el fondo de la nave
  oscuro. Es la que más tiene que ganar.
- **`05-cenital-placa-x`** — cenital: es probable que salga casi plana. Si es
  así, **no se usa** y se declara.

Anotar el veredicto por foto. Un mapa malo no se corrige a mano: esa foto se
sirve plana y listo. Es preferible una foto plana que una foto que se deforma mal.

- [ ] **Step 5: Commit** *(local; no hacer push)*

```bash
git add assets/tools/generar-depthmaps.py assets/web/depth/
git commit -m "feat(assets): generador de mapas de profundidad con Depth-Anything V2"
```

---

### Task 4: La fotografía con volumen

**Files:**
- Create: `lab/6/profundidad.js`
- Modify: `lab/6/index.html` (invocación)

**Interfaces:**
- Consumes: `[data-foto-profundidad]` con `data-src` y `data-depth` (tarea 1),
  y los PNG de `assets/web/depth/` (tarea 3).
- Produces: `iniciar()` exportada, devuelve la cantidad de figuras convertidas.
- Produces: **un único contexto WebGL compartido** por todas las figuras — el
  presupuesto de la spec es dos contextos en total, y la escena ya usa uno.

- [ ] **Step 1: Escribir `lab/6/profundidad.js`**

```js
// Capa 1 — la foto gana volumen: los UV se desplazan según el mapa de
// profundidad siguiendo el puntero. Un solo canvas para todas las figuras.
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

  const cargador = new THREE.TextureLoader();
  const escena = new THREE.Scene();
  const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  } catch (e) { return 0; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const lienzo = renderer.domElement;
  lienzo.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';

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
        uFuerza: { value: 0.035 },     // desplazamiento máximo en UV
      },
    });

    let listas = 0;
    const alListo = () => {
      if (++listas < 2) return;
      const img = fig.querySelector('img');
      if (img) img.style.visibility = 'hidden';   // se oculta, NO se elimina
      fig.style.position = 'relative';
      items.push({ fig, material, objetivo: { x: 0, y: 0 } });
      convertidas++;
    };
    cargador.load(src,   (t) => { material.uniforms.uFoto.value = t; alListo(); },
                  undefined, () => {});
    cargador.load(depth, (t) => { material.uniforms.uProf.value = t; alListo(); },
                  undefined, () => {});
  }

  const plano = new THREE.PlaneGeometry(2, 2);
  const malla = new THREE.Mesh(plano, new THREE.MeshBasicMaterial());
  escena.add(malla);

  addEventListener('pointermove', (e) => {
    for (const it of items) {
      const r = it.fig.getBoundingClientRect();
      it.objetivo.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      it.objetivo.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
  }, { passive: true });

  let visible = new Set();
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
      renderer.setSize(r.width, r.height, false);
      if (lienzo.parentElement !== it.fig) it.fig.appendChild(lienzo);
      malla.material = it.material;
      renderer.render(escena, camara);
      // El canvas se pinta por figura y se copia al vuelo: un solo contexto.
      const copia = it.fig.querySelector('canvas[data-copia]') || (() => {
        const c = document.createElement('canvas');
        c.dataset.copia = '1';
        c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
        it.fig.appendChild(c); return c;
      })();
      copia.width = lienzo.width; copia.height = lienzo.height;
      copia.getContext('2d').drawImage(lienzo, 0, 0);
    }
  }
  requestAnimationFrame(bucle);
  return convertidas;
}
```

- [ ] **Step 2: Invocar desde `index.html`, aislado**

Agregar dentro del mismo `<script type="module">`, después de la escena:

```js
  try {
    const { iniciar } = await import('./profundidad.js');
    const n = iniciar();
    console.info('fotos con volumen:', n);
  } catch (e) { console.warn('profundidad no disponible:', e); }
```

Si falla, los `<img>` quedan visibles y las fotos se ven planas: correcto.

- [ ] **Step 3: Verificar que el puntero la mueve y el scroll no**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://localhost:8613/lab/6/"); pg.wait_for_timeout(5000)
    pg.locator("#historia").scroll_into_view_if_needed(); pg.wait_for_timeout(1500)

    # el puntero cambia el render
    pg.mouse.move(300, 400); pg.wait_for_timeout(700)
    a = pg.locator("#historia figure").screenshot()
    pg.mouse.move(1100, 400); pg.wait_for_timeout(900)
    c = pg.locator("#historia figure").screenshot()
    print("el puntero mueve la foto:", a != c)

    # el scroll NO cambia el render con el puntero quieto
    d = pg.locator("#historia figure").screenshot()
    pg.mouse.wheel(0, 120); pg.wait_for_timeout(700)
    pg.mouse.wheel(0, -120); pg.wait_for_timeout(900)
    e = pg.locator("#historia figure").screenshot()
    print("el scroll NO la mueve:", d == e)
    b.close()
PY
```
Expected: `el puntero mueve la foto: True` y `el scroll NO la mueve: True`.

La segunda aserción es la que protege el principio de la spec.

- [ ] **Step 4: Commit** *(local; no hacer push)*

```bash
git add lab/6/profundidad.js lab/6/index.html
git commit -m "feat(lab6): capa 1 — fotografía con volumen por mapa de profundidad"
```

---

### Task 5: El medio — multiplano y trazo

**Files:**
- Create: `lab/6/multiplano.js`
- Modify: `lab/6/index.html` (invocación)

**Interfaces:**
- Consumes: `[data-multiplano]` con hijos `.capa[data-z]`, y `[data-trazo]`
  (SVG con `path[pathLength="1"]`) — ambos de la tarea 1.
- Produces: `iniciar()` exportada, devuelve `true` si arrancó.
- El trazo del SVG se dispara **al entrar en viewport**, animando sólo
  `stroke-dashoffset`. No se ata a la posición de scroll.

- [ ] **Step 1: Escribir `lab/6/multiplano.js`**

```js
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
          `translateZ(${z * 14}px) translate3d(${s.x * amp}px, ${s.y * amp}px, 0)`;
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
```

- [ ] **Step 2: Invocar desde `index.html`**

```js
  try {
    const { iniciar } = await import('./multiplano.js');
    iniciar();
  } catch (e) { console.warn('multiplano no disponible:', e); }
```

- [ ] **Step 3: Verificar amplitud y trazo**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://localhost:8613/lab/6/"); pg.wait_for_timeout(1500)
    pg.locator("#problema").scroll_into_view_if_needed(); pg.wait_for_timeout(2200)

    off = pg.eval_on_selector_all("[data-trazo] path",
        "els => els.map(e => getComputedStyle(e).strokeDashoffset)")
    print("trazo dibujado (esperado ~0):", off)

    pg.mouse.move(200, 400); pg.wait_for_timeout(800)
    t1 = pg.eval_on_selector_all("#problema .capa", "e=>e.map(x=>getComputedStyle(x).transform)")
    pg.mouse.move(1200, 400); pg.wait_for_timeout(900)
    t2 = pg.eval_on_selector_all("#problema .capa", "e=>e.map(x=>getComputedStyle(x).transform)")
    print("las capas se mueven:", t1 != t2)

    import re
    val = [abs(float(v)) for m in t2 for v in re.findall(r'-?\d+\.?\d*', m)[-3:-1]]
    print(f"desplazamiento máximo: {max(val):.1f}px (tope 6)")
    b.close()
PY
```
Expected: `strokeDashoffset` cerca de `0`, `las capas se mueven: True`,
desplazamiento máximo ≤ 6 px.

- [ ] **Step 4: Commit** *(local; no hacer push)*

```bash
git add lab/6/multiplano.js lab/6/index.html
git commit -m "feat(lab6): capa 2 — multiplano por puntero y trazo de la X"
```

---

### Task 6: La orquesta — carga, Lenis y contadores

**Files:**
- Create: `lab/6/orquesta.js`
- Modify: `lab/6/index.html` (import map e invocación)

**Interfaces:**
- Consumes: `.revelar` (tarea 1), `[data-contador]` con `data-hasta` y `data-prefijo`.
- Produces: `iniciar()` exportada, devuelve `true` si arrancó.
- **Lenis se configura sin `wrapper`/`content` y sin `ScrollTrigger`**: suaviza
  la rueda, no controla la posición.

- [ ] **Step 1: Ampliar el import map**

```html
<script type="importmap">
{ "imports": {
  "three": "https://unpkg.com/three@0.180.0/build/three.module.js",
  "lenis": "https://unpkg.com/lenis@1.1.18/dist/lenis.mjs",
  "gsap": "https://unpkg.com/gsap@3.13.0/index.js",
  "gsap/SplitText": "https://unpkg.com/gsap@3.13.0/SplitText.js"
} }
</script>
```

- [ ] **Step 2: Escribir `lab/6/orquesta.js`**

```js
// Capa 3 — el sitio se presenta solo: timeline de carga, scroll con peso,
// y las cifras que suben. Nada acá lee la posición del scroll.
import Lenis from 'lenis';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

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
    const lineas = document.querySelectorAll('.hero__titulo span');
    const partes = [...lineas].map((l) => new SplitText(l, { type: 'lines' }));
    const tl = gsap.timeline({ delay: 0.25 });
    partes.forEach((p, i) => {
      tl.from(p.lines, {
        yPercent: 110, opacity: 0, duration: 0.9,
        ease: 'power3.out', stagger: 0.06,
      }, i * 0.13);
    });
    tl.from('.hero__acciones', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35');
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
```

- [ ] **Step 3: Invocar desde `index.html`**

```js
  try {
    const { iniciar } = await import('./orquesta.js');
    iniciar();
  } catch (e) { console.warn('orquesta no disponible:', e); }
```

- [ ] **Step 4: Verificar que el hero se presenta solo y el scroll queda libre**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://localhost:8613/lab/6/")

    # el hero se revela sin tocar el scroll
    pg.wait_for_timeout(400)
    o1 = pg.eval_on_selector(".hero__acciones", "e=>+getComputedStyle(e).opacity")
    pg.wait_for_timeout(2600)
    o2 = pg.eval_on_selector(".hero__acciones", "e=>+getComputedStyle(e).opacity")
    print(f"el hero se presenta solo: {o1:.2f} -> {o2:.2f}", "OK" if o2 > 0.9 else "FALLA")

    # el scroll llega al fondo sin retenciones
    alto = pg.evaluate("document.body.scrollHeight - innerHeight")
    pg.evaluate(f"scrollTo(0,{alto})")
    pg.wait_for_timeout(2500)
    y = pg.evaluate("scrollY")
    print(f"scroll libre: {y:.0f}/{alto} ", "OK" if y >= alto - 30 else "FALLA — algo lo retiene")

    print("contador:", pg.eval_on_selector("[data-contador]", "e=>e.textContent"))
    b.close()
PY
```
Expected: opacidad final > 0.9, el scroll llega al fondo, el contador muestra
`$9.999`.

- [ ] **Step 5: Commit** *(local; no hacer push)*

```bash
git add lab/6/orquesta.js lab/6/index.html
git commit -m "feat(lab6): capa 3 — timeline de carga, scroll con peso y contadores"
```

---

### Task 7: Degradación, presupuestos y `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md` (agregar sección; no borrar nada)
- Create: `lab/6/VERIFICACION.md` (registro de las mediciones)

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: Verificar los cinco fallbacks de la spec**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 - <<'PY'
from playwright.sync_api import sync_playwright
U = "http://localhost:8613/lab/6/"
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    # 1 · prefers-reduced-motion
    c = b.new_context(reduced_motion="reduce", viewport={"width":1440,"height":900})
    pg = c.new_page(); pg.goto(U); pg.wait_for_timeout(2500)
    print("reduced-motion · canvas retirado:", pg.locator("#escena").count() == 0)
    print("reduced-motion · texto visible:",
          pg.eval_on_selector(".hero__acciones", "e=>+getComputedStyle(e).opacity") > 0.9)
    c.close()

    # 2 · sin JavaScript
    c = b.new_context(java_script_enabled=False, viewport={"width":1440,"height":900})
    pg = c.new_page(); pg.goto(U); pg.wait_for_timeout(800)
    print("sin JS · mensaje legible:", "Saber dónde hacerla" in pg.inner_text("body"))
    c.close()

    # 3 · móvil
    c = b.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    pg = c.new_page(); pg.goto(U); pg.wait_for_timeout(4000)
    print("móvil · sin desborde horizontal:",
          not pg.evaluate("document.documentElement.scrollWidth > innerWidth + 1"))
    c.close()

    # 4 · sin los mapas de profundidad (se bloquea la carpeta depth/)
    c = b.new_context(viewport={"width":1440,"height":900})
    pg = c.new_page()
    pg.route("**/assets/web/depth/**", lambda r: r.abort())
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(3500)
    pg.locator("#historia").scroll_into_view_if_needed(); pg.wait_for_timeout(1200)
    print("sin mapas · la foto se ve igual:",
          pg.eval_on_selector("#historia img", "e=>getComputedStyle(e).visibility") == "visible")
    print("sin mapas · sin errores:", len(errs) == 0)
    c.close()
    b.close()
PY
```
Expected: las seis líneas en `True`.

El caso 5 (sin WebGL) queda cubierto por la rama `return false` de `escena.js`,
que el caso 1 ya ejercita al retirar el canvas.

- [ ] **Step 2: Medir los presupuestos**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
python3 - <<'PY'
import gzip, io
from playwright.sync_api import sync_playwright
recursos = {}
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width":1440,"height":900})
    def anotar(r):
        try:
            if r.status == 200 and (r.url.endswith(".js") or ".mjs" in r.url):
                recursos[r.url] = len(gzip.compress(r.body()))
        except Exception: pass
    pg.on("response", anotar)
    pg.goto("http://localhost:8613/lab/6/", wait_until="networkidle")
    pg.wait_for_timeout(4000)
    lcp = pg.evaluate("""() => new Promise(r => {
        new PerformanceObserver(l => { const e=l.getEntries(); r(e[e.length-1].startTime); })
          .observe({type:'largest-contentful-paint', buffered:true});
        setTimeout(()=>r(-1), 2000); })""")
    b.close()
tot = sum(recursos.values())
print(f"JS total gzip: {tot/1024:.0f} KB   (tope 250)  {'OK' if tot < 250*1024 else 'EXCEDIDO'}")
for u, s in sorted(recursos.items(), key=lambda x: -x[1])[:6]:
    print(f"   {s/1024:6.0f} KB  {u.split('/')[-1]}")
print(f"LCP: {lcp:.0f} ms   (tope 2000)  {'OK' if 0 < lcp < 2000 else 'revisar'}")
PY
```
Expected: JS gzip < 250 KB. Si se excede, importar three.js por submódulos en
lugar del bundle entero, o bajar el conteo de partículas.

- [ ] **Step 3: Medir FPS en GPU real**

Este paso lo corre Ian en su navegador, no headless:

1. Abrir `http://localhost:8613/lab/6/`.
2. Abrir la consola y escribir `__escenaFPS` después de 10 segundos.
3. Anotar el valor.

Expected: ≥ 58. Si está por debajo, bajar `CANT.alta` de 60.000 a 40.000 en
`escena.js` y volver a medir.

- [ ] **Step 4: Escribir `lab/6/VERIFICACION.md` con los resultados reales**

Rellenar con los números medidos en los pasos 1–3. **Si un valor no se midió, se
escribe "no medido" — no se estima.**

```markdown
# Verificación — lab/6

_Medido el YYYY-MM-DD. Comandos en `docs/2026-08-13-plan-landing-profundidad.md`,
tarea 7._

## Presupuestos

| Presupuesto | Tope | Medido | Veredicto |
|---|---|---|---|
| JS total gzip | 250 KB | | |
| LCP | 2 s | | |
| FPS sostenido (GPU real) | 60 | | |
| DPR | cap 2 | 2 | OK |

Desglose de JS por recurso:

| Recurso | KB gzip |
|---|---|

## Degradación

| Caso | Esperado | Resultado |
|---|---|---|
| `prefers-reduced-motion` | canvas retirado, texto visible | |
| Sin JavaScript | mensaje legible completo | |
| Móvil 390px | sin desborde horizontal | |
| Sin mapas de profundidad | foto plana, sin errores | |
| Sin WebGL | hero como texto sobre negro | |

## Mapas de profundidad

| Foto | Mapa | Veredicto | Se usa |
|---|---|---|---|
| 01-marca-tiza-acero | | | |
| 02-nave-estanques | | | |
| 05-cenital-placa-x | | | |

## Scroll libre

| Comprobación | Resultado |
|---|---|
| La foto se mueve con el puntero | |
| La foto NO se mueve con el scroll | |
| El scroll llega al fondo sin retención | |

## Pendientes y desvíos

_Lo que no cerró y por qué. Un número honesto vale más que un número que cierra._
```

Es el registro que permite decidir con datos si `lab/6` se promueve a la raíz.

- [ ] **Step 5: Agregar la sección de revisión a `CLAUDE.md`**

**No borrar ni reescribir ninguna línea existente.** Agregar al final:

```markdown
## Revisión de la regla de movimiento — 2026-08-13

La sección "Sistema visual" de más arriba dice *"un solo momento animado ·
sin parallax, sin translate, sin spring · GSAP ScrollTrigger fue rechazado —
no reintentar"*. Ese texto refleja el estado del sitio en la raíz y **sigue
siendo válido para `index.html`**. Para el trabajo de `lab/6` en adelante,
esta es la regla vigente, de `docs/2026-08-13-spec-landing-profundidad.md`:

- **Lo prohibido es atar narrativa a la posición del scroll**, no animar. Esa
  prohibición se mantiene con toda su fuerza: fue el error del landing muerto.
- **GSAP como orquestador de la timeline de carga: permitido.** GSAP
  ScrollTrigger controlando el scroll: no.
- **Lenis: permitido.** Suaviza la rueda, no controla la posición.
- Los disparadores válidos son tres: la carga, el puntero y el loop ambiental.
  La entrada en viewport se admite sólo para opacidad.
- La regla "un solo momento animado" queda superada, para `lab/6`, por el
  presupuesto de capas de §3 y §4 de la spec.
- Sigue vigente sin cambios: **sin color de acento**, blanco sobre `#0a0a0a`,
  Inter + IBM Plex Mono, sin caras, grano global.

**Corrección de dato:** el copy del hero que cita este archivo más arriba es de
una versión anterior. El del sitio en vivo es: *"Hacer la marca cuesta $1.
Saber dónde hacerla: $9.999. Steinmetz es saber dónde."*
```

- [ ] **Step 6: Comprobar que no se borró nada en todo el trabajo**

```bash
cd /Users/ianberndt/Desktop/Steinmetz
echo "--- archivos que existían y siguen existiendo ---"
for f in index.html style.css main.js CNAME CLAUDE.md \
         lab/1/index.html lab/2/index.html lab/3/index.html \
         lab/4/index.html lab/5/index.html; do
  [ -f "$f" ] && echo "OK    $f" || echo "FALTA $f"
done
echo "--- frames del hero ---"
echo "frames: $(ls assets/web/frames 2>/dev/null | wc -l | tr -d ' ')"
echo "--- eliminaciones en archivos versionados ---"
git diff --numstat HEAD -- CLAUDE.md lab/index.html
```
Expected: once `OK`, los frames intactos, y en `git diff --numstat` la columna
de eliminaciones en **0** para ambos archivos.

- [ ] **Step 7: Commit final** *(local; no hacer push)*

```bash
git add CLAUDE.md lab/6/VERIFICACION.md
git commit -m "docs(lab6): verificacion de presupuestos y revision de la regla de movimiento"
```

---

## Notas para quien ejecute

- **La tarea 2, paso 5 es la puerta del proyecto.** Si el polvo no se lee como
  una X, o se ve como un efecto de plantilla, hay que parar ahí. Todo lo demás
  depende de que esa escena convenza, y es barato descartarla en ese punto.
- **El scroll es la línea roja.** Cualquier cosa que lo retenga, lo acelere o lo
  frene está fuera de la spec, por linda que se vea. La aserción del paso 3 de la
  tarea 4 y la del paso 4 de la tarea 6 existen para atrapar exactamente eso.
- **Un mapa de profundidad malo no se arregla a mano.** Esa foto se sirve plana.
  Es preferible una foto plana a una foto que se deforma mal.
- **`steinmetz.cl` no se toca.** Ningún paso de este plan modifica lo que sirve
  la raíz, y ningún paso hace `push`. La promoción de `lab/6` es una decisión
  posterior de Ian, con su propio plan.
- Si un presupuesto se excede y no hay forma limpia de bajarlo, **reportarlo en
  `VERIFICACION.md` en lugar de recortar en silencio.** Un número honesto vale
  más que un número que cierra.
