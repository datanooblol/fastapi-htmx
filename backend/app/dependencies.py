from pathlib import Path

from fastapi.templating import Jinja2Templates

from app.config import settings
from app.repositories.duckdb.connection import get_db
from app.repositories.duckdb.source_repo import DuckDBSourceRepository
from app.repositories.duckdb.note_repo import DuckDBNoteRepository
from app.repositories.duckdb.tag_repo import DuckDBTagRepository
from app.repositories.duckdb.prompt_template_repo import DuckDBPromptTemplateRepository
from app.repositories.duckdb.summary_repo import DuckDBSummaryRepository
from app.repositories.duckdb.connection_repo import DuckDBConnectionRepository
from app.repositories.duckdb.article_repo import DuckDBArticleRepository
from app.repositories.duckdb.article_section_repo import DuckDBArticleSectionRepository
from app.repositories.duckdb.engagement_repo import DuckDBEngagementRepository
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


def get_connection_repo() -> DuckDBConnectionRepository:
    return DuckDBConnectionRepository(get_db())


def get_article_repo() -> DuckDBArticleRepository:
    return DuckDBArticleRepository(get_db())


def get_section_repo() -> DuckDBArticleSectionRepository:
    return DuckDBArticleSectionRepository(get_db())


def get_engagement_repo() -> DuckDBEngagementRepository:
    return DuckDBEngagementRepository(get_db())


def get_ai_provider() -> ClaudeCLIProvider:
    return ClaudeCLIProvider(command=settings.AI_COMMAND)
