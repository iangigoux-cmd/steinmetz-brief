# Arquitectura de Dominio — Steinmetz

## El problema

Hay dos archivos HTML que representan dos documentos distintos:

| | `index.html` | `steinmetz_propuesta_valor.html` |
|---|---|---|
| **Título** | Brief de Posicionamiento | Propuesta de Valor & Análisis Competitivo |
| **Formato** | Página scrollable con gateway | Slide deck (16 slides, scroll-snap) |
| **Tono** | Narrativo, fundacional | Analítico, data-driven |
| **Audiencia** | Alguien que NO conoce Steinmetz | Alguien que ya entiende el concepto |
| **Pregunta que responde** | "¿Qué es Steinmetz y por qué importa?" | "¿Cómo se posiciona y cómo va a ganar?" |

Son documentos complementarios, no redundantes. El **Brief** cuenta la historia. La **Propuesta** presenta la evidencia. Juntos forman un argumento completo.

---

## Mapa de contenido: qué tiene cada uno

### Contenido ÚNICO de index.html (Brief)
- Lockscreen con password gate
- Gateway cinematográfico (4 pantallas: hook, versus, pipeline, gate)
- La historia de Steinmetz/Ford + factura ($1 / $9,999)
- Las 3 fases de la IA (Chat → Copiloto → Orquestación Autónoma)
- La Paradoja de la Implementación (beneficiarios vs configuradores)
- Los 3 ERR codes (colapso TI, herramienta sombra, ceguera de infra)
- El síntoma del localhost ("¿no es solo abrir el puerto?")
- Definición de Steinmetz como solución (3 capabilities + 4 value props)
- Contact screen con animación CRT

### Contenido ÚNICO de propuesta_valor.html (Propuesta)
- Cadena de valor de 6 eslabones (pipeline visual)
- Terminal de deploy (OK/PARTIAL/FAIL por eslabón)
- Los 3 vértices del moat (velocidad, conectividad, governance)
- Tabla competitiva reducida (4 competidores × 4 capabilities)
- Mapa competitivo extendido (6 competidores × 5 capabilities)
- 3 señales de demanda validada (localhost, presupuesto consultoría, pricing premium)
- 4 riesgos con severity y mitigación
- Ventana de 1-3 meses
- GTM: estrategia de célula ancla en 3 pasos
- 4 reglas de cierre

### Contenido SUPERPUESTO (mismo concepto, diferente ángulo)

| Concepto | En el Brief | En la Propuesta |
|---|---|---|
| **Qué es Steinmetz** | Sección 04: definición narrativa + 3 capabilities | Slides 1-3: cadena de valor + pipeline + chain strip |
| **Mercado objetivo** | Sección 05: B2B metrics + 3 personas (COO/CFO/GerOps) | Slide 10: 3 señales de demanda + 3 condiciones (C1/C2/C3) |
| **Tesis de mercado** | Sección 05: "Vende la capacidad de cruzar el abismo..." | Slide 11: "Entra a definir un mercado nuevo..." |
| **El COO como punto de entrada** | Sección 05: target card del COO | Slide 14: GTM "entrar por el COO, no por TI" |
| **Hero/Typewriter** | STEINMETZ. en 6 combos de font/color | STEINMETZ. en 6 combos de font/color (idéntico) |
| **Meta grid** | Sector/Modelo/Estado | Etapa/Mercado/Modelo |
| **Cierre + CTA** | Botón → contact screen | Botón → WhatsApp |
| **Sin vs Con Steinmetz** | Gateway versus screen (terminal comparison) | Slide 1 terminal (deploy OK/FAIL) |

**La superposición es conceptual, no textual.** No hay párrafos copiados. Pero el usuario que lee ambos documentos siente repetición en 3 áreas:
1. La definición de qué hace Steinmetz (inevitable — ambos deben explicarlo)
2. El argumento de mercado B2B
3. El COO como buyer

---

## Diagnóstico: qué funciona y qué no

**Lo que funciona:**
- Son dos documentos con propósitos claros y distintos
- El Brief es mejor como primera impresión (más emocional, más memorable)
- La Propuesta es mejor como deep-dive de inversión (más datos, más estructura)
- El design system es consistente entre ambos

**Lo que NO funciona para un dominio:**
- No hay navegación entre ellos
- Ambos tienen hero/typewriter/meta-grid idénticos → si los ves seguidos, se siente repetido
- Ambos tienen lockscreen/gateway que NO deberían repetirse en un segundo documento
- No hay jerarquía clara: ¿cuál es la "home"? ¿cuál es la subpágina?
- El cierre de cada uno no conecta con el otro

---

## Propuesta de arquitectura

### Estructura del dominio

```
steinmetz.cl (o el dominio que sea)
│
├── /                    ← LANDING (index.html, rediseñado)
│   El gateway + el brief completo
│   Es lo primero que ve cualquier persona
│
├── /propuesta           ← PROPUESTA DE VALOR (propuesta_valor.html, ajustado)
│   El slide deck con el análisis competitivo
│   Se accede desde el brief o con link directo
│
└── /brief.pdf           ← (Futuro) Versión PDF descargable
```

### Cambios necesarios

#### 1. Navegación cruzada

**En index.html (landing):**
- En el cierre (sección 06), agregar un tercer botón: `"Ver Propuesta de Valor →"` que lleva a `/propuesta`
- En el navbar, agregar un link: `"PROPUESTA"` al final de los nav-links, que lleva a `/propuesta`

