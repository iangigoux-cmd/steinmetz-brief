# Investigación — motion graphics, 3D y profundidad: qué puedo producir yo

_2026-08-07 · Investigación solicitada por Ian antes de rediseñar el landing.
Nada de esto está construido; es el mapa de lo posible, con veredicto por técnica._

**La pregunta:** cómo produce Claude —escribiendo código y generando assets—
animaciones del registro de Palantir/Anduril/Linear/Metalab: motion graphics,
objetos con volumen 3D, sensación de profundidad, landing construido en capas.

**El principio rector que sale de la autopsia del intento anterior:** en los
sitios de referencia el movimiento **se reproduce solo** — reveals escalonados
al cargar, loops ambientales que respiran, respuesta al puntero, hovers. El
scroll siempre queda libre; nunca es un control. El error del landing muerto no
fue animar: fue cobrar el scroll. Toda técnica de este documento respeta esa
regla.

---

## 1. Resumen ejecutivo — la matriz

| # | Técnica | Qué logra | ¿La produzco yo end-to-end? | Veredicto |
|---|---|---|---|---|
| A | **3D real en el navegador** (three.js) | Objetos con volumen, luz, partículas, shaders. Resolución infinita | ✅ Sí, completo | **La apuesta principal** |
| B | **2.5D por mapa de profundidad** (foto + IA + shader) | La foto industrial cobra profundidad y responde al puntero | ✅ Sí, completo (torch ya instalado) | **La segunda arma. Único, barato, espectacular** |
| C | **Capas multiplano** (recortes + CSS 3D + puntero) | Depth feeling sin WebGL, degradación elegante | ✅ Sí | Complemento de A/B y fallback |
| D | **Motion graphics 2D programático** (SVG/canvas/GSAP) | Tipografía viva, líneas que se trazan, datos que cuentan | ✅ Sí | Obligatoria: es la capa de "artesanía Linear" |
| E | **CSS moderno** (scroll-driven, view(), @property) | Reveals y fades que corren en el compositor, cero jank | ✅ Sí | Sí, para lo sutil — nunca para narrar |
| F | **Lottie / Rive** | Animación vectorial de autor | ❌ Requieren After Effects / editor Rive | Descartada para mí |
| G | **Video como capa o textura** (Veo→ESRGAN, ya dominado) | Atmósfera fotorreal en loop | ✅ Sí (pipeline ya construido) | Ambiente, ya no protagonista |
| H | **Blender headless** (bpy por CLI) | Objetos 3D pre-renderizados con control total de cámara/luz | ⚠️ Sí, si se instala Blender (yo escribo la escena en Python) | Reserva — A la reemplaza en casi todo |

---

## 2. Familia A — 3D real en el navegador

