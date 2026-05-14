# Steinmetz — Integracion con Ecosistema Claude Code 2026

Complemento a `mvp-plan.md`. Este documento describe como integrar el Claude Agent SDK, MCP servers, hooks, subagentes y skills al plan existente del MVP.

**Regla:** El embudo de 10 etapas, los schemas JSON, el modelo de datos, la API, y el UX no cambian. Lo que cambia es la CAPA DE EJECUCION — como los agentes operan internamente.

---

## 1. CLAUDE AGENT SDK COMO RUNTIME

### Que cambia

En el plan actual, `ai.py` hace llamadas crudas a `anthropic.Anthropic().messages.create()`. Esto tiene limitaciones:

- Claude genera texto. El orquestador tiene que parsear JSON y escribir archivos manualmente.
- No hay tool use. Si Claude necesita leer un archivo existente para generar el siguiente, hay que hacerlo a mano.
- No hay retry loop. Si falla, hay que reintentar manualmente.
- No hay streaming. El usuario espera sin feedback.

Con el Agent SDK, cada etapa se convierte en un **agente autonomo** que puede leer archivos, escribir archivos, ejecutar bash, y usar MCP servers — sin que el orquestador tenga que mediar cada accion.

### Antes vs Despues

**Antes (API cruda) — Build agent:**

```python
# ai.py
import anthropic

class AIService:
    def __init__(self):
        self.client = anthropic.Anthropic()

    async def run_build_step(self, architecture, step_instructions):
        response = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=8192,
            system="Eres un generador de codigo...",
            messages=[
                {"role": "user", "content": f"ARQUITECTURA:\n{json.dumps(architecture)}\n\nINSTRUCCION:\n{step_instructions}"}
            ]
        )
        # Parsear JSON manualmente
        files = json.loads(response.content[0].text)
        # Escribir archivos manualmente
        for f in files["files"]:
            workspace.write_file(project_id, f["path"], f["content"])
```

**Despues (Agent SDK) — Build agent:**

```python
# ai.py
from claude_agent_sdk import query, ClaudeAgentOptions

class AIService:
    async def run_build_agent(self, workspace_path: str, architecture: dict, step_instructions: str):
        options = ClaudeAgentOptions(
            model="claude-opus-4-6",
            allowed_tools=["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
            permission_mode="acceptEdits",
            system_prompt=self._load_prompt("build.md"),
            max_turns=50,
            max_budget_usd=2.0,
            cwd=workspace_path,
            mcp_servers={
                "context7": {
                    "command": "npx",
                    "args": ["-y", "@upstash/context7-mcp@latest"]
                }
            }
        )

        messages = []
        async for message in query(
            prompt=f"ARQUITECTURA:\n{json.dumps(architecture)}\n\nINSTRUCCION:\n{step_instructions}",
            options=options
        ):
            messages.append(message)
            # Stream al frontend via WebSocket
            if hasattr(message, "content"):
                await self.ws_broadcast(project_id, message.content)

        return messages
```

**Diferencia clave:** El agente ya no devuelve "JSON con archivos". El agente ESCRIBE los archivos directamente al workspace usando las tools Write/Edit. Tambien puede ejecutar `pip install`, `npm install`, `docker build` via Bash. El orquestador solo lanza al agente y espera.

### Refactorizacion del StageRunner

**Antes:**

```python
class StageRunner:
    async def run(self, context, user_message) -> StageOutput:
        response = await self.ai.call_claude(self.system_prompt, context, user_message)
        output = json.loads(response)
        return StageOutput(data=output)
```

**Despues:**

```python
class StageRunner:
    def get_agent_options(self) -> ClaudeAgentOptions:
        """Cada etapa define sus propias opciones de agente."""
        return ClaudeAgentOptions(
            model=self.model,
            allowed_tools=self.allowed_tools,
            permission_mode="acceptEdits",
            system_prompt=self._load_prompt(),
            max_turns=self.max_turns,
            max_budget_usd=self.budget,
            cwd=self.workspace_path,
            mcp_servers=self.mcp_servers
        )

    async def run(self, context: dict, user_message: str) -> StageOutput:
        options = self.get_agent_options()
        prompt = self._build_prompt(context, user_message)

        result_messages = []
        session_id = None

        async for message in query(prompt=prompt, options=options):
            result_messages.append(message)
            if hasattr(message, "session_id"):
                session_id = message.session_id

        # Extraer output estructurado del ultimo mensaje
        output = self._extract_output(result_messages)
        return StageOutput(data=output, session_id=session_id)
```

