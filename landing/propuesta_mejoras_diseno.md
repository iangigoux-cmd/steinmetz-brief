# Propuesta de mejoras — steinmetz_propuesta_valor.html

## Diagnóstico

El slide deck actual es funcionalmente correcto pero **visualmente monótono**. Las 16 slides siguen el mismo patrón: eyebrow → big-statement → big-sub → componente (tabla o cards). No hay variación de ritmo, no hay elementos visuales fuertes, y las secciones se sienten intercambiables. No hay interactividad. Las animaciones son todas iguales (fade-up 0.45s).

Comparado con `index.html`, que usa terminales, invoice cards, pipeline flows, error cards, paradox grids, typewriter effects y transiciones dark/light, el slide deck se siente plano y estático.

---

# FASE 1 — Ritmo visual y estructura (sin tocar JS)

Cambios CSS + HTML que rompen la monotonía sin agregar lógica nueva.

## 1.1 Dark slides para intros de sección

**Problema:** Ir de "01 — CADENA DE VALOR" a "02 — MOAT" se siente igual que ir de una slide a la siguiente dentro de la misma sección.

**Cambio:** Las slides intro de cada sección (1, 4, 7, 9) pasan a `slide-dark`. El número de sección se muestra grande (120px, rgba(255,255,255,0.04)) como fondo tipográfico. Título de sección en azul como eyebrow. Statement en blanco.

**Cadencia resultante:** dark hero → **dark** intro 01 → light → light → **dark** intro 02 → light → light → **dark** intro 03 → ...

**Impacto:** Alto. **Esfuerzo:** Bajo (cambiar clases CSS, ajustar colores de texto).

## 1.2 Espacio negativo — slides que respiran

**Problema:** Todas las slides tienen el contenido con el mismo peso visual.

**Cambio:**
- Slides de statement (1, 4, 7, 9): big-statement a 44-48px, sin big-sub. Solo la frase. Que la slide respire.
- Slides de dato (2, 5, 8, 10, 12): más densas, más compactas.
- El contraste entre slides vacías y slides densas crea ritmo.

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 1.3 Íconos en vertex-cards y signal-cards

**Problema:** Las cards de slides 5 y 10 son bloques de texto sin ancla visual.

**Cambio:** Agregar icon-box (36×36, borde sutil, ícono Lucide) al inicio de cada card:
- Vértice 1 (velocidad): `zap`
- Vértice 2 (conectividad): `plug`
- Vértice 3 (governance): `shield-check`
- Señal 1 (localhost): `monitor`
- Señal 2 (presupuesto): `wallet`
- Señal 3 (pricing): `trending-up`

**Impacto:** Medio. **Esfuerzo:** Bajo.

## 1.4 Mejorar hero con meta grid

**Problema:** El hero es solo el typewriter. Comparado con el gateway de index.html, es simplista.

**Cambio:** Agregar un meta grid debajo de los badges:
```
ETAPA          MERCADO           MODELO
Pre-Seed       B2B Enterprise    Célula Ancla
```
Borde fuerte, Fira Code, estilo `hero-meta-grid` de index.html pero en dark.

**Impacto:** Medio. **Esfuerzo:** Bajo.

---

# FASE 2 — Componentes visuales nuevos

Reemplazar tablas y bloques pasivos con componentes que comuniquen mejor.

## 2.1 Pipeline visual para los 6 eslabones (slide 2)

**Reemplaza:** La tabla de eslabones.

**Componente:** 6 nodos horizontales conectados por líneas, inspirado en `gw-pipeline-flow` de index.html. Cada nodo tiene:
- Ícono Lucide dentro de un cuadrado
- Nombre del eslabón debajo
- Badge de estado (resuelto/parcial/no resuelto)
- Nodos 1-3: borde verde sólido
- Nodo 4: borde amarillo sólido
- Nodos 5-6: borde rojo punteado + fondo danger-bg

Las líneas conectoras entre nodos 3→4 y 4→5 son punteadas para mostrar la ruptura.

**Impacto:** Alto. **Esfuerzo:** Medio.

## 2.2 Terminal blocks (slides 1 y 4)

**Componente:** Terminal con dots (rojo/amarillo/verde), título "steinmetz-cli", y output monospace.

**Slide 1 — Cadena de valor intro:**
```
$ steinmetz deploy --target=corporate
→ eslabón 1: prompt .............. OK
→ eslabón 2: generación ......... OK
→ eslabón 3: backend ............ OK
→ eslabón 4: conexión datos ..... PARTIAL
→ eslabón 5: governance ......... FAIL
→ eslabón 6: deployment ......... BLOCKED
```
Colores: OK en verde, PARTIAL en amarillo, FAIL/BLOCKED en rojo.

**Slide 4 — Moat intro:**
```
$ compare --chain-coverage
lovable    ██░░░░  2/6
retool     ░██░░░  2/6
steinmetz  ██████  6/6  ← full chain
```

