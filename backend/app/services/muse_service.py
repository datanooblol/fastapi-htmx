from app.ai.base import AIProvider
from app.ai.prompts import build_muse_prompt
from app.repositories.duckdb.article_repo import DuckDBArticleRepository
from app.repositories.duckdb.article_section_repo import DuckDBArticleSectionRepository
from app.repositories.duckdb.note_repo import DuckDBNoteRepository
from app.repositories.duckdb.source_repo import DuckDBSourceRepository


def run_muse(
    action: str,
    article_id: str,
    section_id: str | None,
    user_message: str | None,
    conversation_history: list[dict],
    ai: AIProvider,
    article_repo: DuckDBArticleRepository,
    section_repo: DuckDBArticleSectionRepository,
    note_repo: DuckDBNoteRepository,
    source_repo: DuckDBSourceRepository,
) -> str:
    """Run Muse AI action and return the response text."""

    article = article_repo.get_by_id(article_id)
    if not article:
        return "[Error: Article not found]"

    sections = section_repo.list_by_article(article_id)

    sections_summary = ""
    for s in sections:
        status = s.status.replace("_", " ")
        word_info = f"{s.word_count} words" if s.word_count else "empty"
        sections_summary += f"- § {s.title} [{status}, {word_info}]\n"
        if s.brief:
            sections_summary += f"  Brief: {s.brief}\n"

    section_title = None
    section_brief = None
    section_content = None
    refs_text = ""

    if section_id:
        target_section = section_repo.get_by_id(section_id)
        if target_section:
            section_title = target_section.title
            section_brief = target_section.brief
            section_content = target_section.content

            refs = section_repo.list_refs_by_section(section_id)
            for r in refs:
                if r.ref_type == "note":
                    note = note_repo.get_by_id(r.ref_id)
                    if note:
                        refs_text += f"[Note] {note.title}: {note.content[:300]}\n\n"
                elif r.ref_type == "source":
                    source = source_repo.get_by_id(r.ref_id)
                    if source and source.raw_content:
                        refs_text += f"[Source] {source.title}: {source.raw_content[:300]}\n\n"

    prompt = build_muse_prompt(
        action=action,
        article_title=article.title,
        section_title=section_title,
        section_brief=section_brief,
        section_content=section_content,
        all_sections_summary=sections_summary,
        refs_text=refs_text,
        user_message=user_message,
    )

    # Append conversation history so Muse remembers prior exchanges
    if conversation_history:
        history_text = "\n\nPrevious conversation:\n"
        # Keep last 10 messages to avoid prompt getting too long
        recent = conversation_history[-10:]
        for msg in recent:
            role_val = msg.role if hasattr(msg, "role") else msg.get("role", "")
            content = msg.content if hasattr(msg, "content") else msg.get("content", "")
            role = "User" if role_val == "user" else "Muse"
            # Truncate long messages in history
            if len(content) > 500:
                content = content[:500] + "..."
            history_text += f"{role}: {content}\n\n"
        prompt = prompt + history_text

    response = ai.generate(prompt)
    return response
