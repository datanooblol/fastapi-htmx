# SecondBrain

A knowledge management app with AI-powered connections and writing assistance.

## Tech Stack
- **Backend:** FastAPI (Python 3.12)
- **Frontend:** Jinja2 templates + HTMX + vanilla JS
- **Database:** DuckDB (behind repository pattern for swappability)
- **AI:** Claude CLI via subprocess (behind provider pattern for swappability)
- **PDF Extraction:** Docling
- **Graph Visualization:** D3.js (planned)

## Architecture Patterns
- **Repository pattern:** `app/repositories/base.py` defines Protocol interfaces. `app/repositories/duckdb/` implements them. To swap DB, create a new folder (e.g., `postgres/`) and change one line in `app/dependencies.py`.
- **AI provider pattern:** `app/ai/base.py` defines `AIProvider` Protocol. `app/ai/claude_cli.py` implements it via `subprocess.run(["claude", "-p", prompt])`. To swap AI, create a new provider file.
- **Sync repositories:** DuckDB doesn't support async. Repos use sync methods. FastAPI handles this fine for prototype scale.
- **user_id on every table:** Hardcoded as "default" for now, ready for multi-user later.

## AI Features
- **Synapse:** Finds conceptual connections between notes. Creates/maintains knowledge graph.
- **Muse:** AI writing companion for articles. Drafts, revises, reviews sections.

## Key Directories
- `page_designs/` — 10 HTML mockup files (the design blueprint)
- `app/models/` — Pydantic schemas (source, note, summary, tag, prompt_template, etc.)
- `app/repositories/base.py` — Protocol interfaces (swap DB by implementing these)
- `app/repositories/duckdb/` — DuckDB implementations of all repos
- `app/ai/` — AI provider pattern (base.py Protocol, claude_cli.py implementation)
- `app/services/` — Business logic (source_service, summary_service, etc.)
- `app/routers/` — FastAPI routes (dashboard, sources, prompts, etc.)
- `app/templates/pages/` — Jinja2 page templates (extend base.html)
- `app/templates/fragments/` — HTMX partial responses (no base)
- `app/templates/components/` — Reusable includes (sidebar, cards, etc.)
- `static/uploads/` — User file uploads (gitignored)
- `data/` — DuckDB database file (gitignored)

## Windows Notes
- Claude CLI requires `shell=True` in subprocess to find the binary via PATH
- Use `encoding="utf-8"` in subprocess calls (Windows defaults to cp1252)
- PDF text may contain null bytes — strip `\x00` before processing
- Use stdin piping for subprocess instead of command-line args (avoids shell escaping issues)
- Uvicorn reloader sometimes doesn't pick up new files — restart manually if routes return 404

## Running
```bash
uv run uvicorn app.main:app --reload --port 8000
```

## Commands
- `uv sync` — install dependencies
- `uv run uvicorn app.main:app --reload` — start dev server
