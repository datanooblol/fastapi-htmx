from uuid import uuid4

import duckdb

from app.models.source import Source, SourceCreate, SourceUpdate


class DuckDBSourceRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_source(self, row: tuple, columns: list[str]) -> Source:
        data = dict(zip(columns, row))
        return Source(**data, tags=[])

    def create(self, user_id: str, source: SourceCreate) -> Source:
        source_id = uuid4().hex
        word_count = len(source.raw_content.split()) if source.raw_content else 0
        self.db.execute(
            """INSERT INTO sources (id, user_id, title, source_type, raw_content,
               file_path, file_name, file_size_bytes, source_url, word_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [source_id, user_id, source.title, source.source_type,
             source.raw_content, source.file_path, source.file_name,
             source.file_size_bytes, source.source_url, word_count],
        )
        return self.get_by_id(source_id)

    def get_by_id(self, source_id: str) -> Source | None:
        result = self.db.execute(
            "SELECT * FROM sources WHERE id = ?", [source_id]
        )
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row is None:
            return None
        return self._row_to_source(row, columns)

    def list_all(self, user_id: str, limit: int = 50, offset: int = 0) -> list[Source]:
        result = self.db.execute(
            "SELECT * FROM sources WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [user_id, limit, offset],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_source(row, columns) for row in result.fetchall()]

    def update(self, source_id: str, data: SourceUpdate) -> Source | None:
        updates = data.model_dump(exclude_none=True)
        if not updates:
            return self.get_by_id(source_id)
        if "raw_content" in updates:
            updates["word_count"] = len(updates["raw_content"].split())
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [source_id]
        self.db.execute(
            f"UPDATE sources SET {set_clause}, updated_at = now() WHERE id = ?",
            values,
        )
        return self.get_by_id(source_id)

    def delete(self, source_id: str) -> bool:
        self.db.execute("DELETE FROM summaries WHERE source_id = ?", [source_id])
        self.db.execute("DELETE FROM notes WHERE source_id = ?", [source_id])
        self.db.execute("DELETE FROM item_tags WHERE item_id = ? AND item_type = 'source'", [source_id])
        result = self.db.execute("DELETE FROM sources WHERE id = ? RETURNING id", [source_id])
        return result.fetchone() is not None

    def count(self, user_id: str) -> int:
        return self.db.execute(
            "SELECT COUNT(*) FROM sources WHERE user_id = ?", [user_id]
        ).fetchone()[0]
