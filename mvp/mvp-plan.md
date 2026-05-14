# Steinmetz MVP — Plan de Construccion v2.0

## Que es el MVP

Un software donde un usuario describe lo que quiere, y el sistema lo construye, lo testea y lo deploya — todo con IA. El usuario recibe una URL con su app funcionando.

```
Prompt → Embudo inteligente → Codigo generado → Testeado → Deployado → URL live
```

---

## Estructura del repositorio

```
~/Desktop/Steinmetz/mvp/           ← Este plan + documentacion
~/Desktop/steinmetz-mvp/           ← Codigo del MVP (repo separado)
```

```
steinmetz-mvp/
│
├── frontend/                       ← Next.js 14 + TypeScript + Tailwind
│   ├── app/
│   │   ├── page.tsx                       # Landing minima + login
│   │   ├── layout.tsx                     # Layout global
│   │   ├── console/
│   │   │   ├── page.tsx                   # Dashboard: lista de proyectos
│   │   │   └── [projectId]/
│   │   │       └── page.tsx               # Vista del embudo de un proyecto
│   │   └── api/                           # Proxy a backend (si es necesario)
│   ├── components/
│   │   ├── ProjectCard.tsx                # Card de proyecto en el dashboard
│   │   ├── Chat.tsx                       # Interfaz de chat con el agente
│   │   ├── ChatMessage.tsx                # Burbuja individual de mensaje
│   │   ├── StageProgress.tsx              # Sidebar con las 10 etapas
│   │   ├── StageOutput.tsx                # Card colapsable con output de etapa
│   │   ├── ApprovalBar.tsx                # Barra inferior: aprobar / pedir cambios
│   │   ├── FileTree.tsx                   # Arbol de archivos generados
│   │   ├── CodeViewer.tsx                 # Preview de codigo con syntax highlight
│   │   ├── BuildLog.tsx                   # Terminal de logs en tiempo real
│   │   ├── DeployStatus.tsx               # Progreso de deploy
│   │   └── ConnectionForm.tsx             # Formulario de credenciales de datos
│   ├── lib/
│   │   ├── api.ts                         # Cliente HTTP al backend
│   │   └── types.ts                       # TypeScript types compartidos
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.local
│
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI app, CORS, lifespan
│   │   ├── config.py                      # Settings via pydantic-settings
│   │   ├── database.py                    # SQLAlchemy async engine + session
│   │   ├── models.py                      # ORM models
│   │   ├── schemas.py                     # Pydantic request/response schemas
│   │   │
│   │   ├── routers/
│   │   │   ├── projects.py                # CRUD proyectos
│   │   │   ├── stages.py                  # Interaccion con etapas
│   │   │   └── deploy.py                  # Status de deploy
│   │   │
│   │   ├── stages/                        # Un archivo por etapa
│   │   │   ├── base.py                    # StageRunner base class
│   │   │   ├── s1_discovery.py
│   │   │   ├── s2_evaluation.py
│   │   │   ├── s3_planning.py
│   │   │   ├── s4_audit.py
│   │   │   ├── s5_refinement.py
│   │   │   ├── s6_architecture.py
│   │   │   ├── s7_build.py
│   │   │   ├── s8_test.py
│   │   │   ├── s9_connect.py
│   │   │   └── s10_deploy.py
│   │   │
│   │   ├── prompts/                       # System prompts (archivos .md)
│   │   │   ├── discovery.md
│   │   │   ├── evaluation.md
│   │   │   ├── planning.md
│   │   │   ├── audit.md
│   │   │   ├── refinement.md
│   │   │   ├── architecture.md
│   │   │   └── build.md
│   │   │
│   │   └── services/
│   │       ├── ai.py                      # Claude API wrapper
│   │       ├── orchestrator.py            # State machine del embudo
│   │       ├── workspace.py               # Gestion de workspaces
│   │       ├── docker_builder.py          # Build de imagenes Docker
│   │       ├── deployer.py                # Deploy + DNS
│   │       └── credential_store.py        # Manejo seguro de credenciales
│   │
│   ├── workspaces/                        # Codigo generado (gitignored)
│   ├── templates/                         # Templates base por tipo de app
│   │   ├── fastapi-react/
│   │   │   ├── backend/
│   │   │   │   ├── main.py.j2
│   │   │   │   ├── requirements.txt.j2
│   │   │   │   └── Dockerfile.j2
│   │   │   └── frontend/
│   │   │       ├── package.json.j2
│   │   │       └── Dockerfile.j2
│   │   └── nextjs-fullstack/
│   │       └── ...
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── alembic.ini                        # Migraciones de DB
│   ├── alembic/
│   └── .env
│
├── docker-compose.yml                     # Backend + Postgres + Caddy (dev)
├── docker-compose.prod.yml                # Produccion
├── caddy/
│   └── Caddyfile
├── .env.example
├── .gitignore
└── Makefile                               # Comandos utiles (make dev, make deploy, etc)
```

---

## Modelo de datos

### Tabla `users`

```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(255),
    password_hash VARCHAR(255),
    created_at    TIMESTAMP DEFAULT now(),
    updated_at    TIMESTAMP DEFAULT now()
);
```

### Tabla `projects`

```sql
CREATE TABLE projects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id),
    title         VARCHAR(500),                    -- generado por AI en discovery
    slug          VARCHAR(100) UNIQUE,             -- para el subdominio
    description   TEXT,                            -- prompt original del usuario
    current_stage VARCHAR(50) DEFAULT 'discovery', -- etapa actual
    status        VARCHAR(50) DEFAULT 'active',    -- active | building | deployed | failed
    context       JSONB DEFAULT '{}',              -- contexto acumulado de todas las etapas
    deploy_url    VARCHAR(500),                    -- URL final cuando esta deployado
    created_at    TIMESTAMP DEFAULT now(),
    updated_at    TIMESTAMP DEFAULT now()
);
```

