# Steinmetz — sitio público

Landing de **Steinmetz SpA** (consultoría en IA, Santiago de Chile), servido en
GitHub Pages sobre **`steinmetz.cl`** (desde 2026-08-07; antes `steinmetz.it.com`,
que ya no sirve el sitio). Push a `main` = deploy. El DNS del dominio vive en
Azure (`steinmetz-rg`); su documentación en `~/Desktop/admin/steinmetz/dns.md`.

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
3. Los frames del hero salen de **masters upscaled con Real-ESRGAN x4plus**
   (el video de Veo es 720p): 80 PNG de 2560px en
   `assets/video/master-frames-2560/` (gitignoreados). Si cambia el video,
   regenerarlos: extraer 80 frames nativos → `realesrgan-ncnn-vulkan -n
   realesrgan-x4plus -s 4` → downscale a 2560.
4. `python3 assets/tools/exportar-web.py` → regenera `assets/web/` (usa los
   masters si existen; el script tiene ajustes de grade por imagen en AJUSTES).
5. Los frames son `f000..f079`, 0-indexados (`-start_number 0` en ffmpeg).

## Presupuestos

- LCP: solo poster + primer frame (< 300 KB). Los 80 frames cargan en streaming
  con prioridad (keyframes primero) — desktop ~4-5 MB en total, móvil ~1 MB.
- No comitear PNG/MP4 crudos. No servir nada fuera de `assets/web/`.

## Contacto y dominio

- Correo corporativo: **`ian@steinmetz.cl`** (operativo, Google Workspace).
  Es el CTA principal (mailto); WhatsApp con mensaje pre-cargado es la
  alternativa.
- `CNAME` (**steinmetz.cl**) debe estar SIEMPRE en la raíz o el dominio cae.

## Contexto de empresa

La carpeta `~/Desktop/Steinmetz SpA/` tiene la documentación legal/tributaria
de la sociedad (RUT 78.484.226-6). El relato del estado vive en sus dos
handoffs y su README. El portal de clientes es un proyecto aparte, aún sin
construir — el placeholder solo deja la puerta.

## Idioma

Contenido del sitio: español. Comunicación con Ian: español. "vamos" = aprobar
e implementar directo.

## Revisión de la regla de movimiento — 2026-08-13

La sección "Sistema visual" de más arriba dice *"un solo momento animado · sin
parallax, sin translate, sin spring · GSAP ScrollTrigger fue rechazado — no
reintentar"*. Ese texto refleja el estado del sitio en la raíz y **sigue siendo
válido para `index.html`**. Para `lab/6` en adelante, la regla vigente es la de
`docs/2026-08-13-spec-landing-profundidad.md`:

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

**WebGL: OGL, no three.js.** three.js pesa 385 KB gzip y de él sólo se usaba la
plomería de buffers y uniforms. OGL hace lo mismo en 38 KB. Total de `lab/6`:
119 KB gzip contra un tope de 250. Ver `lab/6/VERIFICACION.md`.

**Corrección de dato:** el copy del hero que cita este archivo más arriba es de
una versión anterior. El del sitio en vivo es: *"Hacer la marca cuesta $1. Saber
dónde hacerla: $9.999. Steinmetz es saber dónde."*
