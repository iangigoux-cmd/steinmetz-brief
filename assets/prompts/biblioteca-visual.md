# Steinmetz — Biblioteca visual

Prompts de generación para la identidad visual del landing. Todos producidos con
Gemini (imagen) y Veo (video).

**Esencia:** *la marca de tiza.* Precisión contra volumen. El valor no está en las
horas, está en saber dónde.

**Regla de dirección de arte:** en una categoría donde todas las empresas de IA
parecen software — gradientes, mallas neuronales, 3D abstracto — Steinmetz parece
**industria**. Acero, roca, polvo, fierro. Sin caras nunca.

---

## ADN de estilo

Bloque que va al final de todos los prompts. Es lo que mantiene la coherencia
entre imágenes generadas en sesiones distintas.

```
Cool palette: near-black, gunmetal, steel blue-grey, with a single muted rust
accent. Hard raking light from one side only, no fill, falling off into deep
unlit black. Surfaces are scratched, used, decades old, never polished.
Shallow depth of field. Fine natural grain, cinematic colour grade, subtle
anamorphic corner falloff. Severe, precise, institutional — the register of
Anduril and Palantir hardware photography. No people, no faces, no hands,
no text, no letters, no numbers, no logos. Photorealistic, not illustrated,
not 3D-rendered. Aspect ratio 16:9.
```

Ajustes según la toma:
- Plano general o cenital → cambiar `shallow depth of field` por `deep focus, sharp across the frame`.
- Minería → el acento pasa a `muted rust-ochre`.

---

## Estado

| # | Toma | Trabajo en el sitio | Estado |
|---|---|---|---|
| 1 | Marca de tiza sobre acero | Hero | ✅ `01-marca-tiza-acero.png` |
| 2 | Polvo a contraluz | Transición / cierre | ⚠️ regenerar — partículas tipo escombro + marco con esquinas redondeadas |
| 3 | Tablero eléctrico | Sección de IA | ⬜ pendiente |
| 4 | Bodegón de la tiza | (sin uso actual: duplicaba la tiza del hero) | ✅ `03-tiza-bodegon.png` |
| 5 | Cenital de la placa | Divisor a sangre | ✅ `05-cenital-placa-x.png` |
| 6 | Nave de estanques | Escala / respiradero | ✅ `02-nave-estanques.png` |
| 7 | Marcas en la roca | Sección historia (columna) | ✅ `08-marcas-en-roca.png` |
| 8 | Escala imposible | Candidata a hero | ⬜ pendiente |
| 9 | Testigos de sondaje | Método / diagnóstico | ✅ `06-testigos-sondaje.png` |
| 10 | Neumático minero | Divisor trabajo→quién | ✅ `07-neumatico-minero.png` |
| 11 | Rajo desde arriba | Divisor cartográfico | ⬜ pendiente |
| 12 | Mineral de cobre | Única licencia de color | ⬜ pendiente |
| V1 | El polvo se vuelve tiza y cae | Hero animado | ✅ `V1-polvo-a-tiza.mp4` — masters 2560 vía Real-ESRGAN x4plus en `assets/video/master-frames-2560/` |
| V2 | La marca se dibuja | Hero atado al scroll | ⬜ pendiente |
| V3 | Pull-back de escala | Reveal de la tesis | ⬜ pendiente |
| V4 | Barrido de tiza | Transición entre secciones | ⬜ pendiente |

---

## 1 · Marca de tiza sobre acero — HERO