El campo `context` es el corazon del sistema. Acumula todo lo que cada etapa produce:

```json
{
  "discovery": {
    "requirements": [...],
    "data_sources": [...],
    "user_types": [...],
    "integrations": [...]
  },
  "evaluation": {
    "complexity": "medium",
    "feasibility": true,
    "estimated_components": 12,
    "risks": [...]
  },
  "planning": {
    "pages": [...],
    "endpoints": [...],
    "db_tables": [...],
    "data_flows": [...]
  },
  "audit": {
    "issues": [...],
    "passed": false,
    "suggestions": [...]
  },
  "refinement": {
    "changes_made": [...],
    "final_plan": {...}
  },
  "architecture": {
    "db_schema_sql": "CREATE TABLE ...",
    "api_spec": [...],
    "component_tree": {...},
    "env_vars": [...],
    "docker_config": {...}
  }
}
```

### Tabla `messages`

```sql
CREATE TABLE messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID REFERENCES projects(id),
    stage         VARCHAR(50) NOT NULL,
    role          VARCHAR(20) NOT NULL,    -- 'user' | 'assistant' | 'system'
    content       TEXT NOT NULL,
    metadata      JSONB DEFAULT '{}',      -- structured output, file lists, etc
    created_at    TIMESTAMP DEFAULT now()
);
```

### Tabla `deployments`

```sql
CREATE TABLE deployments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     UUID REFERENCES projects(id),
    container_id   VARCHAR(100),
    image_tag      VARCHAR(200),
    subdomain      VARCHAR(100),
    status         VARCHAR(50),    -- building | pushing | deploying | live | failed
    env_vars       JSONB,          -- encrypted
    health_check   BOOLEAN DEFAULT false,
    error_log      TEXT,
    deployed_at    TIMESTAMP,
    created_at     TIMESTAMP DEFAULT now()
);
```

---

## La state machine del embudo

```
                    ┌──────────────────────────────────┐
                    │         STATE MACHINE             │
                    │                                   │
  user prompt ──►   │  DISCOVERY ──► EVALUATION         │
                    │       ▲              │            │
                    │       │ feedback      ▼            │
                    │       │         PLANNING           │
                    │       │              │            │
                    │       │              ▼            │
                    │       │          AUDIT             │
                    │       │           │    │           │
                    │       │    pass ──┘    └── fail    │
                    │       │   ▼                │      │
                    │       │ ARCHITECTURE   REFINEMENT  │
                    │       │   │               │       │
                    │       │   ▼               │       │
                    │       │ BUILD ◄───────────┘       │
                    │       │   │                       │
                    │       │   ▼                       │
                    │       │ TEST                      │
                    │       │   │    │                  │
                    │       │   ok   fail → BUILD (retry)│
                    │       │   │                       │
                    │       │   ▼                       │
                    │       │ CONNECT                   │
                    │       │   │                       │
                    │       │   ▼                       │
                    │       │ DEPLOY ──► LIVE           │
                    └──────────────────────────────────┘
```

### Transiciones

| Desde | Hacia | Condicion |
|-------|-------|-----------|
| `discovery` | `evaluation` | Usuario aprueba los requerimientos |
| `evaluation` | `planning` | Factibilidad = true, usuario aprueba |
| `evaluation` | `discovery` | Factibilidad = false, vuelve a preguntar |
| `planning` | `audit` | Automatico (no requiere aprobacion) |
| `audit` | `architecture` | Audit pasa sin issues criticos |
| `audit` | `refinement` | Audit encuentra issues criticos |
| `refinement` | `audit` | Automatico (re-audita el plan mejorado) |
| `architecture` | `build` | Usuario aprueba la arquitectura |
| `build` | `test` | Automatico cuando termina de generar |
| `test` | `connect` | Tests pasan |
| `test` | `build` | Tests fallan (max 3 reintentos) |
| `connect` | `deploy` | Conexiones validadas |
| `deploy` | `live` | Health check pasa |

### Puntos de interaccion con el usuario

Solo 3 etapas requieren input activo del usuario:

1. **Discovery** — Conversacion. El usuario responde preguntas.
2. **Architecture** — Revision. El usuario ve la arquitectura final y aprueba.
3. **Connect** — Credenciales. El usuario pega connection strings, API keys.

Las demas etapas son automaticas o solo requieren un click de "Aprobar".

---

## Detalle de cada etapa

### Etapa 1: DISCOVERY

**Proposito:** Entender que quiere el usuario con suficiente detalle para construirlo.

**Modo de interaccion:** Conversacional. El agente hace preguntas, el usuario responde. Multiples turnos.

**System prompt (resumen):**

```
Eres un analista de requerimientos experto. Tu trabajo es entender
exactamente que software necesita el usuario.

PREGUNTAS OBLIGATORIAS (no avances sin respuestas):
1. Que problema resuelve este software?
2. Quienes lo van a usar? (roles, cantidad)
3. Que datos necesita mostrar/procesar?
4. De donde vienen esos datos? (BD existente, API, CSV, input manual)
5. Que acciones pueden hacer los usuarios? (CRUD, reportes, alertas)
6. Hay roles con permisos diferentes?
7. Necesita integrarse con algun sistema existente?

PREGUNTAS OPCIONALES (si aplican):
- Necesita notificaciones?
- Hay workflows de aprobacion?
- Que metricas importan?
- Hay branding especifico?

Cuando tengas suficiente informacion, genera un documento de
requerimientos estructurado en JSON.
```

