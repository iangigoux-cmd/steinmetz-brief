# Spec — Landing con profundidad (Steinmetz v2)

_2026-08-13 · Especificación aprobada por Ian. Sucede a
`2026-08-07-investigacion-motion-3d.md`, que sigue siendo la fuente técnica._

**Qué es:** el landing de `steinmetz.cl` reconstruido sobre una pila de cinco
capas de profundidad —3D real, fotografía 2.5D, multiplano CSS, motion graphics
y micro-interacción— manteniendo intacto el mensaje, la identidad y el sitio
que existe hoy.

---

## 0. Regla que gobierna todo el trabajo

> **Aditivo. No se borra nada de lo que había.**

`index.html`, `style.css`, `main.js`, los 80 frames del hero, `assets/web/`
completo, los cinco `lab/1..5` y el contenido de `CLAUDE.md` quedan **intactos**.
El trabajo nuevo vive en `lab/6/` y en archivos nuevos. La promoción a la raíz
—si ocurre— es una decisión posterior y separada, y se hará copiando, no
reemplazando en el mismo movimiento.

Consecuencia práctica: en cualquier momento del desarrollo, `steinmetz.cl` sigue
sirviendo exactamente lo que sirve hoy.

---

## 1. Objetivo

Construir una entrada `lab/6` que demuestre el sitio con profundidad real, y
desde ahí extenderla a las seis secciones del landing.

La tesis es que **la profundidad no es decoración en este proyecto: es el
argumento**. La marca de tiza es una historia sobre *saber dónde*. Una imagen
plana no dice dónde; el volumen sí. El sitio sostiene "la precisión requiere
entender en profundidad" con su propia forma de renderizar.

Imagen rectora del hero: **el polvo suspendido en un haz de luz se asienta y
resuelve en una X.** La marca aparece por sedimentación, no por dibujo. Es la
metáfora de la empresa ejecutándose sola, en vivo, a resolución infinita.

---

## 2. El principio que no se cruza

De `2026-08-07-investigacion-motion-3d.md`:

> _"El error del landing muerto no fue animar: fue cobrar el scroll."_

**El scroll queda libre. Siempre.** Todo el movimiento se dispara por una de
tres cosas: la carga de la página, el puntero, o un loop ambiental. Ninguna
narrativa se ata al scroll.

Lenis entra para dar peso físico al scroll, no para controlarlo. GSAP entra
como orquestador de la timeline de carga. **ScrollTrigger no se usa para
secuestrar el scroll** — la prohibición histórica del proyecto se mantiene en su
sentido real, que era ése.

### El hero actual contradice este principio

Los 80 frames scrubbeados hacen que el scroll *sea* un control: exactamente el
patrón condenado. La escena viva lo resuelve y además:

| | Hero actual | Hero v2 |
|---|---|---|
| Peso | 4–5 MB de frames | ~170 KB (three.js) |
| Resolución | fija, se estira | infinita, se dibuja al DPR real |
| Scroll | atado | libre |
| Puntero | sin respuesta | responde |

La capa 3D **se financia sola** con lo que deja de cargarse. El resultado neto
es un sitio más liviano.

**Los 80 frames no se borran.** Quedan donde están, sirviendo al `index.html`
actual, y disponibles como fallback.

---

## 3. Las cinco capas

| Capa | Técnica | Familia en la investigación |
|---|---|---|
| **0 · Escena viva** | three.js `WebGPURenderer` → WebGL2. Partículas GPGPU con curl noise, luz key lateral dura, falloff a negro | A |
| **1 · Fotografía con volumen** | Depth-Anything V2 Small local → mapa de profundidad → shader de displacement de UV movido por puntero | B |
| **2 · Multiplano** | `perspective` + `translateZ` por capa, 4–6 capas, 2–6 px de desplazamiento con inercia | C |
| **3 · Motion graphics** | SVG (`stroke-dasharray` para el trazo, `feTurbulence` para el borde polvoriento), GSAP SplitText, contadores en IBM Plex Mono | D |
| **4 · Micro y ambiente** | Hovers, estados de cursor, grano de película, viñeta | D + E |

**Máximo dos contextos WebGL vivos:** uno para la escena del hero/cierre, uno
compartido y reutilizado para todas las fotos 2.5D. Es el presupuesto que fija
la investigación y no se excede.

---

## 4. Profundidad por sección

Las seis secciones del landing actual se conservan en orden y en mensaje.

