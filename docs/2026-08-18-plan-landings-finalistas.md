# Plan — dos landings completos sobre las finalistas 7 y 24

_2026-08-18 · Brief de Ian: "quiero que crees un landing para ambos. completo,
simple y minimalista. planea y ejecuta." Sin modificar los heros originales._

## Dónde viven

- `lab/7/index.html` y `lab/24/index.html` **no se tocan** (son los heros
  originales aprobados).
- Los landings van en `lab/7/landing/index.html` y `lab/24/landing/index.html`.
  Cada hero original recibe **un único enlace** discreto en el pie hacia su
  landing ("VER LANDING →") — es la única línea que se agrega, sin alterar
  nada visual del hero.
- URLs: `steinmetz.cl/lab/7/landing/` y `steinmetz.cl/lab/24/landing/`.

## Qué comparten (esqueleto único, piel distinta)

Estructura fija de **6 secciones**, scroll libre, sin secuestrar nada:

| # | Sección | Contenido |
|---|---|---|
| 0 | **Hero** | El hero original de cada finalista, reproducido con su mecánica (magnetismo / tallado), con copy real |
| 1 | **La historia** | Steinmetz/Ford en 3 párrafos cortos + la factura ($1 · $9.999 · $10.000) |
| 2 | **Qué hacemos** | Tres líneas: leer la operación real · construir dentro de tu red · dejarlo encendido |
| 3 | **El trabajo** | Dos casos sin logos ("una de las grandes cerveceras de Chile" / "una empresa de genética aplicada") + "referencias a solicitud" |
| 4 | **Quién** | Ian Berndt, un solo responsable; correo y teléfono |
| 5 | **Contacto** | Encuadre (semanas, precio cerrado, 30 min sin costo) + CTA mailto + WhatsApp alternativo; pie con RUT |

Copy compartido, tomado de lo que sobrevivió las tres revisiones (nada de
inventar métricas). Movimiento en el cuerpo: **solo fades de opacidad al entrar
en viewport** (CSS `animation-timeline: view()` con fallback IntersectionObserver)
— nunca parallax, nunca scroll como control.

Sistema tipográfico común: **Fraunces** (display) + **IBM Plex Mono** (etiquetas,
datos, cifras) + **Instrument Sans** (lectura). El nombre "Steinmetz" siempre en
Fraunces.

## En qué divergen

|  | **7 · Las letras** | **24 · El cantero** |
|---|---|---|
| Piel | Blanco puro `#ffffff`, tinta `#111112`, sin acento | Piedra cálida `#e6e1d6`, tinta `#262119`, acento óxido `#a4501f` |
| Hero | "Steinmetz" magnético (peso por cercanía del cursor) + una línea + CTA | El tallado a golpes con esquirlas + definición + "Nosotros tallamos sistemas." |
| Textura | Ninguna — el blanco es la textura | Grano de piedra + veta cálida (`body::before/::after`) |
| Reglas | Hairlines finas `rgba(17,17,18,.14)` | Reglas talladas: 1px oscuro + 1px claro debajo (bajorrelieve) |
| Cifras de la factura | Tabular, tinta | Tabular, óxido en el $9.999 |
| Motivo recurrente | El peso variable: los títulos de sección engordan levemente al hover | El bajorrelieve: títulos con la misma sombra doble del hero |
| Copy del hero | "Ingeniería en inteligencia artificial. Santiago de Chile." | "Cantero — el que talla la piedra, golpe a golpe, donde corresponde." |

## Presupuestos y reglas

- Sin frameworks, sin build. Un HTML por landing con CSS y JS inline (misma
  convención que el lab).
- Fuentes vía Google Fonts (ya usadas por los heros).
- `prefers-reduced-motion`: heros en estado final, sin fades.
- Peso objetivo: < 150 KB sin fuentes. Cero imágenes — todo tipografía y CSS.
- Móvil: una columna, hero reduce tamaño con `clamp`.

## Verificación

Playwright: screenshots de las 6 secciones × 2 landings, desktop y móvil;
cero errores de consola; enlaces mailto/wa válidos; conmutador ausente en los
landings (son páginas completas, no comparables por pill).
