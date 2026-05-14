# Steinmetz MVP — Paso a Paso

Guia de construccion completa. Cada paso tiene su checklist, sus archivos, y su criterio de "listo". Seguir en orden.

Referencia: `mvp-plan.md` (arquitectura) + `STEINMETZ-ECOSYSTEM-INTEGRATION.md` (ecosistema Claude)

---

## PASO 0 — Preparar el terreno

**Objetivo:** Repo creado, proyecto levanta en local, estructura lista.

### 0.1 — Crear repo y estructura base

```bash
cd ~/Desktop
mkdir steinmetz-mvp && cd steinmetz-mvp
git init
```

Crear `.gitignore`:

```
# Python
__pycache__/
*.pyc
.env
venv/
.venv/

# Node
node_modules/
.next/

# Workspaces (codigo generado por los agentes)
backend/workspaces/

# OS
.DS_Store

# Docker
docker-compose.override.yml
```

Crear `.env.example`:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql+asyncpg://steinmetz:steinmetz@localhost:5432/steinmetz

# Cloudflare (para deploy)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=

# GitHub (para deploy)
GITHUB_TOKEN=

# App
SECRET_KEY=change-me-in-production
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

- [ ] Repo creado en GitHub: `steinmetz-mvp`
- [ ] `.gitignore` creado
- [ ] `.env.example` creado
- [ ] `.env` creado (copia de example, con tu API key real)

### 0.2 — CLAUDE.md (crear antes de escribir una linea de codigo)

Crear `CLAUDE.md` en la raiz:

