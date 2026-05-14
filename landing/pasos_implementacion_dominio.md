# Implementación del Dominio — Pasos

Referencia: `arquitectura_dominio.md`

---

## PASO 1 — Estructura de archivos

Renombrar y organizar para que las URLs queden limpias.

**Qué hacer:**
- Crear carpeta `propuesta/`
- Copiar `steinmetz_propuesta_valor.html` → `propuesta/index.html`
- (El `index.html` de la raíz se queda donde está)

**Resultado:**
```
/index.html              → dominio.com/
/propuesta/index.html    → dominio.com/propuesta/
```

**Esfuerzo:** 1 minuto. **Dependencias:** Ninguna.

---

## PASO 2 — Conectar dominio a GitHub Pages

**Qué hacer:**
1. Crear archivo `CNAME` en la raíz del repo con el dominio (sin `https://`, sin `/`)
2. En el registrador de dominio (Spaceship, Namecheap, etc.): configurar DNS
   - Si es dominio apex (ej. `steinmetz.cl`): agregar 4 registros A:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Si es `www`: agregar CNAME → `iangigoux-cmd.github.io`
   - Si se quiere ambos: agregar los A records + el CNAME de www
3. En GitHub: Settings → Pages → Custom domain → escribir el dominio → Save
4. Esperar propagación DNS (5 min a 48 hrs, usualmente <1 hr)
5. Marcar "Enforce HTTPS" cuando esté disponible

**Resultado:** El sitio responde en el dominio con HTTPS.

**Esfuerzo:** 10 minutos + espera de DNS. **Dependencias:** Paso 1.

---

## PASO 3 — Navegación: Brief → Propuesta

Agregar links en `index.html` para que el usuario pueda llegar a la propuesta.

**Qué hacer:**

**3a. Agregar "PROPUESTA" al navbar:**
- En la `<ul class="nav-links">`, agregar un último `<li>`:
  ```html
  <li><a href="/propuesta/" style="color:var(--brand-primary);">PROPUESTA</a></li>
  ```

**3b. Agregar botón en el cierre (sección 06):**
- En `.cierre-actions`, agregar un tercer botón después de "Leer desde el inicio":
  ```html
  <a href="/propuesta/" class="btn-ghost">
    Propuesta de Valor
    <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
  </a>
  ```

**Resultado:** Dos puntos de acceso a la propuesta desde el brief.

**Esfuerzo:** 5 minutos. **Dependencias:** Paso 1.

---

## PASO 4 — Simplificar hero de la Propuesta

Eliminar el typewriter y meta grid duplicados del slide 0 de la propuesta. Reemplazar con un hero más compacto que funcione como "continuación" del brief.

**Qué hacer en `propuesta/index.html`:**

**4a. Reemplazar el contenido del slide 0 (hero):**
- Quitar: el typewriter `#hero-brand`, el meta grid `hero-meta-grid-slide`
- Poner: un hero minimalista con:
  - Breadcrumb: `STEINMETZ → PROPUESTA DE VALOR` con link de vuelta a `/`
  - Título: "Propuesta de Valor & Análisis Competitivo" (tamaño grande)
  - Badges: mantener los 4 badges existentes (B2B Enterprise, Pre-Seed, 6 Secciones, v1.0)
  - Subtítulo: "La cadena de valor está mapeada. La competencia está analizada. El gap está validado."
  - Scroll indicator: mantener

**4b. Eliminar el JS del typewriter del hero:**
- Buscar el bloque `(function() { var el = document.getElementById('hero-brand');` y el ciclo de combos
- Eliminarlo o comentarlo (ya no hay `#hero-brand` en el DOM)

**Resultado:** La propuesta tiene su propia identidad visual sin repetir el efecto del brief.

**Esfuerzo:** 20 minutos. **Dependencias:** Paso 1.

---

## PASO 5 — Navegación: Propuesta → Brief

Agregar links de vuelta en la propuesta.

**Qué hacer en `propuesta/index.html`:**

**5a. Cambiar el botón ghost del cierre (slide 15):**
- Cambiar `"Volver al inicio"` (que hace scroll a slide 0) por dos botones:
  - `"← Volver al Brief"` → enlace a `/`
  - `"Volver al inicio"` → mantener el scroll a slide 0

**5b. (Opcional) Agregar un mini-nav fijo:**
- Un link discreto en la esquina superior izquierda (fuera de las slides): `"← BRIEF"` en Fira Code 10px, que lleva a `/`
- Posicionado absolute, z-index alto, siempre visible

**Resultado:** El usuario puede volver al brief desde cualquier punto de la propuesta.

**Esfuerzo:** 10 minutos. **Dependencias:** Paso 1.

---

## PASO 6 — Ajustar rutas internas

Si se usa `/propuesta/index.html`, las rutas relativas de assets (fonts, Lucide) siguen funcionando porque son CDN (URLs absolutas). Pero verificar:

**Qué revisar:**
- Que los `<link>` de Google Fonts usen URLs absolutas (ya lo hacen: `https://fonts.googleapis.com/...`)
- Que Lucide use URL absoluta (ya lo hace: `https://unpkg.com/lucide@latest/...`)
- Que los links internos entre páginas usen rutas absolutas (`/` y `/propuesta/`) para que funcionen tanto en local como en el dominio
- Que el link de WhatsApp en el cierre de la propuesta tenga la URL correcta

**Esfuerzo:** 5 minutos de revisión. **Dependencias:** Pasos 3, 4, 5.

---

## PASO 7 — Commit, push, verificar

**Qué hacer:**
1. `git add` los archivos nuevos/modificados
2. Commit con mensaje descriptivo
3. Push a main
4. Esperar 2-3 min para GitHub Pages rebuild
5. Verificar en el dominio (o en `iangigoux-cmd.github.io/steinmetz-brief/` mientras DNS propaga):
   - `/` carga el brief con el link a propuesta
   - `/propuesta/` carga la propuesta con hero simplificado
   - Los links entre páginas funcionan
   - HTTPS funciona (si DNS ya propagó)

**Esfuerzo:** 5 minutos. **Dependencias:** Todos los pasos anteriores.

---

## Orden de ejecución

```
Paso 1 (archivos)           ← primero, sin riesgo
Paso 2 (DNS/CNAME)          ← puede hacerse en paralelo, tarda en propagar
Paso 3 (links brief→prop)   ← rápido
Paso 4 (hero propuesta)     ← el más largo
Paso 5 (links prop→brief)   ← rápido
Paso 6 (verificar rutas)    ← revisión
Paso 7 (deploy)             ← cierre
```

**Recomendación:** Hacer Paso 2 primero (para que DNS empiece a propagar mientras trabajamos) y luego Pasos 1, 3, 4, 5, 6, 7 en secuencia.

---

**Tiempo total estimado:** ~45 minutos de trabajo + espera de DNS.

---

*Steinmetz · Pasos de Implementación · 2025*