Se posiciona debajo del big-statement, reemplazando el big-sub.

**Impacto:** Alto. **Esfuerzo:** Medio.

## 2.3 Error cards para riesgos (slide 12)

**Reemplaza:** La tabla de riesgos.

**Componente:** 4 error-cards apiladas, estilo sección 03 de index.html:
- Borde izquierdo 3px rojo
- Columna izquierda con código RISK-01/02/03/04 en fondo danger-bg
- Cuerpo: título del riesgo, badges de probabilidad y horizonte, texto de mitigación
- Comunica urgencia en vez de datos pasivos

**Impacto:** Alto. **Esfuerzo:** Medio.

## 2.4 Highlight agresivo en tabla competitiva (slide 8)

**Problema:** La fila de Steinmetz se pierde entre las demás.

**Cambio:** Borde izquierdo 3px azul, fondo brand-surface más marcado, font-weight 600 en toda la fila, separador 2px arriba de la fila Steinmetz.

**Impacto:** Medio. **Esfuerzo:** Bajo.

---

# FASE 3 — Animaciones con intención

Reemplazar el fade-up genérico con animaciones específicas por tipo de componente.

## 3.1 Terminal typewriter

**Dónde:** Terminal blocks de slides 1 y 4.

**Animación:** Las líneas del terminal aparecen una por una con delay progresivo (300ms entre líneas), simulando ejecución real. El prompt `$` aparece primero, luego el comando se "escribe" carácter por carácter (40ms/char), y después cada línea de output aparece con fade-in secuencial.

**Trigger:** IntersectionObserver — se activa cuando la slide es visible. Se ejecuta una sola vez (flag `data-animated`).

## 3.2 Pipeline build secuencial

**Dónde:** Pipeline visual de slide 2.

**Animación:** Los 6 nodos aparecen secuencialmente de izquierda a derecha (150ms entre nodos). La línea conectora entre cada nodo se dibuja progresivamente (CSS width transition de 0 a 100%). Los nodos 5-6 "fallan" con un shake sutil (2px, 150ms) cuando aparecen.

**Trigger:** IntersectionObserver al entrar en la slide.

## 3.3 Error cards cascade

**Dónde:** Error cards de riesgos (slide 12).

**Animación:** Las cards entran desde la izquierda (translateX(-20px) → 0) con stagger de 200ms entre cada una. El borde rojo izquierdo hace un flash (opacity 0.5 → 1) al aparecer.

**Trigger:** IntersectionObserver.

## 3.4 CountUp en window blocks

**Dónde:** Los window-block con "1 – 3 meses" (slides 6 y 13).

**Animación:** El número grande (48px) hace un countup: "0" → "1" en 400ms con easing. Sutil pero agrega vida al dato más importante.

**Trigger:** IntersectionObserver, una vez.

## 3.5 Vertex cards hover lift

**Dónde:** Vertex cards (slide 5), signal cards (slide 10).

**Animación en entrada:** Stagger estándar pero con scale(0.97) → scale(1) además del translateY, para un efecto de "materialización".

**Animación en hover:** Box-shadow offset duro (2px 2px 0 0 var(--border-strong)) + translateY(-1px). Sin spring, sin blur. Fiel al design system.

## 3.6 Big-statement word reveal

**Dónde:** Los big-statements de slides intro (1, 4, 7, 9).

**Animación:** En vez de fade-up del bloque entero, cada palabra aparece individualmente con un delay muy sutil (30ms entre palabras). El `<strong>` (la palabra clave azul) aparece último con un delay extra de 200ms. Efecto de lectura progresiva.

**Implementación:** JS que envuelve cada palabra en un `<span>` con `opacity:0; transition-delay: calc(var(--i) * 30ms)`. La clase `.visible` las revela todas.

---

# FASE 4 — Interactividad

Elementos que responden al usuario más allá del scroll.

## 4.1 Progress dots con tooltip

**Actual:** Dots en el lateral derecho, solo indicadores pasivos.

**Cambio:**
- Hover: el dot se expande (scale 1.8) y aparece un tooltip con el nombre de la sección (`01 · Cadena de Valor`).
- El tooltip es un pseudo-element posicionado a la izquierda del dot.
- CSS puro con `::before` y `content: attr(data-label)`.

## 4.2 Slide counter con sección

**Actual:** `03 / 16` en la esquina inferior izquierda.

**Cambio:** `03 / 16 · MOAT` — el nombre de la sección actual aparece al lado del número, separado por `·`. Se actualiza con JS en el `updateUI()`. Fade-transition cuando cambia.

## 4.3 Tabla competitiva interactiva (slide 8)

**Actual:** Tabla estática.

**Cambio:**
- Hover en cada fila de competidor: la fila se destaca con fondo hover. La fila de Steinmetz se atenúa ligeramente para mostrar contraste.
- Hover en la fila de Steinmetz: todas las demás filas se atenúan (opacity 0.4) para maximizar el contraste. Efecto "spotlight".
- Click en una fila: toggle de un mini-panel debajo de la tabla con detalle del competidor (2-3 líneas extra de contexto). Solo uno abierto a la vez.

