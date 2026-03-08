# Plan de Simplificación — Brief (index.html)

## El problema

El brief tiene 5 secciones de contenido que repiten conceptos de distintas formas:
- La brecha entre negocio y técnicos se explica en sec. 01, 02, 03 y 05
- Las 3 fases de IA (sec. 02) son contexto excesivo para el lector target
- Los 3 error cards (sec. 03) repiten lo que la paradoja ya dice mejor
- Las 3 personas (sec. 05) son redundantes con la paradoja
- Las 4 value props (sec. 04) repiten lo que las capability cards ya muestran

El gateway ya hace un excelente trabajo vendiendo: hook → versus → pipeline → gate. Cuando el lector llega al brief, no necesita 5 secciones convenciéndolo de lo mismo.

---

## Estructura nueva: 3 secciones + cierre

```
ANTES (5 secciones):                  DESPUÉS (3 secciones):
01 Génesis (light)                    01 La Historia (light) — RECORTADA
02 Contexto (dark)  ─┐               02 El Problema (dark)  — FUSIÓN
03 Problema (light)  ┘               03 La Solución (light) — FUSIÓN
04 Solución (dark)  ─┐               06 Cierre (dark)       — SE MANTIENE
05 Oportunidad (light) ┘
06 Cierre (dark)
```

---

## SECCIÓN 01: LA HISTORIA (light)

### Qué se mantiene
- Section label: `01 — LA HISTORIA`
- Section number bg: `01`
- `story-grid` completo: texto de la anécdota + invoice card (2 columnas)
- La cita "Abran aquí y quiten exactamente 16 vueltas de cable."
- "Ford pagó sin chistar."
- El comentario `// Los $10,000 no eran el precio de una reparación...`

### Qué se elimina
- `story-divider` ("Conectando con el presente") — ya no hace falta un puente
- Los 2 párrafos debajo ("En cualquier organización hay personas..." y "El sistema actual los obliga...")
- `value-comparison` ($9,999 vs $1 con countup) — ya está en la invoice card Y en el gateway

### Diseño
- Sin cambios de layout. Solo se acorta eliminando los bloques de abajo.
- La sección termina justo después de la invoice card.
- Efecto: la historia queda como vignette pura. Se lee rápido. El lector entiende la metáfora y pasa al siguiente acto.

### Resultado visual
```
┌─────────────────────────────────────────┐
│ 01 — LA HISTORIA           ·───────────│
│                                         │
│  [Texto anécdota]     [Invoice Card]    │
│  ...3 párrafos...     │ $1 / $9,999 │   │
│  ...cita...           │   TOTAL     │   │
│  ...Ford pagó...      │  $10,000    │   │
│  // comentario        │_____________│   │
│                                         │
│  ← FIN DE SECCIÓN (sin puente) →        │
└─────────────────────────────────────────┘
```

---

## TRANSICIÓN 01 → 02

### Qué cambia
- Texto nuevo: `"Hoy, el mismo problema persiste. Y tiene nombre."`
- Se mantiene la clase `transition-strip-dark` (transición a sección oscura)

---

## SECCIÓN 02: EL PROBLEMA (dark) — FUSIÓN de 02+03

### Concepto narrativo
Un solo acto que dice: "la IA evolucionó hasta un punto donde los que más la necesitan no pueden usarla". Sin rodeos.

### Qué se mantiene
- Section label: `02 — EL PROBLEMA`
- Section number bg: `02`
- `paradox-block` COMPLETO (título, descripción, grid 2 columnas con dots, callout) — es la pieza más fuerte del brief

### Qué se elimina
- Las 3 phase-cards completas (Fase 01, 02, 03) — son demasiado detalle
- El intro paragraph del contexto
- Todo el error-terminal (3 error cards + terminal header/footer)
- El blindness-block (síntoma/localhost example)
- El párrafo de cierre de sección 03

### Qué se agrega (nuevo)
Un **timeline compacto** que reemplaza las 3 phase cards. Una línea horizontal con 3 nodos, solo lo esencial:

```html
<div class="phase-timeline">
  <div class="phase-node">
    <span class="phase-node-num">01</span>
    <span class="phase-node-title">Chat aislado</span>
    <span class="badge badge-dark">Superada</span>
  </div>
  <div class="phase-connector"></div>
  <div class="phase-node">
    <span class="phase-node-num">02</span>
    <span class="phase-node-title">Copiloto en IDE</span>
    <span class="badge badge-warning">En adopción</span>
  </div>
  <div class="phase-connector"></div>
  <div class="phase-node active">
    <span class="phase-node-num">03</span>
    <span class="phase-node-title">Orquestación autónoma</span>
    <span class="badge badge-blue">Objetivo</span>
  </div>
</div>
```

