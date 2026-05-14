# Master Design Prompt: "Autoridad Documental"

## Instrucción Principal
**LEER SIEMPRE ESTO ANTES DE ESCRIBIR CÓDIGO DE INTERFAZ (UI/UX).**
Estás construyendo Stainmetz, una plataforma institucional de auditoría y evaluación corporativa de grado empresarial. Tu objetivo principal es generar una interfaz de usuario que transmita máxima autoridad, precisión matemática y calma visual. 

**Prohibido:** No uses patrones genéricos de SaaS de "startup". No intentes hacer que la interfaz se vea "divertida", "tecnológica hiper-moderna" o "neon". Destruye cualquier instinto de usar sombras pesadas, gradientes fuertes o bordes excesivamente redondeados.

## 1. Reglas Inquebrantables de Ejecución (Non-Negotiables)

### A. Tipografía (El pilar del diseño)
* **Titulares y Narrativa (H1, H2, Hero):** Usa obligatoriamente `Newsreader` (Google Fonts). Debe sentirse como un periódico financiero (ej. Financial Times).
* **Interfaz y Botones:** Usa obligatoriamente `Inter` (Google Fonts). Debe ser invisible y altamente funcional.
* **Datos, Logs, Tablas y Código:** Usa obligatoriamente `JetBrains Mono` o `Fira Code` (Google Fonts). Los números deben estar perfectamente alineados para su lectura técnica.
* **Peso Tipográfico:** No uses pesos intermedios. Los titulares deben tener presencia (Medium/Regular, nunca Bold extremo). La interfaz debe ser limpia (Regular/Medium).

### B. Uso del Color (Flat & Sharp)
* **Fondos:** Usa exclusivamente la paleta "pergamino" y grises cálidos definidos en `02-color-system.md` (`--bg-canvas`, `--bg-surface`). NUNCA uses blanco puro (`#FFFFFF`) ni negro puro (`#000000`).
* **Acentos:** El color principal es un terracota/arcilla sobrio (`--brand-primary`). Úsalo con moderación (solo para el CTA principal o enlaces activos).
* **Estados Semánticos:** Los estados de auditoría (Conforme, Observación, etc.) DEBEN usar los fondos pastel muy pálidos y textos oscuros definidos en el sistema. Jamás uses colores primarios saturados (rojo brillante, verde semáforo).

### C. Espaciado y Estructura (El Vacío Activo)
* Sigue la cuadrícula base de 8px (`04-spacing-tokens.md`).
* **Densidad de Tablas:** Las tablas de evaluación deben parecer hojas de cálculo profesionales. Padding vertical ajustado, padding horizontal generoso, solo bordes horizontales sutiles (1px, `--border-subtle`).
* **Formularios:** Espaciado amplio entre campos (`24px`). Etiquetas (`labels`) muy cerca del input (`4px`).

### D. Componentes y Decoración (Minimalismo Estricto)
* **Iconografía:** Usa exclusivamente la librería `Lucide React` (o CDN de Lucide). Iconos limpios, trazo de 1.5px o 2px máximo.
* **EMOJIS:** Absolutamente prohibido el uso de emojis en cualquier parte de la interfaz de usuario, badges, titulares o mensajes de estado.
* **Bordes (Radius):** Usa bordes casi cuadrados (`--radius-sm` o `--radius-md`). Prohibido usar pastillas (`rounded-full`) excepto para avatares o puntos indicadores de estado.
* **Sombras:** El diseño es predominantemente plano. Usa separación por color de fondo o bordes sutiles de 1px. Usa sombras extremadamente suaves y difusas SOLO para elementos flotantes (dropdowns, modales). Cero *glassmorphism*.

## 2. Flujo de Trabajo Requerido (Workflow)

Antes de modificar o crear un componente, DEBES:
1.  **Analizar el Contexto:** Entender si es un componente de lectura (reporte, tabla) o de acción (formulario, botón).
2.  **Aplicar el Sistema:** Mapear los requerimientos a los *tokens* exactos definidos en los archivos `.md` de este directorio.
3.  **Priorizar la Claridad:** Ante la duda, añade más espacio en blanco (padding/margin) y reduce el contraste de los contenedores secundarios.
4.  **Ejecutar:** Escribir el código asegurando la implementación de las tres tipografías correctas y la paleta cálida/pastel.