```markdown
# Steinmetz MVP

Plataforma que convierte lenguaje natural en software desplegado. Embudo de 10 etapas (discovery → deploy) donde agentes de IA generan, testean y deployean aplicaciones completas.

## Comandos

- `make dev` — Levanta backend + postgres + frontend en local
- `make test` — Corre tests del backend y frontend
- `make db-migrate` — Aplica migraciones de Alembic
- `make reset` — Resetea BD y workspaces (DESTRUCTIVO)

## Arquitectura

- `frontend/` — Next.js 14 + TypeScript + Tailwind
- `backend/` — Python 3.12 + FastAPI + SQLAlchemy async
- Base de datos: PostgreSQL 16
- AI: Claude Agent SDK (Anthropic)
- Deploy de apps generadas: Docker + Caddy + Cloudflare DNS
- Workspaces: `backend/workspaces/{project_id}/`

## Reglas

- NUNCA pushear a main. Siempre branch + PR.
- Agentes generan codigo SOLO en `backend/workspaces/`. Nunca fuera.
- Sonnet para etapas 1-5. Opus para etapas 6-7.
- Cada etapa produce JSON estructurado. Output que no parsea = bug.
- `context` JSONB en projects = fuente de verdad. No el chat history.
- No agregar dependencias sin justificacion.

## Embudo

discovery → evaluation → planning → audit → refinement → architecture → build → test → connect → deploy

- audit rechaza → refinement (max 2 loops)
- test falla → build retry (max 3)
- Solo discovery, architecture y connect requieren input del usuario

## Patrones

- Async everywhere
- Pydantic v2 para schemas
- FastAPI Depends() para DI
- Prompts en `backend/app/prompts/*.md`
- Un archivo por etapa en `backend/app/stages/`
- NO globals para estado
- NO credenciales en disco sin encriptar
- NO llamadas directas a Claude API — siempre via AIService
```

Crear `backend/CLAUDE.md`:

```markdown
# Backend — Python 3.12 + FastAPI

## Setup
pip install -r requirements.txt
uvicorn app.main:app --reload

## Estructura
- app/main.py — App + CORS + lifespan
- app/config.py — Settings (pydantic-settings)
- app/database.py — SQLAlchemy async engine
- app/models.py — ORM models
- app/schemas.py — Pydantic request/response
- app/routers/ — Endpoints
- app/stages/ — Logica del embudo
- app/services/ — AI, workspace, deployer
- app/prompts/ — System prompts (.md)

## Convenciones
- Todos los endpoints async
- Depends(get_db) para sesiones
- HTTPException para errores
- Logs con structlog
```

Crear `frontend/CLAUDE.md`:

```markdown
# Frontend — Next.js 14 + TypeScript + Tailwind

## Setup
npm install && npm run dev

## Estructura
- app/page.tsx — Landing + login
- app/console/page.tsx — Dashboard
- app/console/[projectId]/page.tsx — Vista embudo
- components/ — Reutilizables
- lib/api.ts — Cliente HTTP
- lib/types.ts — Types compartidos

## Convenciones
- Server components por defecto, 'use client' solo si necesario
- Tailwind, no CSS modules
- Fetch via lib/api.ts
- Shadcn/ui para componentes base
- Tipos estrictos, no any
```

- [ ] `CLAUDE.md` raiz creado
- [ ] `backend/CLAUDE.md` creado
- [ ] `frontend/CLAUDE.md` creado

### 0.3 — Hooks de seguridad

```bash
mkdir -p .claude/hooks
```

Crear `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/validate-bash.sh" }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/validate-write.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/auto-format.sh" }]
      }
    ]
  }
}
```

Crear `.claude/hooks/validate-bash.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
BLOCKED=("rm -rf /" "rm -rf ~" "DROP DATABASE" "DROP TABLE" "mkfs" "dd if=" "> /dev/sda")
for p in "${BLOCKED[@]}"; do
    if echo "$COMMAND" | grep -qi "$p"; then
        echo '{"decision":"block","reason":"Blocked: '"$p"'"}' >&2
        exit 2
    fi
done
exit 0
```

Crear `.claude/hooks/validate-write.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
ALLOWED_PREFIXES=("backend/" "frontend/" ".claude/" "workspaces/")
ALLOWED=false
for prefix in "${ALLOWED_PREFIXES[@]}"; do
    [[ "$FILE_PATH" == "$prefix"* ]] && ALLOWED=true && break
done
if [ "$ALLOWED" = false ] && [ -n "$FILE_PATH" ]; then
    echo '{"decision":"block","reason":"Write outside allowed dirs: '"$FILE_PATH"'"}' >&2
    exit 2
fi
exit 0
```

Crear `.claude/hooks/auto-format.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
case "$FILE_PATH" in
    *.py) ruff format "$FILE_PATH" 2>/dev/null; ruff check --fix "$FILE_PATH" 2>/dev/null ;;
    *.ts|*.tsx|*.js|*.jsx|*.json) npx prettier --write "$FILE_PATH" 2>/dev/null ;;
esac
exit 0
```

```bash
chmod +x .claude/hooks/*.sh
```

- [ ] `.claude/settings.json` creado
- [ ] `.claude/hooks/validate-bash.sh` creado y ejecutable
- [ ] `.claude/hooks/validate-write.sh` creado y ejecutable
- [ ] `.claude/hooks/auto-format.sh` creado y ejecutable

### 0.4 — Backend scaffolding

```bash
mkdir -p backend/app/{routers,stages,services,prompts}
mkdir -p backend/workspaces
mkdir -p backend/templates
touch backend/workspaces/.gitkeep
```

Crear `backend/requirements.txt`:

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy[asyncio]==2.0.35
asyncpg==0.30.0
alembic==1.14.0
pydantic==2.9.0
pydantic-settings==2.6.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
structlog==24.4.0
httpx==0.27.0
python-multipart==0.0.12
claude-agent-sdk>=0.1.48
```

Crear `backend/app/config.py`:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://steinmetz:steinmetz@localhost:5432/steinmetz"
    secret_key: str = "change-me"
    anthropic_api_key: str = ""
    frontend_url: str = "http://localhost:3000"
    cloudflare_api_token: str = ""
    cloudflare_zone_id: str = ""
    github_token: str = ""
    workspace_base_dir: str = "workspaces"

    class Config:
        env_file = ".env"

settings = Settings()
```

Crear `backend/app/database.py`:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session
```

Crear `backend/app/main.py`:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import projects, stages

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Steinmetz MVP", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api")
app.include_router(stages.router, prefix="/api")

@app.get("/api/health")
async def health():
    return {"status": "ok"}
```

Crear `backend/app/models.py`:

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    projects = relationship("Project", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(500))
    slug = Column(String(100), unique=True)
    description = Column(Text)
    current_stage = Column(String(50), default="discovery")
    status = Column(String(50), default="active")
    context = Column(JSON, default=dict)
    deploy_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="projects")
    messages = relationship("Message", back_populates="project")

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    stage = Column(String(50), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="messages")

class Deployment(Base):
    __tablename__ = "deployments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    container_id = Column(String(100))
    image_tag = Column(String(200))
    subdomain = Column(String(100))
    status = Column(String(50), default="pending")
    env_vars = Column(JSON)
    error_log = Column(Text)
    deployed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
```

Crear `backend/app/schemas.py`:

```python
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

# --- Projects ---
class ProjectCreate(BaseModel):
    description: str

class ProjectResponse(BaseModel):
    id: UUID
    title: str | None
    slug: str | None
    description: str
    current_stage: str
    status: str
    context: dict
    deploy_url: str | None
    created_at: datetime

# --- Messages ---
class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: UUID
    stage: str
    role: str
    content: str
    metadata_: dict
    created_at: datetime

# --- Stages ---
class ApproveResponse(BaseModel):
    previous_stage: str
    current_stage: str
    message: str
```

Crear `backend/app/routers/projects.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import re

from app.database import get_db
from app.models import Project
from app.schemas import ProjectCreate, ProjectResponse

router = APIRouter(tags=["projects"])

def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:100]

@router.post("/projects", response_model=ProjectResponse, status_code=201)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(
        description=data.description,
        slug=slugify(data.description[:50]),
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.get("/projects", response_model=list[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    await db.delete(project)
    await db.commit()
```

Crear `backend/app/routers/stages.py` (placeholder):

```python
from fastapi import APIRouter

router = APIRouter(tags=["stages"])

# Se implementa en Paso 2
```

Crear `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] Todos los archivos del backend creados
- [ ] `backend/workspaces/.gitkeep` existe

### 0.5 — Frontend scaffolding

```bash
cd ~/Desktop/steinmetz-mvp
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd frontend
npx shadcn@latest init -d
```

Crear `frontend/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  projects: {
    list: () => request<any[]>("/projects"),
    get: (id: string) => request<any>(`/projects/${id}`),
    create: (description: string) =>
      request<any>("/projects", {
        method: "POST",
        body: JSON.stringify({ description }),
      }),
    delete: (id: string) =>
      request<void>(`/projects/${id}`, { method: "DELETE" }),
  },
  stages: {
    message: (projectId: string, content: string) =>
      request<any>(`/projects/${projectId}/message`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    approve: (projectId: string) =>
      request<any>(`/projects/${projectId}/approve`, { method: "POST" }),
    messages: (projectId: string) =>
      request<any[]>(`/projects/${projectId}/messages`),
  },
};
```

Crear `frontend/lib/types.ts`:

```typescript
export type Stage =
  | "discovery"
  | "evaluation"
  | "planning"
  | "audit"
  | "refinement"
  | "architecture"
  | "build"
  | "test"
  | "connect"
  | "deploy";

export const STAGES: { key: Stage; label: string; auto: boolean }[] = [
  { key: "discovery", label: "Discovery", auto: false },
  { key: "evaluation", label: "Evaluacion", auto: true },
  { key: "planning", label: "Planificacion", auto: true },
  { key: "audit", label: "Auditoria", auto: true },
  { key: "refinement", label: "Mejoras", auto: true },
  { key: "architecture", label: "Arquitectura", auto: false },
  { key: "build", label: "Build", auto: true },
  { key: "test", label: "Test", auto: true },
  { key: "connect", label: "Conexion", auto: false },
  { key: "deploy", label: "Deploy", auto: true },
];

export interface Project {
  id: string;
  title: string | null;
  slug: string | null;
  description: string;
  current_stage: Stage;
  status: string;
  context: Record<string, any>;
  deploy_url: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  stage: Stage;
  role: "user" | "assistant" | "system";
  content: string;
  metadata_: Record<string, any>;
  created_at: string;
}
```

Crear `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- [ ] Next.js creado con create-next-app
- [ ] shadcn/ui inicializado
- [ ] `lib/api.ts` creado
- [ ] `lib/types.ts` creado
- [ ] `.env.local` creado

### 0.6 — Docker Compose + Makefile

Crear `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: steinmetz
      POSTGRES_PASSWORD: steinmetz
      POSTGRES_DB: steinmetz
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Crear `Makefile`:

```makefile
.PHONY: dev dev-backend dev-frontend db-up db-migrate test reset

dev: db-up dev-backend dev-frontend

db-up:
	docker compose up -d db

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000 &

dev-frontend:
	cd frontend && npm run dev &

db-migrate:
	cd backend && alembic upgrade head

test:
	cd backend && pytest tests/ -v
	cd frontend && npm test

reset:
	docker compose down -v
	rm -rf backend/workspaces/*/
	docker compose up -d db
	sleep 2
	cd backend && alembic upgrade head
