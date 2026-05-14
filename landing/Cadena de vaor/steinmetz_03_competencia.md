# 03 — Análisis Competitivo

## Marco de evaluación

Los competidores en este espacio no son homogéneos. Operan en distintos eslabones de la cadena, apuntan a distintos perfiles de usuario y tienen modelos de negocio fundamentalmente diferentes. Evaluarlos como si fueran el mismo tipo de producto lleva a conclusiones incorrectas.

El marco correcto para analizarlos es la cadena de valor de Steinmetz: ¿hasta dónde llegan? ¿A quién le venden? ¿Qué requieren del cliente para funcionar? Y la pregunta más importante: ¿en qué escenario le ganan a Steinmetz?

---

## Competidor 1 — Superblocks

**Categoría:** Internal tooling platform con componentes de IA
**Modelo:** SaaS enterprise, pricing por seat
**Perfil de cliente:** Empresas medianas y grandes con equipo de ingeniería interno

### Lo que hacen bien

Superblocks es el competidor más serio en el espacio de internal tools empresariales. Su plataforma permite construir aplicaciones internas conectadas a bases de datos, APIs y servicios en la nube. Tiene un catálogo amplio de conectores nativos y un modelo de deployment que va más allá del prototipo. Para equipos con un desarrollador dedicado a internal tools, es una solución madura.

### La brecha en su cadena

Su cadena termina en el eslabón 4. El modelo asume que alguien técnico dentro de la empresa configura, mantiene y actualiza las integraciones. No es prompt-first de forma real: el usuario de negocio sigue dependiendo del equipo de ingeniería para que la herramienta funcione. El paso de governance corporativa y deployment autónomo en infraestructura propia no existe en su producto.

En la práctica, Superblocks resuelve el problema del desarrollador que construye tools internas más rápido. No resuelve el problema del gerente de operaciones que necesita una herramienta y no tiene desarrollador disponible.

### Escenario en que gana

Empresa con equipo de ingeniería interno activo, que ya usa su stack y quiere acelerar la construcción de tools internas. No es el cliente de Steinmetz.

### Señal de mercado

Superblocks tiene clientes enterprise reales y pricing premium. Eso valida que el mercado de internal tools corporativas paga bien. Lo que no valida es que el problema esté resuelto para el usuario no técnico.

---

## Competidor 2 — Retool

**Categoría:** Internal tooling platform (incumbent del mercado)
**Modelo:** SaaS, freemium hasta enterprise
**Perfil de cliente:** Desarrolladores y equipos técnicos que construyen tools internas

### Lo que hacen bien

Retool es el incumbent. Lleva más de diez años en el mercado, tiene cientos de conectores nativos, documentación extensa y una base de clientes consolidada en empresas de tecnología y fintech. Su modelo de drag-and-drop con SQL es conocido y confiable para equipos técnicos.

### La brecha en su cadena

Retool no es prompt-first. Construir una aplicación en Retool requiere conocimiento de SQL, lógica de componentes y configuración de conectores. Es una herramienta para desarrolladores que quieren construir más rápido, no para líderes de negocio que quieren construir sin saber programar.

Su cadena llega al eslabón 4, pero con una fricción técnica alta. Los eslabones 5 y 6 no existen en su producto. Y su posicionamiento no ha evolucionado para capturar el mandato de IA que hoy reciben los directorios corporativos.

### Escenario en que gana

Empresa con desarrolladores internos que conocen Retool, que ya tienen integraciones configuradas y que priorizan estabilidad sobre velocidad de adopción. Cliente con perfil técnico alto que no necesita el paso de governance automatizada porque tiene un equipo de DevOps que lo gestiona.

### Señal de mercado

La base de clientes de Retool es exactamente el mercado objetivo de Steinmetz. Las empresas que pagan por Retool son las mismas que tienen el problema que Steinmetz resuelve. La diferencia es que el interlocutor en Retool es el equipo técnico; el interlocutor de Steinmetz es el COO.

---

## Competidor 3 — Lovable / Bolt / v0

**Categoría:** AI-first app generation (B2C y early B2B)
**Modelo:** SaaS, freemium con créditos de generación
**Perfil de cliente:** Founders, diseñadores, product managers, usuarios individuales

### Lo que hacen bien

Son la demostración más clara de que el eslabón 2 está resuelto. La velocidad de generación es real: un usuario sin experiencia técnica puede tener un prototipo navegable en minutos. La UX es accesible y la barrera de entrada es prácticamente cero. Lovable en particular ha ganado tracción masiva y está mejorando su capacidad de deployment a ritmo acelerado.

### La brecha en su cadena

Se detienen en el eslabón 3. El software generado vive en su infraestructura, no en la de la empresa. No hay mecanismo de conexión a datos corporativos. No hay governance. No hay deployment en subdominio propio. Son herramientas para construir productos públicos o prototipos internos, no para operar dentro del perímetro de seguridad de una empresa real.

### Escenario en que gana

Usuario individual o startup early-stage que necesita un MVP rápido sin requerimientos de seguridad corporativa. No es el cliente de Steinmetz, y Lovable no tiene ni la intención ni la arquitectura para serlo en el corto plazo.

