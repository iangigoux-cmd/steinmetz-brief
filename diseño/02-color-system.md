# Color System: "Infraestructura de Élite"

## 1. Reglas Generales
* **Contraste Estructural:** La interfaz se define por líneas duras. Usaremos bordes casi negros para delimitar contenedores y cuadrículas (grids), creando una sensación de "plano arquitectónico" o panel de control físico.
* **Fondo vs. Superficie:** El fondo de la aplicación es un gris industrial muy claro (papel técnico). Las tarjetas y paneles son de color blanco puro para generar un contraste limpio y cortante.
* **Acentos como LEDs:** Los colores semánticos y de marca no se usan para decorar fondos grandes. Se usan como luces indicadoras (líneas finas de 1px, puntos de estado, o insignias sólidas muy pequeñas).

## 2. Paleta Base (Backgrounds & Grids)
La estructura física de la aplicación.

* `--bg-canvas: #F4F4F2;` (Gris industrial claro / "Papel técnico". Fondo general).
* `--bg-surface: #FFFFFF;` (Blanco puro. Para paneles de datos, tablas y tarjetas).
* `--bg-surface-hover: #EAEAEA;` (Gris frío para el estado interactivo mecánico).
* `--border-subtle: #D4D4D4;` (Para divisiones internas menores en tablas).
* `--border-strong: #171717;` (Casi negro. **CRUCIAL:** Se usa para bordear las tarjetas principales, modales y botones, dándoles ese aspecto brutalista y definido).

## 3. Tipografía (Text & Ink)
Tinta de alta densidad para máxima legibilidad.

* `--text-primary: #171717;` (Tinta negra industrial. Títulos, datos clave y datos de tablas).
* `--text-secondary: #525252;` (Gris plomo. Descripciones y metadatos).
* `--text-tertiary: #A3A3A3;` (Gris acero. Placeholders y labels secundarios).

## 4. Acento de Marca (Brand)
No usamos colores suaves. Usamos un tono eléctrico y exacto que evoca tecnología de alto rendimiento.

* `--brand-primary: #2563EB;` (Azul Cobalto / Eléctrico. Transmite precisión técnica y seguridad financiera).
* `--brand-hover: #1D4ED8;` (Azul profundo para interacciones).
* `--brand-surface: #EFF6FF;` (Fondo azul levísimo para resaltar filas seleccionadas o inputs activos).

## 5. Colores Semánticos (The LED Indicators)
A diferencia del estilo anterior, aquí los estados no son pasteles suaves. Son colores puros, funcionales y saturados, como los indicadores de un servidor o maquinaria pesada. Se usan en textos, bordes o puntos (dots), rara vez como fondo completo.

**Success (Conforme)**
* `--status-success-base: #059669;` (Verde Terminal).
* `--status-success-bg: #ECFDF5;` (Solo para fondos de insignias minúsculas).

**Warning (Observación / Pendiente)**
* `--status-warning-base: #D97706;` (Naranja / Amarillo Seguridad).
* `--status-warning-bg: #FFFBEB;`

**Danger (No Conforme)**
* `--status-danger-base: #DC2626;` (Rojo Alarma Industrial).
* `--status-danger-bg: #FEF2F2;`

**Info (Neutral / Informativo)**
* `--status-info-base: #4F46E5;` (Índigo Técnico).
* `--status-info-bg: #EEF2FF;`