```

- [ ] `docker-compose.yml` creado
- [ ] `Makefile` creado

### 0.7 — Alembic (migraciones de DB)

```bash
cd backend
pip install -r requirements.txt
alembic init alembic
```

Editar `backend/alembic/env.py` para usar los modelos y la URL async.

```bash
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

- [ ] Alembic configurado
- [ ] Migracion inicial creada y aplicada
- [ ] Tablas users, projects, messages, deployments existen

### 0.8 — Verificacion del Paso 0

```bash
# Terminal 1
docker compose up -d db

# Terminal 2
cd backend && uvicorn app.main:app --reload

# Terminal 3
cd frontend && npm run dev

# Test
curl http://localhost:8000/api/health
# → {"status": "ok"}

curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"description": "Test project"}'
# → {"id": "...", "current_stage": "discovery", ...}
```

- [ ] Backend responde en :8000
- [ ] Frontend carga en :3000
- [ ] PostgreSQL corre en :5432
- [ ] Crear y listar proyectos funciona via API
- [ ] **COMMIT: "paso 0: scaffolding completo"**

---

## PASO 1 — AIService con Agent SDK

**Objetivo:** El servicio central de AI funciona con Claude Agent SDK. Todas las etapas lo usaran.

### 1.1 — AIService base

Crear `backend/app/services/ai.py`:

