# Steinmetz — Propuesta de Valor & Análisis Competitivo
**Documento Confidencial · v1.0 · 2025**

---

# 01 — La Cadena de Valor Completa

## El argumento central

El desarrollo de software impulsado por IA no tiene un problema de capacidad. Tiene un problema de continuidad.

Cada eslabón de la cadena — desde el prompt inicial hasta el producto en producción — ya existe como tecnología. El mercado ha resuelto partes del problema con precisión creciente. Lo que no existe es una arquitectura que los conecte todos, de forma autónoma, dentro de los límites de una empresa real.

El resultado es predecible: el proceso se detiene. No por falta de herramientas, sino porque nadie ha construido el puente entre el último eslabón que funciona y el primero que no.

---

## Los seis eslabones

### Eslabón 1 — El Prompt
**Estado: Resuelto**

El punto de entrada es lenguaje natural. El usuario describe lo que necesita: una herramienta, un dashboard, un proceso automatizado. No requiere conocimiento técnico. Este eslabón está completamente resuelto por los modelos fundacionales actuales (GPT-4o, Claude 3.5, Gemini 1.5 Pro).

La calidad del output depende de la claridad del requerimiento, no de la capacidad técnica del usuario. Esto es, por sí solo, un salto histórico.

---

### Eslabón 2 — El Software Generado por IA
**Estado: Resuelto**

A partir del prompt, los modelos actuales generan código funcional: frontend, backend, lógica de negocio, esquemas de base de datos. Herramientas como Lovable, Bolt y v0 han democratizado este paso al punto de que un usuario sin experiencia técnica puede obtener un prototipo navegable en minutos.

El código existe. El problema es que existe en un vacío: sin conexión a datos reales, sin infraestructura de soporte, y sin ningún mecanismo para sobrevivir fuera del entorno de desarrollo.

---

### Eslabón 3 — Backend con Soporte a Usuarios Reales
**Estado: Resuelto**

El paso de prototipo a aplicación con usuarios concurrentes, autenticación, base de datos persistente y lógica de negocio robusta está resuelto. Plataformas como Supabase, Railway y Render permiten desplegar backends funcionales sin gestión de infraestructura manual.

Este eslabón ya no representa una barrera técnica significativa. El cuello de botella está más adelante.

---

### Eslabón 4 — Conexión a Datos e Infraestructura de la Empresa
**Estado: Parcialmente resuelto**

Aquí comienza el territorio no conquistado. Conectar una aplicación generada por IA a los sistemas reales de una empresa — ERP, bases de datos internas, APIs propietarias, directorios de usuarios — es técnicamente posible, pero operativamente complejo.

Herramientas como Retool, Superblocks y Appsmith han avanzado en este eslabón, pero su modelo requiere que un perfil técnico interno configure las conexiones, gestione los credenciales y mantenga la integración. El proceso no es autónomo: es asistido. La empresa sigue dependiendo de un ingeniero para que funcione.

> *El síntoma más frecuente de este eslabón incompleto es el líder de área con una aplicación corriendo en localhost, sin ningún camino claro hacia los datos de producción de su empresa.*

---

### Eslabón 5 — Aprobaciones de Seguridad Corporativa
**Estado: No resuelto**

Este es el eslabón donde la cadena se rompe de forma más consistente y costosa.

Toda aplicación que accede a datos o infraestructura corporativa debe cumplir con políticas de seguridad: autenticación federada, control de acceso por rol, auditoría de endpoints, aislamiento de entornos, cumplimiento normativo. En la práctica, esto significa que el equipo de TI corporativo debe revisar, aprobar y en muchos casos re-arquitectar la solución antes de que pueda operar en producción.

Este proceso tarda semanas o meses. Requiere documentación técnica que el equipo de negocio no sabe producir. Y con frecuencia termina en un rechazo o en una re-construcción completa desde TI.

No existe ningún producto en el mercado que automatice este proceso de governance de forma autónoma, adaptándose a las políticas de seguridad específicas de cada empresa sin intervención manual de TI.

---

### Eslabón 6 — Deployment en el Subdominio de la Empresa
**Estado: No resuelto como producto end-to-end**

El destino final de cualquier herramienta interna es vivir dentro del ecosistema de la empresa: en su infraestructura cloud (Azure, AWS, GCP), bajo su dominio, con su sistema de autenticación, visible para sus usuarios y auditable por su equipo de compliance.

Llegar ahí de forma autónoma — sin que TI ejecute comandos manualmente, sin que el equipo de negocio espere semanas de proceso de despliegue — no existe como producto terminado. Es el paso que ningún competidor ha resuelto de forma sistemática.

---

## La tabla del estado actual

| Eslabón | Descripción | Estado | Quién opera aquí hoy |
|---|---|---|---|
| 1 | Prompt en lenguaje natural | ✅ Resuelto | ChatGPT, Claude, Gemini |
| 2 | Software generado por IA | ✅ Resuelto | Lovable, Bolt, v0 |
| 3 | Backend con soporte a usuarios | ✅ Resuelto | Supabase, Railway, Render |
| 4 | Conexión a datos de la empresa | ⚠️ Parcial | Retool, Superblocks, Appsmith |
| 5 | Aprobaciones de seguridad corporativa | ❌ No resuelto | Nadie |
| 6 | Deployment en infraestructura propia | ❌ No resuelto | Nadie |

---

## La brecha que nadie ha cerrado

Los eslabones 1 al 3 están resueltos y se están commoditizando a velocidad acelerada. Los eslabones 4 al 6 representan el territorio donde la cadena se detiene en prácticamente todas las empresas que intentan adoptar desarrollo orquestado por IA.

La demanda para resolver esta brecha es real, urgente y corporativa. Los directorios han dado el mandato. Los líderes de negocio tienen los requerimientos. Los modelos tienen la capacidad técnica.

Lo que falta es la infraestructura que conecta el eslabón 3 con el eslabón 6 de forma autónoma, segura y auditable.

**Steinmetz es esa infraestructura.**

---

*Continúa en: 02 — Dónde Está el Moat Real*

---
*Steinmetz · Documento Confidencial · v1.0 · 2025 · Ian Berndt*
