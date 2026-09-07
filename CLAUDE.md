# Steinmetz — el sitio

`steinmetz.cl`, servido por GitHub Pages. **Push a `main` = despliegue.**
El DNS vive en Azure; su documentación en `Admin/dominio/dns.md`.

## Qué hay acá

```
index.html    el landing. Un solo archivo: HTML, CSS y JS inline, sin build.
marca/        el manual de marca → steinmetz.cl/marca
  assets/     el logo trazado (SVG y PNG) y las piezas para redes y correo
CNAME         steinmetz.cl. Si falta, el dominio cae.
```

## El landing, en tres frases

Es **el vidrio**: el sitio son placas de vidrio flotando sobre un campo de
luz plata. La portada es una pieza enorme, cortada por el marco, con el
nombre grabado al ácido; los tres pilares son tres placas apiladas en 3D
que se ven unas a través de otras y se navegan con las pastillas de la
izquierda; la seguridad son planos encajados. Todo es CSS 3D — sin WebGL,
sin librerías.

La referencia declarada por Ian es **legora.ai**: de ahí vienen la
estructura (portada a pantalla completa con la pieza detrás, navegación
con el nombre al centro, secciones centradas con mucho aire, pastillas +
placas isométricas), la forma de los botones y el registro plata. De
Steinmetz quedan la tipografía y el blanco y negro sin acento.

## Reglas

- **La marca manda** para tipografía y color: Fraunces para el nombre y los
  titulares, Instrument Sans para leer, IBM Plex Mono para datos, blanco y
  negro **sin color de acento**.
- **El logo no es texto.** El trazado vive una sola vez en un `<defs>` al
  principio del documento y se reusa con `<use href="#letras">`: el marco,
  y las tres capas del grabado.
- **Movimiento:** se reproduce solo —carga, puntero, loop, toque— y el
  scroll nunca es el control. Esa regla salió de la autopsia del landing
  v1, que Ian rechazó justamente por eso.
- **Nada de piedra.** Ian eliminó el cantero como metáfora el 2026-09-07.
  Ni «cantero», ni «piedra», ni «losa», ni «tallado»: el material es vidrio.
- **Ojo con `filter: blur()` sobre superficies grandes.** Un desenfoque
  sobre 150vw se recalcula cada vez que la pieza se mueve y tira los
  cuadros a diez por segundo. Los planos fuera de foco se hacen con
  degradados que ya nacen suaves. Lo mismo con las sombras proyectadas.
  Todo lo que dependa del puntero debe ser **transformación**, nunca un
  degradado que se repinta.
- Español en todo: contenido, código, comentarios y commits.

## Cómo se prueba

```bash
python3 -m http.server 8899        # y abrir localhost:8899
```
Antes de publicar: desbordes de 320 a 1920 px, tema claro y oscuro,
`prefers-reduced-motion`, foco visible con teclado, y medir los cuadros
por segundo del bucle de luz (en headless con SwiftShader, ≥30 basta).