```
Extreme macro photograph of a single white chalk X drawn by hand on a large
weathered cold-rolled steel plate. The chalk stroke is dry and powdery, its
edges crumbling, loose chalk dust caught in the grain of the metal and settled
along the bottom of the stroke. The steel shows faint mill scale, micro-
scratches, and a thin bloom of oxidation — industrial, used, never polished.

Hard raking light enters from the far left at a low angle, catching the tooth
of the metal and the texture of the chalk, then falling off into deep near-black
shadow across the rest of the frame. High contrast, deep blacks, no fill light.

Palette: near-black, gunmetal grey, cold steel blue-grey, with the chalk as the
only pure white in the frame.

The chalk mark sits in the lower-left third. The remaining two thirds of the
frame are empty dark steel — quiet negative space, unbroken, reserved for
typography.

Shot on a 100mm macro lens, shallow depth of field: the mark is razor sharp,
the surface falls softly out of focus toward the edges. Cinematic colour grade,
fine natural grain, subtle anamorphic falloff in the corners.

Mood: severe, precise, institutional. The aesthetic of Anduril and Palantir
hardware photography — restrained, serious, no romance.

No people, no faces, no hands, no text, no letters, no numbers, no logos,
no watermarks. Photorealistic, not illustrated, not 3D-rendered.

Aspect ratio 16:9.
```

**Si la tiza sale como pintura:** agregar `dry compressed chalk, chalky powder
residue, matte and porous, absolutely not paint, not liquid, not glossy`.
**Si el acero sale tipo render:** agregar `heavily used industrial surface,
decades old, uneven patina, imperfect`.

---

## 2 · Polvo a contraluz — VERSIÓN CORREGIDA

El primer intento salió con partículas tipo plumavit y un marco con esquinas
redondeadas. Esta versión ataca las dos cosas.

```
Extreme macro of extremely fine chalk powder suspended in a single hard shaft
of light against pure black. An almost weightless haze of microscopic
particles, like flour dust drifting in a sunbeam — individual motes barely
resolvable, only a handful large enough to catch a sharp highlight. Soft,
atmospheric, weightless. Absolutely not chunks, not debris, not gravel, not
snow, not styrofoam — powder only.

Cool palette: near-black and cold white, with the faintest steel blue-grey in
the light shaft. One hard directional light source from the side, no fill,
absolute black everywhere else. Very shallow depth of field. Fine natural
grain, cinematic colour grade. Real photography, captured in-camera — not a
3D render, not CGI. The image must fill the entire frame edge to edge: no
borders, no rounded corners, no letterboxing, no frame within the frame.
Aspect ratio 16:9.
```

---

## 3 · Tablero eléctrico

Acá vive la tensión analógico/digital: fierro viejo, inteligencia nueva.

```
Close-up of a decades-old industrial control panel: bakelite switches, worn
brass terminals, chipped grey enamel on pressed steel, a cracked glass gauge.
Among the analog components, one small modern seven-segment industrial display
glows cold white-blue — utilitarian, not futuristic — and is the only light
source in the frame, throwing hard shadows across the old metal. Old iron, new
intelligence.

[ADN de estilo]
```

**Riesgo:** que el display salga sci-fi. Insistir con `simple seven-segment
industrial display, utilitarian, not futuristic`.

---

## 4 · Bodegón de la tiza

```
Object portrait of a single worn stick of white chalk resting on a scratched
steel workbench. The chalk is short, used down, its end blunted and rounded
from work, fine dust scattered around it. Shot like a piece of precision
hardware in a catalogue: isolated, reverent, positioned low in the frame with
deep black space above it. The most humble tool, photographed like an
instrument.

[ADN de estilo]
```

**Para afinar:** la tiza salió demasiado nueva. Agregar `much shorter, worn
down to a stub, chipped and uneven at the tip`.

---

## 5 · Cenital de la placa

```
Perfectly overhead top-down shot of a large dark steel plate filling the frame
edge to edge, shot flat and square like a technical document. A single small
white chalk X sits off-centre in the lower left, dry and powdery with crumbling
edges and loose dust caught in the grain of the metal. The rest is
uninterrupted scratched steel. Rigid, graphic, almost diagrammatic — an aerial
view of a decision.

[ADN de estilo, con deep focus]
```

---

## 6 · Nave de estanques

```
Wide establishing shot inside an empty industrial hall at dawn. Rows of tall
stainless steel tanks recede into cold haze. Shafts of pale blue light fall from
high clerestory windows and cut through suspended dust. Wet concrete floor
holding faint reflections. Absolute stillness — the plant is running but nobody
is there. Vast, silent, operational.

[ADN de estilo, con deep focus]
```

