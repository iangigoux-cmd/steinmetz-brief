# El relieve — plan del landing (solo plan)

_2026-08-18 · Brief de Ian: olvidar la estructura actual. Partir de un solo
elemento —las letras talladas en piedra— y construir un landing genérico para
una empresa de IA, ultracreativo, fácil de entender, donde el diseño mande el
mensaje. Nivel Y Combinator._

---

## 1. La idea en una frase

**Toda la página es una sola losa de piedra. Todo lo que importa está tallado en
ella. Lo que no importa, no existe.**

No hay secciones, no hay cajas, no hay fondos que cambian. Hay una superficie
continua de piedra clara y una sola operación posible: **tallar**. El nombre
está tallado. Los titulares están tallados. Los datos están tallados. El botón
es un tallado que se hunde al presionarlo. La página entera es *la obra de un
cantero* — y eso, sin decirlo, es el pitch: **precisión, permanencia, una sola
mano, nada decorativo.**

La regla que ordena todo: **relieve = importancia**. Lo hundido en la piedra es
lo que Steinmetz afirma para siempre. Lo que solo está impreso encima (tinta
gris, sin sombra) es contexto y se puede leer o no. El ojo entiende la
jerarquía sin leer una palabra.

Por qué es YC-grade: los landings que se recuerdan de esa camada (Linear,
Vercel, Stripe, Raycast) tienen **una sola idea material ejecutada sin
excepciones**. Acá la idea material es la piedra tallada. Nadie en IA la tiene.

---

## 2. Qué NO tiene (esto es lo que rompe con lo anterior)

- **No hay "hero + secciones".** No hay etiquetas `01 — LA HISTORIA`. No hay la
  factura de Ford. No hay tres pasos de método. No hay "quién está detrás". Todo
  eso era mi molde, no el brief.
- **No hay fondo que cambie de color** entre bloques. Una piedra, de arriba a
  abajo.
- **No hay imágenes.** Ni fotos, ni iconos, ni ilustraciones. Solo tipografía y
  luz.
- **No hay copy largo.** Nada de párrafos de tres líneas. Ninguna frase pasa de
  doce palabras.
- **No hay más de un color de acento** — y ese acento no es un color: es *el
  polvo de la talla*, un tono más oscuro de la misma piedra.
- **No hay decoración.** Cada píxel que no es piedra, luz o letra tallada,
  sobra.

---

## 3. La superficie viva: la luz

La piedra no está muerta. **Hay una lámpara.** El bajorrelieve se ve porque
tiene luz rasante desde un lado — y esa luz **sigue al cursor**. Movés el
mouse a la izquierda y las sombras de todas las letras talladas de la página se
alargan hacia la derecha; lo movés arriba y las sombras caen. En móvil, la
lámpara sigue al giroscopio: inclinás el teléfono y la piedra reacciona.

Esto es una sola función CSS/JS: dos variables (`--lx`, `--ly`) que alimentan
el `text-shadow` de todo lo tallado. Barata, universal, y convierte la página
entera en un objeto físico. Es el "wow" de la landing y **no cuesta un solo
asset**: resolución infinita, cero peso, y no depende del scroll.

Segunda vida de la superficie: **el polvo**. Cada vez que algo se talla (al
cargar, al hacer hover sobre un tallado, al presionar el botón), caen esquirlas
mínimas que se disipan. Poco, discreto, siempre hacia abajo. La página tiene
gravedad.

---

## 4. La secuencia (una sola losa, cuatro golpes)

No son "secciones": son **cuatro golpes de cincel** sobre la misma piedra, cada
uno de una sola pantalla, todos con la misma composición (algo grande tallado +
una línea de tinta). Se leen bajando con scroll libre; nada se ata al scroll,
cada golpe se anima solo cuando entra en pantalla, con opacidad.

### Golpe 1 — El nombre
`Steinmetz` tallado, gigante, centrado. Nada más. Debajo, en tinta gris
pequeña: **"Construimos sistemas de inteligencia artificial que quedan
funcionando."** — la única línea de posicionamiento de toda la página. La talla
del nombre es la única animación de carga: las letras aparecen golpe a golpe
con esquirlas (lo que ya existe en el hero 24, sin la definición del
diccionario, sin la sentencia).

### Golpe 2 — La afirmación
Un solo titular tallado, dos líneas, sin acento:
**"Lo prometido se borra. Lo tallado queda."**
Es la única frase de "manifiesto". Debajo, tinta gris: *"Ningún sistema nuestro
se ha apagado."* — corta, verificable, arrogante en la medida justa.