| # | Sección | Capa dominante | Qué se ve |
|---|---|---|---|
| — | Hero | 0 | Polvo en haz de luz que sedimenta en una X. Responde al puntero |
| 01 | LA HISTORIA | 1 | La placa de acero con la marca gana volumen; la marca se adelanta al fondo |
| 02 | EL PROBLEMA | 2 + 3 | Multiplano de tipografía y hairlines; las líneas se trazan al entrar |
| 03 | EL MÉTODO | 3 | Líneas técnicas y contadores en SVG; nada de fotografía |
| 04 | EL TRABAJO | 1 | La nave de estanques respira: aire real entre las columnas |
| 05 | QUIÉN ESTÁ DETRÁS | 0 reducida | El polvo se asienta y queda quieto. Cierra el ciclo del hero |

Copy del hero, verbatim del sitio en vivo:
_"Hacer la marca cuesta **$1**. Saber dónde hacerla: **$9.999**. Steinmetz es
saber dónde."_ — `CLAUDE.md` cita una versión anterior y también queda
desactualizado en esto; la actualización de §8 lo corrige.

Distribución deliberada: la escena costosa aparece dos veces (apertura y cierre),
la fotografía con volumen dos veces, y el medio del sitio se sostiene con
técnicas baratas. Nunca hay dos contextos WebGL compitiendo en el mismo viewport.

---

## 5. Identidad — lo que no se toca

- **Sin color de acento.** La luz de la escena 3D es key blanca dura lateral con
  falloff a negro, que es el ADN visual actual. El único color del sitio sigue
  saliendo de las fotos: óxido y ocre. **Prohibido** rim light de color, neón,
  gradientes de marca.
- **Blanco sobre `#0a0a0a`.**
- **Inter** (todo) + **IBM Plex Mono** (cifras, etiquetas, datos). Las cifras se
  leen como factura, no como titular.
- **Sin caras, nunca.** El 3D es materia —polvo, tiza, acero—, no personajes ni
  abstracción decorativa de agencia.
- Grano de película global, hairlines `rgba(255,255,255,0.14)`.
- El mensaje y el copy del landing actual se conservan: la historia
  Steinmetz/Ford, el hero "Tu visión vale $9.999 / La ejecución vale $1 / Sin el
  $1, no vale nada", el antagonista sin nombre, los clientes sin nombrar.

---

## 6. Presupuestos y degradación

```
JS total          < 250 KB gzip
LCP               < 2 s
Frame rate        60 fps sostenido en desktop
DPR               cap 2 (nunca 3x en pantallas Pro)
Render loop       pausado fuera de viewport y en pestaña oculta
Scroll            100 % libre
```

Cadena de degradación — **cada capa cae sola sin llevarse el sitio**:

| Condición | Comportamiento |
|---|---|
| `prefers-reduced-motion` | Cuadro estático. Cero animación, en todas las capas |
| Sin WebGL / GPU débil | La escena 0 cae a imagen fija; las fotos 2.5D quedan planas |
| Móvil | Partículas reducidas, o multiplano CSS en lugar de la escena |
| Sin los mapas de profundidad | Las fotos se sirven planas; el sitio funciona igual |
| Sin JS | El contenido y la tipografía se leen completos |

El sitio tiene que ser legible y vendible con JavaScript deshabilitado. Las cinco
capas son mejoras, no requisitos.

---

## 7. Estructura de archivos

```
lab/6/
├── index.html              la entrada nueva, autocontenida en estructura
├── escena.js               capa 0 — three.js, partículas GPGPU, la X
├── profundidad.js          capa 1 — quad 2.5D, shader de displacement
├── multiplano.js           capa 2 — perspective/translateZ por puntero
├── orquesta.js             capa 3 — timeline de carga GSAP + SplitText, SVG
└── estilo.css             tokens del sitio + capas 4

assets/tools/
└── generar-depthmaps.py    NUEVO — corre Depth-Anything sobre assets/web/img

assets/web/depth/           NUEVO — los mapas generados (PNG grises, ~50 KB c/u)

lab/index.html              MODIFICADO — se agrega la entrada 6 al conmutador
CLAUDE.md                   MODIFICADO — se agrega la sección de §8
```

**Sólo se modifican esos dos archivos existentes, y en ambos casos agregando:
ninguna línea preexistente se borra ni se reescribe.** Todo lo demás es nuevo.

`lab/6/index.html` contiene **las seis secciones completas** del landing, no
sólo el hero. Se construye en el orden de §11, pero el destino es el landing
entero.

Cada archivo JS tiene una responsabilidad y expone una función de inicio que
puede fallar sin romper a las demás. `index.html` los carga como módulos
independientes: si `escena.js` lanza, `profundidad.js` sigue funcionando.

