# Development Progress

## Phases

### Phase 1: Foundation [DONE]
- FastAPI app scaffold with lifespan
- pydantic-settings config (.env support)
- DuckDB connection manager (singleton)
- Database migrations (15 tables + 3 default prompt templates)
- Base template with sidebar + theme toggle
- Shared CSS (theme system, all component styles)
- Dashboard route with hardcoded data
- HTMX + response-targets extension loaded

### Phase 2: Sources & Notes CRUD [DONE]
- Pydantic models (source, note, tag, prompt_template, summary)
- Repository protocols in base.py (SourceRepository, NoteRepository, etc.)
- DuckDB implementations (source_repo, note_repo, tag_repo, prompt_template_repo, summary_repo)
- Source service with PyMuPDF text extraction (Docling as fallback)
- Source workspace routes + templates (3-step flow)
- HTMX: step navigation, source creation (write/paste/upload), note save/delete
- Prompt template CRUD: create, delete, preview, duplicate name prevention
- Default prompts protected from deletion
- File upload with PDF/DOCX/TXT/HTML support

### Phase 3: Notes List & Search [NEXT]
- Search service (keyword + FTS)
- Notes list routes + templates
- HTMX search, filters, sort, pagination
- Bulk select, list/card view toggle

### Phase 4: AI Summarization [DONE]
- AIProvider Protocol (app/ai/base.py)
- ClaudeCLI implementation using subprocess with stdin piping
- shell=True for Windows PATH compatibility
- Null byte stripping for PDF-extracted text
- Prompt builder (replaces {source_text} placeholder)
- Summary service orchestrating: source text + prompt template → Claude → save result
- Summary result fragment with success/error display
- Multiple summaries per source with dropdown in Read & Note tab

### Phase 5: Synapse (Connection Discovery)
- Connection + concept repositories
- Synapse service (single + bulk)
- Synapse review routes + templates
- Accept/reject connections

### Phase 6: Articles CRUD + Workspace
- Article, section, section_ref repositories
- Article list routes + templates (status filters)
- Article workspace (3-panel: refs, editor, Muse)
- Section CRUD, reference attachment

### Phase 7: Muse AI Companion
- AI conversation repository
- Muse service (per-section + article-level actions)
- Chat interface + quick action chips
- AI Actions dropdown (draft/revise/shorten/expand/review/fact-check)

### Phase 8: Knowledge Graph
- Graph service (assemble nodes + edges)
- D3.js force-directed graph
- Node detail panel, concept CRUD
- Health check, "Ask Knowledge" query

### Phase 9: Publishing & Public View
- Publish preview (settings, checklist)
- Public article page (no sidebar, reader layout)
- Engagement tracking (views/likes/saves/shares)
- Slug-based URLs

### Phase 10: Export, Analytics, Polish
- Export service (Markdown/HTML/DOCX/PDF)
- Cross-post formatting (Medium/Dev.to/LinkedIn/WordPress)
- Analytics dashboard (charts, date range, article performance)
- Wire dashboard with real data
- Knowledge log

## Page Design → Template Mapping

| # | Design File | Template | Status |
|---|---|---|---|
| 1 | `page_designs/01_dashboard.html` | `templates/pages/dashboard.html` | Done (Phase 1) |
| 2 | `page_designs/02_source_workspace.html` | `templates/pages/source_workspace.html` | Done (Phase 2+4) |
| 3 | `page_designs/03_synapse_review.html` | `templates/pages/synapse_review.html` | Phase 5 |
| 4 | `page_designs/04_article_workspace.html` | `templates/pages/article_workspace.html` | Phase 6 |
| 5 | `page_designs/05_notes_list.html` | `templates/pages/notes_list.html` | Phase 3 |
| 6 | `page_designs/06_articles_list.html` | `templates/pages/articles_list.html` | Phase 6 |
| 7 | `page_designs/07_knowledge_graph.html` | `templates/pages/knowledge_graph.html` | Phase 8 |
| 8 | `page_designs/08_publish_preview.html` | `templates/pages/publish_preview.html` | Phase 9 |
| 9 | `page_designs/09_public_article.html` | `templates/pages/public_article.html` | Phase 9 |
| 10 | `page_designs/10_analytics.html` | `templates/pages/analytics.html` | Phase 10 |

## Known Issues / Lessons Learned
- DuckDB doesn't support CASCADE/SET NULL on foreign keys — handle deletes in app layer
- DuckDB requires `pytz` for TIMESTAMPTZ handling
- Windows: uvicorn reloader sometimes doesn't pick up new route files — restart manually
- Windows: Claude CLI needs `shell=True` in subprocess to find the binary via PATH
- PDF text can contain null bytes (`\x00`) — strip before sending to Claude
- Use stdin piping (`input=prompt`) instead of command-line args for long/special-character text