### Diseño del timeline compacto

```css
.phase-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 48px;
}
.phase-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 32px;
}
.phase-node-num {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 600;
  color: rgba(255,255,255,0.15);
}
.phase-node.active .phase-node-num {
  color: var(--brand-primary);
}
.phase-node-title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  text-align: center;
}
.phase-node.active .phase-node-title {
  color: #fff;
}
.phase-connector {
  width: 48px;
  height: 1px;
  background: rgba(255,255,255,0.12);
  flex-shrink: 0;
}
```

### Intro simplificado (nuevo)
Reemplazar el párrafo largo con algo directo:

```
"La IA en el desarrollo de software evolucionó en tres fases.
La tercera —orquestación autónoma— es la más poderosa.
Y tiene un problema fundamental."
```

### Resultado visual
```
┌─────────────────────────────────────────┐
│ 02 — EL PROBLEMA           ·───────────│
│                                         │
│  [Intro: 3 líneas sobre las fases]      │
│                                         │
│  ──01──────02──────03──                 │
│  Chat    Copiloto  Orquestación         │
│  [sup]   [adopt]   [obj]                │
│                                         │
│  ┌─── La Paradoja ─────────────────┐    │
│  │ Quien más se beneficia ≠ Quien  │    │
│  │ puede configurarlo              │    │
│  │                                 │    │
│  │ [dots verdes]    [dots rojos]   │    │
│  │ Líderes          Ingenieros     │    │
│  │ COOs             DevOps         │    │
│  │ ...              ...            │    │
│  │                                 │    │
│  │ Steinmetz cierra esa brecha.    │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile (< 768px)
El timeline se apila verticalmente (flex-direction: column), con los conectores rotados a vertical.

---

## TRANSICIÓN 02 → 03

### Qué cambia
- Texto nuevo: `"La brecha tiene solución. Se llama Steinmetz."`
- Se mantiene la clase `transition-strip` (transición a sección light)

---

## SECCIÓN 03: LA SOLUCIÓN (light) — FUSIÓN de 04+05

### Concepto narrativo
Un solo acto que dice: "esto es lo que hace Steinmetz y por qué importa". Sin separar solución técnica de oportunidad de mercado — son la misma cosa.

### Qué se mantiene
- Section label: `03 — LA SOLUCIÓN`
- Section number bg: `03`
- `solution-def` (los 2 párrafos de definición) — ligeramente editados para ser más directos
- `capabilities-grid` (3 capability cards con mini-terminales) — se mantiene exacto
- `market-statement` (de la sección 05) — se mueve aquí como cierre

### Qué se elimina
- `value-prop-strip` (4 bullet points) — redundante con las capability cards
- `metrics-band` (B2B / Real sin oferta / 0) — el gateway ya estableció esto
- `target-grid` (3 persona cards: COO, CFO, Gerente Ops) — la paradoja ya lo dijo
- El H3 "El cliente objetivo"
- El intro paragraph de sección 05

### Qué se edita
**solution-def** — comprimir los 2 párrafos en algo más directo:

```
Steinmetz configura, gestiona y mantiene la infraestructura
de agentes de IA. Servidores MCP, pipelines de orquestación,
seguridad de endpoints. Todo gestionado. El cliente no configura;
el cliente produce.
```

**market-statement** — se mueve desde sección 05, se simplifica:

```
Steinmetz no vende IA. Vende la capacidad de cruzar el abismo
entre el mandato corporativo y la ejecución real.
```

### Diseño
- Sin cambios de layout en las capability cards
- El market-statement se posiciona como bloque final de la sección, con border-top
- Se elimina el padding extra que dejaban los bloques eliminados

### Resultado visual
```
┌─────────────────────────────────────────┐
│ 03 — LA SOLUCIÓN            ·───────────│
│                                         │
│  [Definición: 1 párrafo compacto]       │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ MCP      │ │ Agent    │ │ Security │ │
│  │ Infra    │ │ Orchest. │ │ Enterpr. │ │
│  │          │ │          │ │          │ │
│  │ $ stz... │ │ $ stz... │ │ $ stz... │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│  ─────────────────────────────────────  │
│  Steinmetz no vende IA. Vende la       │
│  capacidad de cruzar el abismo...       │
│                                         │
└─────────────────────────────────────────┘
```

---

## TRANSICIÓN 03 → CIERRE

### Qué cambia
- Se mantiene el texto: `"—— EL GENERADOR ESTÁ LISTO ——"`
- Se mantiene la clase `transition-strip-dark`

---

## CIERRE (sin cambios)

Se mantiene exactamente como está:
- Watermark STEINMETZ
- H2 "El generador está listo para encenderse."
- Subtítulo
- Proof strip (Pre-Seed, B2B Corp, LATAM First, Célula Ancla)
- CTAs (Iniciar conversación, Leer desde el inicio, Propuesta de Valor)
- Footer

---

## NAVBAR

Actualizar los links:

```
ANTES:                    DESPUÉS:
01 GÉNESIS               01 HISTORIA
02 CONTEXTO              02 PROBLEMA
03 PROBLEMA              03 SOLUCIÓN
04 SOLUCIÓN              PROPUESTA
05 OPORTUNIDAD
PROPUESTA
```

De 6 links a 4. Más limpio. Menos opciones = menos parálisis.

---

## Resumen de cambios

| Elemento | Acción |
|---|---|
| Sección 01 | Recortar (quitar puente + value comparison) |
| Sección 02 | Eliminar → fusionar en nueva sec. 02 |
| Sección 03 | Eliminar → fusionar en nueva sec. 02 |
| Sección 04 | Eliminar → fusionar en nueva sec. 03 |
| Sección 05 | Eliminar → fusionar en nueva sec. 03 |
| Phase cards (3) | Reemplazar con timeline compacto |
| Error terminal | Eliminar |
| Blindness block | Eliminar |
| Value comparison | Eliminar |
| Value prop strip | Eliminar |
| Metrics band | Eliminar |
| Target personas | Eliminar |
| Paradox block | Mantener (pieza central) |
| Capability cards | Mantener |
| Market statement | Mover a sec. 03 |
| Transition strips | Reducir de 5 a 3, textos nuevos |
| Navbar | De 6 a 4 links |
| Gateway | Sin cambios |
| Hero | Sin cambios |
| Cierre | Sin cambios |

---

## CSS a agregar
- `.phase-timeline` (flex row, center)
- `.phase-node` (flex column, center)
- `.phase-node-num` (mono, 28px)
- `.phase-connector` (line)
- Media query mobile: timeline vertical

## CSS a eliminar (limpieza)
- `.phase-card` y todo su sistema (ya no se usa)
- `.error-terminal`, `.error-card`, `.error-list`, etc. (ya no se usa)
- `.blindness-block`, `.localhost-example` (ya no se usa)
- `.value-comparison`, `.value-col` (ya no se usa)
- `.metrics-band`, `.metric-cell` (ya no se usa)
- `.target-grid`, `.target-card` (ya no se usa)
- `.vp-cell`, `.value-prop-strip` (ya no se usa)

## JS a limpiar
- Eliminar el observer de `.value-col-amount` (countup) — ya no hay countup
- Los fade-in observers siguen funcionando sin cambios

---

## Pasos de implementación

### PASO 1 — Recortar sección 01 (La Historia)

**Qué hacer:**
1. Cambiar section label de `01 — GÉNESIS` a `01 — LA HISTORIA`
2. Cambiar el `id="historia"` del navbar link (ya apunta a `#historia`, OK)
3. Eliminar el bloque `story-divider` ("Conectando con el presente")
4. Eliminar los 2 párrafos que le siguen ("En cualquier organización..." y "El sistema actual...")
5. Eliminar el bloque `value-comparison` completo ($9,999 vs $1 con countup)