```python
import json
from pathlib import Path
from claude_agent_sdk import query, ClaudeAgentOptions

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

class AIService:
    def _load_prompt(self, stage_name: str) -> str:
        prompt_file = PROMPTS_DIR / f"{stage_name}.md"
        if prompt_file.exists():
            return prompt_file.read_text()
        return ""

    async def run_cognitive_stage(
        self,
        stage_name: str,
        context: dict,
        user_message: str,
        cwd: str | None = None,
    ) -> dict:
        """Para etapas 1-5: conversacionales o de analisis."""
        system_prompt = self._load_prompt(stage_name)
        context_block = f"CONTEXTO DEL PROYECTO:\n{json.dumps(context, indent=2, ensure_ascii=False)}"

        options = ClaudeAgentOptions(
            model="claude-sonnet-4-20250514",
            allowed_tools=["Read"],
            permission_mode="acceptEdits",
            system_prompt=system_prompt,
            max_turns=15,
            max_budget_usd=0.50,
            cwd=cwd,
        )

        result_text = ""
        async for message in query(
            prompt=f"{context_block}\n\nUSUARIO:\n{user_message}",
            options=options,
        ):
            if hasattr(message, "content"):
                for block in message.content:
                    if hasattr(block, "text"):
                        result_text += block.text

        return {"content": result_text}

    async def run_architecture_stage(
        self,
        context: dict,
        cwd: str | None = None,
    ) -> dict:
        """Para etapa 6: genera specs detalladas."""
        system_prompt = self._load_prompt("architecture")

        options = ClaudeAgentOptions(
            model="claude-opus-4-6",
            allowed_tools=["Read", "Write"],
            permission_mode="acceptEdits",
            system_prompt=system_prompt,
            max_turns=20,
            max_budget_usd=1.50,
            cwd=cwd,
            mcp_servers={
                "context7": {
                    "command": "npx",
                    "args": ["-y", "@upstash/context7-mcp@latest"]
                }
            },
        )

        result_text = ""
        async for message in query(
            prompt=f"CONTEXTO COMPLETO:\n{json.dumps(context, indent=2, ensure_ascii=False)}\n\nGenera la arquitectura final.",
            options=options,
        ):
            if hasattr(message, "content"):
                for block in message.content:
                    if hasattr(block, "text"):
                        result_text += block.text

        return {"content": result_text}

    async def run_build_agent(
        self,
        workspace_path: str,
        architecture: dict,
        step_instructions: str,
    ) -> list:
        """Para etapa 7: genera codigo directamente en el workspace."""
        system_prompt = self._load_prompt("build")

        options = ClaudeAgentOptions(
            model="claude-opus-4-6",
            allowed_tools=["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
            permission_mode="acceptEdits",
            system_prompt=system_prompt,
            max_turns=50,
            max_budget_usd=3.00,
            cwd=workspace_path,
            mcp_servers={
                "context7": {
                    "command": "npx",
                    "args": ["-y", "@upstash/context7-mcp@latest"]
                }
            },
        )

        messages = []
        async for message in query(
            prompt=f"ARQUITECTURA:\n{json.dumps(architecture, indent=2, ensure_ascii=False)}\n\nINSTRUCCION:\n{step_instructions}",
            options=options,
        ):
            messages.append(message)

        return messages
```