**Estado 2026.** three.js corre con `WebGPURenderer`, que **cae automáticamente
a WebGL2** cuando no hay WebGPU — un solo código para todos los navegadores.
Se sirve por CDN con import maps, sin build. Los materiales se escriben en TSL
(node-based) que compila a WGSL o GLSL según el navegador
([guía de migración](https://www.utsubo.com/blog/webgpu-threejs-migration-guide),
[import maps](https://sbcode.net/threejs/importmap/),
[TSL](https://sbcode.net/tsl/getting-started/)).

**Qué sé hacer con esto, concretamente:**

- **Geometría paramétrica**: una tiza es un cilindro con displacement de ruido
  y material poroso — la modelo en código, sin Blender. Placas de acero,
  terrenos, estructuras: todo lo geométrico simple.
- **Partículas GPGPU**: cientos de miles de partículas computadas en GPU con
  curl noise. **El polvo de tiza procedural en tiempo real** — y acá está el
  insight más importante de toda la investigación: *un sistema de partículas
  renderizado en vivo tiene resolución infinita*. Se acabó para siempre el
  problema "no se ve HD": no hay pixeles de video que estirar, se dibuja a la
  resolución exacta de tu pantalla, retina incluida.
- **Shaders custom** (GLSL/TSL): humo, desplazamientos, reveals materiales.
- **Postproceso**: bloom sutil, viñeta, grano de película, aberración — el
  grade cinematográfico que hoy hacemos en las fotos, aplicado en vivo.
- **Luz**: key dura lateral + falloff a negro — el ADN visual actual, pero
  respondiendo al puntero en tiempo real.

**Modelos complejos** (si algún día se quiere un generador Ford de 1920): no
los esculpo yo. Caminos: procedural (suficiente para tiza/placas/abstracto),
bibliotecas CC0 (Poly Haven), o generadores imagen→3D (Meshy/Tripo, los maneja
Ian y yo integro el GLTF con compresión DRACO/KTX2).

**Riesgos y disciplina:** presupuesto JS < 250 KB gzip; DPR cap 2; pausar el
render loop fuera de viewport y en pestaña oculta; degradar partículas en
móvil; `prefers-reduced-motion` → cuadro estático. Rendimiento validable con
Playwright midiendo FPS ([100 tips de three.js](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).

---

## 3. Familia B — 2.5D por mapa de profundidad

La técnica detrás del modo retrato de Apple, llevada a web
([Codrops: scanning con depth maps](https://tympanus.net/codrops/2025/03/31/webgpu-scanning-effect-with-depth-maps/),
[parallax por depth map](https://www.arpatech.com/blog/give-3d-parallax-effect-to-the-2d-images-using-depth-map/)):

1. **Foto** — las que ya generamos con Gemini (nave, testigos, roca…).
2. **Mapa de profundidad por IA** — [Depth-Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small)
   corre local en CPU; **PyTorch 2.8 ya está instalado en esta máquina**, y
   existe [versión ONNX de 99 MB](https://huggingface.co/onnx-community/depth-anything-v2-small)
   como alternativa. Yo corro el modelo, yo produzco el mapa.
3. **Shader de displacement** — un quad en three.js (o OGL, 30 KB) desplaza los
   UV según profundidad, siguiendo el puntero (desktop) o el giroscopio (móvil).

**Resultado:** la fotografía industrial —que era lo mejor del landing muerto—
deja de ser un fondo plano: la nave de estanques tiene aire entre las columnas,
la pared de roca se adelanta a las marcas de tiza. Profundidad real percibida,
con una foto y un mapa de 50 KB. Movida por puntero, jamás por scroll.

Es la técnica con mejor relación espectáculo/costo de toda la matriz, y casi
nadie la usa bien: diferenciación inmediata.

---

## 4. Familia C — capas multiplano

El "layer based landing" clásico, sin WebGL:

- **Recortes con alpha**: `rembg` local (pip) para separar sujeto/fondo de las
  fotos generadas. Y un truco que ya validamos sin saberlo: cualquier material
  filmado sobre negro (el polvo, la tiza de Veo) se compone gratis con
  `mix-blend-mode: screen` — el negro desaparece, sin canal alfa.
- **Video con alfa real** cuando haga falta: WebM VP9 + canal alpha (Chrome/FF)
  y HEVC alpha vía ffmpeg/videotoolbox en esta máquina (Safari).
- **Escenario CSS 3D**: `perspective` + `translateZ` por capa, 4-6 capas
  (fondo/medio/sujeto/atmósfera/texto), movidas 2-6px por el puntero con
  inercia. Barato, universal, degrada perfecto.

---

## 5. Familia D — motion graphics 2D programático

La capa de artesanía que hace que un sitio se sienta "Linear":

- **GSAP es 100% gratis desde 2025** — Webflow liberó todo el ecosistema,
  incluidos SplitText, MorphSVG, ScrollSmoother, para uso comercial
  ([anuncio](https://webflow.com/blog/gsap-becomes-free),
  [CSS-Tricks](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/),
  [demos de plugins](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)).
  Timelines de carga orquestadas, texto que entra por líneas con máscara,
  contadores. *(La prohibición histórica del proyecto era a ScrollTrigger como
  secuestrador de scroll — GSAP como orquestador de carga es otra cosa.)*
- **SVG**: la X de tiza trazándose (`stroke-dasharray`), `feTurbulence` como
  displacement para el borde polvoriento — la marca como vector animado,
  nítida a cualquier tamaño.
- **Canvas 2D**: ruido, líneas técnicas, grids que respiran.

---

## 6. Familia E — CSS moderno (2026)

- **Scroll-driven animations** son [Baseline](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations):
  Chrome/Edge 115+, Firefox 132+, Safari 18+ (~84% global). Corren **en el
  compositor** — cero jank aunque el main thread esté ocupado. Con
  `@supports (animation-timeline: scroll())` el resto degrada limpio.
- `animation-timeline: view()` reemplaza IntersectionObserver para fades de
  entrada.
- **La regla de uso**: opacidad y micro-movimientos al entrar secciones — lo
  que hacía el sitio muerto con JS, ahora gratis y más suave. **Nunca** para
  atar una narrativa al scroll.

---

## 7. Qué usan de verdad los sitios de referencia

Registro honesto (patrón observable, no ingeniería inversa verificada):
**video loops cinematográficos** que se reproducen solos + **type reveals
escalonados** al cargar + **WebGL puntual** (una escena, un canvas, un
momento) + **micro-interacciones impecables**. Ninguno construye la página
como una película controlada por scroll. La sofisticación está en la
orquestación de la carga y en la calidad material de cada capa, no en la
mecánica.

---

## 8. Arquitectura propuesta para Steinmetz v2 (para discutir, no construida)

```
CAPA 0  fondo        escena three.js (WebGPU→WebGL2): polvo GPGPU en un haz
                     de luz, o quad 2.5D de foto con depth map. Responde al
                     puntero. Pausada fuera de viewport. ~200KB JS.
CAPA 1  atmósfera    grano + viñeta (CSS/postpro)
CAPA 2  contenido    tipografía — reveal escalonado al cargar (GSAP timeline),
                     fades por sección con CSS view()
CAPA 3  micro        hovers precisos, cursor states, contadores
FALLBACKS            reduced-motion → still · sin WebGL → foto + capas CSS ·
                     móvil → partículas reducidas o multiplano CSS
```

**Presupuestos:** LCP < 2s, JS total < 250 KB gz, 60 fps sostenido, scroll
100% libre.

**Siguiente paso propuesto:** una demo de UNA pantalla que valide la capa 0
(las dos variantes: partículas procedurales vs foto 2.5D) antes de discutir
identidad, copy o estructura. Ver el material en movimiento primero, decidir
la marca después.

---

## 9. Censo de librerías — qué cambia un landing de verdad (estado 2026)

### Nivel 1 · Cambian la sensación del sitio entero

| Librería | Peso | Qué cambia | Nota |
|---|---|---|---|
| **[Lenis](https://cssauthor.com/best-javascript-scroll-animation-scrollytelling-libraries/)** | ~3 KB | Scroll con inercia y easing — la señal más barata de "sitio caro" que existe. Es el default de los sitios premiados | No secuestra: el scroll sigue libre, solo se suaviza. Compatible con sticky |
| **[GSAP 3.13+](https://gsap.com/blog/3-13/)** | ~70 KB | El motor de orquestación: timelines de carga, SplitText (texto por líneas/letras con máscara), Flip | **Gratis total desde 2025**, plugins premium incluidos |
| **three.js WebGPU** | ~170 KB | La familia A completa: 3D real, partículas, shaders | Ver §2 |

La combinación Lenis + Motion/GSAP + WebGL puntual es literalmente [el stack
descrito para los sitios premiados 2026](https://www.timace.io/best/best-animation-libraries).

### Nivel 2 · Un momento "wow" específico

| Librería | Qué logra | Cuándo usarla |
|---|---|---|
| **OGL** (~30 KB) | WebGL mínimo: un plano con shader | El quad 2.5D de profundidad sin cargar three.js entero |
| **curtains.js** | Convierte `<img>` del DOM en planos WebGL sincronizados con el layout | Fotos que se deforman al hover o según velocidad de scroll — "las fotos reaccionan" |
| **pixi.js v8** | Compositor 2D WebGPU con displacement filters | La vía rápida al parallax por depth map |
| **postprocessing (pmndrs)** | Bloom, grano, DOF, viñeta de calidad cine para three.js | El grade fotográfico aplicado a la escena viva |
| **[Theatre.js](https://z.tools/explore/unicorn-studio)** | Editor de keyframes EN el navegador para animación por código | Autorear la secuencia del hero visualmente, exportar JSON |

### Nivel 3 · Herramientas visuales que Ian puede manejar y yo integrar

| Herramienta | Qué es | Caveat |
|---|---|---|
| **[Unicorn Studio](https://www.unicorn.studio/docs/)** | Editor no-code de efectos WebGL (70+ efectos: fluidos, distorsiones, ruido reactivo al puntero), exporta embed/SDK liviano | Los efectos son de catálogo — otros sitios usan los mismos. Útil para explorar; lo distintivo se hace a mano |
| **[Spline](https://splinetime3d.substack.com/p/spline-womp-and-unicorn-studio-updates)** | Editor 3D visual con viewer web embebible | Runtime pesado; mejor para prototipar la escena y después replicarla en three.js |

### Con cuidado o evitar

- **fullPage.js / Locomotive Scroll** — secuestran el scroll. Es exactamente la
  lección de la v1. Lenis los reemplaza sin el secuestro.
- **Vanta.js / particles.js / tsparticles** — fondos de plantilla; se leen como
  template de agencia. El polvo nuestro se escribe como shader propio.
- **AOS** — el fade-on-scroll de 2018; CSS `view()` lo hace nativo hoy.
- **Lottie/Rive** — requieren autoría en editor (AE/Rive); fuera de mi alcance
  end-to-end, ver §1.

### El stack que recomiendo para Steinmetz v2

```
Lenis (3KB)               scroll con peso físico
GSAP + SplitText (70KB)   orquestación de carga: el sitio se presenta solo
three.js WebGPU (170KB)   UNA escena viva: polvo GPGPU o quad 2.5D con
                          depth map, respondiendo al puntero
CSS view()                fades de sección en el compositor, cero JS
─────────────────────────────────────────────────────────
~250 KB gz total · scroll libre siempre · reduced-motion → still
```

---

## Fuentes

- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [guía 2026](https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026)
- [Webflow — GSAP 100% free](https://webflow.com/blog/gsap-becomes-free) · [CSS-Tricks](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/) · [GSAP 3.13](https://gsap.com/blog/3-13/) · [Codrops plugins demos](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)
- [Depth-Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small) · [ONNX community](https://huggingface.co/onnx-community/depth-anything-v2-small) · [Depth-Anything-ONNX](https://github.com/fabio-sim/Depth-Anything-ONNX)
- [Migración WebGPU three.js 2026](https://www.utsubo.com/blog/webgpu-threejs-migration-guide) · [100 tips de performance](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · [import maps](https://sbcode.net/threejs/importmap/) · [TSL](https://sbcode.net/tsl/getting-started/)
- [Codrops — WebGPU scanning con depth maps](https://tympanus.net/codrops/2025/03/31/webgpu-scanning-effect-with-depth-maps/) · [depth map parallax](https://www.arpatech.com/blog/give-3d-parallax-effect-to-the-2d-images-using-depth-map/) · [awwwards parallax](https://www.awwwards.com/websites/parallax/)
