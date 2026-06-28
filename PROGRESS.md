# Development Progress

## Status: All 10 pages functional (2026-06-28)

## Migration: HTMX → Next.js

**Decision (2026-06-28):** Migrated frontend from HTMX/Jinja2 to Next.js/TypeScript.
Reason: HTMX too painful for complex interactive UI. Backend stays FastAPI (JSON API).

## All Phases Complete

### M1: Foundation [DONE]
- Next.js + Tailwind + Storybook, design tokens, atoms/molecules
- Backend: CORS, /api/ prefix, JSON responses

### M2: Sources & Notes [DONE]
- Source Workspace (write/paste/upload), PyMuPDF extraction
- Prompt template CRUD (create/delete/preview, duplicate prevention)

### M3: Notes List [DONE]
- Search API (keyword), type/tag filters, sort
- NoteListItem with badges, highlighting, bulk select

### M4: Summarization [DONE]
- ClaudeCLI (subprocess + stdin piping + shell=True)
- Summary service end-to-end working

### M5: Synapse [DONE]
- Connection discovery (single + bulk), accept/reject flow
- Select all/deselect all for bulk mode

### M6: Articles [DONE]
- Articles List (status filter tabs, section pills, progress bars)
- Article Workspace (section-based editor, ref picker, save feedback)

### M7: Muse AI Companion [DONE]
- Collapsible chat panel, 16 action types
- Chip-select mode (click chip → add context → send)
- Conversation memory, "Apply to section", clear chat
- Context display (section name, word count, ref count)

### M8: Knowledge Graph [DONE]
- D3.js force-directed graph (drag, zoom, hover highlight)
- Node detail panel, node type filters
- Graph data API assembling all entity types + connections

### M9: Publishing [DONE]
- Publish Preview (slug, excerpt, visibility, checklist)
- Public Article (serif body, engagement bar, like/save/share)
- Export (Markdown, HTML download + Medium/Dev.to/LinkedIn clipboard)
- Unpublish → back to editor

### M10: Analytics [DONE]
- Stats cards, date range filter (7d/30d/90d/All)
- Top articles bar chart, engagement donut
- Recent activity feed, article performance table

## Current: UI Polish Phase
- Responsive layout
- Center content alignment
- Muse as right-side chat
- Component styling consistency

## Page → Route Mapping

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Dashboard | `/` | Done |
| 2 | Source Workspace | `/sources/new`, `/sources/{id}` | Done |
| 3 | Synapse Review | `/synapse` | Done |
| 4 | Article Workspace | `/articles/{id}/edit` | Done |
| 5 | Notes List | `/notes` | Done |
| 6 | Articles List | `/articles` | Done |
| 7 | Knowledge Graph | `/graph` | Done |
| 8 | Publish Preview | `/articles/{id}/publish` | Done |
| 9 | Public Article | `/p/{slug}` | Done |
| 10 | Analytics | `/analytics` | Done |

## Known Issues / Lessons Learned
- DuckDB: no CASCADE/SET NULL, needs pytz, single-writer lock
- Windows: Claude CLI needs shell=True, encoding="utf-8", stdin piping
- PDF: strip \x00 null bytes before processing
- React: useState doesn't sync on prop change — use useEffect
- Pydantic: use attribute access (.role) not dict access (.get("role"))
- Muse: needs conversation history for follow-up questions
- Uvicorn: reloader sometimes misses new files on Windows — restart manually
