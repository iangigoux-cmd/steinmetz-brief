# Landing de Steinmetz — plan

_2026-09-07 · Simple, directo, profesional. Tres pilares: a medida, rápido,
seguro. Que dé ganas de comprar. Interactivo de verdad y pensado desde el
teléfono._

---

## 1. La tesis

Los tres pilares que diste no son tres características: son **las tres cosas
que dan miedo al contratar**, respondidas.

| Miedo del que compra | Pilar |
|---|---|
| «Me van a vender lo mismo que a todos» | **A medida** |
| «Esto va a tomar seis meses y va a morir en piloto» | **Rápido** |
| «Mis datos van a terminar en un servidor ajeno» | **Seguro** |

Entonces el landing no describe servicios: **desarma objeciones en orden**. Esa
es la diferencia entre una página que informa y una que vende.

**La frase que ordena todo:** un sistema tuyo, encendido en tres semanas, sin
que tu información salga de tu red.

## 2. El problema que hay que resolver de diseño

Un landing tipo Y Combinator se apoya en **mostrar el producto funcionando**:
Linear muestra Linear, Stripe muestra el checkout. Steinmetz no tiene un
producto que mostrar —cada sistema es de un cliente— y **los clientes no se
nombran**, que es una decisión ya tomada.

Sin captura de producto y sin logos, la prueba tiene que venir de otro lado.
Tiene que venir de **mostrar el trabajo**: qué se construye, en qué plazo, con
qué resguardo y por cuánto. La transparencia hace el trabajo que en otras
páginas hacen las capturas.

## 3. La estructura

Siete bloques. Nada de scroll infinito.

| # | Bloque | Qué hace |
|---|---|---|
| 1 | **Portada** | El nombre, una frase, un botón. Tres segundos para entender qué es. |
| 2 | **Las tres cosas** | Los pilares, con una prueba concreta cada uno. |
| 3 | **Elegí tu caso** ★ | La pieza interactiva. Acá se decide la venta. |
| 4 | **Cómo se trabaja** | Las tres semanas, día por día. Quita el miedo al plazo. |
| 5 | **Dónde vive tu información** | Seguridad, en concreto. |
| 6 | **El trabajo** | Dos casos reales sin nombrar clientes. |
| 7 | **Hablemos** | Precio cerrado, 30 minutos sin costo, correo. |

## 4. La pieza interactiva ★

**«Elegí tu caso»** — el visitante toca su situación y ve qué construiríamos.

```
  ¿Qué te está costando tiempo hoy?

  ▸ Tenemos documentos que nadie encuentra a tiempo
  ▸ Mi equipo copia datos de un sistema a otro
  ▸ Reviso contratos y contratos parecidos, a mano
  ▸ Sé que hay algo mal en la operación pero no dónde
  ▸ Ya usamos IA, pero no conoce nuestra empresa

  ────────────────────────────────────────────────
  QUÉ CONSTRUIRÍAMOS   Un índice que se mantiene solo…
  EN CUÁNTO            3 semanas
  DÓNDE VIVE           Dentro de tu red
  DESDE                28 UF
```

**Por qué esto y no un formulario.** Un formulario pide antes de dar. Esto da
primero: el visitante se ve retratado en una de las opciones, recibe una
respuesta concreta con plazo y precio, y recién ahí aparece el botón. Es la
conversación de venta, hecha página.

**Por qué vende.** Contesta las tres preguntas que todo comprador tiene —qué,
cuándo, cuánto— antes de que tenga que escribir un correo para averiguarlas.

**Cómo se comporta.** En el teléfono es una lista de botones grandes; al tocar
uno, la respuesta aparece debajo y la vista se acomoda sola. En el escritorio,
las opciones a la izquierda y la respuesta a la derecha, sin salto. La primera
opción viene abierta: nadie tiene que descubrir que es interactivo.

## 5. El movimiento

**La regla dura del proyecto se mantiene: el scroll nunca es el control.** El
landing v1 murió por eso y no se reintenta.

Lo que sí:

