# Verificación — lab/6

_Medido el 2026-08-13. Comandos en `docs/2026-08-13-plan-landing-profundidad.md`,
tarea 7. Todo lo de acá está medido; lo que no se midió dice "no medido"._

## Presupuestos

| Presupuesto | Tope | Medido | Veredicto |
|---|---|---|---|
| JS total gzip | 250 KB | **119 KB** | OK |
| LCP | 2 s | **104 ms** | OK |
| FPS sostenido (GPU real) | 60 | **no medido** | Pendiente de Ian, ver abajo |
| DPR | cap 2 | 2 | OK |

Desglose de JS, gzip:

| Recurso | KB |
|---|---|
| gsap-core.js | 49,1 |
| ogl.mjs | 38,0 |
| CSSPlugin.js | 18,2 |
| lenis.mjs | 5,7 |
| escena.js | 3,3 |
| profundidad.js | 2,3 |
| orquesta.js | 1,2 |
| multiplano.js | 1,0 |
| index.js (gsap) | 0,3 |

**FPS pendiente.** Las mediciones headless corren sobre SwiftShader (render por
software) y no dicen nada del rendimiento real. Para cerrarlo: abrir el lab,
esperar 10 s y escribir `__escenaFPS` en la consola. Si baja de 58, reducir
`CANT.alta` en `escena.js` de 60.000 a 40.000.

## Degradación — 11/11

| Caso | Esperado | Resultado |
|---|---|---|
| `prefers-reduced-motion` | canvas retirado | OK |
| `prefers-reduced-motion` | texto visible | OK |
| Sin JavaScript | mensaje legible completo | OK |
| Móvil 390 px | sin desborde horizontal | OK |
| Sin mapas de profundidad | foto plana y visible | OK |
| Sin mapas de profundidad | sin errores en consola | OK |
| Sin OGL | canvas retirado | OK |
| Sin OGL | hero legible | OK |
| Sin OGL | la orquesta sigue viva | OK |
| Scroll | llega al fondo sin retención | OK |
| WebGL | un solo contexto vivo | OK |

El caso "sin OGL" prueba el aislamiento entre módulos: caen las capas 0 y 1 y la
capa 3 sigue funcionando.

## Mapas de profundidad

Generados con Depth-Anything V2 Small sobre las seis fotos de `assets/web/img/`.
Los seis salieron con rango dinámico 1.00; lo que decide es el desvío estándar.

| Foto | Desvío | KB | Veredicto | Se usa |
|---|---|---|---|---|
| 02-nave-estanques | 0,304 | 45 | **Excelente.** Separa los estanques del corredor; el fondo se hunde de verdad | Sí, fuerza 0,035 |
| 08-marcas-en-roca | 0,298 | 30 | Gradiente de plano, no separa las marcas de la roca | No está en el landing |
| 01-marca-tiza-acero | 0,271 | 16 | **Parcial.** Plano en fuga correcto para la geometría, pero **no despega la tiza del acero** | Sí, fuerza reducida a 0,018 |
| 06-testigos-sondaje | 0,264 | 93 | No revisado en detalle | No está en el landing |
| 07-neumatico-minero | 0,224 | 72 | No revisado en detalle | No está en el landing |
| 05-cenital-placa-x | 0,185 | 46 | El más plano, como se esperaba de una toma cenital | No está en el landing |

**Corrección a la spec.** La spec §4 esperaba que en `01-marca-tiza-acero` "la
marca se adelante al fondo". No ocurre: Depth-Anything lee la placa como una
superficie continua y la tiza no tiene relieve suficiente. El paralaje que se
obtiene es de superficie inclinada, real pero sutil. Por eso esa figura declara
`data-fuerza="0.018"` en lugar del 0,035 por defecto.

## Scroll libre

| Comprobación | Resultado |
|---|---|
| La foto se mueve con el puntero | OK |
| La foto NO se mueve con el scroll | OK |
| El scroll llega al fondo sin retención | OK |
| El hero se revela sin tocar el scroll | OK (opacidad 0,00 → 1,00) |

## Desvíos respecto del plan

Cuatro, todos deliberados y con su razón:

1. **OGL en lugar de three.js.** El plan especificaba three.js; medido dio
   **466 KB gzip**, casi el doble del tope de 250. De three sólo se usaba la
   plomería de buffers y uniforms —los dos shaders están escritos a mano—, así
   que se migró a OGL: 38 KB contra 385. Total final: 119 KB. Es la salida que
   ya proponía `2026-08-07-investigacion-motion-3d.md` §9 para este caso exacto.

2. **Sin GSAP SplitText.** El HTML ya trae cada línea del titular en su propio
   `<span>`; se envuelven en una máscara y se animan directo. Un plugin menos.

3. **El renderer de `profundidad.js` nunca entra al DOM.** El plan lo agregaba
   al `<figure>` *además* de la copia 2D, lo que dejaba dos canvas por figura.
   Ahora renderiza fuera del documento y se copia con `drawImage`.

4. **`iniciar()` de `profundidad.js` no puede contar las conversiones.** Las
   texturas cargan async, así que el retorno es la cantidad *programada*; el
   número vivo se publica en `window.__fotosVolumen`.

## Defectos encontrados y corregidos

- **El `view()` del CSS peleaba con la timeline de carga.** `.revelar` aplicaba
  también al hero; como el hero está en pantalla desde el arranque, su rango
  nunca se completaba y quedaba en opacidad 0,59. Se acotó la regla a
  `.seccion .revelar`.
- **OGL escribe `width`/`height` inline en el canvas al construirse** (300×150),
  lo que pisa el `width:100%` de la hoja de estilos. Medir el canvas devolvía
  ese tamaño y se autoconfirmaba: la escena quedaba de 300×150 en la esquina.
  Ahora `medir()` lee el contenedor y reimpone el `100%`.

## Nada se borró

`index.html`, `style.css`, `main.js`, `CNAME`, los cinco `lab/1..5` y los frames
del hero quedaron intactos. Los dos únicos archivos versionados que se tocaron
—`lab/index.html` y `CLAUDE.md`— sólo recibieron líneas nuevas: cero
eliminaciones en `git diff --numstat`.
