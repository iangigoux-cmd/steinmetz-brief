# Scroll Dinámico — Brief (index.html)

## El problema actual

El brief usa scroll libre con `fade-in` básicos (opacity + translateY de 10px). Al bajar, los elementos simplemente "aparecen" con un pop sutil. Los bordes duros entre secciones (`border-top: 1px solid`) cortan visualmente. Las transition strips son estáticas. El resultado: se siente como un documento que se lee, no como una experiencia que se recorre.

Lo que el usuario percibe: "bajo y se cortan cosas."

---

## Opciones evaluadas

### Opción A: GSAP + ScrollTrigger (CDN) — RECOMENDADA

**Qué es:** La librería estándar de la industria para animaciones atadas al scroll. Permite "pinear" elementos, controlar animaciones con la posición del scroll (scrub), parallax por capas, y transiciones cinematográficas.

**CDN:** `https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js` + `https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js` (~45KB gzipped total)

**Pros:**
- Animaciones atadas al scroll position (no on/off, sino progresivas)
- Pinning nativo (fijar un elemento mientras el contenido fluye)
- Parallax multicapa sin CSS hacks
- Compatibilidad total (Chrome, Safari, Firefox, Edge, mobile)
- Documentación masiva, battle-tested en producción
- Licencia gratuita para uso no-comercial

**Contras:**
- Agrega ~45KB de JS
- Requiere reescribir el sistema de animaciones actual
- Curva de aprendizaje para ajustar timings

**Resultado esperado:** Scroll tipo sitio Apple/Stripe. Cada sección se revela cinematográficamente.

---

### Opción B: CSS Scroll-Driven Animations (nativo)

**Qué es:** API nativa del browser: `animation-timeline: scroll()` y `animation-timeline: view()`. Permite atar keyframes CSS al scroll sin JS.

**Pros:**
- Cero dependencias
- Rendimiento nativo (compositor thread)
- Sintaxis declarativa

**Contras:**
- **Soporte limitado:** Solo Chrome 115+. NO funciona en Safari, NO en Firefox estable.
- Sin pinning nativo
- Sin scrub suave
- **Descartada para producción.**

---

### Opción C: Lenis + IntersectionObserver mejorado

**Qué es:** Lenis es una librería de smooth scroll (~4KB). Se combina con un `requestAnimationFrame` loop que lee `scrollY` para parallax manual.

**Pros:**
- Muy liviano
- Smooth scroll con momentum natural (como native apps)
- No requiere reescribir todo

**Contras:**
- Parallax y pinning hay que codificarlos a mano
- Menos potente que GSAP
- Más código custom = más bugs potenciales

---

### Opción D: Vanilla mejorado (sin librerías)

**Qué es:** Usar `requestAnimationFrame` + `scrollY` para controlar transforms/opacity manualmente. Mejorar los fade-in actuales con más variedad.

**Pros:**
- Cero dependencias
- Control total

**Contras:**
- Hay que reinventar la rueda (pin, scrub, parallax)
- Mucho código para resultados inferiores a GSAP
- Fácil introducir bugs de performance (jank)

---

## Recomendación: Opción A (GSAP ScrollTrigger)

Es la herramienta correcta para esto. Usada por Apple, Stripe, Nike, Airbnb. Disponible por CDN. El peso extra (~45KB) se justifica completamente por el resultado.

---

## Plan de implementación

### PASO 1 — Setup & Smooth Scroll Base

**Qué hacer:**
1. Agregar los 2 scripts CDN de GSAP antes del `</body>`
2. Registrar `ScrollTrigger` como plugin
3. Reemplazar el sistema actual de `fade-in` (IntersectionObserver) por `ScrollTrigger.batch()` — más suave y con mejor control de timing
4. Configurar el smooth scroll global (GSAP tiene `ScrollSmoother` pero es Club — podemos usar Lenis o el scroll nativo mejorado con GSAP)

**Resultado:** La base funciona. Todos los fade-in existentes siguen operando pero con mejor timing.

**Esfuerzo:** 15 min. **Dependencias:** Ninguna.

---

### PASO 2 — Parallax de secciones

**Qué hacer:**
1. **Hero parallax:** Al hacer scroll, el hero se desvanece progresivamente (opacity de 1→0) y se desplaza lento hacia arriba. Crea la sensación de que la sección 01 "sube sobre" el hero.
2. **Section number BG parallax:** Los números grandes (01, 02, etc.) se mueven a velocidad diferente que el contenido — efecto de profundidad.
3. **Invoice card sticky parallax:** En la sección 01, la invoice card se mueve más lento que el texto de la izquierda, creando parallax dentro de la sección.

**CSS necesario:**
```css
.section { overflow: visible; } /* necesario para parallax */
```

**Resultado:** Profundidad visual. Cada sección tiene capas que se mueven a distinta velocidad.

**Esfuerzo:** 20 min. **Dependencias:** Paso 1.

---

### PASO 3 — Transiciones entre secciones (eliminar cortes duros)

**Qué hacer:**
1. **Eliminar los `border-top` duros** entre secciones. Reemplazar con transiciones de overlap.
2. **Transition strips animados:** En vez de ser estáticos, las transition strips hacen fade-in + scale al entrar, y la línea se extiende progresivamente.
3. **Dark/light crossfade:** Cuando una sección oscura entra, el fondo no "corta" — la sección oscura tiene un clip-path que se revela progresivamente (de `inset(0 0 100% 0)` a `inset(0)`), creando un efecto de cortina.

