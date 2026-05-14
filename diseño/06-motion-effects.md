# Motion & Effects: "Autoridad Documental"

## 1. Filosofía de Movimiento (Mechanical & Instant)
El software de auditoría no juega con el usuario. Las interacciones no rebotan, no flotan y no se arrastran. Responden con la precisión de un interruptor mecánico de alta gama.

* **Prohibido:** Animaciones de "spring" (rebote), efectos parallax extremos, elementos que persiguen el cursor, o transiciones lentas que hagan sentir que el sistema está pensando.
* **Permitido:** Fades sutiles, cambios de color de fondo (color shifts), expansiones de acordeón instantáneas.

## 2. Reglas de Transición (CSS Transitions)
Toda transición debe ser apenas perceptible. Si el usuario nota la animación, es demasiado lenta.

* **Duración Estándar:** `150ms` a `200ms` máximo.
* **Easing:** Usar curvas de aceleración funcionales. `ease-in-out` o `linear` para opacidad. NUNCA usar `ease-out-back` o curvas elásticas.
* **Hover en Botones:** El botón NO se mueve hacia arriba (prohibido `translate-y`). Solo cambia su color de fondo a un tono más oscuro y sólido (`--brand-hover` o `--bg-surface-hover`).
* **Hover en Filas de Tabla:** Las filas de una tabla de auditoría solo reciben un ligerísimo oscurecimiento del fondo (`--bg-surface-hover`) al pasar el cursor. Cero sombras adicionales.

## 3. Carga y Estados de Espera (Loading States)
* **Prohibido:** Spinners gigantes de colores brillantes o barras de progreso con gradientes en movimiento.
* **Permitido:** Esqueletos de carga (skeleton loaders) estáticos con un "pulso" (pulse) de opacidad muy tenue y elegante. 
* **Texto de Carga:** Preferir indicadores textuales. Un simple "Evaluando registros..." en tipografía Mono (`Fira Code`) transmite mucha más autoridad técnica que un círculo girando.

## 4. Aparición de Contenido (Scroll & Page Load)
Para la landing page o la entrada a un dashboard denso:
* **Fade-up sutil:** Los elementos pueden entrar deslizándose hacia arriba un máximo de `10px` mientras su opacidad pasa de 0 a 1.
* **Staggering (Escalonamiento):** Si aparece una lista de características o resultados de auditoría, deben aparecer en secuencia muy rápida (ej. 50ms de diferencia entre cada uno) para simular la ingesta de datos en tiempo real.

## 5. Efectos de Capa (Prohibición de Glassmorphism)
* **Regla estricta:** NO usar `backdrop-blur` extremo. El estilo "vidrio esmerilado" pertenece a las apps de consumo, no a los documentos institucionales.
* Si un modal o menú desplegable necesita separarse del fondo, usa un overlay de color crema o gris cálido (`#FAF9F6`) con opacidad del 90%, sin difuminado óptico.