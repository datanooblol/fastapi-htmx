def build_muse_prompt(
    action: str,
    article_title: str,
    section_title: str | None,
    section_brief: str | None,
    section_content: str | None,
    all_sections_summary: str,
    refs_text: str,
    user_message: str | None = None,
) -> str:
    """Build a prompt for Muse AI writing companion."""

    context = f"Article: {article_title}\n"
    if section_title:
        context += f"Section: {section_title}\n"
        if section_brief:
            context += f"Section Brief: {section_brief}\n"
        if section_content:
            context += f"Current Content:\n{section_content}\n"
    context += f"\nAll Sections Overview:\n{all_sections_summary}\n"
    if refs_text:
        context += f"\nAttached References:\n{refs_text}\n"

    actions = {
        "draft": "Write a full draft for this section based on the section brief and attached references. Follow the brief's structure.",
        "revise": "Revise this section for clarity, flow, and readability while keeping the author's voice.",
        "shorten": "Shorten this section — make it more concise while keeping the key points.",
        "expand": "Expand this section — add more depth and detail using the attached references.",
        "rephrase": "Offer 2-3 alternative phrasings for this section. Keep the same meaning but different wording.",
        "continue": "Continue writing from where the author left off. Match the style and follow the section brief.",
        "review": "Review this section for logic, flow, and clarity. Does it achieve what the brief promised?",
        "factcheck": "Fact-check this section against the attached references. Are all claims accurate?",
        "consistency": "Check this section for consistency against other sections. Flag repetition or contradictions.",
        "tone": "Suggest how to adjust the tone. Currently it reads as [analyze tone]. Options: formal, conversational, tutorial-style.",
        "suggest-outline": "Based on the attached references and article context, suggest what key points this section should cover.",
        "suggest-angles": "Suggest 2-3 different angles for this section. Give a one-line preview of each approach.",
        "review-full": "Review the full article for overall quality, coherence, and flow across all sections.",
        "cohesion": "Check cohesion across all sections. Do they connect logically? Are transitions smooth?",
        "transitions": "Suggest better transitions between sections.",
        "gen-title": "Suggest 3 alternative titles and subtitles for this article.",
        "chat": user_message or "Help me with this article.",
    }

    instruction = actions.get(action, user_message or actions["chat"])

    return f"""You are Muse, an AI writing companion for the SecondBrain app. You help authors draft, revise, review, and improve their articles.

{context}

TASK: {instruction}

Respond helpfully and concisely. If suggesting text changes, format them clearly so the author can copy them."""


def build_summary_prompt(template_text: str, source_text: str) -> str:
    """Replace {source_text} placeholder in the prompt template with actual content."""
    if "{source_text}" in template_text:
        return template_text.replace("{source_text}", source_text)
    return f"{template_text}\n\nSource text:\n{source_text}"


def build_synapse_prompt(focus_note: dict, candidate_notes: list[dict]) -> str:
    """Build a prompt for Synapse to find connections between notes."""
    candidates_text = ""
    for i, note in enumerate(candidate_notes):
        candidates_text += f"\n--- Note {i+1} (ID: {note['id']}) ---\nTitle: {note['title']}\nContent: {note['content'][:500]}\n"

    return f"""You are Synapse, a knowledge connection engine. Your job is to find conceptual relationships between notes.

I have a focus note and a list of candidate notes. For each candidate, determine if there is a meaningful connection to the focus note.

FOCUS NOTE:
Title: {focus_note['title']}
Content: {focus_note['content'][:800]}

CANDIDATE NOTES:
{candidates_text}

For each candidate that has a meaningful connection to the focus note, respond with a JSON array. Each entry should have:
- "note_id": the candidate note ID
- "strength": "strong", "moderate", or "weak"
- "relationship_type": a short label like "problem → solution", "prerequisite → application", "same concept", "compare/contrast", "component → system", etc.
- "reason": one sentence explaining why they are connected

Only include candidates with real connections. Skip unrelated notes.

Respond with ONLY a JSON array, no other text. Example:
[
  {{"note_id": "abc123", "strength": "strong", "relationship_type": "problem → solution", "reason": "Note 1 describes the problem that Note 2's approach solves."}}
]

If no connections found, respond with: []"""
