# Propuesta de mejoras — index.html (Brief de Posicionamiento)

## Alcance

Todo lo que viene DESPUÉS del gateway (desde "Leer el brief completo" en adelante): el Hero, las 5 secciones de contenido y el Cierre. El lockscreen, contact screen y las 4 pantallas del gateway NO se tocan.

---

## Diagnóstico

El gateway es cinematográfico: lockscreen con CRT effect, terminal animations, pipeline flow, invoice dramática. El problema es que cuando el usuario hace click en "Leer el brief completo" y aterriza en el contenido real, la experiencia **cae dramáticamente**. Las secciones 01-05 son planas: text blocks, listas verticales y tablas con `fade-in`. No hay componentes memorables, no hay ritmo dark/light, no hay densidad visual comparable al gateway. El brief se lee como un documento, no como una experiencia.

El gateway promete una experiencia de nivel terminal/aerospace. El brief entrega un documento con bordes.

---

# FASE 1 — Ritmo visual y respiración (CSS + HTML, sin JS nuevo)

## 1.1 Alternar dark/light entre secciones

**Problema:** Las 5 secciones son todas light sobre `#F4F4F2`. No hay ritmo. Se siente como un muro de texto.

**Cambio:**
- **Sección 01 (Génesis):** light (mantener)
- **Sección 02 (Contexto):** **DARK** (`#171717` background, textos en blanco/rgba)
- **Sección 03 (Problema):** light (mantener)
- **Sección 04 (Solución):** **DARK** (`#171717`)
- **Sección 05 (Oportunidad):** light (mantener)
- **Sección 06 (Cierre):** dark (ya está)

**Cadencia resultante:** hero light → 01 light → **02 dark** → 03 light → **04 dark** → 05 light → **06 dark**

Las secciones dark usan la misma estética que el gateway: textos `rgba(255,255,255,0.5-0.85)`, bordes `rgba(255,255,255,0.08-0.12)`, acentos `var(--brand-primary)`. Los `section-label`, `section-h2`, `section-intro`, `badge`, `dot` y todos los componentes internos necesitan variantes dark (invertir colores).

**Impacto:** Altísimo — transforma la monotonía. **Esfuerzo:** Medio (muchos selectores, pero solo CSS).

## 1.2 Section number como background tipográfico

**Problema:** Los `section-label` son discretos y las secciones no tienen identidad visual fuerte.

**Cambio:** Cada sección tiene un número gigante (180-220px, rgba muy baja: 0.025 en light, 0.04 en dark) posicionado `absolute` en la esquina superior derecha como ornamento tipográfico. `01`, `02`, `03`, `04`, `05`. Font Inter, weight 700, letter-spacing negativo.

**Impacto:** Medio. **Esfuerzo:** Bajo (position absolute + CSS).

## 1.3 Mejorar el hero — hacerlo más compacto y agresivo

**Problema:** El hero tiene demasiados elementos dispersos verticalmente. El `STEINMETZ.` typewriter es grande (110px) pero el H1 debajo compete visualmente. Hay un gap visual entre el typewriter animado y el terminal de abajo.

**Cambio:**
- Reducir el gap entre el brand typewriter y el H1. El typewriter y el H1 deben sentirse como un bloque.
- Agregar un separador visual fuerte (1px `border-strong` + 24px padding) entre el bloque superior (brand + H1 + subtitle + tagline) y el bloque inferior (meta grid + terminal).
- El `hero-meta-grid` y el `hero-terminal` se envuelven en un contenedor con borde fuerte que los une visualmente como una unidad "ficha técnica".
- Agregar un mini-label "FICHA TÉCNICA" encima de este contenedor en Fira Code 10px.

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 1.4 Section dividers con contenido

**Problema:** Entre secciones solo hay una línea `border-subtle`. No hay transición.

**Cambio:** Entre las secciones key (01→02, 03→04), agregar un "transition strip" de 64px de alto que actúa como puente narrativo:
- Strip 01→02: `"La tiza fue el inicio. El contexto es lo que sigue."` — Fira Code, 12px, centrado, rgba secondary.
- Strip 03→04: `"El diagnóstico está hecho. La solución es estructural."` — Misma estética.

Cada strip tiene borde arriba y abajo (strong), fondo distinto al de las secciones que conecta.