**Output schema:**

```json
{
  "title": "Sistema de Gestion de Auditorias",
  "problem_statement": "Los auditores usan Excel para...",
  "user_types": [
    {
      "role": "auditor",
      "permissions": ["create_audit", "edit_audit", "view_reports"],
      "count": "~50"
    },
    {
      "role": "admin",
      "permissions": ["all"],
      "count": "~5"
    }
  ],
  "core_features": [
    {
      "name": "Crear auditoria",
      "description": "Formulario para registrar nueva auditoria con...",
      "priority": "must-have"
    }
  ],
  "data_sources": [
    {
      "type": "postgresql",
      "description": "BD corporativa con tabla de empleados",
      "access": "connection_string"
    }
  ],
  "integrations": ["Microsoft Graph API", "SAP"],
  "constraints": ["Debe correr en Azure", "SSO con Azure AD"]
}
```

**Condicion de avance:** El agente determina que tiene respuestas a todas las preguntas obligatorias. Presenta el documento al usuario. Usuario aprueba.

**Comportamiento clave:** El agente NO debe aceptar descripciones vagas. Si el usuario dice "quiero un dashboard", el agente debe preguntar: dashboard de que? que datos? para quien? que decisiones se toman con eso?

---

### Etapa 2: EVALUATION

**Proposito:** Evaluar factibilidad y complejidad. Determinar si se puede construir y con que.

**Modo de interaccion:** Automatica. No requiere input del usuario. El agente recibe los requerimientos y produce la evaluacion.

**System prompt (resumen):**

```
Eres un evaluador tecnico. Dado un documento de requerimientos,
evalua:

1. COMPLEJIDAD: low | medium | high | very-high
   - low: CRUD simple, 1-3 paginas, sin integraciones
   - medium: multiples paginas, auth, 1-2 integraciones
   - high: workflows complejos, multiples integraciones, tiempo real
   - very-high: fuera de alcance para generacion automatica

2. COMPONENTES NECESARIOS:
   - Cuantas paginas de frontend?
   - Cuantos endpoints de API?
   - Cuantas tablas de BD?
   - Que servicios externos?

3. STACK RECOMENDADO:
   - Frontend: React | Next.js
   - Backend: FastAPI | Express
   - BD: PostgreSQL (siempre para MVP)
   - Auth: simple (email/pass) | SSO

4. RIESGOS:
   - Que podria fallar?
   - Que integraciones son riesgosas?
   - Que requerimientos son ambiguos?

5. FACTIBILIDAD: true | false
   - Si false, explica por que y que falta
```

**Output schema:**

```json
{
  "complexity": "medium",
  "feasibility": true,
  "estimated_pages": 6,
  "estimated_endpoints": 14,
  "estimated_tables": 5,
  "stack": {
    "frontend": "react",
    "backend": "fastapi",
    "database": "postgresql",
    "auth": "email_password"
  },
  "external_services": ["microsoft_graph"],
  "risks": [
    {
      "description": "Integracion con SAP puede requerir VPN",
      "severity": "medium",
      "mitigation": "Confirmar acceso de red antes de connect"
    }
  ],
  "notes": "Proyecto viable. Complejidad media por integracion con Graph API."
}
```

**Condicion de avance:** Si `feasibility = true`, avanza automaticamente a planning. Si `false`, notifica al usuario y vuelve a discovery para ajustar requerimientos.

---

### Etapa 3: PLANNING

**Proposito:** Crear un plan detallado de implementacion — que se va a construir exactamente.

**Modo de interaccion:** Automatica. Recibe requerimientos + evaluacion.

**System prompt (resumen):**

```
Eres un arquitecto de software. Dado los requerimientos y la evaluacion,
crea un plan de implementacion detallado.

DEBES PRODUCIR:

1. SCHEMA DE BASE DE DATOS:
   - Cada tabla con columnas, tipos, constraints
   - Relaciones (FK)
   - Indices necesarios

2. API ENDPOINTS:
   - Metodo, ruta, descripcion
   - Request body (JSON)
   - Response body (JSON)
   - Auth requerida?

3. PAGINAS DE FRONTEND:
   - Nombre, ruta, proposito
   - Componentes principales
   - Que endpoints consume
   - Layout (sidebar? tabs? formulario?)

4. FLUJOS DE DATOS:
   - De donde viene cada dato
   - Como se transforma
   - Donde se muestra

5. AUTH FLOW:
   - Como se registra un usuario
   - Como se loguea
   - Que permisos tiene cada rol

NO generes codigo. Solo el plan. El plan debe ser lo suficientemente
detallado para que otro agente lo pueda implementar sin ambiguedad.
```

**Output schema:**

```json
{
  "db_schema": {
    "tables": [
      {
        "name": "audits",
        "columns": [
          {"name": "id", "type": "UUID", "primary_key": true},
          {"name": "title", "type": "VARCHAR(500)", "nullable": false},
          {"name": "status", "type": "VARCHAR(50)", "default": "'draft'"},
          {"name": "assigned_to", "type": "UUID", "foreign_key": "users.id"},
          {"name": "created_at", "type": "TIMESTAMP", "default": "now()"}
        ],
        "indexes": ["idx_audits_status", "idx_audits_assigned"]
      }
    ]
  },
  "api_endpoints": [
    {
      "method": "POST",
      "path": "/api/audits",
      "description": "Crear nueva auditoria",
      "request_body": {"title": "string", "assigned_to": "uuid"},
      "response": {"id": "uuid", "title": "string", "status": "string"},
      "auth": true,
      "roles": ["auditor", "admin"]
    }
  ],
  "pages": [
    {
      "name": "Dashboard",
      "route": "/",
      "purpose": "Vista general con metricas y lista de auditorias recientes",
      "components": ["StatsCards", "AuditTable", "FilterBar"],
      "endpoints_used": ["GET /api/audits", "GET /api/stats"],
      "layout": "sidebar"
    }
  ],
  "auth": {
    "method": "email_password",
    "roles": ["auditor", "admin"],
    "registration": "invite_only"
  }
}
```

