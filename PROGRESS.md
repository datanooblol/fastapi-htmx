# Development Progress

## Status: All pages functional + UI polish in progress (2026-06-28)

## All Migration Phases Complete

### M1: Foundation [DONE]
- Next.js + Tailwind + Storybook, design tokens (dark/light theme)
- Atoms: Button, Input, Textarea, Badge, Tag, StatusDot, Spinner, Checkbox
- Molecules: StatCard, NavItem, FormGroup
- Organisms: Sidebar, ThemeToggle, AppLayout, PageContainer

### M2: Sources & Notes [DONE]
- Source Workspace (write/paste/upload), PyMuPDF extraction
- SourceForm, UploadZone, StepIndicator, PromptSelector
- NoteEditor (create/edit/delete, click-to-edit)
- Prompt template CRUD (create/delete/preview, duplicate prevention)

### M3: Notes List [DONE]
- Search API (keyword), type/tag filters, sort
- Shared ContentCard component (list + card views)
- ViewToggle for list/card switching
- Bulk select, per-note Synapse trigger

### M4: Summarization [DONE]
- ClaudeCLI (subprocess + stdin piping + shell=True)
- Summary service end-to-end

### M5: Synapse [DONE — redesigned]
- SynapsePanel (side panel, triggered from Notes List + Knowledge Graph)
- ConnectionCard component with all states
- Synapse dashboard page (connection history + stats)
- Per-note Synapse from Notes List actions
- Bulk Synapse from Notes List selection
- "Synapse: All" from Knowledge Graph toolbar

### M6: Articles [DONE]
- Articles List (status filter tabs, section pills, progress bars)
- Article Workspace (section-based editor, ref picker, save feedback)
- Shared ContentCard for consistent styling

### M7: Muse AI Companion [DONE]
- MusePanel (collapsible right panel)
- Chip-select mode (click chip → add context → send)
- Conversation memory, "Apply to section", context display
- 16 action types (draft/revise/shorten/expand/review/factcheck/etc.)

### M8: Knowledge Graph [DONE]
- D3.js force-directed graph (drag, zoom, hover highlight)
- Node types: circles (notes), squares (sources), diamonds (summaries), rects (articles)
- Node detail panel, node type filters, search
- SynapsePanel integration

### M9: Publishing [DONE]
- Publish Preview (slug, excerpt, visibility, checklist)
- Public Article (serif body, engagement bar, like/save/share)
- Export (Markdown/HTML download, Medium/Dev.to/LinkedIn clipboard)
- Unpublish → back to editor

### M10: Analytics [DONE]
- Stats cards, date range filter (7d/30d/90d/All)
- Top articles bar chart, engagement donut
- Recent activity feed, article performance table

## UI Polish (In Progress)
- Centered page layout with PageContainer (70% width)
- Removed redundant "Published" sidebar item
- Shared ContentCard component across Notes, Articles, Synapse pages
- ViewToggle (list/card) on Notes and Articles pages
- Card view shows actions (Open/Synapse/Delete)
- Synapse redesigned: panel-based instead of separate page

## Storybook Components

Atoms: Button, Input, Badge, Tag, StatusDot
Molecules: StatCard
Organisms: ContentCard, ViewToggle, ConnectionCard, StepIndicator

Run: `cd frontend && npm run storybook` → http://localhost:6006

## Page → Route Mapping

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Dashboard | `/` | Done |
| 2 | Source Workspace | `/sources/new`, `/sources/{id}` | Done |
| 3 | Notes List | `/notes` | Done |
| 4 | Synapse Dashboard | `/synapse` | Done (redesigned) |
| 5 | Articles List | `/articles` | Done |
| 6 | Article Workspace | `/articles/{id}/edit` | Done |
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
- ContentCard: shared component across pages must handle actions in both list and card views