**Nota:** salió más azul que el resto de la biblioteca. Corregir en el grade, o
agregar `less teal, more neutral gunmetal grey`.

---

## 7 · Marcas en la roca

La anécdota, literal: los mineros marcan dónde perforar.

```
Close-up of a raw rock face underground, wet and fractured, marked with several
hand-drawn white chalk crosses indicating drill points. The marks are dry and
powdery, uneven, made quickly by hand. Water seeps down the stone. One crude
work lamp rakes across the surface from the left, catching every crystal and
crack, everything else falling into total black.

[ADN de estilo, acento rust-ochre]
```

---

## 8 · La escala imposible — CANDIDATA A HERO

La tesis completa en una imagen: la intervención más chica sobre el problema
más grande.

```
A vast sheer rock wall of an open-pit mine fills the entire frame, monumental
and overwhelming, its terraces receding upward out of view. Somewhere in the
lower third, almost lost against the scale of the stone, sits a single small
white chalk X — deliberate, precise, unmistakably human. The contrast between
the immensity of the rock and the smallness of the mark is the subject.

[ADN de estilo, acento rust-ochre, deep focus]
```

---

## 9 · Testigos de sondaje

```
Overhead shot of drill core samples laid in long wooden core trays: cylinders
of grey and copper-veined rock, split, dusty, arranged in perfect parallel
rows receding across the frame. Some cores broken, some intact. The order is
obsessive and scientific — geology turned into data.

[ADN de estilo, acento copper-ochre, deep focus]
```

**Nota:** salió más clara y cálida que el resto. Es la imagen menos oscura de la
biblioteca — usar donde haga falta contraste, o bajarle exposición en el grade.

---

## 10 · Neumático minero

```
Extreme close-up of the tread of a mining haul truck tyre, so large it fills
the entire frame and gives no sense of where it ends. Deep chevron blocks of
worn rubber, embedded gravel, dried mud packed into the grooves, sidewall
scarred from rock. Monolithic, brutal, engineered.

[ADN de estilo, acento rust-ochre]
```

---

## 11 · Rajo desde arriba

```
High aerial view straight down into an open-pit copper mine at dawn. Concentric
terraced benches spiral down into darkness, the geometry reading almost like a
contour map or a technical drawing. Haul roads cut thin precise lines across
the rock. Long cold shadows fill the lower terraces. Immense, silent, no
vehicles visible.

[ADN de estilo, acento rust-ochre, deep focus]
```

---

## 12 · Mineral de cobre

La única licencia de color de todo el sitio. Guardarla para un momento.

```
Extreme macro of a fractured piece of raw copper ore against pure black. Veins
of oxidised turquoise and deep green run through dark grey host rock, with a
few metallic gold-bronze flecks of chalcopyrite catching the light. Crystalline,
sharp-edged, geological. The colour is the only saturation in an otherwise
monochrome world.

Palette: near-black and cold grey, with oxidised turquoise-green and bronze as
the sole colour. Hard raking light from one side only, no fill, absolute black
background. Very shallow depth of field, only a narrow band of the crystal in
focus. Fine natural grain, cinematic colour grade. Severe, precise,
institutional — Anduril and Palantir hardware photography. No people, no faces,
no hands, no text, no letters, no numbers, no logos. Photorealistic, not
illustrated, not 3D-rendered. Aspect ratio 16:9.
```

---

## V1 · El polvo se vuelve tiza y cae — VIDEO

Para el hero animado. Sembrar con la imagen #2 como primer frame para heredar
la atmósfera exacta.

