# Revisión triple del landing — diseñador · inversionista · cliente

_2026-08-07 · Tres agentes Opus revisaron el sitio vivo de forma independiente,
cada uno navegando con su propio browser (desktop y móvil) y leyendo el código.
Ninguno vio los comentarios de los otros._

**Notas: diseñador 6,5 · inversionista 6,5 · cliente 6.**

## Lo que los tres coinciden

1. **Falta la persona.** Cero nombre, cara, correo. Para una consultora de una
   persona, esconder al operador es esconder el producto. *(El cliente: "mi
   próximo paso no es escribirle a él — es llamar al conocido que me lo
   recomendó para preguntarle quién es.")*
2. **El header fijo con `mix-blend-difference` pisaba el texto** al scrollear
   (la factura en móvil quedaba ilegible). Confirmado con screenshots por dos
   de los tres.
3. **Sin señal de precio ni plazo**, el comprador no sabe si esto es de su
   línea de gastos o un caso de inversión — y pospone el contacto.
4. **"No mostramos logos" sin números ni nombre** se lee como excusa, no como
   discreción. La línea hay que ganársela con especificidad.
5. **La mejor línea del sitio es** "Seis personas. Catorce semanas. Una
   presentación. Nada encendido." — los tres la destacaron sin coordinarse.

---

## Revisión 1 — Diseñador gráfico senior

### Veredicto

El sistema visual es real y la contención es genuina: blanco sobre negro, sin
acento, una sola animación, fotografía coherente en tono. Pero por debajo de
esa superficie no hay grilla — hay ocho anchos distintos inventados bloque a
bloque — y la jerarquía tipográfica está invertida en dos puntos críticos: el
titular del hero no es el tipo más grande del sitio, y el remate de cada bloque
siempre es la línea más apagada. Lo más caro del sitio (2.900 px de scrub)
nunca entrega la marca de tiza que es el nombre de la empresa.

### Lo que funciona

- La contención cromática se sostiene: cero acento, el color solo en las fotos.
- El grade en matiz es consistente: las 6 fotos caen en hue 174–203.
- El grano de película a 0.045 es la dosis correcta.
- La factura como artefacto en mono es la idea correcta.
- LCP a 180 ms con 3,3 MB de frames en streaming detrás.
- `05-cenital` y `08-marcas-en-roca` son fotos de nivel; "¿Dónde hacemos la
  marca?" es el mejor cierre posible.

### Hallazgos (resumen; prioridad de mayor a menor)

1. **El hero nunca entrega la marca.** El póster (la X sobre acero) es tapado a
   los ms por el frame 0 (polvo genérico); el arco polvo→tiza termina en objeto
   inerte, nunca en el acto de marcar. Corrección mínima: póster = frame 0 para
   eliminar el salto. Corrección real: re-render con la X trazándose al final.
2. **No hay grilla.** A 1920px: marca/hero/pie en x=80, cuerpo en x=320. Siete
   bordes derechos distintos. Corrección: contenedor único de 90rem para todo.
3. **Jerarquía invertida:** `.sentencia` (62,4px) > `.hline` del hero (57,6px)
   en todos los viewports. El H1 pierde contra tres subtítulos.
4. **`$9 . 999` roto en display:** la mono abre huecos alrededor del punto a
   tamaño grande. Cifras del hero a Inter tabular-nums.
5. **El remate siempre es la línea más apagada** ("Sin el $1...", "Nada
   encendido.", "Nos llamamos así..."). Invertir: setup gris, remate blanco.
6. **En móvil el cover 16:9 destruye el sujeto:** la tiza a 90% es una barra
   horizontal ilegible; 2.700px de scroll para eso. Set vertical pendiente.
7. **Hairlines de `.etiqueta` con tres largos distintos** según el contenedor.
8. **Sección 01: columna derecha vacía** (imagen de 285px en columna de 680) y
   la foto duplica la tiza del final del hero. Cambiar por la marca en roca +
   aspect 3/4.
9. **La factura sin énfasis donde está el chiste:** las tres filas pesan igual.
10. **Grade inconsistente en exposición:** `06-testigos` L* 36 vs 19-26 el
    resto; `02-nave` la única azul (sat 23%). Corregir en pipeline.
11. **La marca desaparece en 2/3 del sitio** (el fix de ocultarla fue
    retroceso). Mantenerla siempre, sin blend-difference, con scrim propio.
12. **Ritmo vertical sin escala** (272px de vacío sin motivo en un punto) y
    divisores sin función que leen como stock.
13. **Microdetalles:** velo plano del cierre (lechoso), pie descentrado sin
    RUT/email, CTA tímido (145×44), portal con estilos duplicados y sin grano,
    ids muertos + scroll-behavior sin anclas.
14. **Carga del scrub sin prioridad:** 80 requests simultáneos compiten; en
    conexión lenta el scrub va a saltos. Cargar keyframes primero. A dpr 2 el
    canvas de 2880 se alimenta de 1920: seguía habiendo upscale 1,5×.

**Nota: 6,5/10** — "el gusto y la disciplina cromática están al nivel de la
referencia, pero la ejecución se queda en la capa de sistema."

---

## Revisión 2 — Inversionista early-stage

### Veredicto

Sí tomo la reunión, pero por el oficio del fundador, no por el negocio. El
sitio demuestra criterio, disciplina y capacidad de ejecución — es mejor que el
95% de las consultoras de IA en Chile. Pero como pieza comercial no vende nada:
después de 60 segundos no sé qué compro, cuánto cuesta, quién lo hace ni qué
resultado obtuve. Y el titular con el que abre le pone precio de $1 a su propio
trabajo antes de que el cliente pregunte.

### Fortalezas

- Producción visual seria y eficiente (2,1 MB, 143 ms) — señal de rigor.
- "Seis personas. Catorce semanas. Una presentación. Nada encendido." — nombra
  el dolor del comprador corporativo chileno mejor que cualquier deck del año.
- "Encendido, o no existe" es una definición de terminado, no un adjetivo.
- El método es concreto; "leemos la operación real, no la declarada" es
  diferenciación defendible.
- Arquitectura que no hay que rehacer; el `/portal/` muestra visión post-venta.

### Hallazgos (resumen)

1. **El titular ancla el precio en $1 — el problema comercial más caro.** "Tu
   visión vale $9.999 / la ejecución vale $1" regala los $9.999 al cliente y se
   queda con el $1; la sección 01 del mismo sitio dice lo contrario. Reclamar
   el lado de los $9.999: la marca de tiza es de Steinmetz, no del cliente.
2. **No hay una sola persona en el sitio.** El "nosotros" se cae en la primera
   reunión. Nombre, foto, 3 líneas verificables. "La postura anti-consultora
   solo es creíble firmada."
3. **"No mostramos logos" no está respaldado.** Sin números es más débil que un
   logo. Anonimato por sector + especificidad en todo lo demás.
4. **Bandera de diligencia:** hay dos clientes publicados y el relato dice
   "primer cliente en negociación". Si los trabajos son de una etapa anterior
   (práctica/freelance) presentados como trabajo de la SpA, hay exposición
   legal y de credibilidad. Tiene que cuadrar en la primera reunión.
5. **Cero señales de modelo de negocio:** ni precio, ni duración, ni formato.
   "Diagnóstico en 2 semanas. Sistema en producción en 6-10. Desde $X."
6. **"La intervención más pequeña" te escopea a pilotos.** Que sea la puerta,
   no la oferta: "empezamos por lo más chico que enciende; lo que funciona,
   se escala."
7. **WhatsApp como único canal** — sin correo del dominio, sin nada
   reenviable, y un `.it.com` que compras nota. Registrar el .cl + correo +
   segundo CTA.
8. **Falta el paquete mínimo de proveedor corporativo:** RUT, dirección,
   política de datos. Lo más fuerte ("dentro de la red, sobre su propia
   nube") está enterrado como anécdota.
9. **Cero analítica** — vendiendo "medimos la operación real" desde un sitio
   que no se mide.
10. **Fricción móvil:** 320svh de hero = 3-4 barridos de pulgar; riesgo de
    rebote en el dispositivo desde el que la gente escribiría.
11. **Terminación:** header pisando texto a los 6.885px; "SANTIAGO DE CHILE"
    cortado a 390px; columna sticky medio vacía.

**Nota: 6,5/10** — "artesanía de 9, argumento comercial de 4."

---

## Revisión 3 — Cliente corporativo (gerente de innovación)

### Veredicto

Le escribo, pero no hoy y no directo. Primero le pregunto a mi contacto cómo se
llama el tipo, porque en todo el sitio no hay un solo nombre, ni una cara, ni
un correo — solo un número de WhatsApp. La frase "seis personas, catorce
semanas..." me pegó fuerte porque es literalmente lo que me pasó el año pasado;
pero un sitio tan cuidado que no me dice quién está detrás me deja mirando una
marca, no a una persona que me va a resolver algo.

### Lo que me convenció

- "Seis personas. Catorce semanas. Una presentación. Nada encendido."
- "Encendido, o no existe" — el criterio que quiero en el contrato.
- "Leemos la operación real, no la declarada."
- El detalle técnico de la cervecera ("dentro de la red corporativa, sobre su
  propia nube") — pasaron por un área de TI corporativa y sobrevivieron.
- Las imágenes son de mi mundo, no de un banco de fotos.
- La historia de la tiza no suena a humo porque es una anécdota conocida.

### Hallazgos (resumen)

1. **No sé a quién le escribo** — lo que más frena. Nombre + cargo + correo
   corporativo; WhatsApp como segunda opción.
2. **El encabezado se come el texto** (la factura en el teléfono, títulos en
   desktop). "Es el generador de Ford fallando en la sala de espera."
3. **No sé cuánto cuesta ni cuánto demora.** Un rango grueso basta; sin eso
   pospongo el contacto.
4. **"No mostramos logos" a medio camino:** sin números, la discreción parece
   excusa. Un resultado numérico por caso + "referencias a solicitud".
5. **No sé qué pasa después de escribir:** ¿me venden? ¿30 minutos? ¿gratis?
   Dos líneas antes del botón.
6. **Los casos son muy cortos para decidir** si sirve para *mi* dolor.
7. **En el teléfono scrolleo mucho para obtener poco al principio.**
8. **La tercera línea del hero casi no se lee en el celular.**
9. **~1 MB móvil descargado de una:** en la señal de una faena va a saltos —
   cargar de a poco.
10. **El "Acceso clientes" juega a favor y está escondido:** el portal (hitos y
    entregables visibles) es mejor prueba de seriedad que la sección de casos.
    Subirlo a la página principal.
11. **Nadie nombra mi problema con mis palabras:** planillas a mano, informes
    copipegados, datos que no cuadran. Una línea así me hace decir "esto es
    para mí".

**Nota: 6/10** (probabilidad de contacto) — "con un nombre, un correo y una
idea de precio, sería un 8."

---

## Qué se aplicó de inmediato (commits del 2026-08-07)

| Hallazgo | Acción |
|---|---|
| Header pisando texto (3 revisiones) | Sin blend-difference, scrim propio, siempre visible |
| Hero ancla el precio en $1 (inv. 1) | Nuevo hero: "Hacer la marca cuesta $1. / Saber dónde hacerla vale $9.999. / Steinmetz es saber dónde." |
| Sin persona (3 revisiones) | Sección "05 — Quién está detrás": Ian Berndt + correo + teléfono |
| Sin correo corporativo | `ian@steinmetz.cl` como CTA principal (mailto); WhatsApp con mensaje pre-cargado como alternativa |
| Sin precio/plazo/proceso (inv. 5, cli. 3/5) | Encuadre en el cierre: proyectos acotados, precio cerrado, primera conversación 30 min sin costo |
| Jerarquía invertida (dis. 3) | `.hline` ahora el tipo más grande; `.sentencia` un escalón abajo |
| `$9 . 999` roto (dis. 4) | Cifras del hero en Inter tabular-nums |
| Remates apagados (dis. 5) | Invertido: setup gris claro, remate blanco |
| Dos ejes de grilla (dis. 2) | `--margen-eje` alinea marca/hero/pie con el contenedor de 90rem |
| Factura sin énfasis (dis. 9) | Fila $9.999 a 1,35×, valores en blanco, regla del total marcada |
| Columna 01 vacía + tiza duplicada (dis. 8) | `08-marcas-en-roca` a aspect 3/4; el neumático pasa al divisor |
| Grade inconsistente (dis. 10) | Pipeline: `06-testigos` −25% brillo, `02-nave` −55% saturación |
| Poster ≠ frame 0 (dis. 1) | Poster = frame 0 exacto; sin salto visual |
| Carga sin prioridad (dis. 14) | Keyframes 0/16/32/48/64/79 primero con fetchPriority high, resto en cascada low |
| Nitidez retina (dis. 14 + pedido de Ian) | Masters 2560 vía Real-ESRGAN x4plus; set desktop 2560 |
| Hero móvil eterno (inv. 10, cli. 7) | 230svh bajo 720px |
| "SANTIAGO DE CHILE" cortado | Oculto bajo 480px |
| Pie sin datos legales (inv. 8, dis. 13) | RUT 78.484.226-6 + correo + grilla de 3 columnas |
| Casos cortos (cli. 6) | Descripciones expandidas con hechos reales, sin métricas inventadas |
| Portal escondido (cli. 10) | Línea en la sección trabajo enlazando el portal |
| Dolores sin nombrar (cli. 11) | Párrafo: planillas a mano, informes copipegados, datos que no cuadran |
| Piloto-trampa (inv. 6) | "Y lo que funciona, se escala." |
| Velo plano del cierre, CTA chico, portal sin grano, scroll-behavior muerto (dis. 13) | Corregidos |
| `.it.com` débil (inv. 7) | `steinmetz.cl` apuntado al sitio (Azure DNS + Pages) |

## Pendiente (requiere decisión o material de Ian)

- **Foto/bio verificable** para la sección Quién (inv. 2). Hoy hay nombre y
  contacto; falta cara y trayectoria.
- **Métricas reales por caso** (cli. 4): horas ahorradas, usuarios, volúmenes.
  No se inventaron números — hay que levantarlos de los proyectos reales.
- **Coherencia del relato de clientes** (inv. 4): definir cómo se presenta el
  trabajo pre-SpA en la primera reunión.
- **Banda de precio explícita** (inv. 5): "desde $X" es decisión comercial.
- **Analítica** (inv. 9): requiere cuenta (GoatCounter/Plausible).
- **Set vertical del hero para móvil** (dis. 6) y **re-render del video con la
  X trazándose al final** (dis. 1): requieren regenerar en Veo.
- **Escala vertical de 4 pasos y unificación total de hairlines** (dis. 7/12):
  refactor fino de CSS, segunda pasada.
- **Master 1080p del video** (pedido de Ian): regenerar en Veo/Flow a 1080p y
  re-correr el pipeline para nitidez nativa.
