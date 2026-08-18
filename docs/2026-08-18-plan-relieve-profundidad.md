# El relieve — profundidad al hacer scroll (plan de 3 opciones)

_2026-08-18 · Brief de Ian: "cuando uno haga scroll para abajo, se haga un
efecto de zoom out y que le dé profundidad a la página". Investigar, planear,
hacer 3 opciones._

## Investigación — la técnica correcta

**CSS scroll-driven animations** (`animation-timeline: scroll()`): la animación
se mapea a la posición del scroll pero corre **en el compositor**, con
`transform`/`opacity` — tan suave como el scroll mismo, sin JS en el hilo
principal. Chrome/Edge 115+, Firefox 132+, Safari 18+, ~84% global
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations),
[guía 2026](https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026),
[Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/)).

**Por qué esto NO viola la regla del proyecto.** La regla nace del landing v1,
que *secuestraba* el scroll: 320svh de hero pinneado que no entregaba nada
hasta el final. Acá el scroll sigue siendo scroll — nada se pinnea, el usuario
llega abajo a la velocidad que quiere — y el zoom-out es una *consecuencia
visual* de bajar, no una condición para leer. Es la diferencia entre "el
scroll controla la película" y "la página tiene perspectiva". Aun así, las tres
opciones respetan un límite duro: **el contenido siempre es legible sin haber
scrolleado nada** y **ninguna sección desaparece por el efecto**.

Fallback: `@supports not (animation-timeline: scroll())` → la página se ve
exactamente como hoy (sin zoom). `prefers-reduced-motion` → idem.

## Las tres opciones

Las tres parten del relieve actual sin tocarlo (`lab/relieve/` queda como
está); viven en `lab/relieve/{a,b,c}/`.

### A — La losa se aleja (zoom-out de la piedra entera)

**La metáfora:** al bajar, te alejás de la piedra. Todo el primer golpe (el
nombre) se encoge y se hunde en la losa a medida que scrolleás; el resto de la
página sigue normal.

- El hero está en un `position: sticky` de una pantalla; mientras el usuario
  baja los primeros 100vh, el nombre pasa de `scale(1)` a `scale(.72)`, su
  sombra tallada se acorta (menos relieve = más lejos) y su opacidad baja a
  .35. Con `scroll()` de raíz, rango 0→100vh.
- Sensación: la piedra tiene una superficie y te vas alejando de ella. La
  segunda pantalla llega "por encima" del nombre que se aleja.
- Costo: cero. Riesgo: cero. Es la más segura y la más elegante.

### B — Los golpes viven a distintas profundidades (multiplano)

**La metáfora:** la losa no es plana — cada golpe está tallado a otra
profundidad, y al scrollear la cámara viaja hacia adentro.

- `perspective` en la losa; cada `.golpe` lleva un `translateZ` distinto
  (0, -80px, -160px, -240px) y una animación `scroll()` que lo trae de
  `translateZ(-N)` a `translateZ(0)` cuando entra en pantalla — el golpe se
  *acerca* hasta quedar en foco, y luego se aleja al salir.
- Los golpes lejanos se ven un poco más chicos y su relieve más tenue; al
  llegar a foco están a tamaño real y con el tallado pleno. Sensación de túnel
  suave, de "entrar en la piedra".
- Es la más "3D" de las tres. Riesgo medio: hay que calibrar para que nunca se
  sienta mareo — la profundidad total es corta (240px de Z) y el rango de
  animación es amplio para que sea lento.

### C — La lámpara se aleja con vos (zoom-out lumínico + escala)

**La metáfora:** no cambia el tamaño de las cosas tanto como la *luz*: al
alejarte, la lámpara se aleja también, las sombras se alargan y el relieve se
hace más dramático — como ver una inscripción de lejos con luz rasante.

- Combina un zoom-out suave de toda la losa (`scale(1)`→`scale(.94)`, apenas)
  con una animación scroll-driven sobre las custom properties de la lámpara
  (`--lx/--ly` crecen con el scroll: sombras más largas). Necesita `@property`
  para animar las variables — soportado donde hay `scroll()`.
- La lámpara sigue respondiendo al puntero encima de eso (el JS suma su offset
  al valor base scroll-driven).
- Sensación: la página respira profundidad sin moverse casi. La más sutil y la
  más "cara". Riesgo bajo.

## Reglas comunes

- Ningún golpe se pinnea más de su propia pantalla (solo A tiene sticky, y de
  1 pantalla).
- El contenido de cada golpe es legible en el rango completo del efecto.
- Solo `transform`, `opacity` y (en C) custom properties registradas.
- Móvil: los mismos efectos, atenuados (menos escala, menos Z).
- Conmutador mínimo entre las tres + volver al relieve base.

## Recomendación

**A** para producción por relación efecto/riesgo. **B** si Ian quiere el
"wow" de profundidad literal. **C** si prefiere que la profundidad venga de la
luz y no del tamaño — la más coherente con la idea de la lámpara. Construyo
las tres para que se elija viendo.