---

## 8. `CLAUDE.md` — actualización aditiva

`CLAUDE.md` hoy dice:

> _"Un solo momento animado: el hero (…). Sin parallax, sin translate, sin
> spring. GSAP ScrollTrigger fue rechazado por el usuario en el pasado — no
> reintentar."_

Si no se actualiza, la próxima sesión revierte este trabajo por seguir las
reglas. Pero **no se borra el texto histórico**: se agrega una sección que
registra la revisión y su fecha, dejando el original visible como contexto.

Lo que la revisión tiene que dejar claro:

1. La prohibición real es a **atar narrativa al scroll**, no a animar. Se
   mantiene con toda su fuerza.
2. GSAP como **orquestador de la timeline de carga** está permitido. GSAP
   ScrollTrigger secuestrando el scroll, no.
3. Lenis está permitido: suaviza sin controlar.
4. El movimiento se dispara por carga, puntero o loop ambiental. Nunca por
   posición de scroll.
5. La regla "un solo momento animado" queda superada por el presupuesto de
   capas de §3 y §4, que es más específico.

---

## 9. Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| La escena 0 no convence estéticamente | Media | Es la primera entrega y se juzga sola, antes de tocar las otras secciones |
| WebGPU no disponible en Safari | Alta | `WebGPURenderer` cae a WebGL2 con el mismo código; es su comportamiento documentado |
| Depth-Anything produce mapas pobres en las fotos industriales | Media | Se revisa mapa por mapa; una foto con mal mapa se sirve plana |
| El presupuesto de 250 KB se excede | Media | three.js se importa por módulos, no entero; se mide antes de sumar la capa siguiente |
| Las partículas hunden el frame rate en móvil | Media | Conteo de partículas por tier de dispositivo; fallback a multiplano |
| Deriva de identidad hacia "sitio de agencia" | **Alta** | Regla explícita de §5: sin color de acento, luz blanca dura, materia industrial. Se revisa contra las fotos existentes |

El último es el riesgo real del proyecto. Todo lo demás es ingeniería.

---

## 10. Criterios de éxito

1. `steinmetz.cl` sirve exactamente lo mismo que hoy durante todo el desarrollo.
2. `lab/6` abre y la escena del hero corre a 60 fps sostenido en desktop.
3. El peso total de JS es menor a 250 KB gzip, medido.
4. El scroll es libre: se puede recorrer el sitio entero de arriba a abajo sin
   que ninguna animación lo retenga, lo acelere ni lo frene.
5. Con `prefers-reduced-motion` activo, el sitio es un documento estático legible.
6. Con JavaScript deshabilitado, el mensaje se lee completo.
7. Nada de lo que existía fue borrado ni sobrescrito.
8. Un visitante que no sabe nada del proyecto describe el sitio como
   "industrial" o "serio", no como "una demo de WebGL".

---

## 11. Orden de construcción

El orden no es arbitrario: cada etapa se juzga sola antes de que la siguiente
dependa de ella. Si la etapa 1 no convence estéticamente, no arrastró trabajo.

| # | Etapa | Entrega | Se juzga por |
|---|---|---|---|
| 1 | **La escena** | `lab/6` con el hero: polvo GPGPU que sedimenta en la X | ¿Se ve mejor que el scrub actual y pesa menos? Medido |
| 2 | **Los mapas** | `generar-depthmaps.py` + los tres mapas en `assets/web/depth/` | ¿Los mapas son buenos? Se revisa uno por uno |
| 3 | **La fotografía en volumen** | Secciones 01 y 04 con el quad 2.5D | ¿La nave respira? ¿Hay aire entre las columnas? |
| 4 | **El medio** | Secciones 02 y 03: multiplano, SVG trazándose, contadores | ¿Se sostiene sin WebGL? |
| 5 | **La orquesta** | Timeline de carga GSAP + Lenis + el cierre | ¿El sitio se presenta solo? ¿El scroll quedó libre? |
| 6 | **La degradación** | Los cinco fallbacks de §6, verificados | ¿Cada capa cae sola? |
| 7 | **El cierre** | Medición de presupuestos + actualización de `CLAUDE.md` | ¿250 KB? ¿60 fps? ¿LCP < 2s? |

La promoción de `lab/6` a la raíz **no está en este alcance**. Es una decisión
posterior, con su propio momento, y se hará copiando sobre una rama — nunca
sobrescribiendo `index.html` en `main` sin una vuelta atrás lista.