```
Extreme macro, locked-off camera. A single hard shaft of light cuts through
absolute darkness. Fine white chalk powder hangs suspended in the beam,
drifting weightlessly.

The particles slow, then begin to draw together — spiralling inward,
compacting toward a single point at the centre of the frame. They fuse into
one solid stick of white chalk: short, worn, blunted at the tip. It hangs
motionless in mid-air for a beat.

Then it drops. It falls out of the beam and strikes a scratched dark steel
surface below, cracking sharply, bouncing once, and settling still — throwing
up a small burst of chalk dust that rises and hangs in the light.

Camera: static, no movement, no shake. Macro lens, very shallow depth of
field, the chalk razor sharp against a completely black background.

Lighting: one hard directional key from the left, no fill, everything outside
the beam falling into absolute black.

Palette: near-black, gunmetal, cold white. The chalk is the only pure white
in the frame.

Style: photorealistic in-camera footage, cinematic colour grade, fine natural
grain, subtle anamorphic falloff. Severe, precise, institutional — Anduril
and Palantir hardware photography. Not a 3D render, not CGI, not stylised.

Audio: near silence and low room tone, then the sharp dry crack of chalk
striking steel, and a soft settling.

No people, no faces, no hands, no text, no letters, no numbers, no logos.
Aspect ratio 16:9.
```

**Dos trucos de producción:**

1. Los modelos de video **ensamblan mal y destruyen bien**. Si el polvo no
   converge, pedí la toma al revés — `the chalk stick lifts off the steel,
   rises into the beam, and disintegrates into fine powder` — y reproducí el
   clip en reversa.
2. Si no logra las dos acciones en 8 segundos, **partilo en dos tomas**:
   la convergencia (generada al revés e invertida) y la caída (de frente, sale
   fácil). Da más control del timing, que es lo que importa para atarlo al
   scroll.

---

## Notas técnicas

**Watermark en video.** Veo estampa el mismo rombo, de 48×48 px a 96 px de la
esquina inferior derecha, en 1280×720. Se saca con
`assets/tools/limpiar-watermark-video.py`. Dos métodos que se probaron y
fallaron están documentados en el encabezado del script: el filtro `delogo` de
ffmpeg deja vetas verticales sobre textura, y pegar un parche cuadrado deja un
escalón porque las bandas de sombra son diagonales. Lo que funciona es detectar
la silueta exacta del rombo — ocupa solo el 10% de su caja — y rellenar
únicamente esa forma con Navier-Stokes.

Para cuando ni eso alcance, queda la salida sin reconstrucción: recortar a
`crop=1130:636:0:42` y reescalar a 1280×720 deja la marca fuera del cuadro a
costa del 13% del encuadre. Está guardada como `V1-polvo-a-tiza-recorte.mp4`.

**Watermark en imagen.** Gemini estampa un rombo de ~88×95 px con su esquina inferior-
derecha a 195 px del borde. Se saca con
`assets/tools/limpiar-watermark.py`, que busca el parche más parecido dentro de
la misma imagen en vez de inventar píxeles — el inpaint automático deja
manchones sobre textura con contraste. No saca el SynthID invisible de Google,
que es irrelevante para uso propio.

**Peso.** Las PNG originales pesan 4–10 MB cada una. Antes de servirlas hay que
pasarlas a WebP/AVIF y generar versiones responsive. No commitear las PNG
crudas al repo del sitio.

---

## V2 · La marca se dibuja — HERO ATADO AL SCROLL

El más valioso de la biblioteca de video. Scrolleás y la X aparece; subís y se
borra. El usuario hace la marca con su propio scroll.

```
Extreme macro, locked-off camera. A large weathered cold-rolled steel plate
fills the frame, scratched and faintly oxidised, lit by one hard raking light
from the far left. The surface is empty.

A white chalk stroke begins to appear on the steel, drawing itself across the
plate — the first diagonal of an X, laid down steadily as if by an unseen
hand. Chalk dust bursts off the leading edge and drifts through the light. A
brief pause. Then the second diagonal crosses it, and the X is complete. Loose
powder settles into the grain of the metal and goes still.

Camera: absolutely static, no movement, no shake. Macro lens, shallow depth of
field, the stroke razor sharp.

Lighting: one hard directional key from the far left, no fill, the right of
the frame falling into deep near-black.

Palette: near-black, gunmetal, steel blue-grey. The chalk is the only pure
white in the frame.

Style: photorealistic in-camera footage, cinematic colour grade, fine natural
grain, subtle anamorphic falloff. Severe, precise, institutional — Anduril and
Palantir hardware photography. Not a 3D render, not CGI, not stylised, not
animated.

Audio: low room tone, then the dry scrape of chalk dragging across steel.

No people, no faces, no hands, no text, no letters, no numbers, no logos.
Aspect ratio 16:9.
```

