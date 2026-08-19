# Mockups — la marca tallada en el mundo físico

_2026-08-18 · La palabra "Steinmetz" con el diseño del hero 24 (bajorrelieve
sobre piedra clara, serifa Fraunces 900) aplicada a superficies reales de
oficinas y edificios. Para Gemini._

## ADN del tallado — va al final de todos los prompts

```
The word "Steinmetz" — spelled exactly S-t-e-i-n-m-e-t-z, capital S, the rest
lowercase, no other text — carved as a shallow bas-relief INTO the surface
(recessed, not raised): a heavy high-contrast transitional serif typeface with
thin hairlines and dramatic thick strokes (in the manner of Fraunces at maximum
weight, or Didone-like), tight letter-spacing. The carved letters share the
material's colour, only slightly darker inside the cut; the relief reads purely
through light — a fine bright edge on the lower-right of each cut, a soft
shadow on the upper-left. Soft raking daylight from one side, no fill light.
Warm neutral palette: pale limestone, warm greys, bone white. Photorealistic
architectural photography, 50mm, shallow depth of field on the letters, fine
natural grain. Restrained, institutional, expensive — the register of a law
firm or a private bank, not a startup. No people, no logos, no other lettering,
no glow, no metallic finish. Aspect ratio 16:9.
```

**Si Gemini escribe mal la palabra:** repetir al principio del prompt
`The text must read exactly "Steinmetz" — nine letters, one word.` y pedir
`legible, sharp, centered`. Si insiste en errores, generar la palabra más
grande en el encuadre.

---

## 1 · El lobby — muro de recepción
```
Wide shot of a modern office lobby: a tall wall of pale limestone panels behind
a low black stone reception desk, polished concrete floor with faint
reflections, a single bench of light oak. Nothing on the wall except the
carved word, centred at eye level, about two metres wide. Morning light enters
from tall windows on the left. [ADN]
```

## 2 · La fachada — placa de acceso
```
Close-up of a building entrance: a large monolithic block of warm travertine
beside a dark bronze door frame, the carved word running horizontally across
the stone at chest height. Overcast soft daylight, wet pavement in the lower
frame, the door out of focus behind. [ADN]
```

## 3 · La sala — placa interior
```
Detail shot inside a meeting room: a slab of honed limestone set flush into a
white plaster wall next to a floor-to-ceiling window with a city view softly
blurred behind. The carved word occupies most of the slab. Late afternoon
light rakes across the stone from the window. [ADN]
```

## 4 · El pasillo — cenital
```
Overhead top-down shot of a wide corridor floor: large-format pale sandstone
tiles, the carved word set into a single darker inlaid slab at the threshold
of a glass door, letters about a metre wide. Even diffuse light with a subtle
directional shadow. Rigid, graphic, almost a plan view. [ADN]
```

## 5 · La esquina del edificio — piedra angular
```
Low-angle exterior shot of the corner of a contemporary building clad in pale
grey limestone: the carved word sits low on the corner stone like a foundation
inscription, small relative to the building, with the facade rising out of
frame above. Hard side sunlight, long shadows, deep blue sky reduced to a
sliver. [ADN]
```

## 6 · El escritorio — objeto
```
Object shot on a light oak desk: a small rectangular block of honed white
marble, the size of a book, standing on its edge, with the carved word across
its face; beside it, out of focus, a closed notebook and a fountain pen. Window
light from the left, shallow depth of field, calm and precise — a desk plaque
photographed like an instrument. [ADN]
```

---

## Notas

- Todos son la misma marca en seis escalas: **objeto → placa → muro → fachada
  → suelo → edificio.** Sirven para el landing (héroe o divisores), para el
  portal de clientes y para la propuesta comercial.
- Con las que salgan bien, correr `assets/tools/limpiar-watermark.py` (mapa
  adentro) y agregarlas a la biblioteca.
- La palabra en las imágenes es decorativa: si Gemini la escribe mal, se
  puede reemplazar por la versión web tallada (SVG/CSS) montada encima en
  postproducción — el fondo fotográfico es lo que importa.