**Condicion de avance:** Automatica a audit.

---

### Etapa 4: AUDIT

**Proposito:** Un segundo agente revisa el plan buscando errores, gaps y problemas.

**Modo de interaccion:** Automatica. El agente auditor NO tiene acceso a la conversacion del planning — solo ve el plan. Esto evita sesgo de confirmacion.

**System prompt (resumen):**

```
Eres un auditor de software senior. Recibes un plan de implementacion
y tu trabajo es encontrar problemas.

BUSCA:
1. GAPS FUNCIONALES
   - Hay algun requerimiento que no esta cubierto por el plan?
   - Falta algun endpoint necesario?
   - Hay paginas sin endpoints o endpoints sin paginas?

2. PROBLEMAS DE DATOS
   - Hay tablas sin relaciones que deberian tenerlas?
   - Faltan campos necesarios?
   - Los tipos de datos son correctos?

3. SEGURIDAD
   - Hay endpoints sin auth que deberian tenerla?
   - Los roles estan bien definidos?
   - Se manejan datos sensibles sin encriptar?

4. EDGE CASES
   - Que pasa si un dato es null?
   - Que pasa con concurrencia?
   - Hay estados invalidos posibles?

5. SOBRE-INGENIERIA
   - Hay componentes innecesarios?
   - Se puede simplificar algo?

SEVERIDAD de cada issue: critical | warning | suggestion
Si hay issues CRITICAL, el plan debe ser corregido antes de avanzar.
```

**Output schema:**

```json
{
  "passed": false,
  "issues": [
    {
      "severity": "critical",
      "category": "gap",
      "description": "Endpoint GET /api/audits no tiene paginacion. Con 10K+ auditorias va a fallar.",
      "suggestion": "Agregar query params: page, limit, offset"
    },
    {
      "severity": "warning",
      "category": "security",
      "description": "Endpoint DELETE /api/audits/{id} no valida que el usuario sea owner o admin",
      "suggestion": "Agregar check de ownership"
    },
    {
      "severity": "suggestion",
      "category": "simplification",
      "description": "La tabla audit_history puede ser un campo JSONB en audits para el MVP",
      "suggestion": "Simplificar a un campo changelog JSONB"
    }
  ],
  "summary": "2 issues criticos, 1 warning. Requiere refinamiento."
}
```

**Condicion de avance:** Si `passed = true` (ningun issue critical), avanza a architecture. Si no, va a refinement.

---

### Etapa 5: REFINEMENT

**Proposito:** Tomar el plan + los issues de la auditoria y corregirlo.

**Modo de interaccion:** Automatica.

**System prompt (resumen):**

```
Eres el mismo arquitecto de la etapa de planning.
Recibes tu plan original + una lista de issues encontrados por el auditor.
Incorpora TODAS las correcciones de issues critical y warning.
Los suggestions son opcionales.
Devuelve el plan corregido completo (no solo los deltas).
```

**Output:** Mismo schema que planning, pero corregido.

**Condicion de avance:** Vuelve automaticamente a audit. El loop audit→refinement se repite maximo 2 veces. Si despues de 2 iteraciones sigue con issues critical, se le presenta al usuario para decision manual.

---

### Etapa 6: ARCHITECTURE

**Proposito:** Convertir el plan aprobado en specs concretas listas para generar codigo.

**Modo de interaccion:** Automatica. Produce output, se presenta al usuario para aprobacion final antes de buildear.

**System prompt (resumen):**

```
Eres un arquitecto de software. Recibes un plan de implementacion
aprobado. Tu trabajo es producir los specs finales que un agente
de codigo necesita para implementar todo.

PRODUCE:

1. SQL COMPLETO:
   - CREATE TABLE statements listos para ejecutar
   - Incluye indices, constraints, defaults
   - Seed data si es necesario

2. API SPECIFICATION:
   - Cada endpoint con request/response JSON exactos
   - Incluye validaciones (que campos son required, tipos, limites)
   - Incluye error responses (400, 401, 403, 404, 500)

3. COMPONENT TREE:
   - Arbol completo de componentes React
   - Props de cada componente
   - State management (que es local, que es global)

4. DOCKER CONFIGURATION:
   - Dockerfile para backend
   - Dockerfile para frontend
   - docker-compose.yml con todos los servicios
   - Networking entre containers

5. ENVIRONMENT VARIABLES:
   - Lista completa de env vars necesarias
   - Cuales son secrets, cuales son config
   - Valores default para desarrollo
```

**Condicion de avance:** El usuario ve la arquitectura y aprueba. Esto es el ultimo checkpoint humano antes de que el sistema genere codigo.

---

### Etapa 7: BUILD

**Proposito:** Generar todo el codigo de la aplicacion.

**Modo de interaccion:** Automatica. El agente genera archivos secuencialmente.

**Estrategia de generacion:**

El contexto de Claude tiene limite. No se puede generar una app entera en una sola llamada. La estrategia es generar por capas:

```
Paso 1: SCAFFOLDING
  - Estructura de carpetas
  - package.json / requirements.txt
  - Configs (tsconfig, tailwind, etc)
  - Dockerfiles
  - docker-compose.yml

Paso 2: DATABASE
  - SQL schema (copiar del architecture output)
  - ORM models (SQLAlchemy / Prisma)
  - Migration files

Paso 3: BACKEND — CORE
  - main.py (app setup, CORS, middleware)
  - database.py (connection, session)
  - auth.py (login, register, middleware)

Paso 4: BACKEND — ENDPOINTS
  - Un archivo por recurso (audits.py, users.py, etc)
  - Incluye validaciones (Pydantic schemas)
  - Cada endpoint con su logica completa

Paso 5: FRONTEND — LAYOUT
  - Layout global (sidebar, header, navigation)
  - Pagina de login
  - Routing

Paso 6: FRONTEND — PAGES
  - Una llamada por pagina compleja
  - Cada pagina con sus componentes, state, API calls

Paso 7: FRONTEND — COMPONENTS COMPARTIDOS
  - Tablas, formularios, modales, alerts
  - Estilos globales
```

Cada paso es una llamada independiente a Claude. El system prompt incluye:
- La arquitectura completa (del paso 6)
- Los archivos ya generados (del paso actual hacia atras)
- Instrucciones especificas de que generar ahora

**Formato de output del build agent:**

El agente devuelve archivos en formato estructurado:

```json
{
  "files": [
    {
      "path": "backend/app/main.py",
      "content": "from fastapi import FastAPI\n..."
    },
    {
      "path": "backend/app/routers/audits.py",
      "content": "from fastapi import APIRouter\n..."
    }
  ]
}
```

El orquestador escribe cada archivo al workspace.

**Manejo de contexto:**

Cada paso del build recibe:
1. La arquitectura completa (~2-4K tokens)
2. Lista de archivos ya generados con sus paths (sin contenido completo, ~500 tokens)
3. Contenido de archivos directamente relevantes al paso actual (~2-4K tokens)
4. Instrucciones del paso actual (~1K tokens)

Total por llamada: ~10K tokens de input. Bien dentro del limite.

---

### Etapa 8: TEST

**Proposito:** Verificar que el codigo generado funciona.

**Modo de interaccion:** Automatica. Ejecuta comandos en el workspace.

**Secuencia de tests:**

```
1. SYNTAX CHECK
   - Backend: python -m py_compile para cada .py
   - Frontend: npx tsc --noEmit
   - Si falla: error vuelve al build agent con el mensaje de error

2. DEPENDENCY INSTALL
   - Backend: pip install -r requirements.txt
   - Frontend: npm install
   - Si falla: build agent corrige requirements/package.json

3. DOCKER BUILD
   - docker-compose build
   - Si falla: build agent corrige Dockerfiles

4. DOCKER UP
   - docker-compose up -d
   - Esperar 10 segundos para startup

5. HEALTH CHECKS
   - Backend: GET /health → 200
   - Backend: GET /docs → 200 (Swagger UI)
   - Frontend: GET / → 200
   - Si falla: revisar logs, enviar a build agent

6. SMOKE TESTS
   - POST /api/auth/register (crear usuario test)
   - POST /api/auth/login (login)
   - GET endpoints principales (con auth)
   - Si falla: logs + error al build agent
```

**Retry logic:**

```
intento 1: build → test
  si falla → error + archivos relevantes al build agent
intento 2: build (correccion) → test
  si falla → error + archivos relevantes al build agent
intento 3: build (correccion) → test
  si falla → STOP. Notificar al usuario con log de errores.
```

---

### Etapa 9: CONNECT

**Proposito:** Conectar la app generada a los datos reales del cliente.

**Modo de interaccion:** El usuario provee credenciales a traves de un formulario en la UI.

**Flujo:**

```
1. La UI muestra que conexiones necesita (basado en el discovery):
   - "Tu app necesita: PostgreSQL connection string"
   - "Tu app necesita: Microsoft Graph API key"

2. El usuario pega las credenciales en el formulario

3. El backend:
   a. Valida cada conexion (intenta conectar, query test)
   b. Si falla: muestra error especifico ("Connection refused en port 5432")
   c. Si pasa: encripta credenciales y las guarda como env vars del container
   d. Re-levanta el container con las env vars reales
   e. Corre health checks de nuevo con datos reales
```

**Manejo de credenciales:**

```python
# Las credenciales se encriptan antes de guardar
# Se inyectan como env vars al container, nunca en disco
# Se guardan en la tabla deployments.env_vars (campo JSONB encriptado)
# La llave de encripcion vive en env var del orquestador, no en DB
```

**Si el usuario no tiene datos externos:**

La app se deploya con su propia base de datos PostgreSQL interna (la que viene en el docker-compose generado). El paso de connect se salta.

---

### Etapa 10: DEPLOY

**Proposito:** Poner la app en produccion con un dominio accesible.

**Secuencia:**

```
1. BUILD IMAGE
   - docker build -t steinmetz/{project-slug}:latest ./workspace/{id}
   - Tag con version: steinmetz/{project-slug}:v1

2. PUSH IMAGE
   - Push al registry (Docker Hub o registry privado en el VPS)

3. DEPLOY CONTAINER
   - docker run con env vars, network, y restart policy
   - Conectar a la red de Caddy

4. CONFIGURE DNS
   - Cloudflare API: agregar registro A/CNAME
   - Subdominio: {project-slug}.apps.steinmetz.it.com
   - Caddy detecta automaticamente y genera SSL

5. HEALTH CHECK
   - GET https://{project-slug}.apps.steinmetz.it.com/health
   - Retry cada 5 segundos, max 12 intentos (1 minuto)

6. MARK AS LIVE
   - Actualizar status del proyecto a 'deployed'
   - Guardar deploy_url en DB
   - Notificar al usuario con la URL
```