### Golpe 3 — Los números
Tres cifras talladas, enormes, en fila (mono tabular): la evidencia sin
adjetivos. Cada una con una línea de tinta debajo:
- **6** — semanas, un sistema en producción
- **0** — datos que salen de la red del cliente
- **1** — responsable, de la primera reunión al último commit
Las cifras se tallan al entrar en pantalla (golpe + esquirlas). Son las únicas
cosas de la página que llevan el tono "polvo" (más oscuro), porque son las que
más pesan.

### Golpe 4 — El pedido
Un solo botón, grande, **tallado hacia adentro** (relieve negativo): al pasar
el cursor la luz cambia y parece hundirse más; al presionarlo, se hunde del
todo y suelta polvo. Texto: **"Encargar una obra."** Debajo, tinta:
`ian@steinmetz.cl · +56 9 9321 5043 · Santiago`. Y nada más. Pie: una línea de
tinta con RUT, en la misma piedra.

Total de palabras talladas en toda la página: unas 25. Total de palabras en
tinta: unas 60. Se lee entera en 40 segundos.

---

## 5. Cómo se ve, exactamente

- **Piedra:** `#e6e1d6` con veta cálida y grano fino (los del hero 24). Es el
  fondo de todo, sin excepción.
- **Tallado:** color `#cfc8b8` (dos tonos más oscuro que la piedra) + sombra
  doble: clara abajo-derecha, oscura arriba-izquierda → bajorrelieve. Los
  offsets de esa sombra son `--lx`/`--ly` (la lámpara).
- **Tallado profundo (los números):** mismo sistema, sombra oscura más larga y
  color `#b9b1a0`.
- **Tinta:** `#5b554a`, IBM Plex Mono, siempre pequeña, siempre sin sombra.
- **Tipografía:** Fraunces 900 optical 144 para todo lo tallado (es la fuente
  del hero aprobado); IBM Plex Mono para toda la tinta. Nada más.
- **Botón:** el mismo tallado, invertido (sombra oscura abajo, clara arriba =
  hundido). Sin borde, sin fondo. Es un hueco en la piedra con letras.
- **Márgenes:** generosos. Cada golpe respira en su pantalla. El vacío también
  es piedra.

---

## 6. Movimiento — reglas duras

1. **La lámpara sigue al puntero** (o al giroscopio). Es la única interacción
   continua. Suave, con inercia.
2. **Los tallados se golpean al entrar en pantalla**: 220 ms, escala 1.6→1 con
   esquirlas. Una vez. Solo opacidad + escala del propio elemento.
3. **Hover en cualquier tallado**: un re-golpe corto (mismo efecto). El sitio
   responde al tacto.
4. **El botón se hunde** al presionar.
5. **Nada más se mueve.** Sin parallax, sin scroll-driven, sin marquesinas, sin
   partículas ambientales. El scroll es siempre libre.
6. `prefers-reduced-motion`: todo tallado desde el inicio, lámpara fija arriba a
   la izquierda, sin esquirlas.

---

## 7. Técnica

- Un solo `index.html` con CSS y JS inline. Sin frameworks, sin build.
- Fuentes: Google Fonts (Fraunces + IBM Plex Mono).
- La lámpara: `pointermove` → dos custom properties en `:root` con lerp; en
  móvil `deviceorientation` con permiso iOS al primer toque.
- Las esquirlas: divs efímeros posicionados fixed, animación CSS, `remove()` al
  terminar. Máximo 12 por golpe.
- Fades de entrada: `animation-timeline: view()` con fallback
  IntersectionObserver (ya probado en el lab).
- Peso: < 60 KB sin fuentes. Cero imágenes.
- Verificación: Playwright, desktop y móvil, cada golpe, hover en un tallado,
  click en el botón, cero errores de consola.

---

## 8. Dónde vive

`lab/relieve/index.html` → `steinmetz.cl/lab/relieve/`. No toca nada de lo
existente. Si aprueba, pasa a la raíz.

---

## 9. Lo que Ian decide antes de construir

1. **El nombre en el golpe 1: ¿"Steinmetz" solo, o "Steinmetz." con punto?** El
   punto tallado es un gesto de cierre muy fuerte. Recomiendo con punto.
2. **Los tres números.** 6 / 0 / 1 son honestos con lo que hay hoy. Se pueden
   cambiar por otros mientras sean verificables — el sistema no cambia.
3. **La frase del golpe 2.** "Lo prometido se borra. Lo tallado queda." es mi
   propuesta. Alternativas del mismo largo: "Nada de esto es una promesa." /
   "Hecho para no borrarse."

Con eso, construyo.