### Configuracion por etapa

| Etapa | Modelo | Tools | Max turns | Budget | MCP servers |
|-------|--------|-------|-----------|--------|-------------|
| Discovery | sonnet | Read, AskUserQuestion | 30 | $0.50 | — |
| Evaluation | sonnet | Read | 10 | $0.20 | — |
| Planning | sonnet | Read | 15 | $0.30 | — |
| Audit | sonnet | Read | 10 | $0.20 | — |
| Refinement | sonnet | Read | 10 | $0.20 | — |
| Architecture | opus | Read, Write | 20 | $1.50 | context7 |
| Build | opus | Read, Write, Edit, Bash, Glob, Grep | 50 | $3.00 | context7, filesystem |
| Test | sonnet | Bash, Read | 20 | $0.50 | — |
| Connect | sonnet | Bash, Read | 10 | $0.20 | postgres (dinamico) |
| Deploy | sonnet | Bash, Read | 15 | $0.30 | github |

### Session management para builds largos

El Agent SDK soporta `resume` para continuar donde quedo:

```python
# Si el build se corta (context window, timeout, etc)
async def resume_build(self, session_id: str, next_instruction: str):
    options = ClaudeAgentOptions(
        resume=session_id  # Continua con todo el contexto anterior
    )
    async for message in query(prompt=next_instruction, options=options):
        yield message
```

Esto se complementa con `progress.md` (seccion 7) para handoff entre sesiones.

> **⚠️ MVP-BLOCKER:** Refactorizar `ai.py` y `StageRunner` para usar Agent SDK antes de empezar a implementar las etapas. Es la base de todo.

---

## 2. MCP SERVERS

### Core (siempre activos)

#### Context7 — Documentacion actualizada para el build agent

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

**Donde se usa:** Etapas 6 (architecture) y 7 (build).

**Por que:** Cuando el build agent genera codigo de React, FastAPI, SQLAlchemy, etc., puede consultar la documentacion actual en vez de hallucinar APIs deprecated.

**Configuracion en el Agent SDK:**

```python
mcp_servers={
    "context7": {
        "command": "npx",
        "args": ["-y", "@upstash/context7-mcp@latest"]
    }
}
```

**Tools que expone:** `mcp__context7__resolve-library-id`, `mcp__context7__get-library-docs`

**Ejemplo de uso por el agente:**
> "Antes de generar el router de FastAPI, deja que consulte la doc actual de FastAPI para confirmar la sintaxis de dependency injection..."

---

#### GitHub MCP — Gestion de repos

```bash
claude mcp add github -- npx -y @anthropic-ai/github-mcp-server
```

**Donde se usa:** Etapa 10 (deploy). Post-MVP: CI/CD.

**Por que:** El deploy agent puede crear repos, pushear codigo, crear releases. Post-MVP: trigger GitHub Actions para CI/CD.

**Env vars:**

```bash
GITHUB_TOKEN=ghp_...
```

**Configuracion:**

```python
mcp_servers={
    "github": {
        "command": "npx",
        "args": ["-y", "@anthropic-ai/github-mcp-server"],
        "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]}
    }
}
```

**Tools que expone:** `mcp__github__create_repository`, `mcp__github__push_files`, `mcp__github__create_pull_request`

---

#### PostgreSQL MCP — Explorar schemas del cliente

```bash
claude mcp add postgres -- npx -y @bytebase/dbhub
```

**Donde se usa:** Etapas 6 (architecture) y 9 (connect).

**Por que:** Si el cliente tiene una BD existente, el agente puede explorar el schema real (tablas, columnas, tipos) en vez de depender de lo que el usuario describe en discovery.

**Configuracion dinamica (se crea por proyecto):**

```python
# En la etapa de connect, cuando el usuario da su connection string:
mcp_servers={
    "client_db": {
        "command": "npx",
        "args": ["-y", "@bytebase/dbhub"],
        "env": {"DATABASE_URL": client_connection_string}
    }
}
```

**Tools que expone:** `mcp__client_db__list_tables`, `mcp__client_db__describe_table`, `mcp__client_db__run_query`

---

### Por proyecto (dinamicos)

#### OpenAPI MCP — APIs del cliente como tools

**Donde se usa:** Etapa 9 (connect).