**Impacto:** Medio. **Esfuerzo:** Bajo.

---

# FASE 2 — Componentes visuales nuevos

## 2.1 Timeline visual para las 3 fases (Sección 02)

**Reemplaza:** La lista vertical `phases-list` con `phase-card` apiladas.

**Componente:** Timeline horizontal con 3 nodos conectados por líneas, inspirado en el `gw-pipeline-flow` del gateway:
- Cada nodo es una card con borde fuerte:
  - Eyebrow: "FASE 01 / 02 / 03"
  - Badge de estado (Superada / En adopción / Objetivo)
  - Título de la fase en bold
  - Descripción debajo
  - Meta data (perfil requerido, ejemplo) en un mini-grid interno
  - El verdict como footnote monospace
- Nodo de Fase 03 tiene borde `brand-primary` y glow sutil (`box-shadow: 0 0 0 1px var(--brand-primary)`) + badge azul
- Las líneas conectoras entre nodos muestran progresión (1→2 sólida, 2→3 punteada para indicar "en transición")
- En mobile, colapsa a vertical con línea a la izquierda

**Alternativa más sencilla pero igualmente impactante:** Mantener el layout vertical pero transformar cada `phase-card` en una card con un indicador visual lateral:
- Borde izquierdo de 3px coloreado según estado (gris Fase 1, warning Fase 2, azul Fase 3)
- El número de fase ("01", "02", "03") aparece como tipografía grande (48px, Fira Code, light opacity) a la izquierda del título
- La card de Fase 3 tiene un background diferente (`brand-surface` en light, `rgba(37,99,235,0.06)` en dark) y el borde superior de 3px azul

**Impacto:** Alto. **Esfuerzo:** Medio.

## 2.2 Paradox grid como confrontación visual (Sección 02)

**Problema:** La `paradox-grid` es funcional pero no comunica la tensión de la paradoja. Las dos columnas (benefit vs capability) se ven como una tabla más.

**Cambio:**
- Agregar un divisor central dramático: una línea vertical gruesa (2px) con un badge centrado que dice `≠` o `BRECHA` en Fira Code, danger color
- La columna izquierda (beneficiarios) tiene fondo `success-bg` sutil
- La columna derecha (configuradores) tiene fondo `danger-bg` sutil
- Debajo de la grid, agregar una línea de conclusión: `"Los que más lo necesitan no pueden configurarlo. Los que pueden configurarlo no lo necesitan."` — styled como un callout con borde izquierdo azul

**Impacto:** Alto. **Esfuerzo:** Bajo.

## 2.3 Error cards con terminal header (Sección 03)

**Problema:** Los `error-card` actuales son correctos pero genéricos. No tienen la energía del gateway.

**Cambio:**
- Envolver los 3 error-cards en un contenedor tipo terminal:
  - Header con dots (rojo/amarillo/verde) + título "STEINMETZ.DIAGNOSTIC — SISTEMA DE DETECCIÓN"
  - Los 3 cards se apilan dentro del terminal body
- Cada card agrega un `timestamp` ficticio: `[2025-01-15 09:23:41]` en Fira Code 10px, tertiary
- El `error-code-col` se hace más visual: el ERR-001/002/003 crece a 14px y el ícono se rodea de un fondo pulsante sutil (usando la misma animación de pulse del gateway: opacity 0.4→1)
- Agregar un "status bar" al pie del terminal: `3 ERRORES CRÍTICOS DETECTADOS · REQUIERE INTERVENCIÓN` en danger red, Fira Code 10px

**Impacto:** Alto. **Esfuerzo:** Medio.

## 2.4 Pipeline de capacidades (Sección 04)

**Reemplaza:** El `capabilities-grid` de 3 cards estáticas.

**Componente:** Un pipeline horizontal (como el del gateway) que muestra el flujo de Steinmetz:

```
[REQUERIMIENTO] → [MCP SERVER] → [ORQUESTACIÓN] → [SEGURIDAD] → [DEPLOY] → [OPERANDO]
    idea            infra          agentes         permisos      producción   resultado
```

Cada nodo tiene:
- Ícono Lucide en un cuadrado con borde
- Label debajo
- Al hacer hover, aparece la descripción de la capability correspondiente debajo del nodo

Debajo del pipeline, mantener la `solution-def` como bloque de texto, y el `value-prop-strip` como está.

