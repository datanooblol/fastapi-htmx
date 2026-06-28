import json

from app.ai.base import AIProvider
from app.ai.prompts import build_synapse_prompt
from app.models.connection import Connection
from app.repositories.duckdb.note_repo import DuckDBNoteRepository
from app.repositories.duckdb.connection_repo import DuckDBConnectionRepository


def find_connections(
    user_id: str,
    focus_note_id: str,
    ai: AIProvider,
    note_repo: DuckDBNoteRepository,
    conn_repo: DuckDBConnectionRepository,
) -> list[dict]:
    """
    Run Synapse on a single note: find connections to all other notes.
    Returns a list of suggested connections (not yet saved).
    """
    focus_note = note_repo.get_by_id(focus_note_id)
    if not focus_note:
        return []

    all_notes = note_repo.list_all(user_id, limit=200, offset=0)
    candidates = [n for n in all_notes if n.id != focus_note_id]

    if not candidates:
        return []

    focus_dict = {"id": focus_note.id, "title": focus_note.title, "content": focus_note.content}
    candidate_dicts = [{"id": n.id, "title": n.title, "content": n.content} for n in candidates]

    prompt = build_synapse_prompt(focus_dict, candidate_dicts)
    response = ai.generate(prompt)

    if response.startswith("[AI Error:"):
        return [{"error": response}]

    # Parse AI response
    suggestions = _parse_synapse_response(response, focus_note_id, candidates, conn_repo)
    return suggestions


def find_connections_bulk(
    user_id: str,
    note_ids: list[str],
    ai: AIProvider,
    note_repo: DuckDBNoteRepository,
    conn_repo: DuckDBConnectionRepository,
) -> list[dict]:
    """Run Synapse on multiple notes."""
    all_suggestions = []
    seen_pairs = set()

    for note_id in note_ids:
        suggestions = find_connections(user_id, note_id, ai, note_repo, conn_repo)
        for s in suggestions:
            if "error" in s:
                all_suggestions.append(s)
                continue
            pair = tuple(sorted([s["node_a_id"], s["node_b_id"]]))
            if pair not in seen_pairs:
                seen_pairs.add(pair)
                all_suggestions.append(s)

    return all_suggestions


def _parse_synapse_response(
    response: str,
    focus_note_id: str,
    candidates: list,
    conn_repo: DuckDBConnectionRepository,
) -> list[dict]:
    """Parse AI JSON response into connection suggestions."""
    try:
        # Extract JSON from response (AI might add markdown code blocks)
        text = response.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text
            text = text.rsplit("```", 1)[0]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

        connections = json.loads(text)
        if not isinstance(connections, list):
            return []
    except (json.JSONDecodeError, ValueError):
        return []

    candidate_map = {n.id: n for n in candidates}
    suggestions = []

    for conn in connections:
        note_id = conn.get("note_id", "")
        if note_id not in candidate_map:
            continue

        candidate = candidate_map[note_id]
        existing = conn_repo.exists(focus_note_id, note_id)

        suggestions.append({
            "node_a_id": focus_note_id,
            "node_a_type": "note",
            "node_b_id": note_id,
            "node_b_type": "note",
            "node_b_title": candidate.title,
            "strength": conn.get("strength", "moderate"),
            "relationship_type": conn.get("relationship_type", "related"),
            "reason": conn.get("reason", ""),
            "already_connected": existing,
        })

    return suggestions
