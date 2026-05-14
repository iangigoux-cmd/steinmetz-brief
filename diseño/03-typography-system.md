# Typography System: "Infraestructura de Élite"

## 1. El Sistema Dual (The Precision Stack)
Abandonamos la estética editorial. Stainmetz es software de grado industrial y su tipografía debe reflejar exactitud matemática y eficiencia espacial.

* **La Interfaz Estructural (Sans): `Inter` (Google Fonts)**
  * *Uso:* Titulares (H1, H2, H3), menús, botones, párrafos explicativos.
  * *Por qué:* Es la tipografía estándar de la alta tecnología financiera y la infraestructura en la nube. Con los ajustes correctos de espaciado, se ve fría, cortante y ultra-profesional.
* **El Núcleo de Datos (Mono): `JetBrains Mono` o `Fira Code` (Google Fonts)**
  * *Uso masivo:* No solo para código. Se usa obligatoriamente en: IDs de evaluación (`EVAL-901`), fechas, porcentajes, etiquetas superiores (eyebrows), indicadores de estado y cualquier métrica que el directorio deba revisar.
  * *Por qué:* Transmite la idea de que los datos son inmutables y generados por un sistema, no escritos por un humano.

## 2. Escala Tipográfica y Tensión (Scale & Tracking)
El secreto de este estilo está en cómo se aprietan las letras grandes y cómo se separan las letras pequeñas.

**Estructura y Títulos (Inter)**
* `--font-display: 48px / 1.1 / SemiBold (600) / Tracking: -0.03em;` (Titulares grandes, muy apretados para dar sensación de bloque de acero).
* `--font-h1: 32px / 1.2 / SemiBold (600) / Tracking: -0.02em;`
* `--font-h2: 20px / 1.3 / Medium (500) / Tracking: -0.01em;`

**Interfaz y Lectura (Inter)**
* `--font-body: 14px / 1.5 / Regular (400);` (Párrafos base. Reducimos el tamaño estándar de 16px a 14px para dar la sensación de un dashboard técnico denso).
* `--font-ui: 13px / 1.5 / Medium (500);` (Botones, navegación, tabs).

**Datos y Etiquetas (Mono)**
* `--font-mono-lg: 24px / 1.2 / Medium (500) / Tracking: -0.02em;` (Métricas gigantes en los dashboards).
* `--font-mono-base: 12px / 1.5 / Regular (400);` (Celdas de tablas, IDs, logs).
* `--font-mono-label: 11px / 1.4 / Medium (500) / Tracking: 0.08em;` (Etiquetas en mayúsculas. Muy separadas para contraste técnico).

## 3. Reglas de Composición (Typesetting)
* **Capitalización Técnica:** Los *eyebrows* (textos pequeños sobre los titulares) y las cabeceras de las tablas DEBEN ir siempre en MAYÚSCULAS usando la tipografía Mono con tracking amplio (`0.08em`).
* **Alineación Monospaciada:** Todos los números en tablas e interfaces deben estar perfectamente alineados a la derecha o tabulados. La tipografía Mono asegura que el dígito `1` ocupe exactamente el mismo espacio que el `0`, permitiendo comparar columnas de auditoría de un vistazo.
* **Contraste de Peso:** No usamos el peso `Bold (700)` casi nunca. El contraste se logra usando `SemiBold (600)` para títulos contra `Regular (400)` para textos, o cambiando el color de la fuente a gris (`--text-secondary`).