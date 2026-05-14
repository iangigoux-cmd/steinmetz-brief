# Spacing, Grid & Borders: "Infraestructura de Élite"

## 1. La Cuadrícula Visible (The Blueprint Grid)
Toda la interfaz se construye sobre una base estricta de 8px. Sin embargo, a diferencia de los diseños modernos convencionales, los contenedores principales suelen estar delimitados por un borde físico (`--border-strong` o `--border-subtle`), creando la sensación de un plano arquitectónico.

* `--space-3xs: 2px;` (Micro-ajustes técnicos).
* `--space-2xs: 4px;` (Separación entre un icono y un valor numérico).
* `--space-xs: 8px;` (Densidad base. Espaciado en celdas de tablas de datos crudos).
* `--space-sm: 12px;` (Padding interno de botones y campos de formulario).
* `--space-md: 16px;` (Padding interno estándar para tarjetas de métricas).
* `--space-lg: 24px;` (Separación entre bloques de información dentro de un mismo panel).
* `--space-xl: 32px;` (Padding de contenedores principales).
* `--space-2xl: 48px;` (Márgenes entre secciones del layout).
* `--space-3xl: 64px;` (Márgenes de la página).

## 2. Radios de Borde (Sharp & Mechanical)
La autoridad y la precisión no tienen bordes suaves. Las esquinas redondeadas se asocian a redes sociales y aplicaciones de consumo. Stainmetz usa bordes casi afilados para mantener la tensión industrial.

* `--radius-none: 0px;` (Paneles interiores anidados, tablas de logs, divisiones de cuadrícula que tocan los márgenes).
* `--radius-sm: 2px;` (Checkboxes, etiquetas pequeñas de estado semántico, teclas de atajos).
* `--radius-md: 4px;` (El estándar máximo. Inputs, botones, tarjetas principales).
* *Regla inquebrantable:* Absolutamente prohibido usar `rounded-lg`, `rounded-xl` o `rounded-full` (pastillas), excepto para los puntos (dots) indicadores de estado (ej. el punto verde de "Conforme").

## 3. Elevación Estructural (Prohibido el Blur Suave)
En este estilo, el diseño es crudo y táctil. No simulamos luz difusa; simulamos capas de material físico apiladas.

* **Nivel 0 (Fondo):** Fondo `--bg-canvas`. La mesa de trabajo.
* **Nivel 1 (Paneles):** Fondo `--bg-surface` con un borde `--border-subtle` de 1px.
* **Nivel 2 (Módulos Activos / Tarjetas Destacadas):** Fondo `--bg-surface` delimitado por un borde grueso o negro `--border-strong` de 1px. 
* **Nivel 3 (Modales y Flotantes):** No usan sombras difuminadas. Usan una sombra técnica y cortante.
  * `--shadow-structural: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--border-strong);`

## 4. Densidad de Componentes (Data Density)
* **Paneles de Control (Dashboards):** Deben verse como terminales densas. Mucha información visible sin hacer scroll. Padding vertical de 8px a 12px máximo.
* **Líneas Divisorias:** Abusar de las líneas divisorias de 1px (`--border-subtle`). Si hay una lista de items, no solo los separes con espacio; pon una línea entre cada uno. Esto aumenta dramáticamente la percepción de orden corporativo.
* **Contenedores de Formularios:** Enmarcados en bordes rígidos. El fondo del input es `--bg-canvas` cuando la tarjeta es `--bg-surface` para crear profundidad invertida (como si el campo estuviera tallado en la tarjeta).