**Por que:** Si el cliente tiene APIs REST con spec OpenAPI, se genera un MCP server automaticamente. El agente de integracion puede llamar a las APIs del cliente como tools nativos.

```python
# Se genera dinamicamente cuando el usuario provee un OpenAPI spec URL
mcp_servers={
    "client_api": {
        "command": "npx",
        "args": ["-y", "mcp-openapi", "--spec", client_openapi_url],
        "env": {"API_KEY": client_api_key}
    }
}
```

> **📈 POST-MVP:** La generacion dinamica de MCP servers desde OpenAPI specs. Para el MVP, las integraciones se hardcodean.

---

### Filesystem MCP — Workspace sandboxed

```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/workspace
```

**Donde se usa:** Etapa 7 (build).

**Por que:** Restringe al build agent a SOLO escribir dentro del workspace del proyecto. No puede tocar archivos del sistema o de otros proyectos.

**Configuracion:**

```python
mcp_servers={
    "workspace": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", f"/workspaces/{project_id}"]
    }
}
```

> **Nota:** Con el Agent SDK usando `cwd` + tools nativas (Read, Write, Edit), el filesystem MCP es redundante para sandboxing. Alcanza con configurar `cwd` al workspace. El filesystem MCP es mas util si se quiere dar acceso a MULTIPLES directorios (ej: workspace + templates).

---

## 3. SUBAGENTES PARALELOS EN EL BUILD

### El problema actual

El plan actual genera codigo en 7 pasos secuenciales. Cada paso espera al anterior. Un build completo toma ~7 llamadas a Opus × ~60 segundos = ~7 minutos.

### El rediseno

Algunos pasos son independientes y pueden correr en paralelo:

```
Paso 1: SCAFFOLDING (secuencial — base para todo)
│
├── Paso 2: DATABASE (subagente)     ─┐
│                                      ├── PARALELO (~90 seg)
├── Paso 3: BACKEND CORE (subagente) ─┘
│
├── Paso 4: BACKEND ENDPOINTS (secuencial — depende de 2+3)
│
├── Paso 5: FRONTEND LAYOUT (subagente)  ─┐
│                                          ├── PARALELO (~90 seg)
├── Paso 6: FRONTEND PAGES (subagente)   ─┘
│
└── Paso 7: SHARED COMPONENTS (secuencial — depende de 5+6)
```

**Tiempo estimado: de ~7 min secuencial a ~4 min con paralelismo.**

### Implementacion con Agent SDK

Cada subagente se define como un agente del SDK con tools y scope restringido:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

# El build orchestrator usa subagentes
options = ClaudeAgentOptions(
    model="claude-opus-4-6",
    allowed_tools=["Read", "Write", "Edit", "Bash", "Agent"],
    permission_mode="acceptEdits",
    cwd=workspace_path,
    agents={
        "db-agent": AgentDefinition(
            description="Generates database schema, ORM models, and migrations",
            prompt="Generate all database-related files based on the architecture spec.",
            tools=["Read", "Write", "Bash"],
            model="claude-opus-4-6"
        ),
        "backend-core-agent": AgentDefinition(
            description="Generates backend core: main.py, config, auth, middleware",
            prompt="Generate core backend files based on the architecture spec.",
            tools=["Read", "Write", "Bash"],
            model="claude-opus-4-6"
        ),
        "frontend-layout-agent": AgentDefinition(
            description="Generates frontend layout, routing, and shared UI shell",
            prompt="Generate the frontend layout and routing based on the architecture spec.",
            tools=["Read", "Write", "Bash"],
            model="claude-opus-4-6"
        ),
        "frontend-pages-agent": AgentDefinition(
            description="Generates individual pages and their components",
            prompt="Generate all pages and page-specific components.",
            tools=["Read", "Write", "Bash"],
            model="claude-opus-4-6"
        )
    }
)
```

### Manejo de conflictos

Dos subagentes podrian tocar archivos compartidos (types, configs, package.json). Reglas:

1. **Archivos compartidos se generan en el scaffolding** (paso 1, antes del paralelismo)
2. **Cada subagente tiene un scope de archivos:**
   - db-agent: `backend/app/models/`, `backend/alembic/`
   - backend-core-agent: `backend/app/main.py`, `backend/app/config.py`, `backend/app/auth/`
   - frontend-layout-agent: `frontend/app/layout.tsx`, `frontend/components/layout/`
   - frontend-pages-agent: `frontend/app/(pages)/`, `frontend/components/pages/`
3. **Si hay conflicto:** el paso secuencial siguiente (4 o 7) hace merge

### En el system prompt del build orchestrator:

```
Cuando llegues al paso de build, usa subagentes para paralelizar:

