from uuid import uuid4

import duckdb

from app.models.tag import Tag


class DuckDBTagRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_tag(self, row: tuple, columns: list[str]) -> Tag:
        return Tag(**dict(zip(columns, row)))

    def get_or_create(self, user_id: str, name: str) -> Tag:
        name = name.strip()
        result = self.db.execute(
            "SELECT * FROM tags WHERE user_id = ? AND name = ?", [user_id, name]
        )
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row:
            return self._row_to_tag(row, columns)
        tag_id = uuid4().hex
        self.db.execute(
            "INSERT INTO tags (id, user_id, name) VALUES (?, ?, ?)",
            [tag_id, user_id, name],
        )
        return Tag(id=tag_id, user_id=user_id, name=name,
                   created_at=self.db.execute("SELECT now()").fetchone()[0])

    def list_all(self, user_id: str) -> list[Tag]:
        result = self.db.execute(
            "SELECT * FROM tags WHERE user_id = ? ORDER BY name", [user_id]
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_tag(row, columns) for row in result.fetchall()]

    def tag_item(self, tag_id: str, item_id: str, item_type: str) -> None:
        existing = self.db.execute(
            "SELECT id FROM item_tags WHERE tag_id = ? AND item_id = ? AND item_type = ?",
            [tag_id, item_id, item_type],
        ).fetchone()
        if not existing:
            self.db.execute(
                "INSERT INTO item_tags (id, tag_id, item_id, item_type) VALUES (?, ?, ?, ?)",
                [uuid4().hex, tag_id, item_id, item_type],
            )

    def untag_item(self, tag_id: str, item_id: str, item_type: str) -> None:
        self.db.execute(
            "DELETE FROM item_tags WHERE tag_id = ? AND item_id = ? AND item_type = ?",
            [tag_id, item_id, item_type],
        )

    def get_tags_for_item(self, item_id: str, item_type: str) -> list[Tag]:
        result = self.db.execute(
            """SELECT t.* FROM tags t
               JOIN item_tags it ON t.id = it.tag_id
               WHERE it.item_id = ? AND it.item_type = ?
               ORDER BY t.name""",
            [item_id, item_type],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_tag(row, columns) for row in result.fetchall()]

    def set_tags(self, user_id: str, item_id: str, item_type: str, tag_names: list[str]) -> list[Tag]:
        self.db.execute(
            "DELETE FROM item_tags WHERE item_id = ? AND item_type = ?",
            [item_id, item_type],
        )
        tags = []
        for name in tag_names:
            if not name.strip():
                continue
            tag = self.get_or_create(user_id, name.strip())
            self.tag_item(tag.id, item_id, item_type)
            tags.append(tag)
        return tags