**Decisión abierta: la mano.** Que el trazo aparezca solo es medio fantasmal y
puede pelear con el registro fotoreal. La alternativa es dejar entrar una mano
— un puño cerrado sobre la tiza, nada más. No revela que la empresa es una
persona, y es literalmente la anécdota. Ian dijo "sin caras"; las manos las
excluyó Claude. Para probarlo: sacar `no hands` y agregar `a single weathered
hand grips the chalk, entering from the left edge of frame`.

**Para el scroll:** generarla hacia adelante. El reverso da el borrado gratis.

---

## V3 · Pull-back de escala — EL REVEAL DE LA TESIS

```
Extreme macro of a single small white chalk X on grey stone, sharp and
intimate, filling the frame. The camera begins to pull back, slowly and
steadily, and keeps pulling — the mark shrinking as more and more rock enters
the frame. Terraces appear. The scale keeps expanding far past what the
opening shot implied, until the mark is a barely visible speck against the
vast sheer wall of an open-pit mine, its benches receding upward out of view.

Camera: a single continuous dolly-back, smooth, mechanical, no cuts, no shake,
constant speed.

Lighting: hard low dawn sun raking across the rock face from one side, deep
unlit shadow in the terraces.

Palette: near-black, cold grey stone, steel blue shadow, with a single muted
rust-ochre accent in the exposed ore.

Style: photorealistic aerial cinematography, cinematic colour grade, fine
natural grain. Severe, precise, institutional — Anduril and Palantir hardware
photography. Not a 3D render, not CGI.

Audio: wind, distance, near silence.

No people, no faces, no hands, no vehicles, no text, no letters, no numbers,
no logos. Aspect ratio 16:9.
```

**Riesgo alto:** los modelos de video deforman la roca durante un pull-back
largo — la geometría cambia a mitad de camino. Si pasa, **no insistir**:
generar el prompt #8 como foto fija en máxima resolución y hacer el pull-back
con `transform: scale()` atado al scroll. Se ve idéntico, pesa una fracción, y
el timing queda exacto. Un movimiento de cámara sobre un plano fijo no necesita
video.

---

## V4 · Barrido de tiza — LA TRANSICIÓN REUTILIZABLE

El menos vistoso y el más útil: es el sistema de transición de todo el sitio.

```
Extreme macro against pure black. A broad white chalk stroke sweeps rapidly
across the frame from left to right, laid down in one fast continuous motion,
throwing a trail of fine powder that billows and drifts behind it. The stroke
covers the entire width of the frame edge to edge, then holds. A moment later
the chalk begins to break apart and disperse, the powder lifting and clearing
until the frame returns to pure black.

Camera: absolutely static, no movement.

Lighting: one hard side light catching only the chalk and its dust. Everything
else is absolute, featureless black — no surface, no texture, no background
detail whatsoever.

Palette: pure black and cold white only.

Style: photorealistic high-speed footage, fine natural grain. Not a 3D render,
not CGI, not stylised.

Audio: a single fast dry scrape.

No people, no faces, no hands, no surfaces, no text, no letters, no numbers,
no logos. Aspect ratio 16:9.
```

**Cómo se monta:** insistir con el fondo negro absoluto. Así se compone en CSS
con `mix-blend-mode: screen` y el negro desaparece solo — la tiza queda
flotando sobre cualquier sección sin necesidad de canal alfa. Un solo clip de
2 segundos sirve como wipe entre todas las secciones, y en reversa da la
entrada además de la salida.