**Alternativa:** Mantener el grid de 3 cards pero elevarlo visualmente:
- Agregar un número grande ("01", "02", "03") en azul como eyebrow de cada card
- Cada card tiene un mini-terminal al pie que muestra un comando de ejemplo:
  - `$ steinmetz mcp --status → ACTIVE`
  - `$ steinmetz agents --list → 4 running`
  - `$ steinmetz audit --report → COMPLIANT`
- Los mini-terminals usan Fira Code, fondo `bg-canvas`, borde sutil

**Impacto:** Alto. **Esfuerzo:** Medio.

## 2.5 Target cards con avatar indicators (Sección 05)

**Problema:** Las `target-card` de COO/CFO/Gerente Ops son bloques de texto sin personalidad.

**Cambio:**
- Cada card agrega un indicador visual en la esquina superior derecha:
  - COO: ícono `briefcase` en un cuadrado con borde azul
  - CFO: ícono `bar-chart-3` en cuadrado
  - Gerente Ops: ícono `settings` en cuadrado
- El `target-role` crece a 18px y se pone en bold azul
- Debajo del `target-pain`, agregar una línea monospace: `→ steinmetz resuelve esto en [tiempo]` en brand-primary

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 2.6 Market statement como hero-quote (Sección 05)

**Problema:** El `market-statement` final es importante pero su diseño no le hace justicia. Es el cierre de la sección de mercado y debería tener el mismo peso visual que los statements del gateway.

**Cambio:**
- Convertir a un componente full-width con más presencia:
  - El texto principal crece a 22-24px
  - El `<strong>` (la frase clave azul) se aísla en su propia línea con font-size aún más grande (26px)
  - Agregar un borde izquierdo de 3px azul además del borde completo
  - Background cambia a `brand-surface` para diferenciarse
- Debajo del statement, agregar un "proof strip" con 3 mini-métricas:
  - `MERCADO: B2B exclusivo` | `PERFIL: 0 técnico` | `DEMANDA: Real, sin oferta`
  - Estilo `hero-meta-grid` pero más compacto

**Impacto:** Alto. **Esfuerzo:** Bajo-Medio.

---

# FASE 3 — Animaciones con intención

## 3.1 Stagger mejorado por componente

**Problema actual:** Todos los `.fade-in` usan el mismo `translateY(10px) + opacity 200ms`. Es monótono.

**Cambio:** Diferentes entradas según tipo:
- **Headings (h2):** `translateY(0)` + solo opacity (no se mueve, aparece en su lugar)
- **Cards en grid:** `scale(0.97) + opacity` → `scale(1)` (materialización)
- **Error cards:** `translateX(-12px) + opacity` (entran desde la izquierda, como alertas)
- **Terminal blocks:** Las líneas aparecen secuencialmente (typewriter delay), no todas a la vez
- **Paradox grid columns:** La izquierda entra desde la izquierda, la derecha desde la derecha (confrontación visual)
- **Market statement:** `scale(0.98) + opacity` con un delay de 200ms después del último elemento anterior

**Impacto:** Alto. **Esfuerzo:** Medio (custom CSS + ajustar IntersectionObserver).

## 3.2 Números animados (countup)

**Dónde:** `$9,999` y `$1` en la `value-comparison`, `B2B` y `0` en `metrics-band`.

**Animación:** Los números hacen un countup rápido (400ms, ease-out cubico):
- `$9,999` cuenta desde $0 hasta $9,999
- `$1` aparece con un delay después de que $9,999 termine (efecto de contraste dramático)
- `0` en perfil técnico hace un "flash" — aparece instantáneamente con un pulso de escala

**Trigger:** IntersectionObserver, una vez.

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 3.3 Invoice card entrance

**Dónde:** La `invoice-card` sticky en Sección 01.

**Animación:** Cuando entra en viewport:
1. El header aparece primero (slide down)
2. Los rows aparecen secuencialmente con stagger de 200ms
3. El total aparece último con un flash azul en el monto
4. La nota al pie aparece con fade-in delayed

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 3.4 Error cards cascade

**Dónde:** Los 3 `error-card` en Sección 03.

**Animación actual:** Simple fade-in con stagger delay.