- **Al cargar**, el wordmark se compone y la frase aparece. Una vez.
- **Al puntero**, las letras del nombre engordan al acercarse — la mecánica de
  la marca, que ya está documentada.
- **Al tocar**, todo lo de «Elegí tu caso» y las tres semanas.
- **Nada más se mueve.** Sin parallax, sin números que cuentan solos, sin
  tarjetas que entran una por una al hacer scroll. Eso es exactamente lo que
  delata una plantilla.

`prefers-reduced-motion`: todo aparece en su estado final.

## 6. El teléfono primero

No es «que se vea bien en móvil»: **es donde se va a leer.** Un gerente abre el
correo en el teléfono.

- Se diseña a **390 px** y se expande, no al revés.
- El wordmark tiene su propia mecánica táctil: como no hay puntero, **se compone
  al cargar y responde al toque**.
- Cualquier cosa tocable, mínimo **44 px** de alto.
- Un solo botón fijo abajo —«Hablemos»— que aparece pasada la portada y no
  tapa contenido.
- Las tres semanas: en el teléfono se deslizan de lado, con indicador de
  posición.
- **Sin tablas horizontales.** La de tramos, si va, se convierte en tarjetas.
- Presupuesto: **menos de 100 KB** sin fuentes, y que la portada se vea antes
  de que carguen. Nada de imágenes pesadas — la marca es tipográfica y eso
  juega a favor.

## 7. El texto, en borrador

**Portada**
> **Steinmetz**
> Construimos sistemas de inteligencia artificial hechos para tu operación.
> En producción en tres semanas, dentro de tu red.
> `[ HABLEMOS ]`  `[ VER CÓMO ]`

**Las tres cosas**
> **A medida.** No instalamos software. Construimos el sistema que le falta a
> tu operación, dentro de tu operación y con tus reglas.
> **Rápido.** Tres semanas desde la orden de compra. No un piloto: un sistema
> encendido, con tu equipo usándolo.
> **Seguro.** Todo dentro de tu perímetro. Tus datos no entrenan modelos, no
> salen de tu red y quedan tuyos al terminar.

**Cierre**
> Proyectos acotados, precio cerrado antes de partir.
> La primera conversación son 30 minutos, sin costo y sin compromiso.

Reglas de escritura, ya fijadas en el manual: una idea por frase, ningún número
sin fuente, y los clientes no se nombran.

## 8. Lo que NO va

Lo digo explícito porque es lo primero que aparecería solo:

- **Nada de logos de clientes** ni testimonios inventados.
- **Nada de «potenciamos tu negocio con IA de vanguardia».** Adjetivo que no se
  puede comprobar, fuera.
- **Sin números que suben solos** ni contadores de proyectos.
- **Sin chatbot** ni demo falsa de un producto que no existe.
- **Sin color de acento**: la marca es blanco y negro, y esa disciplina es
  justamente lo que la hace ver cara.
- **Sin stock photos.** No hay fotos: hay tipografía.

## 9. Cómo se construye

Un solo `index.html` con CSS y JS en línea, sin framework ni build — igual que
el manual de marca. Los tokens salen del sistema: Fraunces para titular,
Instrument Sans para leer, IBM Plex Mono para datos, blanco y negro, canto vivo.
El wordmark es el SVG trazado, no texto.

Se verifica antes de publicar: contraste WCAG en claro y oscuro, sin desbordes
de 360 a 1440 px, foco visible con teclado, y `prefers-reduced-motion`.

## 10. Lo que necesito de ti para construirlo

1. **Los cinco casos de «Elegí tu caso»**: te propuse cinco arriba. Decime
   cuáles son de verdad los que te llegan, y qué construirías para cada uno.
2. **Las tres semanas, día por día**: qué pasa en la 1, la 2 y la 3. Lo tengo
   a medias desde la cotización, pero quiero tu versión.
3. **Los dos casos del bloque 6**: la cervecera y la de genética están escritas
   en la cotización. ¿Se pueden usar tal cual?
4. **¿El precio va en la página?** Mostrar «desde 28 UF» filtra y da confianza;
   esconderlo obliga a escribir. Yo lo mostraría.

Con eso lo construyo entero.