**Alternativa más simple:** En vez de clip-path, usar `opacity` en la sección oscura con un `translateY` sutil que la hace "deslizar" sobre la anterior.

**Resultado:** Las transiciones light→dark y dark→light se sienten como cambios de escena, no como bordes.

**Esfuerzo:** 25 min. **Dependencias:** Paso 1.

---

### PASO 4 — Pinning de elementos clave

**Qué hacer:**
1. **Invoice card pin (Sección 01):** La factura queda fija en pantalla mientras el texto de la izquierda sigue scrolleando. Cuando se llega al final de la sección, se despega. Efecto "sticky sidebar" controlado por ScrollTrigger.
2. **Terminal de errores (Sección 03):** Los 3 error cards aparecen secuencialmente mientras el terminal queda pineado. Cada error entra con un delay, como si el sistema los detectara en tiempo real.
3. **Capabilities cards (Sección 04):** Las 3 cards se animan secuencialmente, cada una con su mini-terminal que "escribe" el comando.

**Resultado:** Momentos de pausa cinematográfica donde el scroll "detona" una secuencia sin que el usuario sienta que se cortó.

**Esfuerzo:** 30 min. **Dependencias:** Pasos 1-2.

---

### PASO 5 — Animaciones de entrada mejoradas

Reemplazar los `fade-in` genéricos con animaciones específicas por tipo de contenido:

| Elemento | Animación actual | Animación nueva |
|---|---|---|
| **Títulos h2** | opacity + translateY(10px) | Clip-path reveal de abajo hacia arriba (wipe) |
| **Párrafos** | opacity + translateY(10px) | opacity progresiva atada al scroll (scrub) |
| **Cards** | opacity + translateY(10px) | Stagger lateral (entran desde la izquierda, 120ms entre cada una) |
| **Terminal blocks** | opacity + translateY(10px) | Scale de 0.95→1 + opacity (efecto "aparece como ventana") |
| **Metrics/badges** | opacity + translateY(10px) | Pop con rebound sutil (elastic ease) |
| **Section numbers** | opacity + translateY(20px) | Parallax + opacity atada al scroll (siempre en movimiento) |
| **Transition strips** | estático | La línea se extiende y el texto hace fade (scrubbed al scroll) |

**Resultado:** Cada tipo de contenido tiene una personalidad de animación distinta. Se siente diseñado, no genérico.

**Esfuerzo:** 25 min. **Dependencias:** Pasos 1-3.

---

### PASO 6 — Cierre cinematográfico

**Qué hacer:**
1. El cierre (sección 06) entra con un efecto dramático: el watermark "STEINMETZ" crece desde el fondo mientras el contenido hace fade-in escalonado.
2. Los proof cells aparecen uno por uno (stagger de 150ms).
3. Los CTAs aparecen al final con un delay.
4. El footer hace fade-in como último elemento.

**Resultado:** El cierre se siente como el final de una película. El último scroll es el más memorable.

**Esfuerzo:** 15 min. **Dependencias:** Pasos 1, 5.

---

### PASO 7 — Performance & polish

**Qué hacer:**
1. Agregar `will-change: transform` a elementos con parallax
2. Usar `gsap.matchMedia()` para desactivar pinning y parallax en mobile (< 768px) — en mobile se mantienen los fade-in simples
3. Lazy-init: no animar nada hasta que el DOM esté ready
4. Verificar no hay jank en Safari (compositor thread)
5. Testear en mobile, tablet, desktop

**Esfuerzo:** 15 min. **Dependencias:** Todos los pasos anteriores.

---

## Resumen visual del resultado

```
ANTES:                          DESPUÉS:
┌──────────────┐               ┌──────────────┐
│   Hero       │               │   Hero       │ ← parallax fade al scroll
├──────────────┤ ← borde duro  │              │
│   Section 01 │               │   Section 01 │ ← invoice card pineada
├──────────────┤ ← borde duro  │   ↕ overlap  │
│   Section 02 │               │   Section 02 │ ← dark section wipe-reveal
├──────────────┤               │   ↕ overlap  │
│   Section 03 │               │   Section 03 │ ← error cards secuenciales
│              │               │   ↕ overlap  │
│   ...etc     │               │   ...etc     │
└──────────────┘               └──────────────┘

Fade-in on/off              →  Animaciones atadas al scroll progress
Borders duros               →  Crossfade entre secciones
Todo igual                  →  Cada tipo de contenido anima distinto
Estático entre animaciones  →  Parallax continuo da vida al fondo
```

---

## Orden de ejecución

```
Paso 1 (setup GSAP)           ← base, sin riesgo
Paso 2 (parallax)             ← efecto inmediato de profundidad
Paso 3 (transiciones)         ← elimina los cortes duros
Paso 5 (animaciones entrada)  ← reemplaza fade-in genéricos
Paso 4 (pinning)              ← el más impactante pero complejo
Paso 6 (cierre)               ← polish final
Paso 7 (performance)          ← testing
```

**Recomendación:** Hacer 1→2→3 primero. Solo con eso el scroll ya se siente radicalmente distinto. Los pasos 4-7 son polish adicional.

---

**Tiempo total estimado:** ~2.5 horas de implementación.

---

*Steinmetz · Propuesta de Scroll Dinámico · 2025*