**Caddy config (auto-discovery):**

```
*.apps.steinmetz.it.com {
    reverse_proxy {
        dynamic a]  {
            # Caddy busca containers con label "steinmetz.subdomain=X"
            # y enruta automaticamente
        }
    }
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}
```

**MVP simplificado:** En vez de auto-discovery, el deployer agrega una linea al Caddyfile y hace reload:

```python
def configure_caddy(subdomain: str, container_port: int):
    entry = f"""
{subdomain}.apps.steinmetz.it.com {{
    reverse_proxy localhost:{container_port}
}}
"""
    # Append to Caddyfile
    # caddy reload
```

---

## Servicio AI (ai.py)

Wrapper centralizado para todas las llamadas a Claude:

```python
import anthropic

class AIService:
    def __init__(self):
        self.client = anthropic.Anthropic()

    async def run_stage(
        self,
        system_prompt: str,
        context: dict,
        user_message: str,
        output_schema: dict | None = None,
        model: str = "claude-sonnet-4-20250514"
    ) -> dict:
        """
        Llamada generica para cualquier etapa.

        - system_prompt: instrucciones de la etapa (desde prompts/*.md)
        - context: todo el contexto acumulado del proyecto
        - user_message: el mensaje del usuario (o descripcion del paso)
        - output_schema: si se pasa, fuerza JSON output
        - model: sonnet para etapas cognitivas, opus para build
        """
        messages = self._build_messages(context, user_message)

        response = self.client.messages.create(
            model=model,
            max_tokens=8192,
            system=system_prompt,
            messages=messages
        )

        if output_schema:
            return self._parse_structured_output(response, output_schema)
        return {"content": response.content[0].text}

    async def run_build_step(
        self,
        architecture: dict,
        existing_files: list[str],
        file_contents: dict,
        step_instructions: str
    ) -> list[dict]:
        """
        Llamada especifica para el build.
        Devuelve lista de {path, content} para escribir al workspace.
        Usa el modelo mas capaz.
        """
        # ...

    def _build_messages(self, context: dict, user_message: str) -> list:
        """
        Construye el array de mensajes incluyendo contexto
        de etapas anteriores como mensajes del sistema.
        """
        messages = []

        # Agregar contexto de etapas completadas
        if context:
            context_summary = self._summarize_context(context)
            messages.append({
                "role": "user",
                "content": f"CONTEXTO DEL PROYECTO:\n{context_summary}"
            })
            messages.append({
                "role": "assistant",
                "content": "Entendido. Tengo el contexto completo del proyecto."
            })

        # Agregar mensaje actual
        messages.append({"role": "user", "content": user_message})

        return messages
```

**Seleccion de modelo por etapa:**

| Etapa | Modelo | Por que |
|-------|--------|---------|
| Discovery | claude-sonnet-4-20250514 | Conversacion, no necesita potencia maxima |
| Evaluation | claude-sonnet-4-20250514 | Analisis estructurado simple |
| Planning | claude-sonnet-4-20250514 | Buena capacidad de planificacion |
| Audit | claude-sonnet-4-20250514 | Revision critica, distinto al planner |
| Refinement | claude-sonnet-4-20250514 | Correccion basada en feedback |
| Architecture | claude-opus-4-6 | Specs detalladas y precisas |
| Build | claude-opus-4-6 | Generacion de codigo — necesita el mejor |
| Test | N/A | No usa AI, ejecuta comandos |
| Connect | N/A | No usa AI, valida conexiones |
| Deploy | N/A | No usa AI, ejecuta deploy |

---

## API del backend

### Endpoints

```
POST   /api/auth/register          Crear cuenta
POST   /api/auth/login             Login (devuelve JWT)

GET    /api/projects               Listar proyectos del usuario
POST   /api/projects               Crear proyecto (recibe prompt inicial)
GET    /api/projects/{id}          Detalle del proyecto (stage, context, status)
DELETE /api/projects/{id}          Eliminar proyecto

POST   /api/projects/{id}/message  Enviar mensaje al agente de la etapa actual
GET    /api/projects/{id}/messages Historial de mensajes (filtrable por stage)
POST   /api/projects/{id}/approve  Aprobar etapa actual y avanzar

GET    /api/projects/{id}/files    Lista de archivos generados (etapa build+)
GET    /api/projects/{id}/files/{path}  Contenido de un archivo especifico

POST   /api/projects/{id}/connect  Enviar credenciales de conexion
GET    /api/projects/{id}/deploy   Estado del deploy
```

### Request/Response examples

**Crear proyecto:**

```
POST /api/projects
{
  "description": "Quiero un sistema de gestion de auditorias para mi equipo de 50 personas"
}

→ 201
{
  "id": "proj_abc123",
  "title": null,
  "current_stage": "discovery",
  "status": "active",
  "created_at": "2026-03-17T..."
}
```

**Enviar mensaje:**

```
POST /api/projects/proj_abc123/message
{
  "content": "Es para auditores internos de una empresa de alimentos. Necesitan registrar hallazgos, asignar responsables y trackear plazos de correccion."
}

→ 200
{
  "role": "assistant",
  "content": "Perfecto. Algunas preguntas mas para tener el cuadro completo:\n\n1. Cuantos auditores van a usar el sistema simultaneamente?\n2. Los hallazgos tienen categorias predefinidas o son libres?\n3. Necesitan adjuntar fotos o documentos a los hallazgos?\n4. Hay un flujo de aprobacion? (ej: auditor registra → jefe aprueba → responsable corrige)\n5. Necesitan reportes/dashboards? Si es asi, que metricas?",
  "metadata": {
    "stage": "discovery",
    "questions_remaining": 5,
    "ready_to_advance": false
  }
}
```