1. Ejecuta el scaffolding (paso 1) directamente
2. Lanza db-agent y backend-core-agent EN PARALELO
3. Cuando ambos terminen, genera backend endpoints (paso 4)
4. Lanza frontend-layout-agent y frontend-pages-agent EN PARALELO
5. Cuando ambos terminen, genera shared components (paso 7)

Usa la tool Agent para lanzar cada subagente.
```

> **📈 POST-MVP:** Los subagentes paralelos son una optimizacion de velocidad. Para el MVP, el build secuencial funciona. Agregar paralelismo cuando el build secuencial este estable.

---

## 4. HOOKS PARA QUALITY ENFORCEMENT

### Configuracion (.claude/settings.json)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/validate-bash.sh"
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/validate-write.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/auto-format.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/update-progress.sh"
          }
        ]
      }
    ]
  }
}
```

### Hook scripts

#### `.claude/hooks/validate-bash.sh` — Bloquear comandos destructivos

```bash
#!/bin/bash
# Lee el input del hook (JSON con tool_input)
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Lista de comandos bloqueados
BLOCKED_PATTERNS=(
    "rm -rf /"
    "rm -rf ~"
    "DROP DATABASE"
    "DROP TABLE"
    "mkfs"
    "dd if="
    "> /dev/sda"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qi "$pattern"; then
        echo '{"decision":"block","reason":"Comando destructivo bloqueado: '"$pattern"'"}' >&2
        exit 2
    fi
done

# Verificar que el comando se ejecuta dentro del workspace
WORKSPACE_DIR="workspaces/"
if echo "$COMMAND" | grep -q "cd " && ! echo "$COMMAND" | grep -q "$WORKSPACE_DIR"; then
    echo '{"decision":"block","reason":"Comandos fuera del workspace no permitidos"}' >&2
    exit 2
fi

exit 0
```

#### `.claude/hooks/validate-write.sh` — Sandboxing de escritura

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Solo permitir escritura dentro de workspaces/ o archivos del proyecto
ALLOWED_PREFIXES=("workspaces/" "backend/" "frontend/" ".claude/")

ALLOWED=false
for prefix in "${ALLOWED_PREFIXES[@]}"; do
    if [[ "$FILE_PATH" == "$prefix"* ]] || [[ "$FILE_PATH" == "./"$prefix"/"* ]]; then
        ALLOWED=true
        break
    fi
done

if [ "$ALLOWED" = false ]; then
    echo '{"decision":"block","reason":"Escritura fuera de directorios permitidos: '"$FILE_PATH"'"}' >&2
    exit 2
fi

# Bloquear escritura a archivos de produccion
BLOCKED_FILES=(".env" "docker-compose.prod.yml" "Caddyfile")
BASENAME=$(basename "$FILE_PATH")
for blocked in "${BLOCKED_FILES[@]}"; do
    if [ "$BASENAME" = "$blocked" ]; then
        echo '{"decision":"block","reason":"Archivo de produccion protegido: '"$BASENAME"'"}' >&2
        exit 2
    fi
done

exit 0
```

#### `.claude/hooks/auto-format.sh` — Formatear despues de escribir

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

case "$FILE_PATH" in
    *.py)
        ruff format "$FILE_PATH" 2>/dev/null
        ruff check --fix "$FILE_PATH" 2>/dev/null
        ;;
    *.ts|*.tsx|*.js|*.jsx)
        npx prettier --write "$FILE_PATH" 2>/dev/null
        ;;
    *.json)
        npx prettier --write "$FILE_PATH" 2>/dev/null
        ;;
esac

exit 0
```

#### `.claude/hooks/update-progress.sh` — Actualizar progress.md al terminar

```bash
#!/bin/bash
# Se ejecuta cuando un agente termina (hook Stop)
# Actualiza el progress.md del proyecto activo

PROGRESS_FILE=$(find workspaces/ -name "progress.md" -newer /tmp/.steinmetz-last-update 2>/dev/null | head -1)

if [ -n "$PROGRESS_FILE" ]; then
    # Contar archivos generados
    WORKSPACE_DIR=$(dirname "$PROGRESS_FILE")
    FILE_COUNT=$(find "$WORKSPACE_DIR" -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -name 'progress.md' | wc -l | tr -d ' ')

    # Actualizar timestamp
    touch /tmp/.steinmetz-last-update

    echo "Progress updated: $FILE_COUNT files in workspace"
fi

exit 0
```