**Resultado:** Sección 01 termina justo después de la invoice card.

**Dependencias:** Ninguna.

---

### PASO 2 — Fusionar secciones 02+03 en nueva "02 El Problema"

**Qué hacer:**
1. Eliminar la transition strip entre 01→02 actual y reemplazar con texto nuevo: `"Hoy, el mismo problema persiste. Y tiene nombre."`
2. Cambiar section label de `02 — CONTEXTO DE MERCADO` a `02 — EL PROBLEMA`
3. Cambiar `id="contexto"` a `id="problema"` (reusar el id)
4. Reemplazar el título H2 y el párrafo intro con versión corta (3 líneas)
5. Reemplazar las 3 phase-cards con el timeline compacto horizontal (3 nodos + conectores)
6. Mantener el `paradox-block` exactamente como está
7. Eliminar TODO lo de la sección 03 original: transition strip 02→03, la sección completa (error-terminal, blindness-block, párrafo de cierre)

**CSS nuevo:** `.phase-timeline`, `.phase-node`, `.phase-node-num`, `.phase-connector` + media query mobile

**Resultado:** Una sola sección oscura con timeline + paradoja.

**Dependencias:** Paso 1.

---

### PASO 3 — Fusionar secciones 04+05 en nueva "03 La Solución"

**Qué hacer:**
1. Eliminar la transition strip 03→04 actual y reemplazar con texto nuevo: `"La brecha tiene solución. Se llama Steinmetz."`
2. Cambiar la sección 04 de `section-dark` a `section` (pasa de dark a light)
3. Cambiar section label de `04 — SOLUCIÓN` a `03 — LA SOLUCIÓN`
4. Cambiar `id="solucion"` a `id="solucion"` (se mantiene)
5. Editar `solution-def`: comprimir los 2 párrafos en 1 más directo
6. Mantener `capabilities-grid` (3 cards) exacto
7. Eliminar `value-prop-strip` (4 bullets)
8. Eliminar TODO lo de la sección 05 original: transition strip 04→05, la sección completa (metrics-band, target-grid, market-statement)
9. Mover el `market-statement` desde sec. 05 al final de la nueva sec. 03 (antes del cierre)
10. Actualizar la transition strip antes del cierre con texto: `"—— EL GENERADOR ESTÁ LISTO ——"` (ya existe, solo verificar)

