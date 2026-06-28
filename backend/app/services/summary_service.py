from app.ai.base import AIProvider
from app.ai.prompts import build_summary_prompt
from app.models.summary import Summary, SummaryCreate
from app.repositories.duckdb.source_repo import DuckDBSourceRepository
from app.repositories.duckdb.summary_repo import DuckDBSummaryRepository
from app.repositories.duckdb.prompt_template_repo import DuckDBPromptTemplateRepository


def run_summary(
    user_id: str,
    source_id: str,
    prompt_template_id: str | None,
    prompt_text_override: str | None,
    ai: AIProvider,
    source_repo: DuckDBSourceRepository,
    summary_repo: DuckDBSummaryRepository,
    prompt_repo: DuckDBPromptTemplateRepository,
) -> Summary | str:
    """
    Run AI summarization on a source.
    Returns a Summary on success, or an error string on failure.
    """
    source = source_repo.get_by_id(source_id)
    if not source or not source.raw_content:
        return "Source not found or has no content to summarize."

    # Get the prompt text — either from the override (user edited) or the template
    if prompt_text_override and prompt_text_override.strip():
        prompt_text = prompt_text_override.strip()
    elif prompt_template_id:
        template = prompt_repo.get_by_id(prompt_template_id)
        if template:
            prompt_text = template.prompt_text
        else:
            prompt_text = "Summarize the following text:\n\n{source_text}"
    else:
        prompt_text = "Summarize the following text:\n\n{source_text}"

    # Build the full prompt with source text inserted
    full_prompt = build_summary_prompt(prompt_text, source.raw_content)

    # Call AI
    ai_response = ai.generate(full_prompt)

    # Check for errors
    if ai_response.startswith("[AI Error:"):
        return ai_response

    # Save the summary
    summary = summary_repo.create(
        user_id,
        SummaryCreate(
            source_id=source_id,
            prompt_template_id=prompt_template_id,
            prompt_text_used=prompt_text,
            content=ai_response,
        ),
    )

    return summary
