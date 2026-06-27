from uuid import uuid4

import duckdb

from app.models.note import Note, NoteCreate, NoteUpdate


class DuckDBNoteRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_note(self, row: tuple, columns: list[str]) -> Note:
        data = dict(zip(columns, row))
        return Note(**data, tags=[])

    def create(self, user_id: str, note: NoteCreate) -> Note:
        note_id = uuid4().hex
        word_count = len(note.content.split()) if note.content else 0
        self.db.execute(
            """INSERT INTO notes (id, user_id, source_id, title, content, word_count)
               VALUES (?, ?, ?, ?, ?, ?)""",
            [note_id, user_id, note.source_id, note.title, note.content, word_count],
        )
        return self.get_by_id(note_id)

    def get_by_id(self, note_id: str) -> Note | None:
        result = self.db.execute(
            """SELECT n.*, s.title as source_title
               FROM notes n LEFT JOIN sources s ON n.source_id = s.id
               WHERE n.id = ?""",
            [note_id],
        )
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row is None:
            return None
        return self._row_to_note(row, columns)

    def list_by_source(self, source_id: str) -> list[Note]:
        result = self.db.execute(
            """SELECT n.*, s.title as source_title
               FROM notes n LEFT JOIN sources s ON n.source_id = s.id
               WHERE n.source_id = ? ORDER BY n.created_at DESC""",
            [source_id],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_note(row, columns) for row in result.fetchall()]

    def list_all(self, user_id: str, limit: int = 50, offset: int = 0) -> list[Note]:
        result = self.db.execute(
            """SELECT n.*, s.title as source_title
               FROM notes n LEFT JOIN sources s ON n.source_id = s.id
               WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?""",
            [user_id, limit, offset],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_note(row, columns) for row in result.fetchall()]

    def update(self, note_id: str, data: NoteUpdate) -> Note | None:
        updates = data.model_dump(exclude_none=True)
        if not updates:
            return self.get_by_id(note_id)
        if "content" in updates:
            updates["word_count"] = len(updates["content"].split())
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [note_id]
        self.db.execute(
            f"UPDATE notes SET {set_clause}, updated_at = now() WHERE id = ?",
            values,
        )
        return self.get_by_id(note_id)

    def delete(self, note_id: str) -> bool:
        self.db.execute("DELETE FROM item_tags WHERE item_id = ? AND item_type = 'note'", [note_id])
        result = self.db.execute("DELETE FROM notes WHERE id = ? RETURNING id", [note_id])
        return result.fetchone() is not None

    def count(self, user_id: str) -> int:
        return self.db.execute(
            "SELECT COUNT(*) FROM notes WHERE user_id = ?", [user_id]
        ).fetchone()[0]

    def recent(self, user_id: str, limit: int = 5) -> list[Note]:
        return self.list_all(user_id, limit=limit, offset=0)
