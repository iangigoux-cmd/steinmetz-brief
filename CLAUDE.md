# Steinmetz — sitio público

Landing de **Steinmetz SpA** (consultoría en IA, Santiago de Chile), servido en
GitHub Pages sobre `steinmetz.it.com`. Push a `main` = deploy.

El sitio anterior (brief con lockscreen + propuesta) vive en el historial de
git y en `old/` (local, gitignoreado). **Este landing lo reemplazó por completo
el 2026-08-07.** No confundir documentación vieja con el sitio actual.

## Identidad

- **Esencia:** *la marca de tiza*. Precisión contra volumen. Historia
  Steinmetz/Ford: $1 por la marca, $9.999 por saber dónde.
- **Hero:** "Tu visión vale $9.999. / La ejecución vale $1. / Sin el $1, no
  vale nada."
- **Visual:** fotografía industrial cinematográfica generada con IA (Gemini/Veo).
  Registro Anduril/Palantir. Sin caras nunca. El sitio parece industria, no
  software.
- **Antagonista:** la consultora grande. Se nombra la conducta, nunca la firma.
- **Clientes:** nunca se nombran ("una de las grandes cerveceras de Chile").

## Sistema visual — reglas estrictas

- Blanco sobre `#0a0a0a`. **Sin color de acento**: el único color sale de las
  fotos (óxido, ocre).
- Inter (todo) + IBM Plex Mono (cifras, etiquetas, datos). Las cifras se leen
  como factura, no como titular.
- **Un solo momento animado**: el hero (canvas scrubbing, 80 frames WebP atados
  al scroll). El resto: fades de opacidad ≤500ms. Sin parallax, sin translate,
  sin spring. GSAP ScrollTrigger fue rechazado por el usuario en el pasado —
  no reintentar.
- Grano de película global (`body::after`), hairlines `rgba(255,255,255,0.14)`.

## Estructura

```
index.html / style.css / main.js   el landing (estático, sin build)
portal/index.html                  placeholder del portal de clientes
assets/web/                        SERVIDO: AVIF/WebP responsive, frames, video
assets/img/, assets/video/         CRUDOS (gitignoreados): PNG Gemini, MP4 Veo
assets/tools/                      pipeline: limpiar-watermark{,-video}.py,
                                   exportar-web.py
assets/prompts/biblioteca-visual.md  los prompts de toda la identidad visual
docs/                              planes y specs
old/                               sitio anterior (local, no comiteado)
```

## Flujo de assets

1. Generar en Gemini/Veo con los prompts de `biblioteca-visual.md` (respetar el
   bloque "ADN de estilo").
2. `python3 assets/tools/limpiar-watermark.py` (imágenes, mapa adentro) o
   `limpiar-watermark-video.py in.mp4 out.mp4` (video).
3. `python3 assets/tools/exportar-web.py` → regenera `assets/web/`.
4. Los frames del hero son `f000..f079`; el JS los pide 0-indexados
   (`-start_number 0` en ffmpeg, no olvidar).

## Presupuestos

- Carga inicial (hero completo con frames): **< 2 MB** (hoy: 1,88 MB).
- No comitear PNG/MP4 crudos. No servir nada fuera de `assets/web/`.

## Contacto y pendientes de dominio

- CTA: WhatsApp `wa.me/56993215043`. El correo `ian@steinmetz.cl` NO existe
  todavía — depende de redelegar nameservers de `steinmetz.cl` a Azure DNS en
  NIC Chile (runbook en `~/Desktop/Steinmetz SpA/06_Dominio_y_Servicios/`).
  Cuando exista, agregarlo al pie y al portal.
- `CNAME` (steinmetz.it.com) debe estar SIEMPRE en la raíz o el dominio cae.

## Contexto de empresa

La carpeta `~/Desktop/Steinmetz SpA/` tiene la documentación legal/tributaria
de la sociedad (RUT 78.484.226-6). El relato del estado vive en sus dos
handoffs y su README. El portal de clientes es un proyecto aparte, aún sin
construir — el placeholder solo deja la puerta.

## Idioma

Contenido del sitio: español. Comunicación con Ian: español. "vamos" = aprobar
e implementar directo.