> **⚠️ MVP-BLOCKER:** Los hooks de PreToolUse (validate-bash y validate-write) son criticos para sandboxing. Implementar antes de que los agentes toquen workspaces reales.

---

## 5. CLAUDE.md STRUCTURE

### `steinmetz-mvp/CLAUDE.md` (raiz)

```markdown
# Steinmetz MVP

Plataforma que convierte lenguaje natural en software desplegado. Un embudo de 10 etapas (discovery → deploy) donde agentes de IA generan, testean y deployean aplicaciones completas.

## Comandos

- `make dev` — Levanta backend + postgres + frontend en local
- `make test` — Corre tests del backend y frontend
- `make db-migrate` — Aplica migraciones de Alembic
- `make reset` — Resetea BD y workspaces (DESTRUCTIVO)

## Arquitectura

```
frontend/ (Next.js 14 + TypeScript + Tailwind)
backend/  (Python 3.12 + FastAPI + SQLAlchemy async)
```

- Base de datos: PostgreSQL 16
- AI: Claude Agent SDK (Anthropic)
- Deploy de apps generadas: Docker + Caddy + Cloudflare DNS
- Workspaces de proyectos: `backend/workspaces/{project_id}/`

## Reglas criticas

- NUNCA pushear a main. Siempre branch + PR.
- Los agentes generan codigo en `workspaces/{project_id}/`. NUNCA fuera de ahi.
- Usar Sonnet para etapas cognitivas (1-5), Opus para arquitectura (6) y build (7).
- Cada etapa produce JSON estructurado. Si el output no parsea, es un bug.
- El campo `context` JSONB en la tabla projects es la fuente de verdad. Nunca confiar en el chat history como fuente de datos.
- No crear archivos fuera de la estructura existente sin razon.
- No agregar dependencias sin justificacion clara.

## Modelo de datos

- `users` — cuentas de usuario
- `projects` — proyectos con `context` JSONB acumulativo y `current_stage`
- `messages` — historial de chat por etapa
- `deployments` — estado de deploys con env vars encriptadas

## El embudo (state machine)

```
discovery → evaluation → planning → audit → refinement → architecture → build → test → connect → deploy
```

- audit puede rechazar y volver a refinement (max 2 loops)
- test puede fallar y volver a build (max 3 retries)
- Solo 3 etapas requieren input del usuario: discovery, architecture, connect

## Patrones preferidos

- Async everywhere (SQLAlchemy async, httpx async)
- Pydantic v2 para schemas
- Dependency injection via FastAPI Depends()
- Archivos de prompts en `backend/app/prompts/*.md`
- Un archivo por etapa en `backend/app/stages/`

## Anti-patterns

- NO usar globals para estado
- NO guardar credenciales de clientes en disco sin encriptar
- NO hacer llamadas a Claude API directas — siempre via AIService
- NO hardcodear modelos — usar config.py
```

### `steinmetz-mvp/backend/CLAUDE.md`

```markdown
# Backend — FastAPI

## Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Estructura

- `app/main.py` — App setup, CORS, lifespan
- `app/config.py` — Settings via pydantic-settings
- `app/database.py` — SQLAlchemy async engine
- `app/models.py` — ORM models
- `app/schemas.py` — Pydantic request/response
- `app/routers/` — API endpoints
- `app/stages/` — Logica del embudo (un archivo por etapa)
- `app/services/` — Servicios compartidos (ai, workspace, deployer)
- `app/prompts/` — System prompts para agentes (.md)

## Convenciones

- Todos los endpoints son async
- Usar `Depends(get_db)` para sesiones de DB
- Schemas Pydantic para todo request/response
- HTTPException para errores con status codes correctos
- Logs con structlog

## Tests

```bash
pytest tests/ -v
```
```

### `steinmetz-mvp/frontend/CLAUDE.md`

```markdown
# Frontend — Next.js 14

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Estructura

- `app/page.tsx` — Landing + login
- `app/console/page.tsx` — Dashboard de proyectos
- `app/console/[projectId]/page.tsx` — Vista del embudo
- `components/` — Componentes reutilizables
- `lib/api.ts` — Cliente HTTP al backend
- `lib/types.ts` — TypeScript types

## Convenciones

- Server components por defecto, 'use client' solo cuando necesario
- Tailwind para estilos, no CSS modules
- Fetch via lib/api.ts, nunca fetch directo
- Shadcn/ui para componentes base
- Tipos estrictos, no `any`
```

> **⚠️ MVP-BLOCKER:** Crear los CLAUDE.md antes de empezar a codear. Son las instrucciones que Claude Code sigue en cada sesion de desarrollo.

---

## 6. SKILLS CUSTOM

### `/steinmetz-new-project`

Archivo: `.claude/skills/steinmetz-new-project/SKILL.md`

```yaml
---
name: steinmetz-new-project
description: Initialize a new Steinmetz project workspace with all required files and DB records
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob
---

Initialize a new Steinmetz client project:

1. Generate a unique project ID (UUID)
2. Create the workspace directory: `workspaces/{project_id}/`
3. Create `workspaces/{project_id}/progress.md` with initial template:
   ```
   # Progress: New Project
   ## Status: discovery
   ## Completed: none
   ## Next: User needs to describe what they want
   ```
4. Create a DB record via the API:
   ```bash
   curl -X POST http://localhost:8000/api/projects \
     -H "Content-Type: application/json" \
     -d '{"description": "$ARGUMENTS"}'
   ```
5. Confirm the project was created and show the project ID
```

### `/steinmetz-debug`

Archivo: `.claude/skills/steinmetz-debug/SKILL.md`

```yaml
---
name: steinmetz-debug
description: Debug a failed build or test in a Steinmetz project
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep, Edit
---

Debug the Steinmetz project specified in $ARGUMENTS:

1. Read `workspaces/{project_id}/progress.md` to understand current state
2. Check the last error:
   - Read build logs: `docker-compose logs` in the workspace
   - Check test output: look for pytest/jest output files
   - Read the most recently modified files
3. Analyze the error in context of:
   - The architecture spec (from project context in DB)
   - The generated code (in the workspace)
   - Common patterns that cause this type of error
4. Propose a specific fix with file paths and code changes
5. If the fix is clear, apply it directly
6. Re-run the failing step to verify

Follow the "3 retries max" rule from the MVP plan. If this is attempt 3+, summarize all errors and suggest the user intervene.
```

### `/steinmetz-iterate`

Archivo: `.claude/skills/steinmetz-iterate/SKILL.md`

```yaml
---
name: steinmetz-iterate
description: Apply changes to an already-deployed Steinmetz project
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

Apply changes to deployed project $ARGUMENTS:

1. Read the project's architecture spec and current codebase in the workspace
2. Understand the requested change (from the user's message)
3. Evaluate impact:
   - What files need to change?
   - Does the DB schema change? (migration needed?)
   - Do new endpoints or pages need to be created?
4. Make the changes in the workspace
5. Run tests: `docker-compose build && docker-compose up -d && curl health check`
6. If tests pass, re-deploy:
   - Build new Docker image
   - Deploy updated container
   - Verify health check on live URL
7. Update progress.md with the changes made
```

### `/steinmetz-quality-gate`

Archivo: `.claude/skills/steinmetz-quality-gate/SKILL.md`

```yaml
---
name: steinmetz-quality-gate
description: Run quality checks before deploying a Steinmetz project
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep
context: fork
---

Run quality gate on project $ARGUMENTS:

1. Navigate to `workspaces/{project_id}/`
2. Run these checks and score each (pass/warn/fail):

   **Security:**
   - Check for hardcoded secrets: `grep -r "password\|secret\|api_key" --include="*.py" --include="*.ts"`
   - Verify all API endpoints have auth middleware
   - Check for SQL injection vectors (raw queries without parameterization)

   **Code Quality:**
   - Python: `ruff check .`
   - TypeScript: `npx tsc --noEmit`
   - Lint: `npx eslint . --quiet`

   **Dependencies:**
   - `pip audit` (Python vulnerabilities)
   - `npm audit` (JS vulnerabilities)

   **Tests:**
   - Docker build succeeds
   - Health checks pass
   - Smoke tests on main endpoints

3. Generate quality report:
   ```
   STEINMETZ QUALITY GATE — {project_name}
   ─────────────────────────────────────
   Security:     PASS / WARN / FAIL
   Code Quality: PASS / WARN / FAIL
   Dependencies: PASS / WARN / FAIL
   Tests:        PASS / WARN / FAIL
   ─────────────────────────────────────
   Overall:      PASS / BLOCK
   ```

4. If Overall = BLOCK, list all failures and do NOT proceed with deploy
5. If Overall = PASS, confirm ready for deployment
```

> **📈 POST-MVP:** Las skills `/steinmetz-iterate` y `/steinmetz-quality-gate`. Para el MVP, el debug y new-project son los mas utiles.

---

## 7. PROGRESS TRACKING CROSS-SESSION

### El problema

El build de una app compleja puede requerir multiples context windows (compaction). Si el agente pierde contexto, necesita saber donde quedo.

### Solucion: progress.md + git commits

#### Template de `progress.md`

Se crea en el workspace de cada proyecto:

```markdown
# Progress: {project_name}

## Status: {discovery|evaluation|planning|audit|refinement|architecture|build|test|connect|deploy|live}

## Current Phase: {descripcion del paso actual}

## Completed
- [x] Discovery: 5 requirements, 2 data sources, 3 user roles
- [x] Evaluation: medium complexity, feasible, React + FastAPI
- [x] Planning: 6 pages, 14 endpoints, 5 tables
- [x] Audit: passed (1 warning fixed)
- [x] Architecture: specs finalized
- [x] Build step 1: scaffolding (12 files)
- [x] Build step 2: database (3 files)
- [x] Build step 3: backend core (4 files)
- [ ] Build step 4: backend endpoints
- [ ] Build step 5: frontend layout
- [ ] Build step 6: frontend pages
- [ ] Build step 7: shared components

## Next
Generate CRUD endpoints for: audits, users, findings, reports

## Files Generated (47 total)
backend/app/main.py
backend/app/config.py
backend/app/database.py
backend/app/models/audit.py
backend/app/models/user.py
...

## Key Decisions
- SQLAlchemy async con asyncpg
- JWT auth con python-jose
- Pydantic v2 para validacion
- Tailwind + shadcn/ui para frontend

## Errors Encountered
- Build step 2, attempt 1: missing alembic.ini — fixed
- Build step 3, attempt 1: circular import en models — restructured

## Architecture Spec Reference
- DB: 5 tables (users, audits, findings, reports, audit_assignments)
- API: 14 endpoints across 4 routers
- Frontend: 6 pages (dashboard, audit-list, audit-detail, finding-form, reports, settings)
```

### Integracion con el orchestrator

```python
class WorkspaceManager:
    def update_progress(self, project_id: str, updates: dict):
        """Actualiza el progress.md del proyecto."""
        progress_path = self.BASE_DIR / project_id / "progress.md"
        current = progress_path.read_text() if progress_path.exists() else ""
        # Parse y actualizar secciones relevantes
        updated = self._merge_progress(current, updates)
        progress_path.write_text(updated)

    def get_progress(self, project_id: str) -> str:
        """Lee el progress.md para handoff entre sesiones."""
        progress_path = self.BASE_DIR / project_id / "progress.md"
        if progress_path.exists():
            return progress_path.read_text()
        return ""
```

### Git como segunda fuente de verdad

Cada paso del build hace un commit:

```python
async def commit_build_step(self, project_id: str, step_name: str, files_changed: list[str]):
    workspace = self.BASE_DIR / project_id
    self.run_command(project_id, "git add -A")
    self.run_command(project_id, f'git commit -m "build: {step_name} ({len(files_changed)} files)"')
```

Si un agente reinicia, puede leer `git log --oneline` + `progress.md` para saber exactamente donde quedo:

```python
async def get_build_state(self, project_id: str) -> dict:
    """Reconstruye el estado del build desde git + progress."""
    progress = self.get_progress(project_id)
    _, git_log, _ = self.run_command(project_id, "git log --oneline")
    files = self.list_files(project_id)

    return {
        "progress": progress,
        "git_history": git_log,
        "file_count": len(files),
        "files": files
    }
```

> **⚠️ MVP-BLOCKER:** progress.md es esencial para el build engine. Sin el, un build que falla a medio camino requiere empezar de cero.

---

## 8. DEPLOYMENT PIPELINE MEJORADO

### MVP (mantener tal cual del plan)

```
Docker build local → Docker run en VPS → Caddy reverse proxy → Cloudflare DNS
```

- Hetzner VPS, ~$15/mes
- Todo en un servidor

### Post-MVP: path de evolucion

```
                   ┌──────────────────────────────────────┐
                   │         POST-MVP ARCHITECTURE         │
                   │                                       │
  Build agent ──►  │  1. Git push al repo del proyecto     │
                   │  2. GitHub Actions CI/CD triggered     │
                   │  3. Build Docker image                 │
                   │  4. Push a container registry privado  │
                   │  5. Deploy a cloud del cliente:        │
                   │     - Azure Container Apps             │
                   │     - AWS ECS                          │
                   │     - Steinmetz managed (Hetzner)      │
                   │  6. Health monitoring (Uptime Robot)    │
                   │  7. Auto-rollback si health falla     │
                   │                                       │
                   └──────────────────────────────────────┘
```

**Cambios especificos al plan:**

| Componente MVP | Evolucion Post-MVP |
|---|---|
| Docker run manual | GitHub Actions CI/CD |
| Docker Hub free | Container registry privado (GitHub Packages) |
| 1 VPS para todo | Cloud del cliente (Azure/AWS) como opcion |
| Sin monitoring | Uptime Robot + alertas |
| Sin rollback | Rollback automatico a version anterior |
| Sin secrets vault | HashiCorp Vault o Azure Key Vault |

**Prioridad de implementacion:**

1. **GitHub Actions CI/CD** — Primer upgrade despues del MVP. Cada deploy se vuelve reproducible y auditable.
2. **Health monitoring** — Uptime Robot es gratis para 50 monitors. Agregar inmediatamente post-MVP.
3. **Azure deploy** — Cuando el primer cliente enterprise lo requiera.

> **📈 POST-MVP:** Todo en esta seccion. El MVP con un VPS y Caddy es suficiente para los primeros 5-10 proyectos.

---

## 9. RESUMEN EJECUTIVO DE CAMBIOS

### Tabla de prioridades

| Componente actual | Cambio propuesto | Esfuerzo | Impacto | Prioridad |
|---|---|---|---|---|
| Sin CLAUDE.md | CLAUDE.md structure (raiz + backend + frontend) | 2 horas | Alto — define como trabajan todos los agentes | **P0** |
| Sin hooks | Hooks de sandboxing (validate-bash, validate-write) | 3 horas | Alto — seguridad critica | **P0** |
| Sin progress tracking | progress.md + git commits por paso | 4 horas | Critico — sin esto, builds que fallan no se recuperan | **P0** |
| `AIService` (API cruda) | Claude Agent SDK | 1-2 dias | Critico — habilita tool use, filesystem access, streaming | **P0** |
| Sin MCP | Context7 para build agent | 2 horas | Alto — reduce alucinaciones de APIs | **P1** |
| Sin MCP | PostgreSQL MCP para connect | 3 horas | Alto — permite explorar schemas del cliente | **P1** |
| Build secuencial | Subagentes paralelos | 1 dia | Medio — reduce build time de ~7 a ~4 min | **P2** |
| Sin skills | `/steinmetz-new-project` + `/steinmetz-debug` | 4 horas | Medio — mejora DX del equipo | **P2** |
| Sin MCP | GitHub MCP para deploy | 3 horas | Medio — automatiza repo management | **P2** |
| Sin skills | `/steinmetz-iterate` + `/steinmetz-quality-gate` | 1 dia | Medio — habilia post-deploy updates | **P3** |
| VPS deploy | GitHub Actions CI/CD | 1 dia | Medio — reproducibilidad de deploys | **P3** |
| Sin MCP | OpenAPI MCP dinamico | 1 dia | Bajo para MVP — clientes complejos lo necesitan | **P3** |

### Orden recomendado de implementacion

**Antes de empezar a codear (dia 0):**
1. Crear CLAUDE.md (raiz + backend + frontend)
2. Configurar hooks de sandboxing
3. Configurar Agent SDK como dependencia

**Durante Fase 1 (embudo cognitivo):**
4. Implementar AIService con Agent SDK (no API cruda)
5. Implementar progress.md en workspace manager

**Durante Fase 2 (build engine):**
6. Agregar Context7 MCP al build agent
7. Implementar git commits por paso de build

**Durante Fase 3 (deploy):**
8. Agregar PostgreSQL MCP para connect
9. Crear skill `/steinmetz-debug`

**Post-MVP:**
10. Subagentes paralelos
11. GitHub MCP + CI/CD
12. Skills de iterate y quality-gate
13. OpenAPI MCP dinamico

---

*Steinmetz Ecosystem Integration — v1.0*
*Complemento a mvp-plan.md*
