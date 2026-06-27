from pathlib import Path

from fastapi.templating import Jinja2Templates

from app.config import settings
from app.repositories.duckdb.connection import get_db
from app.repositories.duckdb.source_repo import DuckDBSourceRepository
from app.repositories.duckdb.note_repo import DuckDBNoteRepository
from app.repositories.duckdb.tag_repo import DuckDBTagRepository
from app.repositories.duckdb.prompt_template_repo import DuckDBPromptTemplateRepository
from app.repositories.duckdb.summary_repo import DuckDBSummaryRepository
from app.ai.claude_cli import ClaudeCLIProvider

templates = Jinja2Templates(directory=Path(__file__).parent / "templates")


def get_source_repo() -> DuckDBSourceRepository:
    return DuckDBSourceRepository(get_db())


def get_note_repo() -> DuckDBNoteRepository:
    return DuckDBNoteRepository(get_db())


def get_tag_repo() -> DuckDBTagRepository:
    return DuckDBTagRepository(get_db())


def get_prompt_template_repo() -> DuckDBPromptTemplateRepository:
    return DuckDBPromptTemplateRepository(get_db())


def get_summary_repo() -> DuckDBSummaryRepository:
    return DuckDBSummaryRepository(get_db())


def get_ai_provider() -> ClaudeCLIProvider:
    return ClaudeCLIProvider(command=settings.AI_COMMAND)