**Aprobar etapa:**

```
POST /api/projects/proj_abc123/approve

→ 200
{
  "previous_stage": "discovery",
  "current_stage": "evaluation",
  "message": "Requerimientos aprobados. Evaluando factibilidad..."
}
```

---

## Frontend — UX del embudo

### Pagina del proyecto (`/console/[id]`)

```
┌─────────────────────────────────────────────────────────┐
│  STEINMETZ            [proyecto: Sistema de Auditorias] │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  EMBUDO    │  CHAT / CONTENIDO                          │
│            │                                            │
│  ● Discov. │  ┌──────────────────────────────────────┐  │
│  ○ Eval.   │  │ Agente: Para entender bien lo que    │  │
│  ○ Plan    │  │ necesitas, tengo algunas preguntas... │  │
│  ○ Audit   │  │                                      │  │
│  ○ Refine  │  │ Tu: Es para auditores internos...    │  │
│  ○ Arq.    │  │                                      │  │
│  ○ Build   │  │ Agente: Perfecto. Algunas preguntas  │  │
│  ○ Test    │  │ mas...                               │  │
│  ○ Connect │  │                                      │  │
│  ○ Deploy  │  └──────────────────────────────────────┘  │
│            │                                            │
│            │  ┌──────────────────────────────────────┐  │
│            │  │ [Escribir mensaje...]          [↑]   │  │
│            │  └──────────────────────────────────────┘  │
│            │                                            │
│            │  ┌──────────────────────────────────────┐  │
│            │  │ [Aprobar y continuar →]               │  │
│            │  └──────────────────────────────────────┘  │
│            │                                            │
├────────────┴────────────────────────────────────────────┤
```

**En etapas automaticas (evaluation, planning, audit):**

El chat muestra el output del agente como un documento formateado, no como burbujas de chat. El usuario ve cards con el plan, la evaluacion, o los issues de la auditoria.

**En etapa de build:**

El area central cambia de chat a una vista split:
- Izquierda: arbol de archivos generados (tipo VS Code sidebar)
- Derecha: preview del archivo seleccionado (con syntax highlighting)
- Abajo: terminal con logs de build/test

**En etapa de deploy:**

Progress bar con los pasos:
```
[✓ Building image] → [✓ Pushing] → [● Deploying...] → [ DNS] → [ Live]
```

Cuando llega a Live:
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ✓  Tu app esta en produccion                    │
│                                                  │
│  🔗 auditorias.apps.steinmetz.it.com             │
│                                                  │
│  [Abrir app ↗]     [Ver logs]     [Nuevo build]  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Workspace manager (workspace.py)

```python
import subprocess
import shutil
from pathlib import Path

class WorkspaceManager:
    BASE_DIR = Path("workspaces")

    def create(self, project_id: str) -> Path:
        """Crea el directorio del workspace."""
        workspace = self.BASE_DIR / project_id
        workspace.mkdir(parents=True, exist_ok=True)
        return workspace

    def write_file(self, project_id: str, file_path: str, content: str):
        """Escribe un archivo al workspace, creando subdirectorios si es necesario."""
        full_path = self.BASE_DIR / project_id / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")

    def read_file(self, project_id: str, file_path: str) -> str:
        """Lee un archivo del workspace."""
        return (self.BASE_DIR / project_id / file_path).read_text(encoding="utf-8")

    def list_files(self, project_id: str) -> list[str]:
        """Lista todos los archivos del workspace (recursivo)."""
        workspace = self.BASE_DIR / project_id
        return [
            str(p.relative_to(workspace))
            for p in workspace.rglob("*")
            if p.is_file() and not p.name.startswith(".")
        ]

    def run_command(
        self, project_id: str, command: str, timeout: int = 120
    ) -> tuple[int, str, str]:
        """
        Ejecuta un comando en el workspace.
        Retorna (exit_code, stdout, stderr).
        """
        workspace = self.BASE_DIR / project_id
        result = subprocess.run(
            command, shell=True, cwd=workspace,
            capture_output=True, text=True, timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr

    def cleanup(self, project_id: str):
        """Elimina el workspace."""
        workspace = self.BASE_DIR / project_id
        if workspace.exists():
            shutil.rmtree(workspace)
```

---

## Orchestrator (orchestrator.py)