- [ ] `backend/app/services/ai.py` creado
- [ ] `claude-agent-sdk` en requirements.txt
- [ ] Test manual: importar AIService sin errores
- [ ] **COMMIT: "paso 1: AIService con Agent SDK"**

---

## PASO 2 — Workspace Manager + Progress Tracking

**Objetivo:** Poder crear, escribir y gestionar workspaces de proyectos con tracking de progreso.

### 2.1 — Workspace Manager

Crear `backend/app/services/workspace.py`:

```python
import subprocess
import shutil
from pathlib import Path
from app.config import settings

class WorkspaceManager:
    def __init__(self):
        self.base_dir = Path(settings.workspace_base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def create(self, project_id: str) -> Path:
        workspace = self.base_dir / project_id
        workspace.mkdir(parents=True, exist_ok=True)
        # Inicializar git
        self.run_command(project_id, "git init")
        # Crear progress.md
        self.init_progress(project_id)
        return workspace

    def get_path(self, project_id: str) -> Path:
        return self.base_dir / project_id

    def write_file(self, project_id: str, file_path: str, content: str):
        full_path = self.base_dir / project_id / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")

    def read_file(self, project_id: str, file_path: str) -> str:
        return (self.base_dir / project_id / file_path).read_text(encoding="utf-8")

    def list_files(self, project_id: str) -> list[str]:
        workspace = self.base_dir / project_id
        return [
            str(p.relative_to(workspace))
            for p in workspace.rglob("*")
            if p.is_file()
            and not any(part.startswith(".") for part in p.relative_to(workspace).parts)
            and "node_modules" not in str(p)
        ]

    def run_command(self, project_id: str, command: str, timeout: int = 120) -> tuple[int, str, str]:
        workspace = self.base_dir / project_id
        result = subprocess.run(
            command, shell=True, cwd=workspace,
            capture_output=True, text=True, timeout=timeout,
        )
        return result.returncode, result.stdout, result.stderr

    def commit(self, project_id: str, message: str):
        self.run_command(project_id, "git add -A")
        self.run_command(project_id, f'git commit -m "{message}" --allow-empty')

    def cleanup(self, project_id: str):
        workspace = self.base_dir / project_id
        if workspace.exists():
            shutil.rmtree(workspace)

    # --- Progress tracking ---

    def init_progress(self, project_id: str):
        content = """# Progress
## Status: discovery
## Current Phase: Waiting for user input
## Completed
(none)
## Next
User describes what they want to build
## Files Generated
(none)
## Key Decisions
(none)
## Errors
(none)
"""
        self.write_file(project_id, "progress.md", content)

    def get_progress(self, project_id: str) -> str:
        try:
            return self.read_file(project_id, "progress.md")
        except FileNotFoundError:
            return ""

    def update_progress(self, project_id: str, stage: str, phase: str, completed_item: str | None = None):
        progress = self.get_progress(project_id)
        # Simple line replacement
        lines = progress.split("\n")
        for i, line in enumerate(lines):
            if line.startswith("## Status:"):
                lines[i] = f"## Status: {stage}"
            if line.startswith("## Current Phase:"):
                lines[i] = f"## Current Phase: {phase}"
        if completed_item:
            for i, line in enumerate(lines):
                if line.startswith("## Completed"):
                    lines.insert(i + 1, f"- [x] {completed_item}")
                    break
        self.write_file(project_id, "progress.md", "\n".join(lines))
```

- [ ] `backend/app/services/workspace.py` creado
- [ ] Test: crear workspace, escribir archivo, listar archivos, leer progress
- [ ] **COMMIT: "paso 2: workspace manager + progress tracking"**

---

## PASO 3 — Motor de etapas (Stage Runner)

