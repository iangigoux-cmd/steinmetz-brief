# Steinmetz — Project Context

## What is Steinmetz

Plataforma B2B de infraestructura de agentes de IA como servicio. Resuelve la "paradoja de Fase 3": los que mas se beneficiarian de agentes autonomos (lideres de negocio sin perfil tecnico) no pueden configurar la infraestructura que los hace funcionar (MCP servers, API routing, sandboxes, etc.).

**Historia fundacional:** Charles Steinmetz y Henry Ford. Steinmetz reparo el generador de Ford con una marca de tiza. Factura: $1 por la marca, $9,999 por saber donde hacerla. La vision del negocio vale $9,999; la ejecucion tecnica vale $1.

**Contacto:** Ian Berndt, +56 9 9321 5043

---

## Dominio y Hosting

- **Dominio:** `steinmetz.it.com`
- **Hosting:** GitHub Pages (repo: `iangigoux-cmd/steinmetz-brief`)
- **CNAME:** archivo `CNAME` en raiz con `steinmetz.it.com`
- **URLs:**
  - `steinmetz.it.com/` → `index.html` (brief)
  - `steinmetz.it.com/propuesta/` → `propuesta/index.html` (propuesta de valor)

---

## Estructura de Archivos

### Produccion (lo que se sirve)
- `index.html` — **BRIEF principal.** Archivo unico autocontenido (~3400 lineas, HTML+CSS+JS vanilla, CDN only). Incluye lockscreen, gateway animado, 6 secciones de contenido, cierre.
- `propuesta/index.html` — **Propuesta de valor.** Slide deck horizontal con scroll-snap. Hero simplificado con breadcrumb, sin typewriter. Back-nav fijo `<- BRIEF` en esquina superior.
- `CNAME` — archivo para GitHub Pages custom domain

### Design System (referencia, no se sirve)
- `01-moodboard.md` — filosofia visual "Infraestructura de Elite"
- `02-color-system.md` — tokens de color
- `03-typography-system.md` — Inter + Fira Code
- `04-spacing-tokens.md` — grid 8px, border-radius max 4px
- `05-master-prompt.md` — **DESACTUALIZADO.** Version antigua con terracota+Newsreader. NO usar.
- `06-motion-effects.md` — 150-200ms, sin spring, sin translate en hover
- `07-landing-instructions.md` — estructura de landing
- `brandbook dark.html` / `brandbook light.html` — implementacion visual del design system

### Contenido de negocio
- `Brief IDEA .docx` — brief original de la idea
- `Cadena de vaor/` — 6 archivos .md con cadena de valor, moat, competencia, gap, riesgos, GTM
- `steinmetz_propuesta_valor.html` — version original de la propuesta (antes de moverla a `propuesta/`)
- `brief.html` — version anterior del brief (antes de convertirlo en `index.html`)

### Planes y propuestas (documentacion interna)
- `plan_simplificacion.md` — **PLAN PENDIENTE DE IMPLEMENTAR.** Simplificacion del brief de 5 secciones a 3. Incluye 7 pasos de implementacion. Ver seccion "Tarea Pendiente" abajo.
- `arquitectura_dominio.md` — analisis de arquitectura del dominio (ya implementado)
- `pasos_implementacion_dominio.md` — pasos de implementacion del dominio (ya implementado)
- `propuesta_scroll_dinamico.md` — propuesta de GSAP ScrollTrigger (**RECHAZADA por el usuario**, animaciones funcionaban mal)
- `propuesta_mejoras_index.md` / `propuesta_mejoras_diseno.md` — propuestas anteriores de mejoras

### Otros
- `posts/` — posts de Instagram (ig-post.html, ig-post-02 a 05). Tienen node_modules para puppeteer/screenshot.

---

## Design System

