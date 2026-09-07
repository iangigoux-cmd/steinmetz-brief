# Steinmetz — el sitio

`steinmetz.cl`, servido por GitHub Pages. **Push a `main` = despliegue.**
El DNS vive en Azure; su documentación en `Admin/dominio/dns.md`.

## Qué hay acá

```
index.html    la raíz: el wordmark, qué hace la empresa y el correo. Nada más.
marca/        el manual de marca → steinmetz.cl/marca
  assets/     el logo trazado (SVG y PNG) y las piezas para redes y correo
  direcciones/  las tres direcciones exploradas antes de elegir
CNAME         steinmetz.cl. Si falta, el dominio cae.
```

## El estado, en tres frases

El **landing v1** —la «marca de tiza», con fotografía industrial generada por
IA y un hero atado al scroll— **se archivó el 2026-09-07** junto con el resto de
la identidad anterior, incluidas las 31 exploraciones del lab. Todo está en
`Archivo/identidad-v1/`, no se borró.

Mientras tanto la raíz sirve **una presencia mínima**: el wordmark, la línea de
qué hace la empresa y el correo. No es un landing y no pretende serlo — el
mensaje de la marca todavía no está definido, y el documento no promete lo que
no está decidido.

Lo que sí está definido es la **identidad**, y vive en `marca/`.

## Reglas

- **La marca manda.** Cualquier página nueva toma su sistema del manual: el
  nombre en Fraunces, Instrument Sans para leer, IBM Plex Mono para datos,
  blanco y negro **sin color de acento**, canto vivo.
- **El logo no es texto.** Se usa el SVG trazado de `marca/assets/`, para que no
  dependa de que cargue la fuente.
- **Movimiento:** se reproduce solo —carga, puntero, loop— y el scroll nunca es
  el control. Esa regla salió de la autopsia del landing v1, que Ian rechazó
  justamente por eso.
- Español en todo: contenido, código, comentarios y commits.

## Cuando se construya el landing de verdad

Antes hace falta decidir el mensaje. Lo que ya está resuelto y no hay que
rediscutir: la identidad visual, el logo, la tipografía y el tono de escritura
—directo, específico, sin adjetivos que no se puedan comprobar—, todo
documentado en `steinmetz.cl/marca`.