**Objetivo:** La base class y las 6 etapas cognitivas (discovery → architecture) funcionan.

### 3.1 — Base class

Crear `backend/app/stages/base.py`:

```python
from abc import ABC, abstractmethod

class StageRunner(ABC):
    stage_name: str

    def __init__(self, ai_service, workspace_manager):
        self.ai = ai_service
        self.workspace = workspace_manager

    @abstractmethod
    async def run(self, project_context: dict, user_message: str) -> dict:
        """Ejecuta la etapa. Retorna {content, metadata}."""
        pass

    @abstractmethod
    def is_complete(self, output: dict) -> bool:
        """Determina si la etapa tiene output suficiente para avanzar."""
        pass
```

### 3.2 — System prompts

Crear un archivo `.md` por etapa en `backend/app/prompts/`. Cada prompt define el comportamiento del agente. Ver `mvp-plan.md` seccion "Detalle de cada etapa" para los prompts completos.

Archivos a crear:
- [ ] `backend/app/prompts/discovery.md`
- [ ] `backend/app/prompts/evaluation.md`
- [ ] `backend/app/prompts/planning.md`
- [ ] `backend/app/prompts/audit.md`
- [ ] `backend/app/prompts/refinement.md`
- [ ] `backend/app/prompts/architecture.md`
- [ ] `backend/app/prompts/build.md`

### 3.3 — Implementar cada etapa

Un archivo por etapa en `backend/app/stages/`:

- [ ] `s1_discovery.py` — Conversacional. Hace preguntas, valida respuestas, produce requerimientos JSON.
- [ ] `s2_evaluation.py` — Automatica. Recibe requerimientos, produce evaluacion (complejidad, factibilidad, stack).
- [ ] `s3_planning.py` — Automatica. Produce plan (DB schema, endpoints, pages).
- [ ] `s4_audit.py` — Automatica. Revisa el plan, produce lista de issues.
- [ ] `s5_refinement.py` — Automatica. Corrige plan segun issues del audit.
- [ ] `s6_architecture.py` — Automatica. Produce specs finales (SQL, API spec, component tree).

### 3.4 — Orchestrator (state machine)

Crear `backend/app/services/orchestrator.py`:

Implementar la state machine del embudo. Ver `mvp-plan.md` seccion "Orchestrator" para el codigo completo. Puntos clave:

- Mapa de stage → StageRunner class
- Logica de transicion (audit fail → refinement, evaluation fail → discovery)
- `handle_message()` — procesa input del usuario en la etapa actual
- `approve_stage()` — avanza a la siguiente etapa
- Auto-ejecucion de etapas automaticas (evaluation, planning, audit, refinement)

- [ ] `backend/app/services/orchestrator.py` creado

### 3.5 — Endpoints de etapas

Completar `backend/app/routers/stages.py`:

```python
@router.post("/projects/{project_id}/message")
@router.post("/projects/{project_id}/approve")
@router.get("/projects/{project_id}/messages")
```

- [ ] Endpoints implementados
- [ ] Conectados al orchestrator

### 3.6 — Verificacion del Paso 3

```bash
# Crear proyecto
curl -X POST localhost:8000/api/projects -H "Content-Type: application/json" \
  -d '{"description": "Un dashboard de ventas con graficos"}'

# Chatear con discovery
curl -X POST localhost:8000/api/projects/{id}/message -H "Content-Type: application/json" \
  -d '{"content": "Es para el equipo comercial, 20 personas, conectado a PostgreSQL"}'

# Aprobar discovery → evaluation se ejecuta automaticamente → planning → audit → ...
curl -X POST localhost:8000/api/projects/{id}/approve

# Ver estado
curl localhost:8000/api/projects/{id}
# → current_stage deberia avanzar automaticamente hasta architecture
```

- [ ] Discovery funciona (preguntas y respuestas)
- [ ] Aprobar discovery dispara evaluation → planning → audit automaticamente
- [ ] Si audit falla, va a refinement y re-audita
- [ ] Architecture produce specs estructurados
- [ ] Todo el contexto se acumula en project.context
- [ ] **COMMIT: "paso 3: motor de etapas completo (discovery → architecture)"**

---

## PASO 4 — Frontend del embudo

**Objetivo:** UI funcional para crear proyectos y navegar el embudo.

### 4.1 — Dashboard de proyectos