### Relación estratégica

Más que competidores, estas herramientas son potencialmente proveedores del eslabón 1-2 de Steinmetz. La capa de generación de código puede apoyarse en modelos existentes. El diferenciador de Steinmetz empieza después de que el código existe.

---

## Competidor 4 — Microsoft Power Platform

**Categoría:** Low-code platform con integración nativa a ecosistema Microsoft
**Modelo:** Enterprise, incluido en licencias Microsoft 365 y Azure
**Perfil de cliente:** Empresas medianas y grandes ya integradas en el ecosistema Microsoft

### Lo que hacen bien

Power Platform tiene la ventaja competitiva más difícil de replicar: distribución. Está preinstalado en prácticamente toda empresa que usa Microsoft 365. Power Automate, Power Apps y Copilot Studio tienen conectores nativos a los sistemas más comunes del mundo corporativo (SharePoint, Teams, Dynamics, Azure AD). La capa de governance existe parcialmente a través de Azure Active Directory y las políticas de compliance de Microsoft.

### La brecha en su cadena

La experiencia de usuario es su talón de Aquiles. Power Platform no es prompt-first de forma real. Copilot Studio mejora la interfaz, pero construir un flujo funcional en Power Automate o una aplicación en Power Apps sigue requiriendo conocimiento técnico significativo. La velocidad de generación es drásticamente inferior a las herramientas modernas. Y el resultado final está atado al ecosistema Microsoft: no funciona bien fuera de él.

### El riesgo real

Microsoft es el único competidor en esta lista con la distribución para ganar este mercado sin tener el mejor producto. Si Microsoft decide mejorar la experiencia de Copilot Studio hasta el punto en que sea genuinamente prompt-first y el deployment sea autónomo, tiene la base instalada para capturar el mercado sin necesidad de un esfuerzo comercial significativo.

Este riesgo no es inmediato, pero define la ventana de tiempo disponible para Steinmetz.

### Escenario en que gana

Empresa ya integrada en Azure y Microsoft 365 que prioriza governance sobre velocidad, y que tiene un equipo de IT dispuesto a configurar y mantener Power Platform. En ese escenario, el costo de cambio es alto y la propuesta de Steinmetz debe ser significativamente superior en velocidad y autonomía para justificar el switch.

---

## Competidor 5 — Appsmith / Tooljet

**Categoría:** Open-source internal tooling
**Modelo:** Open source con tier cloud y enterprise
**Perfil de cliente:** Equipos técnicos que quieren control total sobre su infraestructura

### Lo que hacen bien

El modelo open source tiene un atractivo real en empresas con equipos técnicos que priorizan control y customización sobre velocidad de adopción. Appsmith y Tooljet permiten self-hosting completo, lo que resuelve parcialmente el problema de governance al mantener todo dentro del perímetro de la empresa.

### La brecha en su cadena

No son prompt-first. Requieren perfil técnico alto para instalar, configurar y mantener. El modelo de adopción es el opuesto al de Steinmetz: en lugar de absorber la complejidad técnica, la transfieren completamente al cliente. Son herramientas para equipos que quieren construir; no para equipos que quieren usar.

### Escenario en que gana

Empresa con equipo de DevOps sólido, cultura open-source y requerimientos de compliance que impiden usar infraestructura cloud de terceros. Nicho técnico, no el mercado objetivo de Steinmetz.

---

## Mapa competitivo consolidado

| Competidor | Prompt-first real | Conectividad enterprise | Governance autónoma | Deployment en infra propia | Perfil técnico requerido |
|---|---|---|---|---|---|
| Superblocks | ⚠️ Parcial | ✅ | ❌ | ❌ | Medio-alto |
| Retool | ❌ | ✅ | ❌ | ❌ | Alto |
| Lovable / Bolt | ✅ | ❌ | ❌ | ❌ | Ninguno |
| Microsoft Power Platform | ⚠️ Parcial | ⚠️ Parcial | ⚠️ Parcial | ⚠️ Parcial | Medio |
| Appsmith / Tooljet | ❌ | ✅ | ❌ | ⚠️ Parcial | Alto |
| **Steinmetz** | **✅** | **✅** | **✅** | **✅** | **Ninguno** |

---

## Conclusión del análisis

Ningún competidor actual cubre la cadena completa. Los que llegan más lejos (Superblocks, Retool) lo hacen con una dependencia técnica que Steinmetz elimina. Los que son más accesibles para el usuario no técnico (Lovable, Bolt) se detienen antes de entrar al perímetro corporativo real.

El mercado no está saturado. Está fragmentado. Cada competidor resolvió una parte del problema para un perfil de usuario específico. Lo que no existe es un producto que resuelva el problema completo para el perfil más desatendido: el líder de negocio con un mandato, sin equipo técnico, dentro de una empresa real.

Ese es el mercado de Steinmetz. Y hoy está vacío.

---

*Continúa en: 04 — El Gap de Mercado*

---
*Steinmetz · Documento Confidencial · v1.0 · 2025 · Ian Berndt*