```python
from app.stages import (
    DiscoveryStage, EvaluationStage, PlanningStage,
    AuditStage, RefinementStage, ArchitectureStage,
    BuildStage, TestStage, ConnectStage, DeployStage
)

STAGE_ORDER = [
    "discovery", "evaluation", "planning", "audit",
    "refinement", "architecture", "build", "test",
    "connect", "deploy"
]

STAGE_MAP = {
    "discovery": DiscoveryStage,
    "evaluation": EvaluationStage,
    "planning": PlanningStage,
    "audit": AuditStage,
    "refinement": RefinementStage,
    "architecture": ArchitectureStage,
    "build": BuildStage,
    "test": TestStage,
    "connect": ConnectStage,
    "deploy": DeployStage,
}

class Orchestrator:
    def __init__(self, ai_service, workspace_manager, db):
        self.ai = ai_service
        self.workspace = workspace_manager
        self.db = db

    async def handle_message(self, project_id: str, user_message: str) -> dict:
        """Procesa un mensaje del usuario en el contexto de la etapa actual."""
        project = await self.db.get_project(project_id)
        stage_runner = STAGE_MAP[project.current_stage](self.ai)

        result = await stage_runner.run(
            context=project.context,
            user_message=user_message
        )

        # Guardar mensaje + respuesta
        await self.db.save_message(project_id, "user", user_message)
        await self.db.save_message(project_id, "assistant", result["content"])

        return result

    async def approve_stage(self, project_id: str) -> dict:
        """Aprueba la etapa actual y avanza a la siguiente."""
        project = await self.db.get_project(project_id)
        current = project.current_stage
        stage_runner = STAGE_MAP[current](self.ai)

        # Guardar output de la etapa en el contexto
        stage_output = stage_runner.get_final_output()
        project.context[current] = stage_output

        # Determinar siguiente etapa
        next_stage = self._get_next_stage(current, stage_output)
        project.current_stage = next_stage

        await self.db.update_project(project)

        # Si la siguiente etapa es automatica, ejecutarla
        if next_stage in ["evaluation", "planning", "audit", "refinement", "build", "test"]:
            return await self._run_automatic_stage(project)

        return {"current_stage": next_stage, "awaiting_input": True}

    def _get_next_stage(self, current: str, output: dict) -> str:
        """Logica de transicion de la state machine."""
        if current == "evaluation" and not output.get("feasibility"):
            return "discovery"  # volver a preguntar
        if current == "audit" and not output.get("passed"):
            return "refinement"
        if current == "refinement":
            return "audit"  # re-auditar
        if current == "test" and not output.get("passed"):
            retries = output.get("retry_count", 0)
            if retries < 3:
                return "build"  # reintentar
            return "test"  # stop, notificar usuario

        # Default: siguiente en el orden
        idx = STAGE_ORDER.index(current)
        return STAGE_ORDER[idx + 1]
```

---

## Fases de construccion (actualizado)

### FASE 0 — Setup (1 dia)

- [ ] Crear repo GitHub `steinmetz-mvp`
- [ ] `docker-compose.yml` con postgres
- [ ] FastAPI scaffolding con health check
- [ ] Next.js scaffolding con pagina basica
- [ ] Modelos SQLAlchemy + Alembic migration inicial
- [ ] `.env.example` con todas las vars necesarias
- [ ] Makefile: `make dev`, `make db-migrate`, `make reset`
- [ ] Verificar: `make dev` levanta todo y frontend conecta a backend

### FASE 1 — Embudo cognitivo (4-5 dias)

- [ ] **Dia 1:** AIService + StageRunner base + Discovery (prompt + handler)
- [ ] **Dia 2:** Evaluation + Planning + schemas de output
- [ ] **Dia 3:** Audit + Refinement + loop logic
- [ ] **Dia 4:** Architecture + orchestrator completo con state machine
- [ ] **Dia 5:** Frontend: chat UI + stage progress + approval flow
- [ ] Verificar: crear proyecto, pasar 6 etapas, llegar a architecture aprobada

### FASE 2 — Build engine (4-5 dias)

- [ ] **Dia 1:** WorkspaceManager + generacion de scaffolding (paso 1)
- [ ] **Dia 2:** Build agent: pasos 2-4 (database + backend core + endpoints)
- [ ] **Dia 3:** Build agent: pasos 5-7 (frontend layout + pages + components)
- [ ] **Dia 4:** Test runner: syntax check + docker build + health checks + retry loop
- [ ] **Dia 5:** Frontend: file tree + code viewer + build logs
- [ ] Verificar: desde architecture aprobada, genera app completa que buildea en Docker

### FASE 3 — Deploy pipeline (3 dias)

- [ ] **Dia 1:** Connect: formulario de credenciales + validacion + inyeccion de env vars
- [ ] **Dia 2:** Deployer: docker run + Caddy config + DNS via Cloudflare API
- [ ] **Dia 3:** Frontend: deploy progress + URL final + logs
- [ ] Verificar: app deployada en {slug}.apps.steinmetz.it.com con SSL

### FASE 4 — Polish (2-3 dias)

- [ ] Auth (JWT + email/password)
- [ ] Error handling en cada etapa
- [ ] Retry logic robusta
- [ ] Test end-to-end completo: prompt → app deployada
- [ ] Fix bugs del test e2e
- [ ] Landing page minima

---

## Infra para el MVP

| Que | Donde | Costo |
|---|---|---|
| Frontend | Vercel | $0 |
| Backend + Workspaces + Docker host | Hetzner CPX31 (4 vCPU, 8GB RAM) | ~$15/mes |
| PostgreSQL | Mismo VPS | $0 |
| Caddy (reverse proxy) | Mismo VPS | $0 |
| DNS | Cloudflare (free plan) | $0 |
| Claude API | Anthropic | ~$5-20 por proyecto generado |
| Docker Registry | Docker Hub (free, 1 repo privado) | $0 |
| **Total mensual** | | **~$15 + API usage** |

---

## Costos de AI por proyecto (estimado)

| Etapa | Modelo | Tokens estimados (in/out) | Costo aprox |
|-------|--------|---------------------------|-------------|
| Discovery (5 turnos) | Sonnet | 15K in / 5K out | $0.12 |
| Evaluation | Sonnet | 5K in / 2K out | $0.03 |
| Planning | Sonnet | 8K in / 5K out | $0.08 |
| Audit | Sonnet | 8K in / 3K out | $0.06 |
| Refinement | Sonnet | 10K in / 5K out | $0.09 |
| Architecture | Opus | 12K in / 8K out | $1.20 |
| Build (7 pasos) | Opus | 70K in / 40K out | $10.50 |
| **Total por proyecto** | | | **~$12** |

El costo mas alto es el build porque usa Opus para generar codigo de calidad y hace 7 llamadas. Optimizable despues con caching de templates y uso de Sonnet donde sea viable.

---

*Steinmetz MVP — Plan de Construccion v2.0*