`frontend/app/console/page.tsx`:
- Lista de proyectos con status
- Boton "Nuevo proyecto" (prompt input)
- Click en proyecto → navega a `/console/[id]`

### 4.2 — Vista del embudo

`frontend/app/console/[projectId]/page.tsx`:
- **Sidebar izquierda:** 10 etapas con indicador de progreso (completada, activa, pendiente)
- **Centro:** chat o contenido segun la etapa actual
  - Etapas conversacionales (discovery): interfaz de chat
  - Etapas automaticas (evaluation, planning, audit): muestra output formateado
  - Etapa de build: arbol de archivos + code preview
  - Etapa de deploy: progress bar + URL final

### 4.3 — Componentes

- [ ] `Chat.tsx` — Input de texto + historial de mensajes
- [ ] `ChatMessage.tsx` — Burbuja de mensaje (user/assistant)
- [ ] `StageProgress.tsx` — Sidebar con las 10 etapas
- [ ] `StageOutput.tsx` — Card con output de etapa (colapsable)
- [ ] `ApprovalBar.tsx` — Barra inferior con "Aprobar" / "Pedir cambios"

### 4.4 — Verificacion del Paso 4

- [ ] Crear proyecto desde la UI
- [ ] Chat con discovery funciona
- [ ] Aprobar etapa avanza el sidebar
- [ ] Etapas automaticas muestran su output
- [ ] Llegar hasta architecture aprobada via UI
- [ ] **COMMIT: "paso 4: frontend del embudo"**

---

## PASO 5 — Build Engine

**Objetivo:** Dada una arquitectura aprobada, generar la app completa en el workspace.

### 5.1 — Build stage (s7_build.py)

Cuando architecture se aprueba:
1. Crear workspace via WorkspaceManager
2. Ejecutar build en 7 pasos secuenciales (scaffolding → DB → backend core → endpoints → frontend layout → pages → shared)
3. Cada paso: llamar a `ai.run_build_agent()` con instrucciones especificas
4. El agente escribe archivos directamente al workspace via tools
5. Despues de cada paso: `workspace.commit(project_id, "build: step N")`
6. Actualizar progress.md despues de cada paso

- [ ] `backend/app/stages/s7_build.py` implementado

### 5.2 — Test stage (s8_test.py)

Secuencia de tests:
1. `docker-compose build` en el workspace
2. `docker-compose up -d`
3. Esperar 10s
4. Health checks (GET /health, GET /)
5. Si falla: extraer error, volver a build con el error como contexto
6. Max 3 reintentos

- [ ] `backend/app/stages/s8_test.py` implementado

### 5.3 — Frontend: vista de build

- [ ] `FileTree.tsx` — Arbol de archivos del workspace
- [ ] `CodeViewer.tsx` — Syntax highlighting para preview
- [ ] `BuildLog.tsx` — Terminal de logs en tiempo real

### 5.4 — Verificacion del Paso 5

```
Crear proyecto → pasar embudo → aprobar architecture → build genera codigo → tests pasan
```

- [ ] Workspace creado con todos los archivos
- [ ] Docker build exitoso
- [ ] Docker up + health check pasan
- [ ] progress.md actualizado con cada paso
- [ ] Git history con un commit por paso
- [ ] Frontend muestra archivos generados
- [ ] **COMMIT: "paso 5: build engine funcional"**

---

## PASO 6 — Connect + Deploy

**Objetivo:** Conectar datos del cliente y deployar con URL publica.

### 6.1 — Connect stage (s9_connect.py)

- [ ] Frontend: formulario pide credenciales basadas en lo que discovery identifico
- [ ] Backend: valida cada conexion (test connect)
- [ ] Si falla: muestra error especifico
- [ ] Si pasa: encripta credenciales, inyecta como env vars
- [ ] Si no hay datos externos: skip

### 6.2 — Deploy stage (s10_deploy.py)

- [ ] Docker build + tag
- [ ] Docker run con env vars y network
- [ ] Configurar Caddy (append al Caddyfile + reload)
- [ ] Cloudflare API: crear registro DNS
- [ ] Health check en URL publica (retry 12x, cada 5s)
- [ ] Actualizar project.deploy_url y status = "deployed"

### 6.3 — Frontend: deploy view

