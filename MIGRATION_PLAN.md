# Migration Plan: HTMX/Jinja2 → Next.js/TypeScript

## Why

- HTMX requires excessive workarounds for complex UI (collapsible panels, AI chat, section editors, dropdown menus)
- Backend becomes overly complex mixing HTML rendering with business logic
- Codebase maintainability degrades as features grow
- Next.js provides better developer experience for interactive UIs

## What Changes

| Layer | Before | After |
|---|---|---|
| **Frontend** | Jinja2 templates + HTMX + vanilla JS | Next.js (React + TypeScript) |
| **API** | Returns HTML fragments | Returns JSON |
| **Styling** | CSS in templates + style.css | CSS Modules or Tailwind (same theme variables) |
| **Routing** | FastAPI serves pages | Next.js App Router handles pages |
| **State** | Server-rendered, HTMX swaps | React state + API calls |
| **Backend logic** | Unchanged | Unchanged |
| **Database** | Unchanged (DuckDB → Postgres later) | Unchanged |
| **AI Provider** | Unchanged | Unchanged |

## What Stays The Same

- FastAPI backend (app/ directory) — repos, services, AI providers, models
- DuckDB database + repository pattern
- Claude CLI integration
- 10 page designs as the UI blueprint
- All Pydantic models
- Development phases (reordered for API-first)

## Project Structure (After Migration)

```
d:\fastapi-htmx\
├── app/                          ← FastAPI (JSON API only)
│   ├── main.py                   # CORS, no templates/static
│   ├── config.py
│   ├── dependencies.py           # No templates, just repos + AI
│   ├── models/                   # Pydantic (unchanged)
│   ├── repositories/             # (unchanged)
│   ├── services/                 # (unchanged)
│   ├── ai/                       # (unchanged)
│   └── routers/                  # Return JSON, not HTML
│       ├── dashboard.py
│       ├── sources.py
│       ├── notes.py
│       ├── prompts.py
│       ├── synapse.py
│       ├── articles.py
│       ├── graph.py
│       ├── publish.py
│       ├── public.py
│       └── analytics.py
│
├── frontend/                     ← Next.js (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── layout.tsx        # Root layout (sidebar)
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── sources/
│   │   │   │   ├── new/page.tsx  # Source Workspace
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── notes/page.tsx    # Notes List
│   │   │   ├── synapse/page.tsx  # Synapse Review
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx      # Articles List
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/page.tsx   # Article Workspace
│   │   │   │       └── publish/page.tsx
│   │   │   ├── graph/page.tsx    # Knowledge Graph
│   │   │   ├── p/[slug]/page.tsx # Public Article
│   │   │   └── analytics/page.tsx
│   │   ├── components/           # Reusable React components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   ├── sources/
│   │   │   │   ├── SourceForm.tsx
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   ├── NoteCard.tsx
│   │   │   │   ├── SummaryPanel.tsx
│   │   │   │   └── PromptSelector.tsx
│   │   │   ├── articles/
│   │   │   │   ├── SectionBlock.tsx
│   │   │   │   ├── RefPicker.tsx
│   │   │   │   ├── AIActionsMenu.tsx
│   │   │   │   └── MusePanel.tsx
│   │   │   ├── graph/
│   │   │   │   ├── GraphCanvas.tsx
│   │   │   │   ├── NodeDetail.tsx
│   │   │   │   └── HealthCheck.tsx
│   │   │   └── shared/
│   │   │       ├── StatCard.tsx
│   │   │       ├── TagInput.tsx
│   │   │       ├── SearchBar.tsx
│   │   │       ├── BulkBar.tsx
│   │   │       └── Pagination.tsx
│   │   ├── lib/
│   │   │   ├── api.ts            # API client (fetch wrapper)
│   │   │   └── types.ts          # TypeScript types (mirror Pydantic models)
│   │   └── styles/
│   │       └── globals.css       # Theme variables, shared styles
│   └── public/
│
├── page_designs/                 ← Design blueprints (reference)
├── data/                         ← DuckDB (gitignored)
├── docker-compose.yaml           ← Future: orchestrate frontend + backend + Postgres
├── CLAUDE.md
├── PROGRESS.md
└── MIGRATION_PLAN.md
```

## Backend Migration Steps

### Step 1: Convert API to JSON

Convert existing routes from returning `TemplateResponse` to returning Pydantic models/dicts:

```python
# Before (HTMX)
@router.get("/")
def dashboard(request: Request):
    return templates.TemplateResponse(request, "pages/dashboard.html", {"stats": stats})

# After (JSON API)
@router.get("/api/dashboard")
def dashboard():
    return {"stats": stats, "recent_notes": [], "draft_articles": []}
```

All routes get `/api/` prefix. CORS middleware added for Next.js dev server.

### Step 2: Remove template dependencies

- Remove `app/templates/` directory
- Remove `app/templates/` references from dependencies.py
- Remove `static/` serving from main.py
- Remove `jinja2` from dependencies (optional, keep for now)

## Frontend Migration Steps

### Step 1: Initialize Next.js
```bash
cd d:\fastapi-htmx
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
```

### Step 2: Set up API client
Create `frontend/src/lib/api.ts` that points to `http://localhost:8000/api/`

### Step 3: Convert pages (one by one, matching the 10 designs)
Each page design becomes a Next.js page + components.

## Migration Order

| Phase | Backend | Frontend |
|---|---|---|
| **M1: Foundation** | Add CORS, prefix routes with /api/, return JSON | Init Next.js, layout, sidebar, theme, dashboard |
| **M2: Sources** | Convert source routes to JSON API | Source Workspace (3-step form, file upload) |
| **M3: Notes** | Convert notes routes + add search API | Notes List (search, filters, pagination) |
| **M4: Summarization** | Already JSON-ready (just wire it) | Summary UI in Source Workspace |
| **M5: Synapse** | Build Synapse API endpoints | Synapse Review page |
| **M6: Articles** | Build Article CRUD + section API | Article Workspace + Articles List |
| **M7: Muse** | Build Muse chat API | Muse panel in Article Workspace |
| **M8: Graph** | Build graph data API | Knowledge Graph (D3.js in React) |
| **M9: Publish** | Build publish + public API | Publish Preview + Public Article |
| **M10: Analytics** | Build analytics API | Analytics Dashboard |

## Docker Compose (Future)

```yaml
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_PATH=data/secondbrain.duckdb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api

  # Future: when migrating from DuckDB to Postgres
  # postgres:
  #   image: postgres:17
  #   ports:
  #     - "5432:5432"
  #   environment:
  #     - POSTGRES_DB=secondbrain
  #     - POSTGRES_USER=secondbrain
  #     - POSTGRES_PASSWORD=secretpassword
  #   volumes:
  #     - pgdata:/var/lib/postgresql/data
```

## Running (During Development)

Terminal 1 (Backend):
```bash
cd d:\fastapi-htmx
uv run uvicorn app.main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd d:\fastapi-htmx\frontend
npm run dev
```

Frontend runs on `http://localhost:3000`, calls API at `http://localhost:8000/api/`.