## 4.4 Pipeline nodes clickables (slide 2)

**Cambio:** Click en un nodo del pipeline muestra un tooltip/panel con el detalle:
- Nombre completo del eslabón
- Quién opera hoy
- Estado detallado
- En nodos 5-6: "Steinmetz resuelve esto"

Panel posicionado debajo del nodo, con arrow CSS. Click fuera o en otro nodo cierra el panel.

## 4.5 Keyboard shortcuts mejorados

**Actual:** ArrowUp/ArrowDown/Space para navegar.

**Agregar:**
- `1-6` para saltar a la intro de cada sección directamente.
- `Home` → slide 0 (hero).
- `End` → slide 15 (cierre).
- `?` → muestra overlay con todos los shortcuts disponibles (Fira Code, fondo semi-transparente, se cierra con Esc o click).

## 4.6 Hover en vertex cards — reveal de detalle

**Actual:** Cards estáticas.

**Cambio:** Cada vertex-card tiene un `data-detail` con información extra. Al hacer hover por más de 500ms (o click en mobile), la descripción corta se expande con una línea adicional que aparece con fade-in. No es un modal — es una expansión in-place.

## 4.7 Window block countdown visual

**Dónde:** Window blocks de "1 – 3 meses" (slides 6 y 13).

**Cambio:** Debajo del número grande, una barra de progreso que representa el tiempo transcurrido. Estilo Fira Code, borde sutil. Se llena gradualmente con CSS animation (60s loop) para dar sensación de urgencia pasiva. Color: brand-primary que transiciona a status-danger cuando está "llena".

---

# FASE 5 — Micro-detalles y polish

Toques finales que elevan la calidad percibida.

## 5.1 Scroll progress bar

**Cambio:** Barra de 2px en la parte superior de la pantalla (fixed) que se llena de izquierda a derecha según el progreso total del scroll. Color brand-primary. Como el `#progress-bar` de index.html.

## 5.2 Slide transition accent

**Cambio:** Cuando una slide se activa, aparece una línea de 2px azul en su borde superior que se anima de width 0 → 100% en 300ms. Desaparece cuando la slide deja de ser visible.

## 5.3 Section label animation

**Cambio:** El `slide-section-label` en la esquina superior izquierda hace un fade-in lateral (translateX(-10px) → 0) con delay de 100ms después de que el contenido empieza a animar.

## 5.4 Dark mode auto-detection mejorada

**Cambio:** Cuando se entra a una slide dark, el counter, nav arrows y dots transicionan con un timing más suave (400ms en vez de 300ms). Agregar un sutil cambio de background del body (visible detrás del scroll overscroll en algunos browsers).

## 5.5 Scroll velocity snap feedback

**Cambio:** Cuando el scroll snap "encaja" una slide, un sutil pulse en el progress dot activo (scale 1.4 → 1.6 → 1.4, 200ms). Feedback háptico visual de que la slide encajó.

## 5.6 Easter egg terminal

**Cambio:** Triple-click en el slide counter abre un mini-terminal overlay en la esquina inferior:
```
steinmetz> _
```
Comandos disponibles:
- `goto [n]` → navega a slide n
- `section [nombre]` → navega a la sección
- `theme dark/light` → toggle forzado
- `info` → muestra versión y stats
- `exit` → cierra el terminal

Fira Code, fondo #171717, borde sutil. Se cierra con Esc. No es crítico pero genera conversación y refuerza la identidad técnica.

---

# Resumen por fases

| Fase | Qué incluye | Esfuerzo total | Impacto |
|------|------------|----------------|---------|
| **1** | Dark intros, espacio negativo, íconos, meta grid hero | **Bajo** | Alto — rompe la monotonía |
| **2** | Pipeline visual, terminal blocks, error cards, highlight tabla | **Medio** | Alto — componentes memorables |
| **3** | Typewriter, pipeline build, cascade, countup, word reveal | **Medio** | Alto — el deck cobra vida |
| **4** | Tooltips, tabla interactiva, pipeline clickable, shortcuts, terminal easter egg | **Medio-alto** | Medio — diferenciador |
| **5** | Progress bar, transition accents, micro-animations, polish | **Bajo** | Medio — calidad percibida |

**Orden sugerido:** Fase 1 → Fase 3 → Fase 2 → Fase 5 → Fase 4

Empezar con Fase 1 porque son cambios CSS/HTML simples que transforman la percepción inmediatamente. Luego Fase 3 porque las animaciones dan vida sin necesitar componentes nuevos. Después Fase 2 que construye los componentes visuales. Fase 5 de polish. Fase 4 al final porque la interactividad es el diferenciador pero requiere más testing.

---

*Steinmetz · Propuesta de Mejoras de Diseño v2 · 2025*
