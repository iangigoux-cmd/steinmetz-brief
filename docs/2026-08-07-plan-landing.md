# Plan — Landing de Steinmetz

_2026-08-07 · borrador para revisión_

Plan para construir el landing público de Steinmetz desde cero. El portal de
clientes es un proyecto aparte; acá solo se le deja la puerta.

Recursos ya producidos: 8 imágenes y 1 video en `assets/`, con sus prompts en
`assets/prompts/biblioteca-visual.md`.

---

## 1. Qué aprendimos de los referentes

Sitios revisados: Palantir, Anduril, Linear, Metalab, Anthropic — más Sierra y
37signals que entraron en la primera ronda.

> **Nota de método:** Linear, Metalab, 37signals, Sierra y Anthropic se leyeron
> directo del sitio. Palantir y Anduril son SPAs que renderizan con JavaScript y
> no devuelven contenido al raspado; la lectura de esos dos viene de
> conocimiento previo, no de verificación de hoy.

### El patrón que se repite

**Ninguno explica. Todos afirman una sola cosa y después muestran pruebas.**

- Metalab dice "We make interfaces" y pasa directo al trabajo.
- Linear repite su headline tres veces y muestra screenshots del producto.
- Sierra dice una frase y descarga treinta logos de clientes.
- 37signals pone su filosofía antes que sus productos.
- Anthropic se lee como institución de investigación, no como startup.

Ninguno tiene grilla de features con checkmarks. Ninguno tiene "cómo funciona en
tres pasos". Ninguno dice "prueba gratis".

Son **cortos**: cinco a siete secciones, frases en vez de párrafos.

Palantir y Anduril agregan lo que los otros no tienen: **un antagonista**.
Anduril no vende drones, vende el reemplazo de los contratistas históricos.
Ese es el componente de disrupción.

### Qué se toma para Steinmetz

| De | Se toma |
|---|---|
| Metalab | Brevedad brutal en el hero. El trabajo hace la prueba. |
| Linear | Nivel de artesanía. La ejecución del sitio *es* el argumento. |
| Anduril | Fotografía cinematográfica de lo tangible. Tener un enemigo. |
| Palantir | Gravedad institucional. No pedir permiso. |
| Anthropic | Contención. Comunicar seriedad por lo que no se hace. |

No se toma de Sierra el muro de logos ni las certificaciones: esa jugada
requiere treinta clientes y hoy hay uno.

---

## 2. El mensaje

### El problema

La frase del brief actual es:

> Tu visión vale $9.999. La ejecución vale $1.

Esa frase **invierte la anécdota**. En la historia real Steinmetz cobró $9.999
*por saber dónde hacer la marca*: la pericia era lo caro y la marca lo barato.
La versión del brief le da los $9.999 al cliente y se queda con el $1.

Como halago funciona: el cliente es el visionario. Como posicionamiento de
precio, se está tarifando en $1 — que es exactamente el riesgo ya anotado en la
cotización de CCU, donde el precio implica ~$10.800 por hora contra un mercado
de $39.000 a $70.000.

### La resolución propuesta

No cambiar la frase. **Completarla**:

> **Tu visión vale $9.999.**
> **La ejecución vale $1.**
> **Sin el $1, no vale nada.**

Mantiene la línea original palabra por palabra, sigue siendo generosa con el
cliente, y recupera el valor en el tercer renglón. Ese giro es todo el negocio.

**Pendiente de confirmación de Ian.** Si prefiere la versión de dos líneas, se
respeta.

### El antagonista

La consultora grande. La fábrica de presentaciones. Se nombra la **conducta**,
nunca la firma — el mercado chileno es chico y quemar el nombre de Accenture o
Deloitte cierra puertas de sociedad más adelante.

---

## 3. Estructura — 6 secciones

### 00 · Hero

Video V1 a sangre completa, en loop, mudo, autoplay. Encima, las tres líneas.
Un solo CTA.

Sin navbar. Sin logos de clientes. Sin indicador de scroll. Sin nada más.

```
Tu visión vale $9.999.
La ejecución vale $1.
Sin el $1, no vale nada.

[ Hablemos ]
```

Las cifras en mono: tienen que leerse como números de factura, no como titular.

**Asset:** `video/V1-polvo-a-tiza.mp4` · fallback `img/01-marca-tiza-acero.png`

### 01 · La historia

La anécdota en tres tiempos cortos. Es la sección que se gana el derecho a
decir el hero.

```
1920. La planta de Ford llevaba semanas detenida.
El generador principal había fallado y los mejores
ingenieros del país no pudieron repararlo.

Llamaron a Charles Steinmetz. Miró la máquina.
Escuchó. Hizo una marca de tiza en un costado.
Dijo dónde abrir.

La factura fueron $10.000.
Ford pidió el detalle.

$1     por hacer la marca de tiza
$9.999 por saber dónde hacerla
```

**Asset:** `img/03-tiza-bodegon.png`

### 02 · El problema

El antagonista, sin nombrarlo.

```
Seis personas. Catorce semanas. Una presentación.
Nada encendido.
```