**Mejora:** Cada card entra con `translateX(-16px)` desde la izquierda. El borde rojo izquierdo hace un flash (width 3px → 5px → 3px en 300ms). El `error-code` dentro de cada card pulsa brevemente en rojo (opacity 0.5 → 1).

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 3.5 Section number bg entrance

**Dónde:** Los números gigantes de fondo (si se implementa 1.2).

**Animación:** Cuando la sección entra en viewport, el número hace un `translateY(20px) + opacity 0 → translateY(0) + opacity target` con duración larga (800ms) y easing suave. Más lento que el contenido, dando sensación de profundidad/parallax.

**Impacto:** Bajo-Medio. **Esfuerzo:** Bajo.

---

# FASE 4 — Interactividad

## 4.1 Phase cards expandibles (Sección 02)

**Actual:** Las 3 phase-cards muestran toda la info siempre.

**Cambio:** Solo Fase 3 muestra toda la info por defecto (es la fase activa). Fases 1 y 2 muestran solo el header (número + título + badge). Al hacer click, se expanden con una transición suave (`max-height` + `opacity`). Esto reduce la carga visual inicial y deja a Fase 3 como protagonista.

**En mobile:** Todas colapsadas por defecto excepto Fase 3.

**Impacto:** Medio. **Esfuerzo:** Medio.

## 4.2 Capability cards con flip/reveal (Sección 04)

**Actual:** Las 3 capability-cards son estáticas con hover de background.

**Cambio:** El hover revela información adicional:
- Al entrar en hover (>300ms), la descripción corta se reemplaza con una métrica concreta:
  - MCP: `"Setup en < 4 min. 0 configuración manual."`
  - Orquestación: `"Coordina hasta 12 microagentes en paralelo."`
  - Seguridad: `"Audit trail completo. SOC2 ready."`
- El mini-terminal aparece con fade-in debajo de la card
- Transición suave sin layout shift (la info extra se revela dentro del espacio existente)

**Impacto:** Medio. **Esfuerzo:** Medio.

## 4.3 Target cards hover spotlight (Sección 05)

**Actual:** Las 3 target-cards son estáticas.

**Cambio:** Al hacer hover en una card, las otras dos se atenúan (opacity 0.4). La card activa eleva con `box-shadow: 3px 3px 0 0 var(--brand-primary)`. Efecto spotlight como en la tabla competitiva de la propuesta de valor.

**Impacto:** Bajo-Medio. **Esfuerzo:** Bajo.

## 4.4 Scroll-to-section desde el hero

**Actual:** El hero tiene terminal y meta grid pero no hay un CTA explícito para empezar a leer.

**Cambio:** Debajo del terminal, agregar un botón ghost: `"Leer el brief ↓"` que hace smooth scroll a Sección 01. Estilo: borde sutil, Fira Code 11px, uppercase.

**Impacto:** Bajo. **Esfuerzo:** Bajo.

## 4.5 Back-to-top flotante

**Actual:** No hay forma de volver arriba excepto scroll manual o los links del nav.

**Cambio:** Un botón `↑` fijo en la esquina inferior derecha que aparece cuando el usuario ha scrolleado más del 30%. Cuadrado 40x40, borde strong, fondo surface, ícono `chevron-up`. Se oculta con opacity transition cuando está near top.

**Impacto:** Bajo. **Esfuerzo:** Bajo.

---

# FASE 5 — Cierre como experiencia memorable

## 5.1 Cierre rediseñado — dramático y con peso

**Problema:** El cierre actual es funcional pero no está a la altura del gateway. Después de 5 secciones de contenido, el cierre debería sentirse como el final de una presentación cinematográfica.

**Cambio:**
- **Dot grid background:** Radial gradient dots como en el cierre de la propuesta de valor (`radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 20px 20px`)
- **STEINMETZ watermark:** 200px, rgba(255,255,255,0.015), absolute bottom-right como en la propuesta de valor
- **H2 más grande:** 52px, max-width 600px, word-reveal animation (cada palabra aparece individualmente con delay de 30ms)
- **Subtitle:** Mantener pero subir a 15px con más espacio
- **Agregar "proof strip"** encima de los botones: 4 mini-metrics en una fila con borde sutil:
  - `PRE-SEED` | `B2B CORP` | `LATAM FIRST` | `CÉLULA ANCLA`
  - Cada una con un dot de color diferente (warning, blue, success, info)
