# SecondBrain

A knowledge management app with AI-powered connections and writing assistance.

## Features

- **Source Capture** — Upload PDFs, paste text, or write notes. AI extracts and summarizes.
- **Synapse** — AI finds conceptual connections between your notes to build a knowledge graph.
- **Article Writing** — Section-based editor with references from your notes.
- **Muse** — AI writing companion that drafts, revises, reviews, and critiques your writing.
- **Knowledge Graph** — D3.js force-directed visualization of all your knowledge connections.
- **Publishing** — Publish articles with engagement tracking (likes, saves, shares).
- **Export** — Download as Markdown/HTML, copy for Medium/Dev.to/LinkedIn.
- **Analytics** — Track views, likes, shares, downloads per article.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.12) |
| Frontend | Next.js (TypeScript + React) |
| Styling | Tailwind CSS |
| Database | DuckDB (swappable via repository pattern) |
| AI | Claude CLI via subprocess (swappable via provider pattern) |
| PDF Extraction | PyMuPDF |
| Graph | D3.js |
| Component Dev | Storybook |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd fastapi-htmx

# Install backend dependencies
cd backend
uv sync

# Install frontend dependencies
cd ../frontend
npm install
```

### Running

You need three terminals:

**Terminal 1 — Backend API** (port 8000)
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend** (port 3000)
```bash
cd frontend
npm run dev
```

**Terminal 3 — Storybook** (port 6006, optional)
```bash
cd frontend
npm run storybook
```

### Access

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| API Docs | http://localhost:8000/docs |
| Storybook | http://localhost:6006 |

## Project Structure

```
├── backend/                  # FastAPI (Python)
│   ├── app/
│   │   ├── main.py           # App entry, CORS, routers
│   │   ├── config.py         # Settings (.env)
│   │   ├── dependencies.py   # DI factories
│   │   ├── models/           # Pydantic schemas
│   │   ├── repositories/     # Database layer (protocol + DuckDB impl)
│   │   ├── services/         # Business logic
│   │   ├── ai/               # AI provider (protocol + Claude CLI impl)
│   │   └── routers/          # API endpoints
│   ├── data/                 # DuckDB file (gitignored)
│   └── pyproject.toml
│
├── frontend/                 # Next.js (TypeScript)
│   ├── app/                  # Pages (App Router)
│   ├── components/
│   │   ├── atoms/            # Button, Input, Badge, Tag, etc.
│   │   ├── molecules/        # StatCard, NavItem, FormGroup, etc.
│   │   └── organisms/        # Sidebar, ContentCard, MusePanel, etc.
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   └── types.ts          # TypeScript types
│   └── package.json
│
├── page_designs/             # 10 HTML mockup files (design blueprint)
├── CLAUDE.md                 # Project docs for Claude Code
├── PROGRESS.md               # Development progress tracker
└── MIGRATION_PLAN.md         # HTMX → Next.js migration plan
```

## Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Stats, recent notes, quick actions |
| Source Workspace | `/sources/new`, `/sources/{id}` | Upload → Summarize → Read & Note |
| Notes List | `/notes` | Search, filter, list/card view, bulk Synapse |
| Synapse Dashboard | `/synapse` | Connection history and stats |
| Articles List | `/articles` | Status tabs, progress tracking |
| Article Editor | `/articles/{id}/edit` | Section-based editor with Muse AI |
| Knowledge Graph | `/graph` | D3.js visualization with node details |
| Publish Preview | `/articles/{id}/publish` | Settings, checklist, publish |
| Public Article | `/p/{slug}` | Reader-facing with engagement |
| Analytics | `/analytics` | Views, likes, charts, performance table |

## Architecture

### Swappable Database
```
app/repositories/base.py         → Protocol interfaces
app/repositories/duckdb/         → DuckDB implementation
app/repositories/postgres/       → (future) create this, change one line in dependencies.py
```

### Swappable AI
```
app/ai/base.py                   → AIProvider Protocol
app/ai/claude_cli.py             → Claude CLI implementation
app/ai/claude_api.py             → (future) Anthropic SDK implementation
```