Y el contraste: diagnóstico antes que propuesta. La evidencia se saca del
sistema, no de una entrevista.

**Asset:** `img/06-testigos-sondaje.png`

### 03 · Qué hacemos

Tres líneas. No una grilla de servicios. Copy pendiente de redacción final.

**Asset:** `img/02-nave-estanques.png`, o el tablero (#3) cuando se genere —
ahí vive la tensión fierro viejo / inteligencia nueva, que es la sección de IA.

### 04 · El trabajo

La prueba. Sin esta sección el sitio es puro reclamo.

Bloqueado por la decisión sobre nombrar clientes (ver §6).

**Asset:** `img/08-marcas-en-roca.png` o `img/07-neumatico-minero.png`

### 05 · Cierre

La marca otra vez. Un CTA de contacto. En el pie, discreto, **"Acceso
clientes"** — la puerta al portal.

**Asset:** `img/05-cenital-placa-x.png`

---

## 4. Sistema visual

### Sin color de acento

Es la decisión más importante del sistema. El azul cobalto del sistema anterior
pelea con la paleta fría de las fotografías.

Blanco sobre casi-negro, y **el único color del sitio sale de las fotos**: el
óxido, el ocre, el cobre. Eso es minimalismo real y hace que las imágenes
manden.

```
--negro:      #0A0A0A    fondo
--blanco:     #FFFFFF    texto principal
--gris:       #8A8A8A    texto secundario
--linea:      rgba(255,255,255,0.12)
```

Cambio respecto del sistema anterior: **el sitio pasa de claro a oscuro.** Las
fotos lo exigen.

### Tipografía

Una familia más una mono. Inter para todo; la mono solo para cifras, datos y
etiquetas técnicas.

Las cifras del hero van en mono. `$9.999` y `$1` tienen que leerse como una
factura.

### Movimiento

**Un solo momento animado**: el hero atado al scroll. Todo lo demás son fades de
opacidad de 200 ms.

Sin parallax. Sin translate en hover. Sin spring.

> Ian ya rechazó una implementación de scroll-driven animation por sentirse mal
> ("funciona demasiado mal las animaciones"). Aquello animaba elementos del DOM
> con ScrollTrigger y peleaba con el layout. El scrubbing de canvas es otra cosa:
> o funciona o no, sin jank intermedio. Aun así, la disciplina de un solo momento
> animado es la defensa.

---

## 5. Técnico

Página estática, sin framework, sin build. Tres archivos:

```
index.html
style.css
main.js
```

Se sirve en GitHub Pages igual que hoy. **Recuperar el `CNAME` a la raíz** antes
de cualquier push, o `steinmetz.it.com` deja de resolver.

### Pipeline de assets

Lo único que necesita proceso. Los 51 MB actuales en PNG y MP4 crudos no se
sirven ni se commitean. Va como un script más en `assets/tools/`, en la misma
línea que los dos de watermark:

- Imágenes → AVIF con fallback WebP, en 3 anchos responsive
- Video → WebM (VP9) más MP4 (H.264) de respaldo
- Presupuesto: hero bajo 2 MB, LCP bajo 2,5 s

### El portal

Proyecto aparte: autenticación, datos por cliente, estado que cambia en el
tiempo. Spec propia. El landing solo necesita el enlace en el pie.

---

## 6. Decisiones — CERRADAS (aprobación de Ian, 2026-08-07)

**1. ¿Se nombra a CCU?** → **No.** Se describe sin nombrar: "una de las grandes
cerveceras de Chile" / "una empresa de genética aplicada". La restricción se
convirtió en postura: *"No mostramos logos. Mostramos sistemas encendidos."*

**2. ¿Idioma?** → **Español solo.**

**3. ¿Tercer renglón del hero?** → **Confirmado.** El hero lleva las tres líneas.

---

## 7. Qué falta antes de maquetar

**Assets pendientes de generar** (prompts listos en la biblioteca):

| Prioridad | Qué | Por qué |
|---|---|---|
| Alta | #8 escala imposible | Puede reemplazar el hero |
| Alta | V4 barrido de tiza | Resuelve todas las transiciones de una vez |
| Media | #3 tablero eléctrico | Es la sección de IA |
| Media | #2 polvo corregido | El actual tiene partículas tipo escombro y marco redondeado |
| Baja | #11 rajo, #12 mineral | Divisores |

**Contenido pendiente:**
- Copy final de la sección 03
- Copy de la sección 04, bloqueado por la decisión sobre clientes
- Correo de contacto — hoy la cotización se firmó sin correo, esperando
  `ian@steinmetz.cl`, que a su vez depende de redelegar los nameservers en NIC

---

## 8. Orden de trabajo propuesto

1. Cerrar las tres decisiones de §6
2. Generar los dos assets de prioridad alta
3. Escribir el pipeline de assets y correr la conversión
4. Maquetar estático: las 6 secciones sin animación, solo estructura y tipo
5. Agregar el hero atado al scroll
6. Medir peso y LCP, ajustar
7. Recuperar `CNAME`, publicar