- **Botón primario:** Más grande (16px padding vertical), con animación de box-shadow on hover más pronunciada
- **Footer divider:** Mantener pero agregar el año "2025" como número grande (48px, rgba baja) a la derecha del brand name

**Impacto:** Alto. **Esfuerzo:** Medio.

## 5.2 Transición sección 05 → cierre

**Problema:** El paso de la última sección light al cierre dark es abrupto.

**Cambio:** Agregar un "transition strip" entre sección 05 y el cierre:
- Fondo dark, 80px de alto
- Texto centrado: `"—— EL GENERADOR ESTÁ LISTO ——"` en Fira Code 11px, rgba(255,255,255,0.2)
- Funciona como un "drumroll" antes del cierre

**Impacto:** Medio. **Esfuerzo:** Bajo.

---

# FASE 6 — Micro-detalles y polish

## 6.1 Progress bar mejorada

**Actual:** Barra azul 2px en top del navbar.

**Cambio:** Agregar un tooltip que aparece al hacer hover sobre la barra mostrando el % de lectura y el nombre de la sección actual: `"48% · 03 PROBLEMA"`. Fira Code 10px, fondo dark, positioned below the bar.

**Impacto:** Bajo. **Esfuerzo:** Medio.

## 6.2 Section label animation

**Actual:** Los `section-label` aparecen con el fade-in general.

**Cambio:** El `section-label` tiene su propia animación: la línea después del label (el `::after`) se extiende de width 0 → 100% en 400ms con delay de 200ms después de que el label text aparece. Efecto de "reveal" progresivo.

**Impacto:** Bajo. **Esfuerzo:** Bajo.

## 6.3 Print / PDF mode

**Cambio:** Agregar `@media print` que:
- Oculta el navbar, progress bar y lockscreen
- Fuerza todas las secciones a background white con texto black
- Los fade-in quedan en estado visible
- Ajusta los tamaños para A4
- Agrega page-break-before en cada section

Esto permite que un inversor imprima el brief como PDF limpio.

**Impacto:** Medio (valor práctico para sharing). **Esfuerzo:** Bajo.

## 6.4 Reading time indicator

**Cambio:** En el hero, debajo del tagline, agregar: `"⏱ ~8 MIN DE LECTURA"` en Fira Code 10px, tertiary. Calculado aproximadamente.

**Impacto:** Bajo. **Esfuerzo:** Bajo.

## 6.5 Footnote links between sections

**Cambio:** Al final de cada sección, agregar una línea monospace subtle:
- Fin de 01: `"Continuar → 02 Contexto de Mercado"`
- Fin de 02: `"Continuar → 03 Diagnóstico"`
- etc.

Estilo: Fira Code 11px, text-tertiary, alineado a la derecha. Click navega a la siguiente sección. Hover cambia color a brand-primary.

**Impacto:** Bajo. **Esfuerzo:** Bajo.

---

# Resumen por fases

| Fase | Qué incluye | Esfuerzo | Impacto |
|------|------------|----------|---------|
| **1** | Dark/light alternance, section numbers, hero compacto, dividers | **Medio** | Altísimo — ritmo visual |
| **2** | Timeline fases, paradox dramática, error terminal, pipeline capabilities, target cards, market statement | **Medio-Alto** | Alto — componentes memorables |
| **3** | Stagger por tipo, countup, invoice entrance, error cascade, section number parallax | **Medio** | Alto — el brief cobra vida |
| **4** | Phase cards expandibles, capability reveal, target spotlight, CTAs | **Medio** | Medio — interactividad |
| **5** | Cierre dramático, transition strip | **Medio** | Alto — cierre memorable |
| **6** | Progress tooltip, section label anim, print mode, reading time, footnotes | **Bajo** | Medio — polish |

**Orden sugerido:** Fase 1 → Fase 5 → Fase 2 → Fase 3 → Fase 6 → Fase 4

Empezar con Fase 1 porque el dark/light alternance transforma la percepción inmediatamente y es puro CSS/HTML. Luego Fase 5 porque el cierre es la última impresión. Después Fase 2 que construye los componentes visuales que dan personalidad a cada sección. Fase 3 da vida. Fase 6 de polish. Fase 4 al final porque requiere más JS y testing.

---

*Steinmetz · Propuesta de Mejoras index.html · v1.0 · 2025*