- [ ] `ConnectionForm.tsx` — Formulario de credenciales
- [ ] `DeployStatus.tsx` — Progress bar (building → pushing → deploying → DNS → live)
- [ ] URL final clickeable cuando esta live

### 6.4 — Verificacion del Paso 6

```
Proyecto completo: prompt → embudo → build → test → connect → deploy → URL live
```

- [ ] App accesible en `{slug}.apps.steinmetz.it.com`
- [ ] SSL funciona (auto via Caddy)
- [ ] Health check pasa
- [ ] **COMMIT: "paso 6: deploy pipeline funcional"**

---

## PASO 7 — Auth + Polish

**Objetivo:** MVP usable por personas reales.

### 7.1 — Autenticacion

- [ ] `POST /api/auth/register` (email + password)
- [ ] `POST /api/auth/login` (devuelve JWT)
- [ ] Middleware que valida JWT en endpoints protegidos
- [ ] Frontend: pagina de login/register
- [ ] Proyectos filtrados por user_id

### 7.2 — Error handling

- [ ] Cada etapa tiene try/catch con logging
- [ ] Si Claude falla (timeout, rate limit): retry con backoff
- [ ] Si output no parsea: retry con instruccion de correccion
- [ ] Frontend muestra errores de forma clara (no stack traces)

### 7.3 — MCP servers

- [ ] Context7 configurado para build agent (ya deberia estar en ai.py)
- [ ] PostgreSQL MCP para connect stage (si el cliente tiene BD)

### 7.4 — Skills

- [ ] `.claude/skills/steinmetz-debug/SKILL.md` creado (para development interno)

### 7.5 — Test end-to-end completo

Correr el flujo completo desde cero:

1. Registrarse
2. Crear proyecto: "Un sistema de tickets para soporte interno, 10 agentes, conectado a PostgreSQL"
3. Pasar discovery (responder preguntas)
4. Ver evaluation, planning, audit ejecutarse automaticamente
5. Aprobar architecture
6. Ver build generar codigo
7. Ver tests pasar
8. Ingresar credenciales de BD (o skip)
9. Deploy
10. Abrir URL y verificar que la app funciona

- [ ] Flujo completo funciona sin errores
- [ ] **COMMIT: "paso 7: MVP funcional"**

---

## PASO 8 — Deploy del MVP mismo

**Objetivo:** El MVP de Steinmetz esta en produccion.

### 8.1 — VPS

- [ ] Contratar Hetzner CPX31 (4 vCPU, 8GB RAM, ~$15/mes)
- [ ] Instalar Docker + Docker Compose
- [ ] Instalar Caddy
- [ ] Configurar firewall (80, 443, 22)
- [ ] Configurar DNS: `app.steinmetz.it.com` → IP del VPS
- [ ] Configurar wildcard DNS: `*.apps.steinmetz.it.com` → IP del VPS

### 8.2 — Deploy

- [ ] Clonar repo en VPS
- [ ] Configurar `.env` con credenciales reales
- [ ] `docker compose -f docker-compose.prod.yml up -d`
- [ ] Backend corriendo en puerto interno
- [ ] Frontend en Vercel apuntando al backend del VPS
- [ ] Caddy enruta todo con SSL

### 8.3 — Verificacion final

- [ ] `app.steinmetz.it.com` carga el frontend
- [ ] Login/register funciona
- [ ] Crear proyecto, pasar embudo, deploy
- [ ] App generada accesible en `*.apps.steinmetz.it.com`
- [ ] **COMMIT + TAG: "v0.1.0 — MVP"**

---

## Checklist global

| Paso | Descripcion | Estado |
|------|-------------|--------|
| 0 | Setup: repo, CLAUDE.md, hooks, scaffolding, DB | [ ] |
| 1 | AIService con Agent SDK | [ ] |
| 2 | Workspace Manager + Progress Tracking | [ ] |
| 3 | Motor de etapas (6 etapas cognitivas + orchestrator) | [ ] |
| 4 | Frontend del embudo (chat, progress, approval) | [ ] |
| 5 | Build Engine (generacion de codigo + tests) | [ ] |
| 6 | Connect + Deploy pipeline | [ ] |
| 7 | Auth + Polish + Test E2E | [ ] |
| 8 | Deploy del MVP en produccion | [ ] |

---

*Steinmetz MVP — Paso a Paso v1.0*
*Documento unificado de construccion*