**En propuesta_valor.html:**
- Eliminar el hero typewriter (slide 0) y reemplazarlo con un hero más compacto que NO repita el typewriter. Opciones:
  - **Opción A (recomendada):** Hero minimalista dark — solo el título "Propuesta de Valor & Análisis Competitivo", los badges, y un botón "← Volver al Brief" + un breadcrumb `STEINMETZ > PROPUESTA DE VALOR`. Sin typewriter, sin meta grid (ya se vio en el brief).
  - **Opción B:** Mantener el hero pero cambiar el typewriter por un elemento visual diferente (e.g., el pipeline flow estático de los 6 eslabones como preview).
- En el cierre (slide 15), cambiar el CTA ghost "Volver al inicio" por `"← Volver al Brief"` que lleva a `/`

#### 2. Eliminar el lockscreen de la propuesta

La propuesta NO necesita lockscreen. El lockscreen es la experiencia de entrada al universo Steinmetz — sucede una vez, en la landing. Si alguien llega directo a `/propuesta` (link compartido), no debería tener que poner password.

**Opción:** Si se quiere mantener la sensación de documento restringido, agregar un banner sutil al top de la propuesta: `"DOCUMENTO CONFIDENCIAL · STEINMETZ · 2025"` en Fira Code 10px — sin gate.

#### 3. Deduplicar contenido con intención

NO hay que eliminar toda la superposición. Un lector puede llegar a la propuesta sin haber leído el brief (link directo). La propuesta debe ser autocontenida. Pero se puede reducir la repetición:

| Área superpuesta | Acción |
|---|---|
| **Hero typewriter** | Eliminar de propuesta. El brief es la primera impresión. |
| **Meta grid (Sector/Modelo/Estado)** | Eliminar de propuesta. Mantener solo badges. |
| **Definición de Steinmetz** | Mantener en ambos pero con ángulos distintos (ya lo están). No tocar. |
| **Mercado B2B / target personas** | El brief tiene las 3 personas (COO/CFO/GerOps). La propuesta tiene las 3 señales de demanda + condiciones. Complementarios, no duplicados. No tocar. |
| **COO como entry point** | El brief lo menciona en el target card. La propuesta lo desarrolla en el GTM. Complementario. No tocar. |
| **Cierre con CTA** | Diferente CTA en cada uno. El brief invita a conversar. La propuesta invita a volver al brief o a WhatsApp. Está bien. |

#### 4. Hilo narrativo entre documentos

El flujo ideal para un lector:

```
Lockscreen → Gateway (30s de hook)
    ↓
Brief completo (lectura de ~8 min)
    ↓
"¿Quieres ver el análisis detallado?"
    ↓
Propuesta de Valor (lectura de ~10 min)
    ↓
"Iniciar conversación" → WhatsApp/Contacto
```

Para que este flujo sea natural:

- **Final del Brief → entrada de la Propuesta:** El cierre del brief debe tener un CTA secundario que diga algo como: `"Ver el análisis competitivo completo"` o `"Propuesta de Valor & Análisis →"`. No es el CTA primario (ese sigue siendo "Iniciar conversación"). Es la opción para el que quiere más datos antes de decidir.

- **Inicio de la Propuesta:** Debe sentirse como una continuación, no como un documento separado. Un mini-hero que diga: `"Ya conoces la historia. Ahora los números."` o simplemente un header limpio con el título y un link de vuelta.

#### 5. Renombrar archivos para el dominio

```
index.html                        →  index.html (se mantiene como /)
steinmetz_propuesta_valor.html    →  propuesta.html (se sirve como /propuesta)
```

O si se usa GitHub Pages con directorios:
```
/index.html                       →  steinmetz.cl/
/propuesta/index.html             →  steinmetz.cl/propuesta
```

---

## Resumen de cambios concretos

### En index.html (mínimos)
1. Agregar `"PROPUESTA"` al navbar
2. Agregar botón terciario en el cierre → `/propuesta`
3. (Opcional) Agregar link en el footer: `"Ver Propuesta de Valor →"`

### En propuesta_valor.html (moderados)
1. Eliminar o simplificar el hero (quitar typewriter + meta grid duplicados)
2. Agregar header/breadcrumb con link de vuelta al brief
3. Agregar `"← Volver al Brief"` en el cierre
4. Eliminar lockscreen si lo tuviera (no lo tiene, pero asegurarse de que no se agregue)
5. Renombrar a `propuesta.html`

### Nuevos archivos necesarios
- Ninguno. Solo ajustes a los existentes.
- (Futuro) Se podría agregar un `404.html` si se usa dominio propio.

---

## Nota sobre GitHub Pages vs dominio propio

Si el dominio se conecta a GitHub Pages:
- El repo `steinmetz-brief` se puede configurar con custom domain en Settings → Pages
- Se necesita un archivo `CNAME` en la raíz del repo con el dominio (e.g., `steinmetz.cl`)
- DNS: agregar un registro CNAME apuntando `www` a `iangigoux-cmd.github.io` o registros A apuntando a las IPs de GitHub Pages
- HTTPS se activa automáticamente después de que DNS propague

```
# Archivo CNAME (nuevo, en la raíz del repo)
steinmetz.cl
```

Si se quiere `/propuesta` como ruta limpia:
```
/propuesta/index.html    →  steinmetz.cl/propuesta/
```
O simplemente:
```
/propuesta.html          →  steinmetz.cl/propuesta.html
```
(GitHub Pages sirve ambos formatos)

---

*Steinmetz · Arquitectura de Dominio · v1.0 · 2025*
