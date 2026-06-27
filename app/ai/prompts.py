def build_summary_prompt(template_text: str, source_text: str) -> str:
    """Replace {source_text} placeholder in the prompt template with actual content."""
    if "{source_text}" in template_text:
        return template_text.replace("{source_text}", source_text)
    return f"{template_text}\n\nSource text:\n{source_text}"