**Resultado:** Una sola sección light con definición + capabilities + statement.

**Dependencias:** Paso 2.

---

### PASO 4 — Actualizar navbar

**Qué hacer:**
1. Cambiar los nav-links de 6 a 4:
   - `01 HISTORIA` → `#historia`
   - `02 PROBLEMA` → `#problema`
   - `03 SOLUCIÓN` → `#solucion`
   - `PROPUESTA` → `/propuesta/`
2. Actualizar el IntersectionObserver de nav para que funcione con los nuevos ids

**Dependencias:** Pasos 2-3.

---

### PASO 5 — Limpiar CSS

**Qué hacer:**
Eliminar los estilos de componentes que ya no existen:
- `.phase-card`, `.phase-num-big`, `.phase-top`, `.phase-number`, `.phase-title`, `.phase-body`, `.phase-desc`, `.phase-meta`, `.phase-meta-row`, `.phase-meta-key`, `.phase-meta-val`, `.phase-verdict`, `.active-phase`
- `.error-terminal`, `.error-terminal-header`, `.error-terminal-title`, `.error-list`, `.error-card`, `.error-code-col`, `.error-code`, `.error-icon`, `.error-body`, `.error-id`, `.error-title`, `.error-desc`, `.error-terminal-footer`
- `.blindness-block`, `.blindness-title`, `.blindness-desc`, `.localhost-example`
- `.value-comparison`, `.value-col`, `.value-col-label`, `.value-col-amount`, `.value-col-desc`
- `.metrics-band`, `.metric-cell`, `.metric-eyebrow`, `.metric-value`, `.metric-desc`
- `.target-grid`, `.target-card`, `.target-role`, `.target-context`, `.target-pain`
- `.vp-cell`, `.value-prop-strip`

**Dependencias:** Pasos 2-3.

---

### PASO 6 — Limpiar JS

**Qué hacer:**
1. Eliminar el observer de `.value-col-amount` (countup animation) — ya no hay countup
2. Verificar que los fade-in observers siguen funcionando (no dependen de clases eliminadas)
3. Verificar que el nav observer funciona con los nuevos section ids

**Dependencias:** Pasos 4-5.

---

### PASO 7 — Verificar y commit

**Qué hacer:**
1. Abrir en browser, recorrer todo el flujo: lockscreen → gateway → brief → cierre
2. Verificar que no hay CSS roto ni JS errors en console
3. Verificar mobile responsive
4. Commit y push

**Dependencias:** Todos los pasos anteriores.

---

## Orden de ejecución

```
Paso 1 (recortar sec. 01)        ← rápido, sin riesgo
Paso 2 (fusionar 02+03)          ← el más complejo
Paso 3 (fusionar 04+05)          ← segundo más complejo
Paso 4 (navbar)                  ← rápido
Paso 5 (limpiar CSS)             ← limpieza
Paso 6 (limpiar JS)              ← limpieza
Paso 7 (verificar + deploy)      ← cierre
```

---

*Steinmetz · Plan de Simplificación · 2025*