### Tokens
```css
--bg-canvas:        #F4F4F2;   /* gris industrial, fondo general */
--bg-surface:       #FFFFFF;   /* superficies/cards */
--border-subtle:    #D4D4D4;   /* bordes suaves */
--border-strong:    #171717;   /* bordes duros */
--text-primary:     #171717;
--text-secondary:   #525252;
--text-tertiary:    #A3A3A3;
--brand-primary:    #2563EB;   /* azul cobalto, acento principal */
--brand-hover:      #1D4ED8;
--status-success:   #059669;
--status-warning:   #D97706;
--status-danger:    #DC2626;
--font-ui:          'Inter', sans-serif;
--font-mono:        'Fira Code', monospace;
```

### Reglas estrictas
- **Border-radius:** maximo 4px. Nunca pill excepto status dots (8px circle).
- **Sombras:** offset duro sin blur (`0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--border-strong)`). No glassmorphism. No gradientes.
- **Transiciones:** 150-200ms ease-in-out. Solo color/opacity. Sin translate-Y en hover.
- **Tipografia:** Inter para UI/titulos. Fira Code para TODO lo que sea dato, ID, metrica, eyebrow, label tecnico.
- **Iconos:** Lucide via unpkg CDN (`https://unpkg.com/lucide@latest/dist/umd/lucide.js`)
- **Secciones oscuras:** fondo `#171717`, texto blanco, dots y borders con rgba blanco.
- **Google Fonts CDN:** `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:ital,wght@0,400;0,500;0,600;1,400&display=swap`

---

## Arquitectura de index.html

El archivo es un monolito autocontenido. Todo el CSS esta en un `<style>` en el `<head>`. Todo el JS esta en un `<script>` antes del `</body>`. No hay archivos externos excepto CDN (Google Fonts, Lucide).

### Flujo del usuario
1. **Lockscreen** — Password screen (clave: `12345`). Terminal aesthetic. Reloj en vivo.
2. **Gateway** — 4 pantallas full-screen dark con scroll-snap:
   - Screen 1 (Hook): "Tu vision vale $9,999. La infraestructura vale $1."
   - Screen 2 (Versus): Terminal animado comparando SIN vs CON Steinmetz
   - Screen 3 (Pipeline): Diagrama animado del flujo (idea -> MCP -> orquestador -> agentes -> seguridad -> deploy)
   - Screen 4 (Gate): "El generador esta listo. Solo falta la marca." + CTA al brief
3. **Navbar** — Aparece despues del gateway. Fija arriba. Progress bar de scroll. Links a secciones + PROPUESTA.
4. **Hero** — Eyebrow, H1 con typewriter "STEINMETZ.", subtitulo, tagline, meta grid, terminal con typewriter de la cita
5. **Secciones de contenido** (actualmente 5, se van a simplificar a 3):
   - 01 Genesis (light) — Anecdota Steinmetz/Ford + invoice card
   - 02 Contexto (dark) — 3 fases de IA + paradoja
   - 03 Problema (light) — Error cards estilo terminal
   - 04 Solucion (dark) — Capability cards + value props
   - 05 Oportunidad (light) — Metricas + personas target
6. **Cierre** (dark) — CTA, proof strip, footer

### Transition strips
Entre cada seccion hay un `transition-strip` con una frase corta. Las dark usan `transition-strip-dark`.

### Sistema de animaciones
- **Fade-in:** Clase `.fade-in` con IntersectionObserver. Al entrar en viewport, agrega `.visible`. CSS: `opacity 0->1, translateY 10px->0`.
- **Stagger:** Elementos dentro de `.error-list` o `.phases-list` reciben delay incremental (`i * 40ms`).
- **Section numbers:** Los numeros grandes (01, 02...) en background tienen su propio observer.
- **Label lines:** Las lineas que se extienden despues del section label usan `scaleX(0->1)` con observer.
- **Countup:** Los valores $9,999 y $1 en value-comparison se animan de $0 al valor final.
- **Typewriter:** Dos typewriters en el hero. Uno para "STEINMETZ." con loop de fuentes/colores. Otro para la cita "$9,999 / $1".
- **Gateway animations:** Terminal versus, pipeline flow, todo con IntersectionObserver y delays.

### Navbar links (actual)
```
01 GENESIS | 02 CONTEXTO | 03 PROBLEMA | 04 SOLUCION | 05 OPORTUNIDAD | PROPUESTA
```

### Cross-navigation con propuesta
- Navbar: link `PROPUESTA` apunta a `/propuesta/` (azul, bold)
- Cierre: boton ghost "Propuesta de Valor" apunta a `/propuesta/`
- Propuesta tiene `<a href="/" class="back-nav">← BRIEF</a>` fijo + boton "Volver al Brief" en su cierre

---

## Tarea Pendiente: Simplificacion del Brief

**Archivo de referencia:** `plan_simplificacion.md` (leer completo antes de implementar)

El usuario pidio simplificar el brief porque tiene demasiada informacion y es dificil de entender. El diseno le gusta, no cambiarlo — solo reducir y reorganizar contenido.

### Resumen del plan
Fusionar 5 secciones de contenido en 3:

| Antes | Despues |
|---|---|
| 01 Genesis (light) | 01 La Historia (light) — recortada |
| 02 Contexto (dark) + 03 Problema (light) | 02 El Problema (dark) — fusion |
| 04 Solucion (dark) + 05 Oportunidad (light) | 03 La Solucion (light) — fusion |
| 06 Cierre (dark) | Cierre (dark) — sin cambios |

### Que se elimina
- `story-divider` + parrafos puente en seccion 01
- `value-comparison` ($9,999 vs $1 countup) en seccion 01
- Las 3 `phase-card` completas (se reemplazan con timeline compacto)
- Todo el `error-terminal` (3 error cards)
- `blindness-block` + `localhost-example`
- `value-prop-strip` (4 bullets) en seccion 04
- `metrics-band` (3 metricas) en seccion 05
- `target-grid` (3 persona cards) en seccion 05
- 2 transition strips (quedan 3 de 5)

### Que se mantiene intacto
- Gateway completo
- Hero completo
- Invoice card
- Paradox block (pieza central)
- Capability cards (3 cards con mini-terminales)
- Market statement (se mueve al final de sec. 03)
- Cierre completo

### Que se agrega
- Timeline compacto horizontal (3 nodos con conectores) reemplazando las phase cards
- CSS nuevo para `.phase-timeline`, `.phase-node`, `.phase-connector`

### 7 pasos de implementacion
1. Recortar seccion 01
2. Fusionar 02+03 en "El Problema"
3. Fusionar 04+05 en "La Solucion"
4. Actualizar navbar (6 links -> 4)
5. Limpiar CSS
6. Limpiar JS (countup observer, etc.)
7. Verificar + commit + push

---

## Decisiones Pasadas Importantes

- **GSAP ScrollTrigger: RECHAZADO.** Se implemento y el usuario lo rechazo ("funciona demasiado mal las animaciones"). Se revirtio a IntersectionObserver vanilla. NO intentar de nuevo.
- **El usuario prefiere simplicidad.** No over-engineer. El diseno actual le gusta. Los cambios son narrativos, no visuales.
- **Idioma del contenido:** Espanol. Idioma de comunicacion con el usuario: Espanol.
- **El usuario dice "vamos" para aprobar un paso.** Implementar directamente al recibir "vamos".

---

## Notas Tecnicas

- El archivo `index.html` es grande (~3400 lineas). Leer por secciones.
- CSS esta entre lineas ~12-2210 aprox.
- HTML body entre lineas ~2214-2988 aprox.
- JS entre lineas ~2990-3400 aprox.
- La propuesta (`propuesta/index.html`) es ~2600 lineas, tambien monolito autocontenido.
- No hay build tools, no hay npm, no hay framework. Todo vanilla + CDN.
- Git remote: GitHub Pages. Push a main = deploy automatico.
